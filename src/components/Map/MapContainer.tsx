"use client";
import React, { useRef, useCallback, useReducer, useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Map, { MapRef } from "react-map-gl";
import { MAP_DATA } from "@/data/data";
import MapControls from "@/components/Map/MapControls";
import { MAP_CONFIG, MAPBOX_TOKEN } from "@/app/constants/mapConstants";
import { ANIMATION_CONFIG } from "@/styles/mapStyles";
import { MapState, MapAction } from "@/types/map";
import { ChevronDown, ChevronUp } from 'lucide-react';

// Dynamic imports
const ProjectPolygons = dynamic(() => import('@/components/Map/ProjectPolygons'), { ssr: false });
const ProjectsMarker = dynamic(() => import('@/components/Map/ProjectMarker'), { ssr: false });
const MeteorBackground = dynamic(() => import('./MeteorBackground'), { ssr: false });

const ProjectList = ({ 
  projects, 
  onSelect,
  isOpen,
  setIsOpen
}: { 
  projects: typeof MAP_DATA,
  onSelect: (id: string) => void,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  return (
    <div className="absolute top-4 right-4 z-10 w-[300px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white/90 rounded-lg shadow-lg hover:bg-white/100 transition-all"
      >
        <span className="text-sm font-medium">Project List</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="mt-2 bg-white/90 rounded-lg shadow-lg max-h-[400px] overflow-y-auto backdrop-blur-sm">
          {projects.map((project) => {
            if(project.showInList === false) return null;
            return (
              <button
              key={project.id}
              onClick={() => {
                onSelect(project.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors border-b border-gray-100 last:border-0"
            >
              <h3 className="text-sm font-medium mb-1">{project.name}</h3>
              {/* {project.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              )} */}
            </button>
            )
          })}
        </div>
      )}
    </div>
  );
};

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_MAP_LOADED':
      return { ...state, mapLoaded: action.payload };
    case 'TOGGLE_TEXT':
      return { ...state, showText: action.payload };
    case 'TOGGLE_GOOGLE_LAYER':
      return { ...state, showGoogleLayer: action.payload };
    // case 'SET_CURRENT_PROJECT':
    //   return { ...state, currentProject: action.payload };
    case 'UPDATE_VIEW_STATE':
      return { ...state, viewState: action.payload };
    default:
      return state;
  }
}

export default function InteractiveMap() {
  const mapRef = useRef<MapRef>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showPolygons, setShowPolygons] = useState(false);
  const [showMeteor, setShowMeteor] = useState(true);
  const [state, dispatch] = useReducer(mapReducer, {
    showText: true,
    mapLoaded: false,
    // currentProject: null,
    showGoogleLayer: true,
    viewState: MAP_CONFIG.initialViewState
  });
  const [isProjectListOpen, setIsProjectListOpen] = useState(false);

  // Handle zoom changes
  const handleZoomChange = useCallback(() => {
    const mapboxMap = mapRef?.current?.getMap();
    if (!mapboxMap) return;

    const currentZoom = mapboxMap.getZoom();

    // Update visibility based on zoom level
    if (currentZoom >= 8) {
      setShowMarkers(false);
      setShowPolygons(true);
      setShowMeteor(false)
    } else {
      setShowMarkers(true);
      setShowPolygons(false);
      setShowMeteor(true)
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

      // Add source
      mapboxMap.addSource('google-satellite', {
        type: 'raster',
        tiles: [`https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 20,
      });

      // Find the first symbol layer to insert before
      const style = mapboxMap.getStyle();
      const firstSymbolLayer = style?.layers?.find(
        layer => layer.type === 'symbol'
      )?.id;

      // Add layer at the bottom
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

  // Event Handlers
  const handleMapLoad = useCallback(() => {
    dispatch({ type: 'SET_MAP_LOADED', payload: true });
    addGoogleMapLayer();
  }, [addGoogleMapLayer]);

  const handleChangeLocation = useCallback((id: string) => {
    const area = MAP_DATA.find((area) => area.id === id);
    const map = mapRef?.current;
    
    if (!area || !map) return;
    
    map.flyTo({
      center: [area.lng, area.lat],
      zoom: area.zoom,
      duration: 3000,
    });
    
    dispatch({ type: 'TOGGLE_TEXT', payload: area.zoom === 1 });
  }, []);

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


   // Add zoom change handler to map
   useEffect(() => {
    const mapboxMap = mapRef?.current?.getMap();
    if (!mapboxMap) return;

    mapboxMap.on('zoom', handleZoomChange);

    // Initial check
    handleZoomChange();

    return () => {
      mapboxMap.off('zoom', handleZoomChange);
    };
  }, [handleZoomChange]);

  return (
    <div className="m-0" id="map-page">
      {showMeteor && <MeteorBackground />}
      {/* Map Container */}
      <div className="absolute top-0 h-screen w-full z-0">
        <Map
          ref={mapRef}
          initialViewState={MAP_CONFIG.initialViewState}
          mapStyle="mapbox://styles/hanyrabah/clreumh3d00e501pid3g47uqu"
          mapboxAccessToken={MAPBOX_TOKEN}
          onLoad={handleMapLoad}
          onIdle={spinGlobe}
          projection={{
            name: 'globe'
          }}
          onZoom={handleZoomChange}
        >
            {showPolygons && <ProjectPolygons />}
            {showMarkers && <ProjectsMarker handleClick={handleChangeLocation} />}
            <MapControls 
              showGoogleLayer={state.showGoogleLayer}
              toggleGoogleLayer={toggleGoogleLayer}
              handleZoomOut={handleZoomOut}
              isZoomedOut={state.showText}
              mapBox={mapRef} // not used for now but will keep it for future use
              showMarkers={showMarkers}
              showPolygons={showPolygons}
              setShowMarkers={setShowMarkers}
              setShowPolygons={setShowPolygons}
            />
          {/* Project List Dropdown */}
          <ProjectList
            projects={MAP_DATA}
            onSelect={handleChangeLocation}
            isOpen={isProjectListOpen}
            setIsOpen={setIsProjectListOpen}
          />
        </Map>

        
      </div>
      
      {/* Project Details Modal */}
      {/* <ProjectDetails
        data={state.currentProject}
        toggleProject={() => dispatch({ 
          type: 'SET_CURRENT_PROJECT', 
          payload: null 
        })}
      /> */}
    </div>
  );
}