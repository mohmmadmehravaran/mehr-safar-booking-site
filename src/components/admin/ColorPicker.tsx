import { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showInput, setShowInput] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTempValue(value); }, [value]);

  return (
    <div className="flex items-center gap-3 group">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm group-hover:border-emerald-400 transition-colors"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-600 mb-0.5">{label}</div>
        {showInput ? (
          <input
            ref={inputRef}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={() => {
              if (/^#[0-9A-Fa-f]{3,8}$/.test(tempValue)) onChange(tempValue);
              setShowInput(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (/^#[0-9A-Fa-f]{3,8}$/.test(tempValue)) onChange(tempValue);
                setShowInput(false);
              }
            }}
            className="w-full text-xs font-mono px-2 py-0.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="text-xs font-mono text-gray-500 hover:text-emerald-600"
          >
            {value}
          </button>
        )}
      </div>
    </div>
  );
}
