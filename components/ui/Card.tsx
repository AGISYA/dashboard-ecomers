export default function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="card p-5">
      <div className="text-sm text-muted">{title}</div>
      <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
      {subtitle && <div className="mt-2 text-sm text-muted">{subtitle}</div>}
    </div>
  );
}
