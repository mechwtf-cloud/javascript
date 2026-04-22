const { defineConfig } = require("playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: "msedge",
    headless: true
  },
  webServer: {
    command: "node server.js",
    port: 4173,
    reuseExistingServer: true
  }
});
