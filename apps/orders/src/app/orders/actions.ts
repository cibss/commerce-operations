"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  cancelOrder,
  CommerceApiError,
  completeOrder,
  confirmOrder,
  processOrder,
  shipOrder,
} from "@/lib/commerce-api";

function getString(formData: FormData, fieldName: string) {
  return String(formData.get(fieldName) ?? "").trim();
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

  return url.replace(/\/+$/, "");
}

function getOrderUrl(orderId: string) {
  return `${getCommercePlatformUrl()}/orders/${orderId}`;
}

async function runOrderTransition(
  orderId: string,
  transition: () => Promise<unknown>,
) {
  try {
    await transition();
  } catch (error) {
    const message = encodeURIComponent(getErrorMessage(error));

    redirect(`${getOrderUrl(orderId)}?error=${message}`);
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);

  redirect(getOrderUrl(orderId));
}

export async function confirmOrderAction(formData: FormData) {
  const orderId = getString(formData, "orderId");

  await runOrderTransition(orderId, () => confirmOrder(orderId));
}

export async function processOrderAction(formData: FormData) {
  const orderId = getString(formData, "orderId");

  await runOrderTransition(orderId, () => processOrder(orderId));
}

export async function shipOrderAction(formData: FormData) {
  const orderId = getString(formData, "orderId");

  await runOrderTransition(orderId, () => shipOrder(orderId));
}

export async function completeOrderAction(formData: FormData) {
  const orderId = getString(formData, "orderId");

  await runOrderTransition(orderId, () => completeOrder(orderId));
}

export async function cancelOrderAction(formData: FormData) {
  const orderId = getString(formData, "orderId");

  await runOrderTransition(orderId, () => cancelOrder(orderId));
}
