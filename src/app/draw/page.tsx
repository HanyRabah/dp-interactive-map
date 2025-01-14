// app/draw/page.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Copy, CheckCircle, Search, X } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MAP_CONFIG } from '../constants/mapConstants';

interface GeometryData {
  type: string;
  coordinates: number[][][] | number[][];
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

const MapboxExample = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  
  const [geometryData, setGeometryData] = useState<GeometryData | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleCopy = () => {
    if (geometryData) {
      navigator.clipboard.writeText(JSON.stringify(geometryData.coordinates, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center
      })));
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    if (!mapRef.current) return;

    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    const marker = new mapboxgl.Marker()
      .setLngLat(result.center)
      .addTo(mapRef.current);
    markerRef.current = marker;

    // Fly to location
    mapRef.current.flyTo({
      center: result.center,
      zoom: 14,
      duration: 2000
    });

    // Clear search
    setSearchResults([]);
    setSearchQuery('');
    setIsSearching(false);
  };

  // Map initialization useEffect remains the same...
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
        throw new Error('Mapbox access token is not defined');
      }

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [MAP_CONFIG.initialViewState.longitude, MAP_CONFIG.initialViewState.latitude],
        zoom: 12
      });
      
      map.on('load', () => {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            line_string: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });
        
        map.addControl(draw);
        drawRef.current = draw;

        const updateGeometry = () => {
          const data = draw.getAll();
          if (data.features.length > 0) {
            const feature = data.features[0];
            const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.LineString;
            setGeometryData({
              type: geometry.type,
              coordinates: geometry.coordinates
            });
          } else {
            setGeometryData(null);
          }
        };

        map.on('draw.create', updateGeometry);
        map.on('draw.delete', updateGeometry);
        map.on('draw.update', updateGeometry);
      });

      mapRef.current = map;

      return () => {
        if (markerRef.current) markerRef.current.remove();
        map.remove();
        mapRef.current = null;
        drawRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  return (
    <div className="relative items-stretch min-h-screen w-full">
      {/* Search Box */}
      <div className="absolute top-4 left-4 z-10 w-[300px]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location..."
            className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Search Results */}
        {isSearching && searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            <div className="p-2 flex justify-between items-center border-b">
              <span className="text-sm font-semibold">Search Results</span>
              <button 
                onClick={() => setIsSearching(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-sm"
              >
                {result.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 min-h-screen w-full"
      />

      {/* Coordinates Box */}
      <div className="absolute bottom-10 right-2.5 bg-white/90 p-4 max-h-1/2 w-[300px] overflow-y-auto rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2.5">
          <p className="m-0 text-sm font-['Open_Sans']">
            Draw a polygon or line on the map.
          </p>
          {geometryData && (
            <button
              onClick={handleCopy}
              className={`border-none bg-transparent cursor-pointer p-1 flex items-center ${
                copied ? 'text-green-500' : 'text-gray-600'
              }`}
              title="Copy coordinates"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </button>
          )}
        </div>
        {geometryData && (
          <div>
            <p className="m-0 text-sm font-['Open_Sans']">
              <strong>
                {geometryData.type === 'Polygon' ? 'Polygon' : 'Line'} Coordinates:
              </strong>
            </p>
            <pre className="text-xs overflow-auto h-full my-1.5 mx-0 bg-gray-100 p-2 rounded">
              {JSON.stringify(geometryData.coordinates, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapboxExample;