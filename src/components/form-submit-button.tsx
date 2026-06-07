"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export type FormSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: ReactNode;
  variant?: "primary" | "success" | "secondary" | "danger";
};

const baseClass =
  "inline-flex items-center justify-center rounded-full font-semibold transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

const variantClass = {
  primary:
    "bg-[#7DD3FC] px-5 py-3 text-sm text-[#030611] hover:shadow-[0_0_26px_rgba(125,211,252,0.18)]",
  success:
    "bg-[#48F5D3] px-5 py-3 text-sm text-[#05110e] hover:shadow-[0_0_26px_rgba(72,245,211,0.18)]",
  secondary:
    "border border-white/12 px-5 py-3 text-sm text-[#E8EEF8] hover:border-[#7DD3FC]/50 hover:text-[#7DD3FC]",
  danger:
    "border border-red-400/40 px-4 py-2 text-sm text-red-200 hover:border-red-300 hover:bg-red-400/10"
} as const;

export function FormSubmitButton({
  children,
  pendingLabel = "处理中...",
  variant = "primary",
  className,
  disabled,
  type = "submit",
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(baseClass, variantClass[variant], className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
