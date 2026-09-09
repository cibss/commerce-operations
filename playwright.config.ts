import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 1 : 0,

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
    baseURL: "http://localhost:3000",

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

    url: "http://localhost:3000/work/commerce-operations/quotations",

    reuseExistingServer: !process.env.CI,

    timeout: 120_000,
  },
});
