import type { Phase } from '@demo-tbscg/shared';
import type { PhasePosition } from '../../utils/timelineCalculations';
import { formatDateRange } from '../../utils/dateFormat';
import { useState } from 'react';

interface PhaseBarProps {
  phase: Phase;
  position: PhasePosition;
  laneHeight: number;
}

export default function PhaseBar({ phase, position, laneHeight }: PhaseBarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-800',
        };
      case 'in-progress':
        return {
          bg: 'bg-orange-100',
          border: 'border-primary',
          text: 'text-orange-800',
        };
      case 'planned':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-400',
          text: 'text-gray-800',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-800',
        };
    }
  };

  const colors = getStatusColor(phase.status);
  const top = position.lane * laneHeight;

  return (
    <>
      <button
        type="button"
        className={`absolute rounded-md border-2 ${colors.bg} ${colors.border} ${colors.text} 
          cursor-pointer transition-all duration-200 hover:shadow-lg hover:z-10
          flex items-center px-3 py-2 overflow-hidden`}
        style={{
          left: position.left,
          width: position.width,
          top: `${top}px`,
          height: `${laneHeight - 8}px`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Phase ${phase.order}: ${phase.name}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-xs bg-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
            {phase.order}
          </span>
          <span className="text-sm font-medium truncate">{phase.name}</span>
        </div>
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 pointer-events-none"
          style={{
            left: position.left,
            top: `${top + laneHeight + 5}px`,
            minWidth: '250px',
            maxWidth: '350px',
          }}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {phase.order}. {phase.name}
              </h4>
              {phase.status && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.border} ${colors.text} border capitalize flex-shrink-0`}
                >
                  {phase.status}
                </span>
              )}
            </div>

            {phase.description && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {phase.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-100">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{formatDateRange(phase.startDate, phase.endDate)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
