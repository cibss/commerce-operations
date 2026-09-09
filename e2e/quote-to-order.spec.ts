import { expect, test } from "@playwright/test";

const COMMERCE_BASE_PATH = "/work/commerce-operations";

test.describe("quote-to-order workflow", () => {
  test("creates, approves, converts, and fulfills an order across microfrontends", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.goto(`${COMMERCE_BASE_PATH}/quotations`);

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

    await expect(page).toHaveURL(
      /\/work\/commerce-operations\/quotations\/QT-\d{4}-\d{4}$/,
    );

    const quotationId = page.url().split("/").pop();

    expect(quotationId).toBeTruthy();

    if (!quotationId) {
      throw new Error(
        "Quotation ID was not found after creating the quotation.",
      );
    }

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

    const convertButton = page.getByRole("button", {
      name: /Convert to order/i,
    });

    await expect(convertButton).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/work\/commerce-operations\/orders\/ORD-\d{4}-\d{4}$/, {
        timeout: 20_000,
        waitUntil: "commit",
      }),

      convertButton.click(),
    ]);

    const orderId = page.url().split("/").pop();

    expect(orderId).toBeTruthy();

    if (!orderId) {
      throw new Error("Order ID was not found after converting the quotation.");
    }

    expect(orderId).toMatch(/^ORD-\d{4}-\d{4}$/);

    await expect(
      page.getByRole("heading", {
        name: orderId,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText(quotationId, {
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
