import React from 'react';
import { Marker } from 'react-map-gl';
import { POIMarkers, POIColors } from './markers';
import { POI } from '@/types/poi';


interface GlobePOIMarkersProps {
  pois: POI[];
  onPOIClick: (poi: POI) => void;
  showMarkers: boolean;
}

export const GlobePOIMarkers: React.FC<GlobePOIMarkersProps> = ({
  pois,
  onPOIClick,
  showMarkers,
}) => {
  if (!showMarkers) return null;

  return (
    <>
      {pois.map((poi) => {
        const Icon = POIMarkers[poi.type.name];
        const color = POIColors[poi.type.name];

        return (
          <Marker
            key={poi.id}
            longitude={poi.lng}
            latitude={poi.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPOIClick(poi);
            }}
          >
            <div className="relative group cursor-pointer">
              {/* Pulsing background */}
              {/* <div className="absolute w-16 h-16 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: `${color}20` }} /> */}
              
              {/* Inner circle */}
              <div className="relative w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color }}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                            bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/75 text-white 
                            text-sm rounded whitespace-nowrap">
                {poi.title}
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
};