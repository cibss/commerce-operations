"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CommerceApiError,
  markPaymentFailed,
  markPaymentPaid,
  refundPayment,
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

async function runPaymentTransition(
  paymentId: string,
  transition: () => Promise<unknown>,
) {
  try {
    await transition();
  } catch (error) {
    const message = encodeURIComponent(getErrorMessage(error));

    redirect(`/payments/${paymentId}?error=${message}`);
  }

  revalidatePath("/payments");

  revalidatePath(`/payments/${paymentId}`);

  redirect(`/payments/${paymentId}`);
}

export async function markPaymentPaidAction(formData: FormData) {
  const paymentId = getString(formData, "paymentId");

  await runPaymentTransition(paymentId, () => markPaymentPaid(paymentId));
}

export async function markPaymentFailedAction(formData: FormData) {
  const paymentId = getString(formData, "paymentId");

  await runPaymentTransition(paymentId, () => markPaymentFailed(paymentId));
}

export async function refundPaymentAction(formData: FormData) {
  const paymentId = getString(formData, "paymentId");

  await runPaymentTransition(paymentId, () => refundPayment(paymentId));
}
