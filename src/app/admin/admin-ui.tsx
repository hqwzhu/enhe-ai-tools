export function AdminSection({
  title,
  intro,
  children
}: React.PropsWithChildren<{ title: string; intro?: string }>) {
  return (
    <section>
      <h1 className="text-3xl font-semibold">{title}</h1>
      {intro ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">{intro}</p> : null}
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
      <span className="mb-2 block text-sm text-[#E8EEF8]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]";
export const selectClass = "w-full rounded-xl border border-white/12 bg-[#111827] px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]";
export const textareaClass = "min-h-28 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm outline-none focus:border-[#7AA7FF]";

export function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  return <button className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">{children}</button>;
}

export function DangerButton({ children = "Delete" }: { children?: React.ReactNode }) {
  return <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">{children}</button>;
}
