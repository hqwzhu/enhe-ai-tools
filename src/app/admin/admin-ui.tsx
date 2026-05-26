export function AdminSection({
  title,
  intro,
  children
}: React.PropsWithChildren<{ title: string; intro?: string }>) {
  return (
    <section>
      <h1 className="text-3xl font-semibold text-[#F6FAFF]">{title}</h1>
      {intro ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8F9DB2]">{intro}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  className
}: React.PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm text-[#F6FAFF]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full rounded-xl border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.06)] px-4 py-3 text-sm text-[#F6FAFF] outline-none placeholder:text-[#8F9DB2]/75 focus:border-[#7DD3FC]";
export const selectClass = "w-full rounded-xl border border-[rgba(210,230,255,0.16)] bg-[#07101E] px-4 py-3 text-sm text-[#F6FAFF] outline-none focus:border-[#7DD3FC]";
export const textareaClass = "min-h-28 w-full rounded-xl border border-[rgba(210,230,255,0.16)] bg-[rgba(238,246,255,0.06)] px-4 py-3 text-sm text-[#F6FAFF] outline-none placeholder:text-[#8F9DB2]/75 focus:border-[#7DD3FC]";

export function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  return <button className="rounded-full bg-[#7DD3FC] px-5 py-3 text-sm font-semibold text-[#030611] transition hover:shadow-[0_0_26px_rgba(125,211,252,0.18)]">{children}</button>;
}

export function DangerButton({ children = "Delete" }: { children?: React.ReactNode }) {
  return <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">{children}</button>;
}
