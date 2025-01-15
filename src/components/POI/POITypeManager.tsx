import React from 'react';
import { POIMarkers, POIColors, POILabels } from './markers';

interface POITypeManagerProps {
  selectedTypes: (keyof typeof POIMarkers)[];
  onTypeToggle: (type: keyof typeof POIMarkers) => void;
}

export const POITypeManager: React.FC<POITypeManagerProps> = ({
  selectedTypes,
  onTypeToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">POI Types</h3>
      <div className="space-y-2">
        {(Object.keys(POIMarkers) as Array<keyof typeof POIMarkers>).map((type) => {
          const Icon = POIMarkers[type];
          const color = POIColors[type];
          const isSelected = selectedTypes.includes(type);
          
          return (
            <button
              key={type}
              className={`
                w-full px-4 py-2 rounded-lg flex items-center space-x-3
                transition-colors
                ${isSelected 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
                }
                border
              `}
              onClick={() => onTypeToggle(type)}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex-1 text-left">{POILabels[type]}</span>
              <div className={`
                w-4 h-4 rounded border
                ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
              `}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};