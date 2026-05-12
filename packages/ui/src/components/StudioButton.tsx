import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type StudioButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
  }
>;

export function StudioButton({ children, variant = "primary", className = "", ...props }: StudioButtonProps) {
  const base =
    "inline-flex items-center rounded-full border px-5 py-2.5 font-display text-sm tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500";

  const style =
    variant === "primary"
      ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-900"
      : "border-coral-500 bg-coral-50 text-coral-700 hover:bg-coral-100";

  return (
    <button className={`${base} ${style} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
