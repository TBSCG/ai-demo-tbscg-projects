import type { TimelineMetrics } from '../../utils/timelineCalculations';
import { generateMonthMarkers } from '../../utils/timelineCalculations';

interface TimelineAxisProps {
  metrics: TimelineMetrics;
}

export default function TimelineAxis({ metrics }: TimelineAxisProps) {
  const markers = generateMonthMarkers(metrics.startDate, metrics.endDate, metrics);

  return (
    <div className="relative h-12 bg-gray-50 border-b border-gray-200">
      {markers.map((marker) => (
        <div
          key={marker.date.getTime()}
          className="absolute top-0 h-full flex items-center"
          style={{ left: marker.position }}
        >
          {/* Vertical line */}
          <div className="absolute top-0 w-px h-full bg-gray-300" />
          
          {/* Month label */}
          <div className="relative ml-2 text-xs font-medium text-gray-600 whitespace-nowrap">
            {marker.label}
          </div>
        </div>
      ))}
    </div>
  );
}
