interface TodayMarkerProps {
  position: string;
  height: number;
}

export default function TodayMarker({ position, height }: TodayMarkerProps) {
  return (
    <div
      className="absolute top-0 z-20 pointer-events-none"
      style={{
        left: position,
        height: `${height}px`,
      }}
    >
      {/* Vertical line */}
      <div className="absolute top-0 w-0.5 h-full bg-primary opacity-70" />
      
      {/* Label */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
        Today
      </div>
    </div>
  );
}
