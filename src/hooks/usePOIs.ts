import { useState, useCallback } from 'react';
import { POIMarkers } from '@/components/POI/markers';

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

export function usePOIs() {
  const [pois, setPois] = useState<POI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<(keyof typeof POIMarkers)[]>(
    Object.keys(POIMarkers) as (keyof typeof POIMarkers)[]
  );

  const fetchPOIs = useCallback(async (bounds?: number[]) => {
    try {
      const params = new URLSearchParams();
      if (bounds) {
        params.append('bounds', bounds.join(','));
      }
      if (selectedTypes.length) {
        params.append('types', selectedTypes.join(','));
      }

      const response = await fetch(`/api/pois?${params}`);
      if (!response.ok) throw new Error('Failed to fetch POIs');
      
      const data = await response.json();
      setPois(data);
    } catch (error) {
      console.error('Error fetching POIs:', error);
    }
  }, [selectedTypes]);

  const togglePOIType = useCallback((type: keyof typeof POIMarkers) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  return {
    pois,
    selectedPOI,
    selectedTypes,
    setSelectedPOI,
    fetchPOIs,
    togglePOIType
  };
}