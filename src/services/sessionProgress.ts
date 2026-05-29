import type { SessionProgressPoint } from "../types";

const storageKey = "volleyball-tutor:session-progress";

const isSessionProgressPoint = (value: unknown): value is SessionProgressPoint => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SessionProgressPoint>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.sessionNumber === "number" &&
    Number.isFinite(candidate.sessionNumber) &&
    typeof candidate.completedAt === "string" &&
    Number.isFinite(Date.parse(candidate.completedAt)) &&
    typeof candidate.videoCount === "number" &&
    Number.isFinite(candidate.videoCount) &&
    typeof candidate.correctCount === "number" &&
    Number.isFinite(candidate.correctCount) &&
    typeof candidate.accuracy === "number" &&
    Number.isFinite(candidate.accuracy) &&
    candidate.accuracy >= 0 &&
    candidate.accuracy <= 100
  );
};

export function loadSessionProgress(): SessionProgressPoint[] {
  let storedValue: string | null = null;

  try {
    storedValue = window.localStorage.getItem(storageKey);
  } catch {
    return [];
  }

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) && parsedValue.every(isSessionProgressPoint)
      ? parsedValue
      : [];
  } catch {
    return [];
  }
}

export function saveSessionProgress(points: SessionProgressPoint[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(points));
  } catch {
    return;
  }
}

export function createSessionProgressPoint(input: {
  existingPoints: SessionProgressPoint[];
  videoCount: number;
  correctCount: number;
}): SessionProgressPoint {
  const accuracy =
    input.videoCount > 0 ? Math.round((input.correctCount / input.videoCount) * 100) : 0;
  const sessionNumber = input.existingPoints.length + 1;

  return {
    id: `${Date.now()}-${sessionNumber}`,
    sessionNumber,
    completedAt: new Date().toISOString(),
    videoCount: input.videoCount,
    correctCount: input.correctCount,
    accuracy,
  };
}

export function resetSessionProgress() {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    return;
  }
}
