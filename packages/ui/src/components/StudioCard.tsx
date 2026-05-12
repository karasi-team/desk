import type { PropsWithChildren } from "react";
import type { Subject } from "@karasi/types";

interface StudioCardProps extends PropsWithChildren {
  title: string;
  subject: Subject;
}

export function StudioCard({ title, subject, children }: StudioCardProps) {
  return (
    <article className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-studio backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">{subject}</p>
      <h3 className="mt-2 font-display text-xl text-emerald-950">{title}</h3>
      <div className="mt-4 font-body">{children}</div>
    </article>
  );
}
