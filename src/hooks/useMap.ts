// hooks/useMap.ts
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapConfig } from '@/types/map';


export function useMap(containerId: string, config: MapConfig) {
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: containerId,
        style: config.style,
        center: config.center,
        zoom: config.zoom,
        projection: config.projection
      });
    }

    return () => {
      mapInstance.current?.remove();
    };
  }, [containerId, config]);

  return mapInstance.current;
}