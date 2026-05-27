import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { ProgressRail } from "./components/ProgressRail";
import { VideoQuizPlayer } from "./components/VideoQuizPlayer";
import { lessonClips } from "./data/lessons";

export function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const currentClip = lessonClips[currentIndex];

  const score = useMemo(() => completedIds.length, [completedIds]);

  const handleComplete = (clipId: string) => {
    setCompletedIds((existing) =>
      existing.includes(clipId) ? existing : [...existing, clipId],
    );
  };

  const handleNext = () => {
    if (currentIndex === lessonClips.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedIds([]);
    setIsFinished(false);
  };

  return (
    <div className="app-shell">
      <ProgressRail
        clips={lessonClips}
        completedIds={completedIds}
        currentIndex={currentIndex}
      />

      {isFinished ? (
        <main className="finish-state">
          <Trophy size={44} />
          <p className="eyebrow">Lesson complete</p>
          <h1>{score} clips reviewed</h1>
          <p>
            The MVP flow is ready for real volleyball clips: upload videos to Azure,
            set each pause timestamp, and tune the feedback for your coaching model.
          </p>
          <button className="primary-action" onClick={handleRestart} type="button">
            Restart lesson
          </button>
        </main>
      ) : (
        <VideoQuizPlayer
          clip={currentClip}
          isLastClip={currentIndex === lessonClips.length - 1}
          onComplete={handleComplete}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
