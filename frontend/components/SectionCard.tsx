type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-2xl font-semibold leading-tight text-[color:var(--ink)]">{title}</h2>
      <div className="mt-4 text-[color:var(--muted)]">{children}</div>
    </section>
  );
}
