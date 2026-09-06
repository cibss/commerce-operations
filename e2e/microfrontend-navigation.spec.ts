import { expect, test } from "@playwright/test";

test.describe("microfrontend navigation", () => {
  test("keeps a unified platform URL while navigating between domains", async ({
    page,
  }) => {
    await page.goto("/");

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

    await expect(page).toHaveURL(/localhost:3024\/quotations$/);

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

    await expect(page).toHaveURL(/localhost:3024\/customers$/);

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

    await expect(page).toHaveURL(/localhost:3024\/payments$/);

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

    await expect(page).toHaveURL(/localhost:3024\/orders$/);

    await expect(
      page.getByRole("heading", {
        name: "Orders",
      }),
    ).toBeVisible();
  });
});
