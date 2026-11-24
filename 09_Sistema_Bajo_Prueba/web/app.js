const state = {
  token: sessionStorage.getItem("qaflowToken"),
  user: null,
};

const elements = {
  loginView: document.querySelector("#login-view"),
  appView: document.querySelector("#app-view"),
  loginForm: document.querySelector("#login-form"),
  loginMessage: document.querySelector("#login-message"),
  currentUser: document.querySelector("#current-user"),
  logoutButton: document.querySelector("#logout-button"),
  productsBody: document.querySelector("#products-body"),
  productsMessage: document.querySelector("#products-message"),
  refreshProducts: document.querySelector("#refresh-products"),
  productForm: document.querySelector("#product-form"),
  productMessage: document.querySelector("#product-message"),
  inventoryForm: document.querySelector("#inventory-form"),
  inventoryMessage: document.querySelector("#inventory-message"),
};

function setMessage(element, message = "", type = "") {
  element.textContent = message;
  element.className = `form-message${type ? ` ${type}` : ""}`;
}

function setBusy(form, busy) {
  const button = form.querySelector("button[type='submit']");
  button.disabled = busy;
  form.setAttribute("aria-busy", String(busy));
}

async function api(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers ?? {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error?.message ?? `Solicitud rechazada con HTTP ${response.status}.`);
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details;
    throw error;
  }
  return payload?.data;
}

function showLogin(message = "", type = "") {
  state.token = null;
  state.user = null;
  sessionStorage.removeItem("qaflowToken");
  elements.appView.hidden = true;
  elements.loginView.hidden = false;
  setMessage(elements.loginMessage, message, type);
  document.querySelector("#username").focus();
}

function showDashboard() {
  elements.loginView.hidden = true;
  elements.appView.hidden = false;
  elements.currentUser.textContent = state.user ? `${state.user.username} · ${state.user.role}` : "Sesión activa";
}

function renderProducts(products) {
  elements.productsBody.replaceChildren();
  if (products.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-row";
    cell.textContent = "No hay productos registrados.";
    row.append(cell);
    elements.productsBody.append(row);
    return;
  }

  const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
  for (const product of products) {
    const row = document.createElement("tr");
    const values = [product.id, product.sku, product.name, currency.format(product.unitPrice), product.stock];
    values.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (index === 4) cell.className = "stock-value";
      row.append(cell);
    });
    const status = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "state-badge";
    badge.textContent = product.active ? "ACTIVO" : "INACTIVO";
    status.append(badge);
    row.append(status);
    elements.productsBody.append(row);
  }
}

async function loadProducts() {
  setMessage(elements.productsMessage, "Consultando catálogo…");
  try {
    const products = await api("/api/products");
    renderProducts(products);
    setMessage(elements.productsMessage, `${products.length} producto(s) recuperado(s).`, "success");
    return true;
  } catch (error) {
    if (error.status === 401) {
      showLogin("La sesión expiró. Ingresa nuevamente.", "error");
      return false;
    }
    setMessage(elements.productsMessage, error.message, "error");
    return false;
  }
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.loginForm);
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    setMessage(elements.loginMessage, "Usuario y contraseña son obligatorios.", "error");
    (!username ? elements.loginForm.elements.username : elements.loginForm.elements.password).focus();
    return;
  }

  setBusy(elements.loginForm, true);
  setMessage(elements.loginMessage, "Validando credenciales…");
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    state.token = data.token;
    state.user = data.user;
    sessionStorage.setItem("qaflowToken", data.token);
    showDashboard();
    await loadProducts();
  } catch (error) {
    setMessage(elements.loginMessage, error.message, "error");
    elements.loginForm.elements.password.select();
  } finally {
    setBusy(elements.loginForm, false);
  }
});

elements.productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.productForm);
  const product = {
    sku: String(formData.get("sku") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    unitPrice: Number(formData.get("unitPrice")),
  };

  if (!product.sku || !product.name || !Number.isFinite(product.unitPrice) || product.unitPrice < 0) {
    setMessage(elements.productMessage, "Completa SKU, nombre y un precio válido.", "error");
    return;
  }

  setBusy(elements.productForm, true);
  setMessage(elements.productMessage, "Registrando producto…");
  try {
    const created = await api("/api/products", { method: "POST", body: JSON.stringify(product) });
    setMessage(elements.productMessage, `Producto ${created.sku} creado con ID ${created.id}.`, "success");
    elements.inventoryForm.elements.productId.value = created.id;
    elements.productForm.reset();
    await loadProducts();
  } catch (error) {
    setMessage(elements.productMessage, error.message, "error");
  } finally {
    setBusy(elements.productForm, false);
  }
});

elements.inventoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.inventoryForm);
  const movement = {
    productId: Number(formData.get("productId")),
    type: String(formData.get("type") ?? ""),
    quantity: Number(formData.get("quantity")),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  if (!Number.isSafeInteger(movement.productId) || movement.productId <= 0 || !Number.isSafeInteger(movement.quantity) || movement.quantity <= 0) {
    setMessage(elements.inventoryMessage, "Indica un ID y una cantidad entera mayor que cero.", "error");
    return;
  }

  setBusy(elements.inventoryForm, true);
  setMessage(elements.inventoryMessage, "Aplicando movimiento…");
  try {
    const created = await api("/api/inventory/movements", { method: "POST", body: JSON.stringify(movement) });
    setMessage(elements.inventoryMessage, `${created.type}: stock actualizado de ${created.stockBefore} a ${created.stockAfter}.`, "success");
    elements.inventoryForm.elements.quantity.value = "";
    elements.inventoryForm.elements.notes.value = "";
    await loadProducts();
  } catch (error) {
    setMessage(elements.inventoryMessage, error.message, "error");
  } finally {
    setBusy(elements.inventoryForm, false);
  }
});

elements.refreshProducts.addEventListener("click", loadProducts);
elements.logoutButton.addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    // La sesión local se elimina incluso si el token ya expiró.
  }
  showLogin("Sesión cerrada correctamente.", "success");
});

if (state.token) {
  showDashboard();
  loadProducts();
} else {
  showLogin();
}
