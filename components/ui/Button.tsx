export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
  const base = "btn";
  const v = variant === "primary" ? "btn-primary" : "btn-outline";
  return (
    <button className={`${base} ${v} ${className}`} {...props}>
      {children}
    </button>
  );
}
