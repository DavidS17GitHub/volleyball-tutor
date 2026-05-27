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
