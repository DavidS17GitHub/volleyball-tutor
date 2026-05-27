import type { LessonClip } from "../types";

interface ProgressRailProps {
  clips: LessonClip[];
  currentIndex: number;
  completedIds: string[];
}

export function ProgressRail({ clips, currentIndex, completedIds }: ProgressRailProps) {
  return (
    <aside className="progress-rail" aria-label="Lesson clips">
      <p className="eyebrow">Lesson</p>
      <h2>Set selection reads</h2>
      <ol>
        {clips.map((clip, index) => (
          <li
            className={[
              index === currentIndex ? "active" : "",
              completedIds.includes(clip.id) ? "complete" : "",
            ].join(" ")}
            key={clip.id}
          >
            <span>{index + 1}</span>
            <div>
              <strong>{clip.title}</strong>
              <small>{clip.skillFocus}</small>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
