import { CheckCircle2, XCircle } from "lucide-react";
import type { AnswerState, LessonClip, SetOption } from "../types";

const options: Array<{ value: SetOption; label: string }> = [
  { value: "outside", label: "Outside" },
  { value: "pipe", label: "Pipe" },
  { value: "center", label: "Center" },
  { value: "opposite", label: "Opposite" },
];

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
  return (
    <section className="answer-panel" aria-live="polite">
      <div>
        <p className="eyebrow">Decision point</p>
        <h2>What set should the setter choose?</h2>
      </div>

      <div className="option-grid">
        {options.map((option) => {
          const isSelected = answer?.selected === option.value;
          const isCorrect = clip.correctAnswer === option.value;
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
              key={option.value}
              onClick={() => onAnswer(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {answer && (
        <div className={`feedback ${answer.isCorrect ? "correct" : "incorrect"}`}>
          {answer.isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          <div>
            <strong>{answer.isCorrect ? "Correct read" : "Not quite"}</strong>
            <p>{clip.explanation}</p>
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
        {isLastClip ? "Finish lesson" : "Next clip"}
      </button>
    </section>
  );
}
