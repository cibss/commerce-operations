import { expect, test } from "@playwright/test";

const COMMERCE_BASE_PATH = "/work/commerce-operations";

test.describe("multi-zone navigation", () => {
  test("keeps a unified platform URL while navigating between domains", async ({
    page,
  }) => {
    await page.goto(COMMERCE_BASE_PATH);

    await expect(
      page.getByRole("heading", {
        name: "Commerce operations",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Quotations",
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        `localhost:3000${COMMERCE_BASE_PATH.replaceAll("/", "\\/")}\\/quotations$`,
      ),
    );

    await expect(
      page.getByRole("heading", {
        name: "Quotations",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Customers",
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        `localhost:3000${COMMERCE_BASE_PATH.replaceAll("/", "\\/")}\\/customers$`,
      ),
    );

    await expect(
      page.getByRole("heading", {
        name: "Customers",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Payments",
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        `localhost:3000${COMMERCE_BASE_PATH.replaceAll("/", "\\/")}\\/payments$`,
      ),
    );

    await expect(
      page.getByRole("heading", {
        name: "Payments",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Orders",
      })
      .first()
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        `localhost:3000${COMMERCE_BASE_PATH.replaceAll("/", "\\/")}\\/orders$`,
      ),
    );

    await expect(
      page.getByRole("heading", {
        name: "Orders",
      }),
    ).toBeVisible();
  });
});
