// components/DrawMap/DetailsPanel.tsx
import React from 'react';
import { Mode, MODES, Feature, Marker } from '@/types/drawMap';
import DeleteButton from './DeleteButton';

interface DetailsPanelProps {
  mode: Mode;
  selectedFeature: Feature | null;
  selectedMarker: Marker | null;
  featureNames: Record<string, string>;
  onNameChange: (id: string, name: string) => void;
  onDelete: () => void;
}

export default function DetailsPanel({
  mode,
  selectedFeature,
  selectedMarker,
  featureNames,
  onNameChange,
  onDelete,
}: DetailsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Polygons Details</h2>
        {(selectedFeature || selectedMarker) && (
          <DeleteButton
            onClick={onDelete}
            type={mode === MODES.MARKER ? 'marker' : 'feature'}
          />
        )}
      </div>

      {mode === MODES.DRAW ? (
        selectedFeature ? (
          <div className="p-4 bg-white rounded shadow">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Polygon Name
              </label>
              <input
                type="text"
                value={featureNames[selectedFeature.id] || ''}
                onChange={(e) => onNameChange(selectedFeature.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter feature name"
              />
            </div>
            <p className="text-sm">Type: {selectedFeature.geometry.type}</p>
            <p className="text-sm">ID: {selectedFeature.id}</p>
            <div className="mt-2">
              <p className="font-semibold">Coordinates:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {JSON.stringify(selectedFeature.geometry.coordinates, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a feature to view details</p>
        )
      ) : selectedMarker ? (
        <div className="p-4 bg-white rounded shadow">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marker Name
            </label>
            <input
              type="text"
              value={selectedMarker.name}
              onChange={(e) => onNameChange(selectedMarker.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter marker name"
            />
          </div>
          <div className="mt-2">
            <p className="text-sm">Latitude: {selectedMarker.latitude.toFixed(6)}</p>
            <p className="text-sm">Longitude: {selectedMarker.longitude.toFixed(6)}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Select a marker or click on the map to add a new one</p>
      )}
    </div>
  );
}