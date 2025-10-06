import type { Phase } from '@demo-tbscg/shared';

export interface TimelineMetrics {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  pixelsPerDay: number;
  containerWidth: number;
}

export interface PhasePosition {
  left: string;
  width: string;
  leftPercent: number;
  widthPercent: number;
  lane: number;
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = start.getTime();
  const endMs = end.getTime();
  return Math.ceil((endMs - startMs) / msPerDay);
}

/**
 * Parse ISO date string to Date object
 */
export function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if two date ranges overlap
 */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Filter phases that have valid date ranges
 */
export function filterPhasesWithDates(phases: Phase[]): Phase[] {
  return phases.filter((phase) => {
    const start = parseDate(phase.startDate);
    const end = parseDate(phase.endDate);
    return start !== null && end !== null && start <= end;
  });
}

/**
 * Calculate timeline metrics based on all phases
 */
export function calculateTimelineMetrics(
  phases: Phase[],
  containerWidth: number = 1000
): TimelineMetrics | null {
  const phasesWithDates = filterPhasesWithDates(phases);

  if (phasesWithDates.length === 0) {
    return null;
  }

  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  phasesWithDates.forEach((phase) => {
    const start = parseDate(phase.startDate);
    const end = parseDate(phase.endDate);

    if (start && (!minDate || start < minDate)) {
      minDate = start;
    }
    if (end && (!maxDate || end > maxDate)) {
      maxDate = end;
    }
  });

  if (!minDate || !maxDate) {
    return null;
  }

  // Add padding (7 days before and after)
  const paddedStart = new Date(minDate);
  paddedStart.setDate(paddedStart.getDate() - 7);

  const paddedEnd = new Date(maxDate);
  paddedEnd.setDate(paddedEnd.getDate() + 7);

  const totalDays = daysBetween(paddedStart, paddedEnd);
  const pixelsPerDay = containerWidth / totalDays;

  return {
    startDate: paddedStart,
    endDate: paddedEnd,
    totalDays,
    pixelsPerDay,
    containerWidth,
  };
}

/**
 * Calculate the position of a phase on the timeline
 */
export function calculatePhasePosition(
  phase: Phase,
  metrics: TimelineMetrics
): PhasePosition | null {
  const start = parseDate(phase.startDate);
  const end = parseDate(phase.endDate);

  if (!start || !end) {
    return null;
  }

  const startOffset = daysBetween(metrics.startDate, start);
  const duration = Math.max(daysBetween(start, end), 1); // Minimum 1 day

  const leftPercent = (startOffset / metrics.totalDays) * 100;
  const widthPercent = (duration / metrics.totalDays) * 100;

  return {
    left: `${leftPercent}%`,
    width: `${Math.max(widthPercent, 2)}%`, // Minimum 2% width for visibility
    leftPercent,
    widthPercent: Math.max(widthPercent, 2),
    lane: 0, // Will be assigned by overlap detection
  };
}

/**
 * Detect overlapping phases and assign them to lanes
 * Returns a map of phase ID to lane number (0-indexed)
 */
export function assignPhasesToLanes(
  phases: Phase[]
): Map<string, number> {
  const phasesWithDates = filterPhasesWithDates(phases);
  const laneAssignments = new Map<string, number>();

  // Sort phases by start date
  const sortedPhases = [...phasesWithDates].sort((a, b) => {
    const dateA = parseDate(a.startDate)!;
    const dateB = parseDate(b.startDate)!;
    return dateA.getTime() - dateB.getTime();
  });

  // Track which lanes are occupied up to which date
  const laneOccupancy: Date[] = [];

  sortedPhases.forEach((phase) => {
    const start = parseDate(phase.startDate)!;
    const end = parseDate(phase.endDate)!;

    // Find the first available lane
    let assignedLane = -1;
    for (let i = 0; i < laneOccupancy.length; i++) {
      if (start > laneOccupancy[i]) {
        assignedLane = i;
        laneOccupancy[i] = end;
        break;
      }
    }

    // If no available lane, create a new one
    if (assignedLane === -1) {
      assignedLane = laneOccupancy.length;
      laneOccupancy.push(end);
    }

    laneAssignments.set(phase.id, assignedLane);
  });

  return laneAssignments;
}

/**
 * Format a date for the timeline axis (e.g., "Jan 2025")
 */
export function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date for the timeline axis (short version, e.g., "Jan")
 */
export function formatTimelineDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
  });
}

/**
 * Generate month markers for the timeline axis
 */
export function generateMonthMarkers(
  startDate: Date,
  endDate: Date,
  metrics: TimelineMetrics
): Array<{ date: Date; label: string; position: string }> {
  const markers: Array<{ date: Date; label: string; position: string }> = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    const offset = daysBetween(metrics.startDate, current);
    const position = `${(offset / metrics.totalDays) * 100}%`;

    markers.push({
      date: new Date(current),
      label: formatTimelineDate(current),
      position,
    });

    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return markers;
}

/**
 * Calculate the position of today's marker on the timeline
 */
export function getTodayPosition(metrics: TimelineMetrics): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today < metrics.startDate || today > metrics.endDate) {
    return null;
  }

  const offset = daysBetween(metrics.startDate, today);
  return `${(offset / metrics.totalDays) * 100}%`;
}
