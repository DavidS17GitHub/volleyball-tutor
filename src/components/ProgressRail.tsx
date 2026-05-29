import { ChartLine, RotateCcw, Target } from "lucide-react";
import { getLocalizedLessonText, useI18n } from "../i18n";
import type { LessonClip, PlayerProgress } from "../types";
import { LocaleToggle } from "./LocaleToggle";

interface ProgressRailProps {
  clips: LessonClip[];
  currentIndex: number;
  completedIds: string[];
  playerProgress: PlayerProgress | null;
  sessionStats: {
    attempts: number;
    bestStreak: number;
    correct: number;
  };
  onResetProgress: () => void;
  onViewSessionProgress: () => void;
}

const formatPercent = (correct: number, attempts: number) =>
  attempts > 0 ? `${Math.round((correct / attempts) * 100)}%` : "0%";

export function ProgressRail({
  clips,
  currentIndex,
  completedIds,
  playerProgress,
  sessionStats,
  onResetProgress,
  onViewSessionProgress,
}: ProgressRailProps) {
  const { locale, t } = useI18n();
  const currentClip = clips[currentIndex];

  if (!currentClip) {
    return null;
  }

  const currentClipText = getLocalizedLessonText(currentClip, locale);

  return (
    <aside className="progress-rail" aria-label={t("lesson")}>
      <LocaleToggle />
      <p className="eyebrow">{t("lesson")}</p>
      <h2>{t("setSelectionReads")}</h2>
      <div className="progress-summary">
        <div>
          <Target size={18} />
          <span>{t("accuracy")}</span>
          <strong>
            {formatPercent(sessionStats.correct, sessionStats.attempts)}
          </strong>
        </div>
        <div>
          <span>{t("attempts")}</span>
          <strong>{sessionStats.attempts}</strong>
        </div>
        <div>
          <span>{t("bestStreak")}</span>
          <strong>{sessionStats.bestStreak}</strong>
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
            <strong>{currentClipText.title}</strong>
            <small>{currentClipText.skillFocus}</small>
            {playerProgress?.lessonStats[currentClip.id] ? (
              <small>
                {playerProgress.lessonStats[currentClip.id].correct}/
                {playerProgress.lessonStats[currentClip.id].attempts} {t("correct")}
              </small>
            ) : null}
          </div>
        </li>
      </ol>
      <button className="text-action rail-action" onClick={onResetProgress} type="button">
        <RotateCcw size={16} />
        {t("resetProgress")}
      </button>
      <button className="text-action rail-action" onClick={onViewSessionProgress} type="button">
        <ChartLine size={16} />
        {t("viewChart")}
      </button>
    </aside>
  );
}
