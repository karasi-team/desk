import { StudioButton, StudioCard } from "@karasi/ui";
import type { Lesson } from "@karasi/types";

const sampleLessons: Lesson[] = [
  {
    id: "eng-01",
    subject: "english",
    title: "Narrative Structure Lab",
    objective: "Analyze character motivation and argument flow.",
    durationMinutes: 40
  },
  {
    id: "math-01",
    subject: "math",
    title: "Function Transform Studio",
    objective: "Map graph transformations collaboratively.",
    durationMinutes: 35
  },
  {
    id: "law-01",
    subject: "law",
    title: "Case Reasoning Workshop",
    objective: "Debate precedent and statutory interpretation.",
    durationMinutes: 45
  }
];

export default function App() {
  return (
    <main className="min-h-screen bg-surface px-6 py-10 text-ink sm:px-10">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Karasi Desk</p>
          <h1 className="font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
            Studio-grade learning, on one collaborative desk.
          </h1>
          <p className="max-w-2xl text-base text-emerald-900/80 sm:text-lg">
            Shared canvas, real-time calling, and subject modules designed for focused, high-fidelity
            instruction.
          </p>
          <div className="flex flex-wrap gap-3">
            <StudioButton>Launch Live Room</StudioButton>
            <StudioButton variant="secondary">Explore Modules</StudioButton>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {sampleLessons.map((lesson) => (
            <StudioCard key={lesson.id} title={lesson.title} subject={lesson.subject}>
              <p className="text-sm text-emerald-900/80">{lesson.objective}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-coral-700">
                {lesson.durationMinutes} minutes
              </p>
            </StudioCard>
          ))}
        </section>
      </section>
    </main>
  );
}
