import { CheckCircle2, XCircle } from "lucide-react";
import { getLocalizedLessonText, useI18n, useSetOptionLabel } from "../i18n";
import type { AnswerState, LessonClip, SetOption } from "../types";

const options: SetOption[] = ["outside", "pipe", "center", "opposite"];

interface AnswerPanelProps {
  clip: LessonClip;
  answer: AnswerState | null;
  onAnswer: (answer: SetOption) => void;
  onContinue: () => void;
  isLastClip: boolean;
  progressError?: string | null;
}

export function AnswerPanel({
  clip,
  answer,
  onAnswer,
  onContinue,
  isLastClip,
  progressError,
}: AnswerPanelProps) {
  const { locale, t } = useI18n();
  const getSetOptionLabel = useSetOptionLabel();
  const clipText = getLocalizedLessonText(clip, locale);

  return (
    <section className="answer-panel" aria-live="polite">
      <div>
        <p className="eyebrow">{t("decisionPoint")}</p>
        <h2>{t("whatSetShouldSetterChoose")}</h2>
      </div>

      <div className="option-grid">
        {options.map((option) => {
          const isSelected = answer?.selected === option;
          const isCorrect = clip.correctAnswer === option;
          const resultClass = answer
            ? isCorrect
              ? "correct"
              : isSelected
                ? "incorrect"
                : ""
            : "";

          return (
            <button
              className={`option-button ${resultClass}`}
              disabled={Boolean(answer)}
              key={option}
              onClick={() => onAnswer(option)}
              type="button"
            >
              {getSetOptionLabel(option)}
            </button>
          );
        })}
      </div>

      {answer && (
        <div className={`feedback ${answer.isCorrect ? "correct" : "incorrect"}`}>
          {answer.isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          <div>
            <strong>{answer.isCorrect ? t("correctRead") : t("notQuite")}</strong>
            <p>{clipText.explanation}</p>
          </div>
        </div>
      )}

      {progressError ? <p className="error-text">{progressError}</p> : null}

      <button
        className="primary-action"
        disabled={!answer}
        onClick={onContinue}
        type="button"
      >
        {isLastClip ? t("finishLesson") : t("nextClip")}
      </button>
    </section>
  );
}
