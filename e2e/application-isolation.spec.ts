import { expect, test } from "@playwright/test";

test.describe("application isolation", () => {
  test("quotations can run as a standalone application", async ({ page }) => {
    await page.goto("http://localhost:3001/quotations");

    await expect(
      page.getByRole("heading", {
        name: "Quotations",
      }),
    ).toBeVisible();
  });

  test("orders can run as a standalone application", async ({ page }) => {
    await page.goto("http://localhost:3002/orders");

    await expect(
      page.getByRole("heading", {
        name: "Orders",
      }),
    ).toBeVisible();
  });

  test("customers can run as a standalone application", async ({ page }) => {
    await page.goto("http://localhost:3004/customers");

    await expect(
      page.getByRole("heading", {
        name: "Customers",
      }),
    ).toBeVisible();
  });

  test("payments can run as a standalone application", async ({ page }) => {
    await page.goto("http://localhost:3005/payments");

    await expect(
      page.getByRole("heading", {
        name: "Payments",
      }),
    ).toBeVisible();
  });
});
