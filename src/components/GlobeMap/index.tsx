// components/GlobeMap/index.tsx
"use client";
import React, { useRef, useCallback, useReducer, useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Map, { MapRef } from "react-map-gl";
import MapControls from "./MapControls";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/app/constants/mapConstants";
import { ANIMATION_CONFIG } from "@/styles/mapStyles";
import { useMapData } from "@/hooks/useMapData";

interface MapState {
  showText: boolean;
  mapLoaded: boolean;
  showGoogleLayer: boolean;
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

type MapAction =
  | { type: 'SET_MAP_LOADED'; payload: boolean }
  | { type: 'TOGGLE_TEXT'; payload: boolean }
  | { type: 'TOGGLE_GOOGLE_LAYER'; payload: boolean }
  | { type: 'UPDATE_VIEW_STATE'; payload: MapState['viewState'] };

// Dynamic imports
const ProjectPolygons = dynamic(() => import('@/components/GlobeProjects/ProjectPolygons'), { ssr: false });
const ProjectsMarker = dynamic(() => import('@/components/GlobeProjects/ProjectMarker'), { ssr: false });
const ProjectList = dynamic(() => import('@/components/GlobeProjects/ProjectList'), { ssr: false });
const MeteorBackground = dynamic(() => import('./MeteorBackground'), { ssr: false });

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_MAP_LOADED':
      return { ...state, mapLoaded: action.payload };
    case 'TOGGLE_TEXT':
      return { ...state, showText: action.payload };
    case 'TOGGLE_GOOGLE_LAYER':
      return { ...state, showGoogleLayer: action.payload };
    case 'UPDATE_VIEW_STATE':
      return { ...state, viewState: action.payload };
    default:
      return state;
  }
}

