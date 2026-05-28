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

export type UserRole = "free" | "premium" | "admin";
export type PlanStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled";

export interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  planStatus: PlanStatus;
  createdAt: string;
  updatedAt: string;
}
