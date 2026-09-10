import { expect, test } from "@playwright/test";

const COMMERCE_BASE_PATH = "/work/commerce-operations";
const COMMERCE_API_ORIGIN = "http://localhost:3003";

test.describe("quote-to-cash workflow", () => {
  test("moves a quotation through payment clearance and fulfillment across zones", async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000);

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

    // A converted order starts as PENDING and must not have a payment yet.
    await expect(
      page.getByText("NOT CREATED", {
        exact: true,
      }),
    ).toBeVisible();

    const confirmButton = page.getByRole("button", {
      name: "Confirm order",
    });

    await Promise.all([
      page.waitForURL(
        /\/work\/commerce-operations\/payments\/PAY-\d{4}-\d{4}$/,
        {
          timeout: 20_000,
          waitUntil: "commit",
        },
      ),

      confirmButton.click(),
    ]);

    const paymentId = page.url().split("/").pop();

    expect(paymentId).toBeTruthy();

    if (!paymentId) {
      throw new Error("Payment ID was not found after confirming the order.");
    }

    expect(paymentId).toMatch(/^PAY-\d{4}-\d{4}$/);

    await expect(
      page.getByRole("heading", {
        name: paymentId,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText("PENDING", {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    // Backend must reject fulfillment while payment is still pending.
    const blockedProcessingResponse = await request.post(
      `${COMMERCE_API_ORIGIN}/api/orders/${orderId}/process`,
    );

    expect(blockedProcessingResponse.status()).toBe(409);

    const blockedProcessingBody = (await blockedProcessingResponse.json()) as {
      error?: {
        message?: string;
      };
    };

    expect(blockedProcessingBody.error?.message).toContain(
      "cannot start processing until payment is PAID",
    );

    // Return to the order before paying to verify the UI gate.
    await Promise.all([
      page.waitForURL(
        new RegExp(`/work/commerce-operations/orders/${orderId}$`),
        {
          timeout: 20_000,
          waitUntil: "commit",
        },
      ),

      page
        .getByRole("link", {
          name: /View order/i,
        })
        .click(),
    ]);

    await expect(
      page.getByText(paymentId, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText("PENDING", {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Start processing",
      }),
    ).toBeDisabled();

    // Go back to the payment and clear it.
    await Promise.all([
      page.waitForURL(
        new RegExp(`/work/commerce-operations/payments/${paymentId}$`),
        {
          timeout: 20_000,
          waitUntil: "commit",
        },
      ),

      page
        .getByRole("link", {
          name: /View payment/i,
        })
        .click(),
    ]);

    const markPaidButton = page.getByRole("button", {
      name: "Mark as paid",
    });

    await expect(markPaidButton).toBeVisible();

    await Promise.all([
      page.waitForURL(
        new RegExp(`/work/commerce-operations/orders/${orderId}$`),
        {
          timeout: 20_000,
          waitUntil: "commit",
        },
      ),

      markPaidButton.click(),
    ]);

    await expect(
      page.getByText(paymentId, {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText("PAID", {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    const startProcessingButton = page.getByRole("button", {
      name: "Start processing",
    });

    await expect(startProcessingButton).toBeEnabled();

    // A PAID order cannot be cancelled before its payment is refunded.
    await expect(
      page.getByRole("button", {
        name: "Cancel order",
      }),
    ).toBeDisabled();

    const blockedCancellationResponse = await request.post(
      `${COMMERCE_API_ORIGIN}/api/orders/${orderId}/cancel`,
    );

    expect(blockedCancellationResponse.status()).toBe(409);

    const blockedCancellationBody =
      (await blockedCancellationResponse.json()) as {
        error?: {
          message?: string;
        };
      };

    expect(blockedCancellationBody.error?.message).toContain(
      "must be refunded before order",
    );

    await startProcessingButton.click();

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
