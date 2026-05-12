import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StudioButton, StudioCard } from "@karasi/ui";
const sampleLessons = [
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
    return (_jsx("main", { className: "min-h-screen bg-surface px-6 py-10 text-ink sm:px-10", children: _jsxs("section", { className: "mx-auto max-w-5xl space-y-8", children: [_jsxs("header", { className: "space-y-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-emerald-700", children: "Karasi Desk" }), _jsx("h1", { className: "font-display text-4xl leading-tight text-emerald-950 sm:text-5xl", children: "Studio-grade learning, on one collaborative desk." }), _jsx("p", { className: "max-w-2xl text-base text-emerald-900/80 sm:text-lg", children: "Shared canvas, real-time calling, and subject modules designed for focused, high-fidelity instruction." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(StudioButton, { children: "Launch Live Room" }), _jsx(StudioButton, { variant: "secondary", children: "Explore Modules" })] })] }), _jsx("section", { className: "grid gap-4 sm:grid-cols-3", children: sampleLessons.map((lesson) => (_jsxs(StudioCard, { title: lesson.title, subject: lesson.subject, children: [_jsx("p", { className: "text-sm text-emerald-900/80", children: lesson.objective }), _jsxs("p", { className: "mt-3 text-xs uppercase tracking-[0.2em] text-coral-700", children: [lesson.durationMinutes, " minutes"] })] }, lesson.id))) })] }) }));
}
