import type { Phase } from '@demo-tbscg/shared';
import { Badge } from './ui';
import { formatDateRange } from '../utils/dateFormat';

interface PhaseTimelineProps {
  phases: Phase[];
}

export default function PhaseTimeline({ phases }: PhaseTimelineProps) {
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  const getStatusVariant = (status: Phase['status']): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (sortedPhases.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No phases defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedPhases.map((phase, index) => (
        <div key={phase.id} className="relative">
          {/* Connector line */}
          {index < sortedPhases.length - 1 && (
            <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-300" />
          )}

          {/* Phase card */}
          <div className="relative flex gap-4">
            {/* Number circle */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm z-10">
              {phase.order}
            </div>

            {/* Phase content */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{phase.name}</h4>
                {phase.status && <Badge variant={getStatusVariant(phase.status)}>{phase.status}</Badge>}
              </div>

              {phase.description && (
                <p className="text-gray-600 mb-3">{phase.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDateRange(phase.startDate, phase.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

