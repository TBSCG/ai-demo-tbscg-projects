import type { TimelineMetrics } from '../../utils/timelineCalculations';
import { generateMonthMarkers } from '../../utils/timelineCalculations';

interface TimelineGridProps {
  metrics: TimelineMetrics;
  height: number;
}

export default function TimelineGrid({ metrics, height }: TimelineGridProps) {
  const markers = generateMonthMarkers(metrics.startDate, metrics.endDate, metrics);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {markers.map((marker) => (
        <div
          key={marker.date.getTime()}
          className="absolute top-0 w-px bg-gray-200"
          style={{
            left: marker.position,
            height: `${height}px`,
          }}
        />
      ))}
    </div>
  );
}
