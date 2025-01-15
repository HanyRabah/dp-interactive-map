import React, { useEffect, useState } from 'react';
import { ChevronRight, Clock, MapPin } from 'lucide-react';
import { Project } from '@/types/project';
import { useMap } from 'react-map-gl';

interface LocationInfo {
  country: {
    name: string;
    bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  };
  area: {
    name: string;
    bbox?: [number, number, number, number];
  };
}

interface LocationBreadcrumbProps {
  selectedProject?: Project | null;
  selectedPOI?: {
    title: string;
  } | null;
  routeInfo?: {
    driving?: {
      duration: number;
      distance: number;
    };
  } | null;
  center?: [number, number];
}

export const LocationBreadcrumb: React.FC<LocationBreadcrumbProps> = ({
  selectedProject,
  selectedPOI,
  routeInfo,
  center
}) => {
  const { current: map } = useMap();
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    const fetchLocationInfo = async () => {
      if (!center) return;

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${center[0]},${center[1]}.json?` +
          `types=country,place&` +
          `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );

        if (!response.ok) throw new Error('Failed to fetch location');

        const data = await response.json();
        const country = data.features.find((f: any) => f.place_type[0] === 'country');
        const area = data.features.find((f: any) => f.place_type[0] === 'place');

        setLocationInfo({
          country: {
            name: country?.text || '',
            bbox: country?.bbox
          },
          area: {
            name: area?.text || '',
            bbox: area?.bbox
          }
        });
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocationInfo();
  }, [center]);

  const handleCountryClick = () => {
    if (!map || !locationInfo?.country.bbox) return;
    
    map.fitBounds(
      [
        [locationInfo.country.bbox[0], locationInfo.country.bbox[1]],
        [locationInfo.country.bbox[2], locationInfo.country.bbox[3]]
      ],
      { padding: 50, duration: 2000 }
    );
  };

  const handleAreaClick = () => {
    if (!map || !locationInfo?.area.bbox) return;
    
    map.fitBounds(
      [
        [locationInfo.area.bbox[0], locationInfo.area.bbox[1]],
        [locationInfo.area.bbox[2], locationInfo.area.bbox[3]]
      ],
      { padding: 50, duration: 2000 }
    );
  };

  const handleProjectClick = () => {
    if (!map || !selectedProject) return;
    if (selectedProject.polygon) {
        map.flyTo({
          center: [selectedProject.lng, selectedProject.lat],
          zoom: selectedProject.zoom,
          duration: 2000
        });
    } else {
      map.flyTo({
        center: [selectedProject.lng, selectedProject.lat],
        zoom: selectedProject.zoom,
        duration: 2000
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatDistance = (meters: number) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  return (
    <div className="absolute bottom-8 left-4 z-10 bg-black/50 text-white rounded-lg px-4 py-2  z-10">
      <div className="flex items-center space-x-2 text-sm">
      {locationInfo?.country.name && (
          <>
            <button
              onClick={handleCountryClick}
              className="hover:text-blue-400 transition-colors"
            >
              {locationInfo.country.name}
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </>
        )}

        {locationInfo?.area && (
          <>
            <button
              onClick={handleAreaClick}
              className="hover:text-blue-400 transition-colors"
            >
              {locationInfo.area.name}
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </>
        )}

        {selectedProject && (
          <>
            <button
              onClick={handleProjectClick}
              className="hover:text-blue-400 transition-colors"
            >
              {selectedProject.name}
            </button>
          </>
        )}

        {selectedPOI && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <span>{selectedPOI.title}</span>
              {routeInfo?.driving && (
                <div className="flex items-center space-x-2 text-xs bg-white/10 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(routeInfo.driving.duration)}</span>
                  <MapPin className="w-3 h-3" />
                  <span>{formatDistance(routeInfo.driving.distance)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};