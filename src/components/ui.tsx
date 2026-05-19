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
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/14 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-[#48F5D3]/45 hover:text-white hover:shadow-[0_0_32px_rgba(72,245,211,0.20)]",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent before:transition before:duration-500 hover:before:translate-x-full",
        variant === "primary"
          ? ""
          : ""
      )}
      href={href}
    >
      <span className="relative z-10">{children}</span>
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
