import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,

  forbidOnly: Boolean(process.env.CI),

  /*
   * One retry is enough to expose genuine
   * flakiness in CI without masking unstable
   * tests behind multiple retries.
   */
  retries: process.env.CI ? 1 : 0,

  /*
   * E2E tests mutate shared commerce state,
   * so keep execution sequential.
   */
  workers: 1,

  reporter: process.env.CI
    ? [
        ["github"],
        ["list"],
        [
          "html",
          {
            open: "never",
          },
        ],
      ]
    : "list",

  use: {
    baseURL: "http://localhost:3024",

    /*
     * Retain traces for failed attempts so
     * CI artifacts contain the request,
     * navigation, and DOM timeline.
     */
    trace: "retain-on-failure",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: "npm run dev",

    url: "http://localhost:3024",

    reuseExistingServer: !process.env.CI,

    timeout: 120_000,
  },
});
