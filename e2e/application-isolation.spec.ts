import { expect, test } from "@playwright/test";

const COMMERCE_BASE_PATH = "/work/commerce-operations";

test.describe("application isolation", () => {
  test("quotations can run as a standalone application", async ({ page }) => {
    await page.goto(`http://localhost:3001${COMMERCE_BASE_PATH}/quotations`);

    await expect(
      page.getByRole("heading", {
        name: "Quotations",
      }),
    ).toBeVisible();
  });

  test("orders can run as a standalone application", async ({ page }) => {
    await page.goto(`http://localhost:3002${COMMERCE_BASE_PATH}/orders`);

    await expect(
      page.getByRole("heading", {
        name: "Orders",
      }),
    ).toBeVisible();
  });

  test("customers can run as a standalone application", async ({ page }) => {
    await page.goto(`http://localhost:3004${COMMERCE_BASE_PATH}/customers`);

    await expect(
      page.getByRole("heading", {
        name: "Customers",
      }),
    ).toBeVisible();
  });

  test("payments can run as a standalone application", async ({ page }) => {
    await page.goto(`http://localhost:3005${COMMERCE_BASE_PATH}/payments`);

    await expect(
      page.getByRole("heading", {
        name: "Payments",
      }),
    ).toBeVisible();
  });
});