const InteractiveMap: React.FC = () => {
  const { mapData, loading, error } = useMapData();
  const mapRef = useRef<MapRef>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(false);
  const [showMeteor, setShowMeteor] = useState(true);
  const [state, dispatch] = useReducer(mapReducer, {
    showText: true,
    mapLoaded: false,
    showGoogleLayer: true,
    viewState: MAP_CONFIG.initialViewState
  });
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  // Handle zoom changes
  const handleZoomChange = useCallback(() => {
    const mapboxMap = mapRef?.current?.getMap();
    if (!mapboxMap) return;

    const currentZoom = mapboxMap.getZoom();

    if (currentZoom >= 8) {
      setShowMarkers(false);
      setShowPolygons(true);
      setShowMeteor(false);
    } else {
      setShowMarkers(true);
      setShowPolygons(false);
      setShowMeteor(true);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapRef?.current;
    if (!map) return;
    
    map.flyTo({
      center: [MAP_CONFIG.initialViewState.longitude, MAP_CONFIG.initialViewState.latitude],
      zoom: 2,
      duration: 3000,
    });
    
    dispatch({ type: 'TOGGLE_TEXT', payload: true });
    handleZoomChange();
  }, [handleZoomChange]);

  // Layer Management Functions
  const addGoogleMapLayer = useCallback(() => {
    if (!mapRef.current) return;
    const mapboxMap = mapRef.current.getMap();
    
    const addLayer = () => {
      if (mapboxMap.getSource('google-satellite')) return;

      mapboxMap.addSource('google-satellite', {
        type: 'raster',
        tiles: [`https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 20,
      });

      const style = mapboxMap.getStyle();
      const firstSymbolLayer = style?.layers?.find(
        layer => layer.type === 'symbol'
      )?.id;

      mapboxMap.addLayer({
        id: 'google-satellite-layer',
        type: 'raster',
        source: 'google-satellite',
        paint: {
          'raster-opacity': 1,
          'raster-fade-duration': 1000,
        },
        layout: {
          visibility: state.showGoogleLayer ? 'visible' : 'none',
        }
      }, firstSymbolLayer);

      mapboxMap.flyTo({
        zoom: 2,
        duration: 3000,
      });
    };

    if (mapboxMap.isStyleLoaded()) {
      addLayer();
    } else {
      mapboxMap.on('style.load', addLayer);
    }
  }, [state.showGoogleLayer]);

  const toggleGoogleLayer = useCallback(() => {
    if (!mapRef.current) return;
    
    const mapboxMap = mapRef.current.getMap();
    const newVisibility = !state.showGoogleLayer;
    
    try {
      if (mapboxMap.getLayer('google-satellite-layer')) {
        mapboxMap.setLayoutProperty(
          'google-satellite-layer',
          'visibility',
          newVisibility ? 'visible' : 'none'
        );
      }
      
      dispatch({ type: 'TOGGLE_GOOGLE_LAYER', payload: newVisibility });
    } catch (error) {
      console.error('Layer visibility error:', error);
    }
  }, [state.showGoogleLayer]);

  const handleMapLoad = useCallback(() => {
    dispatch({ type: 'SET_MAP_LOADED', payload: true });
    addGoogleMapLayer();
  }, [addGoogleMapLayer]);

  const handleChangeLocation = useCallback((id: string) => {
    const project = mapData.find((p) => p.id === id);
    const map = mapRef?.current;
    
    if (!project || !map) return;
    
    map.flyTo({
      center: [project.lng, project.lat],
      zoom: project.zoom,
      duration: 3000,
    });
    
    dispatch({ type: 'TOGGLE_TEXT', payload: project.zoom === 1 });
  }, [mapData]);

  const spinGlobe = useCallback(() => {
    const mapboxMap = mapRef?.current?.getMap();
    const zoom = mapboxMap?.getZoom();
    
    if (zoom && zoom < ANIMATION_CONFIG.MAX_SPIN_ZOOM) {
      let distancePerSecond = 360 / ANIMATION_CONFIG.SECONDS_PER_REVOLUTION;
      
      if (zoom > ANIMATION_CONFIG.SLOW_SPIN_ZOOM) {
        const zoomDif = (ANIMATION_CONFIG.MAX_SPIN_ZOOM - zoom) / 
          (ANIMATION_CONFIG.MAX_SPIN_ZOOM - ANIMATION_CONFIG.SLOW_SPIN_ZOOM);
        distancePerSecond *= zoomDif;
      }
      
      const center = mapboxMap?.getCenter() || { lat: 0, lng: 0 };
      center.lng -= distancePerSecond;
      
      mapboxMap?.easeTo({ 
        center, 
        duration: 6000, 
        easing: (n) => n 
      });
    }
  }, []);

  useEffect(() => {
    const mapboxMap = mapRef?.current?.getMap();
    if (!mapboxMap) return;

    mapboxMap.on('zoom', handleZoomChange);
    handleZoomChange();

    return () => {
      mapboxMap.off('zoom', handleZoomChange);
    };
  }, [handleZoomChange]);

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Map Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-0" id="map-page">
      {showMeteor && <MeteorBackground />}
      <div className="absolute top-0 h-screen w-full z-0">
        <Map
          ref={mapRef}
          initialViewState={MAP_CONFIG.initialViewState}
          mapStyle="mapbox://styles/hanyrabah/clreumh3d00e501pid3g47uqu"
          mapboxAccessToken={MAPBOX_TOKEN}
          onLoad={handleMapLoad}
          onIdle={spinGlobe}
          projection={{ name: 'globe' }}
          onZoom={handleZoomChange}
        >
          {showPolygons && <ProjectPolygons projects={mapData} />}
          {showMarkers && <ProjectsMarker handleClick={handleChangeLocation} projects={mapData} />}
          
          <MapControls 
            showGoogleLayer={state.showGoogleLayer}
            toggleGoogleLayer={toggleGoogleLayer}
            handleZoomOut={handleZoomOut}
            isZoomedOut={state.showText}
            mapBox={mapRef}
            showMarkers={showMarkers}
            showPolygons={showPolygons}
            setShowMarkers={setShowMarkers}
            setShowPolygons={setShowPolygons}
          />
          <ProjectList
            projects={mapData}
            onSelect={handleChangeLocation}
            isOpen={isProjectListOpen}
            setIsOpen={setIsProjectListOpen}
            loading={loading}
          />
        </Map>
      </div>
    </div>
  );
};

export default InteractiveMap;