import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMap, MapboxGeoJSONFeature } from 'react-map-gl';
import { POIMarkers, POIColors } from './markers';

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

interface POIMapProps {
  pois: POI[];
  onPOIClick: (poi: POI) => void;
  onMapClick: (lat: number, lng: number) => void;
  selectedPOI?: POI | null;
  isAddingMode?: boolean;
  tempMarker?: { lat: number; lng: number } | null;
}

export const POIMap: React.FC<POIMapProps> = ({
  pois,
  onPOIClick,
  onMapClick,
  selectedPOI,
  isAddingMode,
  tempMarker
}) => {
  const [popupInfo, setPopupInfo] = useState<POI | null>(null);
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      if (isAddingMode) {
        const { lng, lat } = event.lngLat;
        onMapClick(lat, lng);
      }
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, isAddingMode, onMapClick]);

  // Cursor styling for adding mode
  useEffect(() => {
    if (!map) return;
    map.getCanvas().style.cursor = isAddingMode ? 'crosshair' : 'pointer';
  }, [map, isAddingMode]);

  return (
    <>
      {/* Existing POI Markers */}
      {pois.map((poi) => {
        const Icon = POIMarkers[poi.type.name];
        const color = POIColors[poi.type.name];
        
        return (
          <React.Fragment key={poi.id}>
            <Marker
              longitude={poi.lng}
              latitude={poi.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(poi);
                onPOIClick(poi);
              }}
            >
              <div className={`
                cursor-pointer transform transition-transform 
                ${selectedPOI?.id === poi.id ? 'scale-125' : 'hover:scale-110'}
              `}>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Marker>

            {popupInfo?.id === poi.id && (
              <Popup
                longitude={poi.lng}
                latitude={poi.lat}
                anchor="top"
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
              >
                <div className="p-2">
                  <h3 className="font-medium">{poi.title}</h3>
                  <p className="text-sm text-gray-500">{poi.type.name}</p>
                </div>
              </Popup>
            )}
          </React.Fragment>
        );
      })}

      {/* Temporary Marker for Adding Mode */}
      {tempMarker && (
        <Marker
          longitude={tempMarker.lng}
          latitude={tempMarker.lat}
          anchor="bottom"
        >
          <div className="animate-bounce">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-5 h-5 text-white">
                <div className="w-5 h-5 text-white">
                    <POIMarkers.store className="w-5 h-5" />
                </div>

              </div>
            </div>
          </div>
        </Marker>
      )}
    </>
  );
};