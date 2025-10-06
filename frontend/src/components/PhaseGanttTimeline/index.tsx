import { useEffect, useRef, useState } from 'react';
import type { Phase } from '@demo-tbscg/shared';
import {
  calculateTimelineMetrics,
  calculatePhasePosition,
  assignPhasesToLanes,
  filterPhasesWithDates,
  getTodayPosition,
} from '../../utils/timelineCalculations';
import TimelineAxis from './TimelineAxis';
import TimelineGrid from './TimelineGrid';
import PhaseBar from './PhaseBar';
import TodayMarker from './TodayMarker';
import { Badge } from '../ui';

interface PhaseGanttTimelineProps {
  phases: Phase[];
}

const LANE_HEIGHT = 60; // Height of each lane in pixels

export default function PhaseGanttTimeline({ phases }: PhaseGanttTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  // Update container width on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter phases with dates
  const phasesWithDates = filterPhasesWithDates(phases);
  const phasesWithoutDates = phases.filter(
    (phase) => !phasesWithDates.find((p) => p.id === phase.id)
  );

  // Calculate timeline metrics
  const metrics = calculateTimelineMetrics(phasesWithDates, containerWidth);

  // If no phases with dates, show message
  if (!metrics || phasesWithDates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timeline Data</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Add start and end dates to your phases to see them visualized on a timeline.
        </p>
        {phasesWithoutDates.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-3">
              {phasesWithoutDates.length} phase{phasesWithoutDates.length !== 1 ? 's' : ''} without
              dates:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {phasesWithoutDates.map((phase) => (
                <Badge key={phase.id} variant="default">
                  {phase.order}. {phase.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assign phases to lanes to handle overlaps
  const laneAssignments = assignPhasesToLanes(phasesWithDates);
  const maxLane = Math.max(...Array.from(laneAssignments.values()), 0);
  const timelineHeight = (maxLane + 1) * LANE_HEIGHT;

  // Calculate positions for all phases
  const phasePositions = phasesWithDates
    .map((phase) => {
      const position = calculatePhasePosition(phase, metrics);
      if (!position) return null;

      return {
        phase,
        position: {
          ...position,
          lane: laneAssignments.get(phase.id) ?? 0,
        },
      };
    })
    .filter((item) => item !== null);

  // Get today's position
  const todayPosition = getTodayPosition(metrics);

  return (
    <div className="space-y-6">
      {/* Timeline Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* Timeline Axis */}
        <TimelineAxis metrics={metrics} />

        {/* Timeline Body */}
        <div
          ref={containerRef}
          className="relative bg-gray-50 overflow-x-auto"
          style={{ minHeight: `${timelineHeight + 40}px` }}
        >
          {/* Grid Lines */}
          <TimelineGrid metrics={metrics} height={timelineHeight + 40} />

          {/* Phase Bars */}
          <div className="relative" style={{ height: `${timelineHeight}px`, marginTop: '20px' }}>
            {phasePositions.map(
              (item) =>
                item && (
                  <PhaseBar
                    key={item.phase.id}
                    phase={item.phase}
                    position={item.position}
                    laneHeight={LANE_HEIGHT}
                  />
                )
            )}
          </div>

          {/* Today Marker */}
          {todayPosition && <TodayMarker position={todayPosition} height={timelineHeight + 40} />}
        </div>
      </div>

      {/* Unscheduled Phases */}
      {phasesWithoutDates.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Unscheduled Phases ({phasesWithoutDates.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {phasesWithoutDates.map((phase) => (
              <Badge key={phase.id} variant="default">
                {phase.order}. {phase.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
