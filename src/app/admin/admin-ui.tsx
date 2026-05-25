export function AdminSection({
  title,
  intro,
  children
}: React.PropsWithChildren<{ title: string; intro?: string }>) {
  return (
    <section>
      <h1 className="text-3xl font-semibold">{title}</h1>
      {intro ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8E9B91]">{intro}</p> : null}
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
      <span className="mb-2 block text-sm text-[#F4EEDA]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass = "w-full rounded-xl border border-[rgba(239,228,197,0.16)] bg-[rgba(244,238,218,0.06)] px-4 py-3 text-sm text-[#F4EEDA] outline-none placeholder:text-[#8E9B91]/75 focus:border-[#35BEE7]";
export const selectClass = "w-full rounded-xl border border-[rgba(239,228,197,0.16)] bg-[#0A1715] px-4 py-3 text-sm text-[#F4EEDA] outline-none focus:border-[#35BEE7]";
export const textareaClass = "min-h-28 w-full rounded-xl border border-[rgba(239,228,197,0.16)] bg-[rgba(244,238,218,0.06)] px-4 py-3 text-sm text-[#F4EEDA] outline-none placeholder:text-[#8E9B91]/75 focus:border-[#35BEE7]";

export function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  return <button className="rounded-full bg-[#F5C66B] px-5 py-3 text-sm font-semibold text-[#04100E] transition hover:shadow-[0_0_26px_rgba(245,198,107,0.18)]">{children}</button>;
}

export function DangerButton({ children = "Delete" }: { children?: React.ReactNode }) {
  return <button className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200">{children}</button>;
}
