// hooks/useMapData.ts
import { Project } from '@/types/project';
import { useState, useEffect } from 'react';

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
        setMapData(data);
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
      setMapData(data);
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