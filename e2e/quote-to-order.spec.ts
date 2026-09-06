import { expect, test } from "@playwright/test";

test.describe("quote-to-order workflow", () => {
  test("creates, approves, converts, and fulfills an order across microfrontends", async ({
    page,
  }) => {
    await page.goto("/quotations");

    await expect(
      page.getByRole("heading", {
        name: "Quotations",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: /Create quotation/i,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Create quotation",
      }),
    ).toBeVisible();

    await page.getByLabel("Customer account").selectOption("CUST-0192");

    await page.getByLabel("SKU").fill("E2E-MONITOR-01");

    await page.getByLabel("Item name").fill("E2E Test Monitor");

    await page.getByLabel("Quantity").fill("2");

    await page.getByLabel("Unit price").fill("5000000");

    await page.getByLabel("Discount").fill("1000000");

    await page
      .getByRole("button", {
        name: "Create draft quotation",
      })
      .click();

    await expect(page).toHaveURL(/\/quotations\/QT-\d{4}-\d{4}$/);

    const quotationId = page.url().split("/").pop();

    expect(quotationId).toBeTruthy();

    await expect(
      page.getByRole("button", {
        name: "Send quotation",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Send quotation",
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Accept quotation",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Accept quotation",
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: /Convert to order/i,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: /Convert to order/i,
      })
      .click();

    await expect(page).toHaveURL(/\/orders\/ORD-\d{4}-\d{4}$/);

    const orderId = page.url().split("/").pop();

    expect(orderId).toBeTruthy();

    await expect(
      page.getByRole("heading", {
        name: orderId!,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText(quotationId!, {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Confirm order",
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Start processing",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Start processing",
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Mark shipped",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Mark shipped",
      })
      .click();

    await expect(
      page.getByRole("button", {
        name: "Complete order",
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Complete order",
      })
      .click();

    await expect(
      page
        .getByText("COMPLETED", {
          exact: true,
        })
        .first(),
    ).toBeVisible();
  });
});
