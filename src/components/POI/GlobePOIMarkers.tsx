import { POI } from '@/types/poi';
import { Project } from '@/types/project';
import { geoUtils } from '@/utils/geoUtils';
import { routeUtils } from '@/utils/routeUtils';
import { Car, Clock, Footprints } from 'lucide-react';
import React, { useState } from 'react';
import { Marker } from 'react-map-gl';
import { POIColors, POIMarkers } from './markers';

interface GlobePOIMarkersProps {
  pois: POI[];
  onPOIClick: (poi: POI) => void;
  showMarkers: boolean;
  project: Project
}

interface RouteDetails {
  driving: {
    duration: number;
    distance: number;
  } | null;
  walking: {
    duration: number;
    distance: number;
  } | null;
}

export const GlobePOIMarkers: React.FC<GlobePOIMarkersProps> = ({
  pois,
  onPOIClick,
  showMarkers,
  project
}) => {
  const [hoveredPOI, setHoveredPOI] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<{ [key: string]: RouteDetails }>({});

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters: number) => {
    const kilometers = meters / 1000;
    return kilometers < 1 
      ? `${Math.round(meters)}m` 
      : `${kilometers.toFixed(1)}km`;
  };

  const fetchRouteDetails = async (poi: POI) => {
    if (!project?.polygon) return;

    const coordinates = JSON.parse(project.polygon.coordinates);
    const center = geoUtils.getPolygonCenter(coordinates);

    try {
      const [drivingRoute, walkingRoute] = await Promise.all([
        routeUtils.fetchRouteMapBox([center.lng, center.lat], [poi.lng, poi.lat], 'driving'),
        routeUtils.fetchRouteMapBox([center.lng, center.lat], [poi.lng, poi.lat], 'walking')
      ]);

      setRouteDetails(prev => ({
        ...prev,
        [poi.id]: {
          driving: drivingRoute && !('message' in drivingRoute) ? {
            duration: drivingRoute.duration / 60, // Convert to minutes
            distance: drivingRoute.distance
          } : null,
          walking: walkingRoute && !('message' in walkingRoute) ? {
            duration: walkingRoute.duration / 60, // Convert to minutes
            distance: walkingRoute.distance
          } : null
        }
      }));
    } catch (error) {
      console.error('Error fetching route details:', error);
    }
  };

  if (!showMarkers) return null;

  return (
    <>
      {pois.map((poi) => {
        const Icon = POIMarkers[poi.type.name];
        const color = POIColors[poi.type.name];
        const details = routeDetails[poi.id];

        return (
          <Marker
            key={poi.id}
            longitude={poi.lng}
            latitude={poi.lat}
            anchor="center"
            style={{
              zIndex: 10
            }}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              //onPOIClick(poi);
            }}
          >
            <div 
              className="relative group cursor-pointer z-10"
              onMouseEnter={() => {
                setHoveredPOI(poi.id);
                if (!routeDetails[poi.id]) {
                  fetchRouteDetails(poi);
                }
              }}
              onMouseLeave={() => setHoveredPOI(null)}
            >
              {/* Inner circle */}
              <div 
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Enhanced Tooltip */}
              {hoveredPOI === poi.id && (
                <div className="absolute opacity-100 transition-all duration-200 
                              bottom-full left-1/2 -translate-x-1/2 mb-2 
                              bg-gray-900/90 text-white rounded-lg shadow-lg
                              min-w-[220px] p-3 z-50">
                  {/* Title */}
                  <div className="font-semibold mb-2 text-sm">
                    {poi.title}
                  </div>

                  {/* Type */}
                  <div className="text-xs text-gray-300 mb-2">
                    {poi.type.name}
                  </div>

                  {/* Route Details */}
                  {details ? (
                    <div className="space-y-2">
                      {details.driving && (
                        <div className="flex items-center gap-2 text-xs">
                          <Car className="w-4 h-4 text-blue-400" />
                          <span>
                            {formatDuration(details.driving.duration)} ({formatDistance(details.driving.distance)})
                          </span>
                        </div>
                      )}
                      {details.walking && (
                        <div className="flex items-center gap-2 text-xs">
                          <Footprints className="w-4 h-4 text-green-400" />
                          <span>
                            {formatDuration(details.walking.duration)} ({formatDistance(details.walking.distance)})
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Calculating route...</span>
                    </div>
                  )}

                  {/* Triangle Pointer */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                                w-2 h-2 bg-gray-900/90 rotate-45" />
                </div>
              )}
            </div>
          </Marker>
        );
      })}
    </>
  );
};

export default GlobePOIMarkers;