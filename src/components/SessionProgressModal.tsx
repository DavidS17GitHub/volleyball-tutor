import { RotateCcw, X } from "lucide-react";
import type { SessionProgressPoint } from "../types";

interface SessionProgressModalProps {
  points: SessionProgressPoint[];
  onClose: () => void;
  onReset: () => void;
}

const chartWidth = 640;
const chartHeight = 320;
const chartPadding = {
  bottom: 56,
  left: 52,
  right: 24,
  top: 30,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const buildChartPoints = (points: SessionProgressPoint[]) => {
  const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const xStep = points.length > 1 ? chartInnerWidth / (points.length - 1) : 0;

  return points.map((point, index) => {
    const x =
      points.length > 1
        ? chartPadding.left + index * xStep
        : chartPadding.left + chartInnerWidth / 2;
    const y = chartPadding.top + chartInnerHeight * (1 - point.accuracy / 100);

    return { ...point, x, y };
  });
};

export function SessionProgressModal({
  points,
  onClose,
  onReset,
}: SessionProgressModalProps) {
  const chartPoints = buildChartPoints(points);
  const polylinePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const yTicks = [100, 75, 50, 25, 0];
  const chartBottom = chartHeight - chartPadding.bottom;
  const hasProgress = points.length > 0;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="session-progress-title"
        aria-modal="true"
        className="progress-modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Session history</p>
            <h2 id="session-progress-title">Progress Chart</h2>
          </div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Close progress chart">
            <X size={20} />
          </button>
        </div>

        {hasProgress ? (
          <>
            <div className="chart-frame" aria-label="Session accuracy chart">
              <svg
                aria-hidden="true"
                className="progress-chart"
                focusable="false"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                {yTicks.map((tick) => {
                  const y =
                    chartPadding.top +
                    (chartHeight - chartPadding.top - chartPadding.bottom) *
                      (1 - tick / 100);

                  return (
                    <g key={tick}>
                      <line
                        className="chart-gridline"
                        x1={chartPadding.left}
                        x2={chartWidth - chartPadding.right}
                        y1={y}
                        y2={y}
                      />
                      <text className="chart-axis-label" x={chartPadding.left - 12} y={y + 4}>
                        {tick}%
                      </text>
                    </g>
                  );
                })}
                <line
                  className="chart-axis"
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={chartBottom}
                  y2={chartBottom}
                />
                <line
                  className="chart-axis"
                  x1={chartPadding.left}
                  x2={chartPadding.left}
                  y1={chartPadding.top}
                  y2={chartBottom}
                />
                <polyline className="chart-line" points={polylinePoints} />
                {chartPoints.map((point) => (
                  <g key={point.id}>
                    <circle className="chart-point" cx={point.x} cy={point.y} r="5" />
                    <text className="chart-x-label" x={point.x} y={chartBottom + 28}>
                      S{point.sessionNumber}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="progress-table-wrap">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Accuracy</th>
                    <th>Correct</th>
                    <th>Videos</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point.id}>
                      <td>Session {point.sessionNumber}</td>
                      <td>{point.accuracy}%</td>
                      <td>{point.correctCount}</td>
                      <td>{point.videoCount}</td>
                      <td>{formatDate(point.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-chart-state">
            <h3>No session data yet</h3>
            <p>Finish a training session to add the first accuracy point.</p>
          </div>
        )}

        <div className="modal-actions">
          <button
            className="text-action"
            disabled={!hasProgress}
            onClick={onReset}
            type="button"
          >
            <RotateCcw size={16} />
            Reset chart
          </button>
        </div>
      </section>
    </div>
  );
}
