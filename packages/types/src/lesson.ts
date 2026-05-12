export type Subject = "english" | "math" | "law";

export interface Lesson {
  id: string;
  subject: Subject;
  title: string;
  objective: string;
  durationMinutes: number;
}

export interface EnglishLesson extends Lesson {
  subject: "english";
  readingLevel: "beginner" | "intermediate" | "advanced";
  prompt: string;
}

export interface MathLesson extends Lesson {
  subject: "math";
  topic: "algebra" | "geometry" | "calculus" | "statistics";
  requiredTools: string[];
}

export interface LawLesson extends Lesson {
  subject: "law";
  jurisdiction: string;
  caseReference?: string;
}

export type ModularLesson = EnglishLesson | MathLesson | LawLesson;
