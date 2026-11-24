const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 8000,
  requestTimeout: 8000,
  responseTimeout: 8000,
  pageLoadTimeout: 30000,
  video: false,
  allowCypressEnv: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: "Evidencias/screenshots",
  downloadsFolder: "cypress/downloads",
  e2e: {
    baseUrl: "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    testIsolation: true,
    setupNodeEvents(on) {
      on("task", {
        log(message) {
          console.log(`[Cypress QAFlow] ${message}`);
          return null;
        },
      });
    },
  },
});
