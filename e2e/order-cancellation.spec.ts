import { expect, test } from "@playwright/test";

const COMMERCE_BASE_PATH = "/work/commerce-operations";
const COMMERCE_API_ORIGIN = "http://localhost:3003";

test.describe("order cancellation workflow", () => {
  test("cancels a pending payment when its confirmed order is cancelled", async ({
    page,
    request,
  }) => {
    const orderId = "ORD-2026-0181";
    const paymentId = "PAY-2026-0091";

    await page.goto(`${COMMERCE_BASE_PATH}/orders/${orderId}`);

    await expect(
      page.getByRole("heading", {
        name: orderId,
      }),
    ).toBeVisible();

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

    const cancelButton = page.getByRole("button", {
      name: "Cancel order",
    });

    await expect(cancelButton).toBeEnabled();

    await cancelButton.click();

    await expect(
      page
        .getByText("CANCELLED", {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Start processing",
      }),
    ).not.toBeVisible();

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

    await expect(
      page.getByRole("heading", {
        name: paymentId,
      }),
    ).toBeVisible();

    await expect(
      page
        .getByText("CANCELLED", {
          exact: true,
        })
        .first(),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Mark as paid",
      }),
    ).not.toBeVisible();

    const blockedPaymentResponse = await request.post(
      `${COMMERCE_API_ORIGIN}/api/payments/${paymentId}/pay`,
    );

    expect(blockedPaymentResponse.status()).toBe(409);

    const blockedPaymentBody = (await blockedPaymentResponse.json()) as {
      error?: {
        message?: string;
      };
    };

    expect(blockedPaymentBody.error?.message).toContain(
      "cannot transition from CANCELLED to PAID",
    );
  });
});
