import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

export interface RouteWaypoint {
  id: string;
  label: string;
  timestamp?: string;
}

export interface RouteTimelineStatusLabels {
  completed: string;
  current: string;
  future: string;
}

export interface RouteTimelineProps {
  waypoints: readonly RouteWaypoint[];
  /* Index of the milestone currently in progress; -1 means nothing reached yet. */
  currentIndex: number;
  orientation?: 'horizontal' | 'vertical';
  drawRoute?: boolean;
  statusLabels?: RouteTimelineStatusLabels;
  className?: string;
}

const DEFAULT_STATUS_LABELS: RouteTimelineStatusLabels = {
  completed: 'انجام‌شده',
  current: 'موقعیت فعلی',
  future: 'پیش‌رو',
};

const DOT_STATE_CLASSES = {
  completed: 'border-harbor bg-harbor',
  current: 'border-harbor bg-sheet',
  future: 'border-rule-strong bg-sheet',
} as const;

function WaypointDot({ state }: { state: 'completed' | 'current' | 'future' }) {
  return (
    <span className="relative flex size-3 items-center justify-center">
      {state === 'current' && (
        <span
          aria-hidden="true"
          className="kv-pulse-ring absolute inset-0 rounded-full border-2 border-harbor"
        />
      )}
      <span aria-hidden="true" className={cn('size-3 rounded-full border-2', DOT_STATE_CLASSES[state])} />
    </span>
  );
}

/*
 * The route SVG is drawn LTR and mirrored as a whole under RTL
 * (rtl:[transform:scaleX(-1)]); dots and labels live outside the SVG and
 * follow the inline direction naturally.
 */
export const RouteTimeline = forwardRef<HTMLDivElement, RouteTimelineProps>(function RouteTimeline(
  { waypoints, currentIndex, orientation = 'horizontal', drawRoute = false, statusLabels, className },
  ref,
) {
  const labels = statusLabels ?? DEFAULT_STATUS_LABELS;
  const count = waypoints.length;
  if (count === 0) {
    return null;
  }
  const stateOf = (index: number): 'completed' | 'current' | 'future' =>
    index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'future';

  if (orientation === 'vertical') {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <ol className="relative flex flex-col">
          <div
            aria-hidden="true"
            className="absolute top-[6px] bottom-[5px] w-[2px]"
            style={{ insetInlineStart: '5px' }}
          >
            <svg className="block h-full w-[2px]" viewBox="0 0 2 100" preserveAspectRatio="none">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="100"
                stroke="var(--color-rule-strong)"
                strokeWidth="2"
                strokeDasharray="2 5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          {waypoints.map((waypoint, index) => {
            const state = stateOf(index);
            return (
              <li
                key={waypoint.id}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
                className="relative flex items-start gap-3 pb-4 last:pb-0"
              >
                <WaypointDot state={state} />
                <span className="flex flex-col">
                  <span className="text-[13px] leading-[1.5] text-ink">{waypoint.label}</span>
                  {waypoint.timestamp && (
                    <bdi className="font-mono text-[13px] text-ink-faint" dir="ltr">
                      {waypoint.timestamp}
                    </bdi>
                  )}
                </span>
                <span className="sr-only">{labels[state]}</span>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  /* Half of one grid column: distance from container edge to first dot center. */
  const edgeInset = `${50 / count}%`;
  const traveledPercent = currentIndex > 0 ? (currentIndex / (count - 1)) * 100 : 0;
  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute top-[5px] h-[2px] rtl:[transform:scaleX(-1)]"
          style={{ insetInlineStart: edgeInset, insetInlineEnd: edgeInset }}
        >
          <svg className="block h-[2px] w-full" viewBox="0 0 100 2" preserveAspectRatio="none">
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="var(--color-rule-strong)"
              strokeWidth="2"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
            />
            {currentIndex > 0 && (
              <line
                x1="0"
                y1="1"
                x2={traveledPercent}
                y2="1"
                pathLength={1}
                stroke="var(--color-harbor)"
                strokeWidth="2"
                strokeDasharray={1}
                vectorEffect="non-scaling-stroke"
                className={drawRoute ? 'kv-route-draw' : undefined}
                style={drawRoute ? ({ '--kv-route-length': 1 } as CSSProperties) : undefined}
              />
            )}
          </svg>
        </div>
        <ol
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {waypoints.map((waypoint, index) => {
            const state = stateOf(index);
            return (
              <li
                key={waypoint.id}
                data-state={state}
                aria-current={state === 'current' ? 'step' : undefined}
                className="flex flex-col items-center gap-2 text-center"
              >
                <WaypointDot state={state} />
                <span className="flex flex-col items-center">
                  <span className="text-[13px] leading-[1.5] text-ink-soft">{waypoint.label}</span>
                  {waypoint.timestamp && (
                    <bdi className="font-mono text-[13px] text-ink-faint" dir="ltr">
                      {waypoint.timestamp}
                    </bdi>
                  )}
                </span>
                <span className="sr-only">{labels[state]}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
});
