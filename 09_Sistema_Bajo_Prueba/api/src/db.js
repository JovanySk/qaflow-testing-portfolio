import mysql from "mysql2/promise";
import { config } from "./config.js";
import { hashPassword } from "./auth.js";

let pool;

const commonOptions = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  waitForConnections: true,
  connectionLimit: 8,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: "Z",
};

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password_salt CHAR(32) NOT NULL,
    password_hash CHAR(128) NOT NULL,
    role ENUM('ADMIN', 'OPERATOR', 'VIEWER') NOT NULL DEFAULT 'OPERATOR',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    sku VARCHAR(48) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(300) NULL,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_products_sku (sku),
    CONSTRAINT chk_products_price CHECK (unit_price >= 0),
    CONSTRAINT chk_products_stock CHECK (stock >= 0)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM('ENTRY', 'EXIT') NOT NULL,
    quantity INT NOT NULL,
    stock_before INT NOT NULL,
    stock_after INT NOT NULL,
    notes VARCHAR(300) NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inventory_product (product_id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_inventory_user FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT chk_inventory_quantity CHECK (quantity > 0),
    CONSTRAINT chk_inventory_stock CHECK (stock_before >= 0 AND stock_after >= 0)
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    details JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_entity (entity_type, entity_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id)
  ) ENGINE=InnoDB`,
];

async function seedData() {
  const [users] = await pool.execute("SELECT id FROM users WHERE username = ? LIMIT 1", [config.seed.username]);
  if (users.length === 0) {
    const password = await hashPassword(config.seed.password);
    await pool.execute(
      "INSERT INTO users (username, password_salt, password_hash, role) VALUES (?, ?, ?, 'ADMIN')",
      [config.seed.username, password.salt, password.hash],
    );
  }

  await pool.execute(
    `INSERT IGNORE INTO products (sku, name, description, unit_price, stock)
     VALUES
       ('QA-RAW-001', 'Lámina de acero', 'Materia prima para pruebas de inventario.', 185.50, 24),
       ('QA-FIN-001', 'Panel ensamblado', 'Producto terminado de referencia.', 899.00, 6)`,
  );
}

export async function initializeDatabase() {
  const bootstrap = mysql.createPool(commonOptions);
  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
    );
  } finally {
    await bootstrap.end();
  }

  pool = mysql.createPool({ ...commonOptions, database: config.database.name });
  for (const statement of schemaStatements) {
    await pool.query(statement);
  }
  await seedData();
  await pool.query("SELECT 1");
}

export function database() {
  if (!pool) throw new Error("La base de datos todavía no ha sido inicializada.");
  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
