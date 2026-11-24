import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { issueToken, passwordMatches, requireAuth, revokeToken } from "./auth.js";
import { database } from "./db.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(currentDirectory, "../../web");

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.static(webDirectory, { extensions: ["html"], maxAge: 0 }));

function apiError(res, status, code, message, details) {
  return res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

function normalizeSku(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

app.get("/api/health", async (_req, res, next) => {
  try {
    await database().query("SELECT 1");
    res.json({ data: { status: "UP", database: "CONNECTED", timestamp: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!username || !password) {
      return apiError(res, 400, "VALIDATION_ERROR", "Usuario y contraseña son obligatorios.");
    }

    const [rows] = await database().execute(
      "SELECT id, username, password_salt, password_hash, role FROM users WHERE username = ? AND active = TRUE LIMIT 1",
      [username],
    );
    const user = rows[0];
    if (!user || !(await passwordMatches(password, user.password_salt, user.password_hash))) {
      return apiError(res, 401, "INVALID_CREDENTIALS", "Credenciales incorrectas.");
    }

    const token = issueToken(user);
    await database().execute(
      "INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (?, 'LOGIN_SUCCESS', 'SESSION', NULL, ?)",
      [user.id, JSON.stringify({ username: user.username })],
    );
    return res.json({ data: { token, user: { id: user.id, username: user.username, role: user.role } } });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  revokeToken(req.authToken);
  res.status(204).end();
});

app.get("/api/products", requireAuth, async (_req, res, next) => {
  try {
    const [products] = await database().query(
      `SELECT id, sku, name, description, unit_price AS unitPrice, stock, active, created_at AS createdAt
       FROM products
       ORDER BY id`,
    );
    res.json({ data: products });
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", requireAuth, async (req, res, next) => {
  const sku = normalizeSku(req.body?.sku);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
  const unitPrice = Number(req.body?.unitPrice);

  if (!sku || !name || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return apiError(
      res,
      400,
      "VALIDATION_ERROR",
      "SKU, nombre y un precio unitario mayor o igual a cero son obligatorios.",
    );
  }
  if (sku.length > 48 || name.length > 120 || description.length > 300) {
    return apiError(res, 400, "VALIDATION_ERROR", "Uno o más campos exceden la longitud permitida.");
  }

  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "INSERT INTO products (sku, name, description, unit_price) VALUES (?, ?, ?, ?)",
      [sku, name, description || null, unitPrice],
    );
    await connection.execute(
      "INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (?, 'PRODUCT_CREATED', 'PRODUCT', ?, ?)",
      [req.user.id, result.insertId, JSON.stringify({ sku, name })],
    );
    await connection.commit();
    return res.status(201).json({
      data: { id: result.insertId, sku, name, description: description || null, unitPrice, stock: 0, active: true },
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      return apiError(res, 409, "DUPLICATE_SKU", `El SKU ${sku} ya existe.`);
    }
    return next(error);
  } finally {
    connection.release();
  }
});

app.post("/api/inventory/movements", requireAuth, async (req, res, next) => {
  const productId = Number(req.body?.productId);
  const movementType = typeof req.body?.type === "string" ? req.body.type.trim().toUpperCase() : "";
  const quantity = Number(req.body?.quantity);
  const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";

  if (!Number.isSafeInteger(productId) || productId <= 0 || !["ENTRY", "EXIT"].includes(movementType)) {
    return apiError(res, 400, "VALIDATION_ERROR", "Producto y tipo de movimiento válidos son obligatorios.");
  }
  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return apiError(res, 400, "VALIDATION_ERROR", "La cantidad debe ser un entero mayor que cero.");
  }
  if (notes.length > 300) {
    return apiError(res, 400, "VALIDATION_ERROR", "Las observaciones no pueden exceder 300 caracteres.");
  }

  const connection = await database().getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute(
      "SELECT id, sku, stock FROM products WHERE id = ? AND active = TRUE FOR UPDATE",
      [productId],
    );
    const product = products[0];
    if (!product) {
      await connection.rollback();
      return apiError(res, 404, "PRODUCT_NOT_FOUND", "El producto indicado no existe o está inactivo.");
    }

    const stockBefore = Number(product.stock);
    if (movementType === "EXIT" && quantity > stockBefore) {
      await connection.rollback();
      return apiError(
        res,
        409,
        "INSUFFICIENT_STOCK",
        `Stock insuficiente. Disponible: ${stockBefore}; solicitado: ${quantity}.`,
        { availableStock: stockBefore, requestedQuantity: quantity },
      );
    }

    const stockAfter = movementType === "ENTRY" ? stockBefore + quantity : stockBefore - quantity;
    await connection.execute("UPDATE products SET stock = ? WHERE id = ?", [stockAfter, productId]);
    const [movement] = await connection.execute(
      `INSERT INTO inventory_movements
       (product_id, movement_type, quantity, stock_before, stock_after, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, movementType, quantity, stockBefore, stockAfter, notes || null, req.user.id],
    );
    await connection.execute(
      "INSERT INTO audit_log (user_id, action, entity_type, entity_id, details) VALUES (?, 'INVENTORY_MOVEMENT', 'PRODUCT', ?, ?)",
      [req.user.id, productId, JSON.stringify({ movementType, quantity, stockBefore, stockAfter })],
    );
    await connection.commit();

    return res.status(201).json({
      data: {
        id: movement.insertId,
        productId,
        sku: product.sku,
        type: movementType,
        quantity,
        stockBefore,
        stockAfter,
      },
    });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
});

app.use("/api", (_req, res) => apiError(res, 404, "NOT_FOUND", "Recurso API no encontrado."));

app.use((error, _req, res, _next) => {
  console.error(`[QAFlow] ${error.code ?? "UNEXPECTED_ERROR"}: ${error.message}`);
  if (error instanceof SyntaxError && "body" in error) {
    return apiError(res, 400, "INVALID_JSON", "El cuerpo de la solicitud no contiene JSON válido.");
  }
  return apiError(res, 500, "INTERNAL_ERROR", "Ocurrió un error interno controlado.");
});

export { app };
