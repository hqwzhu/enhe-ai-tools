import Link from "next/link";
import { cn } from "@/lib/utils";

export function Container({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Badge({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn("rounded-full border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.08)] px-3 py-1 text-xs font-semibold text-[#C8D6EA]", className)}>
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
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[rgba(210,230,255,0.18)] bg-[rgba(238,246,255,0.06)] px-5 py-3 text-sm font-semibold text-[#F6FAFF] transition duration-300 hover:-translate-y-0.5 hover:border-[#7DD3FC]/55 hover:text-white hover:shadow-[0_0_32px_rgba(125,211,252,0.16)]",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[#7DD3FC]/18 before:to-transparent before:transition before:duration-500 hover:before:translate-x-full",
        variant === "primary"
          ? ""
          : ""
      )}
      href={href}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <p className="mb-3 text-sm font-semibold tracking-[0.12em] text-[#7DD3FC] uppercase">{eyebrow}</p> : null}
      <h2 className="text-3xl font-semibold tracking-normal text-[#F6FAFF] md:text-4xl">{title}</h2>
      {intro ? <p className="mt-4 text-base leading-7 text-[#8F9DB2]">{intro}</p> : null}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="dossier-card p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#8F9DB2]">{text}</p>
    </div>
  );
}
