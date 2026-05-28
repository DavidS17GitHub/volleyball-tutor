import { RotateCcw, Target } from "lucide-react";
import type { LessonClip, PlayerProgress } from "../types";

interface ProgressRailProps {
  clips: LessonClip[];
  currentIndex: number;
  completedIds: string[];
  playerProgress: PlayerProgress | null;
  onResetProgress: () => void;
}

const formatPercent = (correct: number, attempts: number) =>
  attempts > 0 ? `${Math.round((correct / attempts) * 100)}%` : "0%";

export function ProgressRail({
  clips,
  currentIndex,
  completedIds,
  playerProgress,
  onResetProgress,
}: ProgressRailProps) {
  const currentClip = clips[currentIndex];

  if (!currentClip) {
    return null;
  }

  return (
    <aside className="progress-rail" aria-label="Lesson clips">
      <p className="eyebrow">Lesson</p>
      <h2>Set selection reads</h2>
      <div className="progress-summary">
        <div>
          <Target size={18} />
          <span>Accuracy</span>
          <strong>
            {formatPercent(
              playerProgress?.totalCorrect ?? 0,
              playerProgress?.totalAttempts ?? 0,
            )}
          </strong>
        </div>
        <div>
          <span>Attempts</span>
          <strong>{playerProgress?.totalAttempts ?? 0}</strong>
        </div>
        <div>
          <span>Best streak</span>
          <strong>{playerProgress?.bestStreak ?? 0}</strong>
        </div>
      </div>
      <ol>
        <li
          className={[
            "active",
            completedIds.includes(currentClip.id) ? "complete" : "",
          ].join(" ")}
          value={currentIndex + 1}
        >
          <span>{currentIndex + 1}</span>
          <div>
            <strong>{currentClip.title}</strong>
            <small>{currentClip.skillFocus}</small>
            {playerProgress?.lessonStats[currentClip.id] ? (
              <small>
                {playerProgress.lessonStats[currentClip.id].correct}/
                {playerProgress.lessonStats[currentClip.id].attempts} correct
              </small>
            ) : null}
          </div>
        </li>
      </ol>
      <button className="text-action rail-action" onClick={onResetProgress} type="button">
        <RotateCcw size={16} />
        Reset progress
      </button>
    </aside>
  );
}
