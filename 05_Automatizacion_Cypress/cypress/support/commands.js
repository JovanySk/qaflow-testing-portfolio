Cypress.Commands.add("getByCy", (selector, options = {}) => {
  return cy.get(`[data-cy="${selector}"]`, options);
});

Cypress.Commands.add("loginFromUi", ({ username, password }) => {
  cy.getByCy("login-username").clear().type(username);
  cy.getByCy("login-password").clear().type(password, { log: false });
  cy.getByCy("login-submit").click();
});
