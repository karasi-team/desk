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

export type DrawingTool = "pen" | "eraser" | "text";

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  roomId: string;
  userId: string;
  tool: Exclude<DrawingTool, "text">;
  color: string;
  size: number;
  points: CanvasPoint[];
  createdAt: string;
}

export interface TextAnnotation {
  id: string;
  roomId: string;
  userId: string;
  color: string;
  position: CanvasPoint;
  text: string;
  createdAt: string;
}

export type CanvasEventType = "stroke" | "text" | "clear";

export interface CanvasEvent {
  eventId: string;
  roomId: string;
  userId: string;
  sequence: number;
  type: CanvasEventType;
  payload: CanvasStroke | TextAnnotation | { reason?: string };
  createdAt: string;
}

export interface PresenceState {
  roomId: string;
  userId: string;
  displayName?: string;
  color?: string;
  isActive: boolean;
  lastSeenAt: string;
}
