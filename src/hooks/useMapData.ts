import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  hideMarker: boolean;
  zoom: number;
  polygons: Array<{
    id: string;
    name: string;
    type: string;
    coordinates: string;
    description?: string;
    style?: {
      fillColor?: string;
      hoverFillColor?: string;
      fillOpacity?: number;
      hoverFillOpacity?: number;
    };
  }>;
}

export function useMapData() {
  const [mapData, setMapData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`Failed to fetch map data (${response.status})`);
        }

        const data = await response.json();
        
        // Ensure we're working with an array of projects
        const projectsArray = Array.isArray(data) ? data : data.projects || [];
        
        // Transform the projects data
        const transformedData = projectsArray.map(project => ({
          ...project,
          polygons: (project.polygons || []).map(polygon => ({
            ...polygon,
            // Parse coordinates if they're stored as a string
            coordinates: typeof polygon.coordinates === 'string' 
              ? JSON.parse(polygon.coordinates)
              : polygon.coordinates,
            // Handle polygon style
            style: polygon.style 
              ? {
                  fillColor: polygon.style.fillColor,
                  hoverFillColor: polygon.style.hoverFillColor,
                  fillOpacity: polygon.style.fillOpacity,
                  hoverFillOpacity: polygon.style.hoverFillOpacity,
                }
              : undefined
          }))
        }));

        console.log('Transformed Map Data:', transformedData);
        setMapData(transformedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    }

    fetchMapData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`Failed to fetch map data (${response.status})`);
      }

      const data = await response.json();
      const projectsArray = Array.isArray(data) ? data : data.projects || [];
      
      const transformedData = projectsArray.map(project => ({
        ...project,
        polygons: (project.polygons || []).map(polygon => ({
          ...polygon,
          coordinates: typeof polygon.coordinates === 'string' 
            ? JSON.parse(polygon.coordinates)
            : polygon.coordinates,
          style: polygon.style 
            ? {
                fillColor: polygon.style.fillColor,
                hoverFillColor: polygon.style.hoverFillColor,
                fillOpacity: polygon.style.fillOpacity,
                hoverFillOpacity: polygon.style.hoverFillOpacity,
              }
            : undefined
        }))
      }));

      setMapData(transformedData);
    } catch (err) {
      console.error('Refetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  return { 
    mapData, 
    loading, 
    error,
    refetch 
  };
}