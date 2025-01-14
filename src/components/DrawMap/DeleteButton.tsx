// components/DrawMap/DeleteButton.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onClick: () => void;
  type: 'marker' | 'feature' | 'view';
  variant?: 'inline' | 'full';
}

export default function DeleteButton({ onClick, type, variant = 'full' }: DeleteButtonProps) {
  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className="p-1 text-red-500 hover:text-red-600"
        title={`Delete ${type}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      <Trash2 className="w-4 h-4" />
      <span>Delete {type}</span>
    </button>
  );
}