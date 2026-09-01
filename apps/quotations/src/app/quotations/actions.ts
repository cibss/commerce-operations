"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  acceptQuotation,
  CommerceApiError,
  convertQuotation,
  createQuotation,
  rejectQuotation,
  sendQuotation,
} from "@/lib/commerce-api";

function getString(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "").trim();
}

function getNumber(formData: FormData, fieldName: string) {
  return Number(formData.get(fieldName));
}

function getErrorMessage(error: unknown) {
  if (error instanceof CommerceApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function getCommercePlatformUrl() {
  const url = process.env.COMMERCE_PLATFORM_URL;

  if (!url) {
    throw new Error("Missing COMMERCE_PLATFORM_URL environment variable.");
  }

  return url.replace(/\/$/, "");
}

export async function createQuotationAction(formData: FormData) {
  const customerName = getString(formData, "customerName");

  const sku = getString(formData, "sku");

  const itemName = getString(formData, "itemName");

  const quantity = getNumber(formData, "quantity");

  const unitPrice = getNumber(formData, "unitPrice");

  const discount = getNumber(formData, "discount");

  let quotationId: string;

  try {
    const quotation = await createQuotation({
      customerName,
      items: [
        {
          sku,
          name: itemName,
          quantity,
          unitPrice,
        },
      ],
      discount,
      currency: "IDR",
    });

    quotationId = quotation.id;
  } catch (error) {
    const message = encodeURIComponent(getErrorMessage(error));

    redirect(`/quotations/new?error=${message}`);
  }

  revalidatePath("/quotations");

  redirect(`/quotations/${quotationId}`);
}

async function runQuotationTransition(
  quotationId: string,
  transition: () => Promise<unknown>,
) {
  try {
    await transition();
  } catch (error) {
    const message = encodeURIComponent(getErrorMessage(error));

    redirect(`/quotations/${quotationId}?error=${message}`);
  }

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);

  redirect(`/quotations/${quotationId}`);
}

export async function sendQuotationAction(formData: FormData) {
  const quotationId = getString(formData, "quotationId");

  await runQuotationTransition(quotationId, () => sendQuotation(quotationId));
}

export async function acceptQuotationAction(formData: FormData) {
  const quotationId = getString(formData, "quotationId");

  await runQuotationTransition(quotationId, () => acceptQuotation(quotationId));
}

export async function rejectQuotationAction(formData: FormData) {
  const quotationId = getString(formData, "quotationId");

  await runQuotationTransition(quotationId, () => rejectQuotation(quotationId));
}

export async function convertQuotationAction(formData: FormData) {
  const quotationId = getString(formData, "quotationId");

  let orderId: string;

  try {
    const result = await convertQuotation(quotationId);

    orderId = result.orderId;
  } catch (error) {
    const message = encodeURIComponent(getErrorMessage(error));

    redirect(`/quotations/${quotationId}?error=${message}`);
  }

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${quotationId}`);

  redirect(`${getCommercePlatformUrl()}/orders/${orderId}`);
}
