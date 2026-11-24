import "./commands";

beforeEach(() => {
  cy.task("log", `Ejecutando: ${Cypress.currentTest.titlePath.join(" > ")}`);
});
