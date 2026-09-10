"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { buttonClassName, type ButtonSize, type ButtonVariant } from "./Button";

type SubmitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> & {
  children: ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const isDisabled = disabled || pending;

  return (
    <button
      {...props}
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={buttonClassName(variant, size, `gap-2 ${className}`)}
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}

      <span>{pending ? pendingText : children}</span>
    </button>
  );
}
