import React from 'react';
import { POIMarkers, POIColors } from './markers';
import { Edit2, Trash2, MapPin } from 'lucide-react';

interface POI {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: {
    name: keyof typeof POIMarkers;
    icon: string;
  };
}

interface POIListProps {
  pois: POI[];
  onEdit: (poi: POI) => void;
  onDelete: (id: string) => void;
  onSelect: (poi: POI) => void;
  selectedPOI?: POI | null;
}

export const POIList: React.FC<POIListProps> = ({
  pois,
  onEdit,
  onDelete,
  onSelect,
  selectedPOI
}) => {
  return (
    <div className="space-y-2">
      {pois.map((poi) => {
        const Icon = POIMarkers[poi.type.name];
        const color = POIColors[poi.type.name];
        
        return (
          <div 
            key={poi.id}
            className={`
              p-4 rounded-lg border transition-all cursor-pointer
              ${selectedPOI?.id === poi.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
              }
            `}
            onClick={() => onSelect(poi)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">{poi.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(poi);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-500 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(poi.id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};