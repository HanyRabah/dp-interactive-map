// components/ModeSwitcher.tsx
import React from 'react';
import { Mode, MODES } from '@/types/drawMap';

interface ModeSwitcherProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="bg-white rounded-lg shadow p-2">
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded ${currentMode === MODES.VIEW ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onModeChange(MODES.VIEW)}
        >
          View Mode
        </button>
        <button
          className={`px-4 py-2 rounded ${currentMode === MODES.DRAW ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onModeChange(MODES.DRAW)}
        >
          Draw Mode
        </button>
        <button
          className={`px-4 py-2 rounded ${currentMode === MODES.MARKER ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => onModeChange(MODES.MARKER)}
        >
          Marker Mode
        </button>
      </div>
    </div>
  );
}