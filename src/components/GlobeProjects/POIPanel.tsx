import { POI } from '@/types/poi';
import { Car, Footprints } from 'lucide-react';
import React from 'react';
// onPOIClick: (poi: POI) => void;

interface POIPanelProps {
  selectedPOI: POI | null;
  
  routeInfo: any;
}
export const POIPanel: React.FC<POIPanelProps> = ({
  selectedPOI,
  // onPOIClick,
  routeInfo,
}) => {
 
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
  };


  return (
    <div className="absolute right-4 top-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
      {/* <h3 className="text-lg font-semibold mb-3">
        Points of Interest ({pois.length})
      </h3> */}
      
      {selectedPOI && routeInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">{selectedPOI.title}</h4>
          
          <div className="space-y-2">
            {/* Driving info */}
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-gray-600" />
              <span className="text-sm">
                {formatDuration(routeInfo.driving.duration)} ({formatDistance(routeInfo.driving.distance)})
              </span>
            </div>
            
            {/* Walking info */}
            { routeInfo.walking && 
              <div className="flex items-center space-x-2">
                <Footprints className="w-5 h-5 text-gray-600" />
                <span className="text-sm">
                  {formatDuration(routeInfo.walking.duration)} ({formatDistance(routeInfo.walking.distance)})
                </span>
              </div>
              }
          </div>
        </div>
      )}
      {/* <div className="space-y-2 max-h-96 overflow-y-auto">
        {pois.length === 0 ? (
          <p className="text-gray-500">No POIs found within 20km</p>
        ) : (
          pois.map(poi => {
            const Icon = POIMarkers[poi.type.name];
            const color = POIColors[poi.type.name];
            const distance = geoUtils.getDistance(
              projectCenter?.lat || 0,
              projectCenter?.lng || 0,
              poi.lat,
              poi.lng
            );
            
            return (
              <div
                key={poi.id}
                className={`
                  flex items-center space-x-3 p-2 rounded-lg cursor-pointer
                  transition-colors duration-200
                  ${selectedPOI?.id === poi.id 
                    ? 'bg-blue-100' 
                    : 'hover:bg-white/50'
                  }
                `}
                onClick={() => onPOIClick(poi)}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">{poi.title}</h4>
                  <p className="text-sm text-gray-500">
                    {distance.toFixed(1)}km away
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div> */}
    </div>
  );
};