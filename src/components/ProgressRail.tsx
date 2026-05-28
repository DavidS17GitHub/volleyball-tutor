import type { LessonClip } from "../types";

interface ProgressRailProps {
  clips: LessonClip[];
  currentIndex: number;
  completedIds: string[];
}

export function ProgressRail({ clips, currentIndex, completedIds }: ProgressRailProps) {
  const currentClip = clips[currentIndex];

  if (!currentClip) {
    return null;
  }

  return (
    <aside className="progress-rail" aria-label="Lesson clips">
      <p className="eyebrow">Lesson</p>
      <h2>Set selection reads</h2>
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
          </div>
        </li>
      </ol>
    </aside>
  );
}
