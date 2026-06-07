"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export type FormSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: ReactNode;
  duplicateSubmitLabel?: ReactNode;
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
  duplicateSubmitLabel = "已经提交，请勿重复提交",
  variant = "primary",
  className,
  disabled,
  onClick,
  type = "submit",
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showDuplicateNotice, setShowDuplicateNotice] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmitButton = type === "submit";
  const isDisabled = Boolean(disabled || pending || hasSubmitted);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  function showDuplicateSubmitNotice() {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setShowDuplicateNotice(true);
    noticeTimerRef.current = setTimeout(() => setShowDuplicateNotice(false), 2600);
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;

    if (isSubmitButton && (pending || hasSubmitted || form?.dataset.submitted === "true")) {
      event.preventDefault();
      showDuplicateSubmitNotice();
      return;
    }

    onClick?.(event);
    if (event.defaultPrevented || !isSubmitButton) return;

    if (form && !form.checkValidity()) return;

    if (form) form.dataset.submitted = "true";
    setHasSubmitted(true);
    setShowDuplicateNotice(false);
  }

  return (
    <>
      <button
        {...props}
        type={type}
        disabled={disabled}
        aria-disabled={isDisabled}
        onClick={handleClick}
        className={cn(baseClass, variantClass[variant], isDisabled && "cursor-not-allowed opacity-70", className)}
      >
        {pending ? pendingLabel : children}
      </button>
      {showDuplicateNotice ? (
        <span
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-[#7DD3FC]/35 bg-[#08111f]/95 px-4 py-2 text-sm font-semibold text-[#E8EEF8] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        >
          {duplicateSubmitLabel}
        </span>
      ) : null}
    </>
  );
}
