export type SetOption = "outside" | "pipe" | "center" | "opposite";

export interface LessonClip {
  id: string;
  title: string;
  skillFocus: string;
  videoUrl?: string;
  videoPath?: string;
  pauseAtSeconds: number;
  correctAnswer: SetOption;
  explanation: string;
}

export interface AnswerState {
  selected: SetOption;
  isCorrect: boolean;
}

export interface LessonProgressStats {
  attempts: number;
  correct: number;
  lastAnsweredAt?: string;
}

export interface PlayerProgress {
  id: string;
  userId: string;
  totalAttempts: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  lessonStats: Record<string, LessonProgressStats>;
  createdAt: string;
  updatedAt: string;
}
