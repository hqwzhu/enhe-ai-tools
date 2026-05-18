import Link from "next/link";
import { cn } from "@/lib/utils";

export function Container({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Badge({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn("rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-200", className)}>
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: React.PropsWithChildren<{ href: string; variant?: "primary" | "ghost" }>) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
        variant === "primary"
          ? "bg-[#7AA7FF] text-[#07101f] shadow-[0_0_28px_rgba(122,167,255,0.35)]"
          : "border border-white/12 bg-white/6 text-slate-100"
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <p className="mb-3 text-sm font-semibold text-[#48F5D3]">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-normal text-[#E8EEF8] md:text-4xl">{title}</h2>
      {intro ? <p className="mt-4 text-base leading-7 text-[#8B95A7]">{intro}</p> : null}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#8B95A7]">{text}</p>
    </div>
  );
}
