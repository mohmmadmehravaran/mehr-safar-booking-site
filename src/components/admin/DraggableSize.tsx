import { useRef, useCallback, useState } from 'react';
import { GripHorizontal } from 'lucide-react';

interface DraggableSizeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

export default function DraggableSize({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
}: DraggableSizeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      // RTL: right is 0%, left is 100%
      const ratio = 1 - Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, snapped)));
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updateValue(e.clientX);
    },
    [isDragging, updateValue]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          {value}{unit}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-8 bg-gray-100 rounded-lg cursor-pointer select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Filled track */}
        <div
          className="absolute top-0 right-0 h-full bg-emerald-100 rounded-lg transition-[width] duration-75"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white border-2 rounded-lg shadow-md flex items-center justify-center transition-colors ${
            isDragging ? 'border-emerald-600 shadow-lg scale-110' : 'border-emerald-400'
          }`}
          style={{ right: `calc(${pct}% - 14px)` }}
        >
          <GripHorizontal className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-400">{max}{unit}</span>
        <span className="text-[10px] text-gray-400">{min}{unit}</span>
      </div>
    </div>
  );
}
