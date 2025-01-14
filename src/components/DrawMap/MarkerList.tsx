// components/DrawMap/MarkerList.tsx
import React from 'react';
import { Marker } from '@/types/drawMap';
import DeleteButton from './DeleteButton';

interface MarkerListProps {
  markers: Marker[];
  selectedMarker: Marker | null;
  onSelect: (marker: Marker) => void;
  onDelete: (markerId: string) => void;
  onNameChange: (markerId: string, name: string) => void;
}

export default function MarkerList({
  markers,
  selectedMarker,
  onSelect,
  onDelete,
  onNameChange,
}: MarkerListProps) {
  return (
    <div className="space-y-2">
      {markers.map(marker => (
        <div 
          key={marker.id}
          className={`p-3 rounded ${
            selectedMarker?.id === marker.id 
              ? 'bg-blue-100 border border-blue-300'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(marker)}>
              <p className="font-medium">{marker.name}</p>
              <p className="text-sm text-gray-600">
                {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={marker.name}
                onChange={(e) => onNameChange(marker.id, e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                onClick={(e) => e.stopPropagation()}
                placeholder="Name marker"
              />
              <DeleteButton
                onClick={() => onDelete(marker.id)}
                type="marker"
                variant="inline"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}