describe("QAFlow - autenticación", () => {
  beforeEach(() => {
    cy.fixture("usuarios").as("usuarios");
    cy.visit("/");
    cy.getByCy("login-form").should("be.visible");
  });

  it("CY-LOGIN-001 permite iniciar sesión con credenciales válidas", function () {
    cy.intercept("POST", "/api/auth/login").as("loginExitoso");
    cy.intercept("GET", "/api/products", (request) => {
      delete request.headers["if-none-match"];
      delete request.headers["if-modified-since"];
      request.on("before:response", (response) => {
        response.headers["cache-control"] = "no-store";
      });
    }).as("consultaProductos");

    cy.loginFromUi(this.usuarios.valido);

    cy.wait("@loginExitoso").then(({ request, response }) => {
      expect(request.body).to.deep.equal(this.usuarios.valido);
      expect(response.statusCode).to.equal(200);
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.body.data.token).to.be.a("string").and.not.be.empty;
      expect(response.body.data.user).to.include({ username: "qa.admin", role: "ADMIN" });
    });
    cy.wait("@consultaProductos").its("response.statusCode").should("eq", 200);

    cy.getByCy("app-shell").should("be.visible");
    cy.getByCy("current-user").should("contain.text", "qa.admin").and("contain.text", "ADMIN");
    cy.getByCy("products-list").find("tr").should("have.length.at.least", 1);
    cy.scrollTo("top");
    cy.get("#dashboard-title").should("be.visible");
    cy.screenshot("CY-LOGIN-001_login_exitoso", { capture: "viewport" });
  });

  it("CY-LOGIN-002 rechaza credenciales incorrectas", function () {
    cy.intercept("POST", "/api/auth/login").as("loginIncorrecto");

    cy.loginFromUi(this.usuarios.invalido);

    cy.wait("@loginIncorrecto").then(({ response }) => {
      expect(response.statusCode).to.equal(401);
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.body.error).to.deep.include({
        code: "INVALID_CREDENTIALS",
        message: "Credenciales incorrectas.",
      });
    });
    cy.getByCy("login-message").should("be.visible").and("contain.text", "Credenciales incorrectas.");
    cy.getByCy("app-shell").should("not.be.visible");
    cy.scrollTo("top");
    cy.get("#login-title").should("be.visible");
    cy.screenshot("CY-LOGIN-002_login_incorrecto", { capture: "viewport" });
  });

  it("CY-LOGIN-003 valida los campos obligatorios sin enviar la solicitud", () => {
    let loginRequests = 0;
    cy.intercept("POST", "/api/auth/login", (request) => {
      loginRequests += 1;
      request.continue();
    }).as("loginNoEsperado");

    cy.getByCy("login-submit").click();

    cy.getByCy("login-message")
      .should("be.visible")
      .and("contain.text", "Usuario y contraseña son obligatorios.");
    cy.getByCy("login-username").should("be.focused");
    cy.wrap(null).should(() => {
      expect(loginRequests).to.equal(0);
    });
    cy.scrollTo("top");
    cy.get("#login-title").should("be.visible");
    cy.screenshot("CY-LOGIN-003_campos_vacios", { capture: "viewport" });
  });

  it("CY-LOGIN-004 permite cerrar una sesión autenticada", function () {
    cy.intercept("POST", "/api/auth/login").as("loginParaLogout");
    cy.intercept("GET", "/api/products", (request) => {
      delete request.headers["if-none-match"];
      delete request.headers["if-modified-since"];
      request.on("before:response", (response) => {
        response.headers["cache-control"] = "no-store";
      });
    }).as("productosParaLogout");
    cy.intercept("POST", "/api/auth/logout").as("logout");

    cy.loginFromUi(this.usuarios.valido);
    cy.wait("@loginParaLogout").its("response.statusCode").should("eq", 200);
    cy.wait("@productosParaLogout").its("response.statusCode").should("eq", 200);
    cy.getByCy("app-shell").should("be.visible");

    cy.getByCy("logout-button").click();

    cy.wait("@logout").its("response.statusCode").should("eq", 204);
    cy.getByCy("login-form").should("be.visible");
    cy.getByCy("app-shell").should("not.be.visible");
    cy.getByCy("login-message").should("contain.text", "Sesión cerrada correctamente.");
    cy.scrollTo("top");
    cy.get("#login-title").should("be.visible");
    cy.screenshot("CY-LOGIN-004_cierre_sesion", { capture: "viewport" });
  });
});
