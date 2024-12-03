import { MAP_CONFIG } from "@/app/constants/mapConstants";
import { MapRef } from "react-map-gl";

// Map Config
export interface MapConfig {
  style: string;
  center: [number, number];
  zoom: number;
  projection?: string;
}

// Map State 
export type MapState = {
  showText: boolean;
  mapLoaded: boolean;
  showGoogleLayer: boolean;
  viewState: typeof MAP_CONFIG.initialViewState;
};

// Map reducer actions
export type MapAction = 
  | { type: 'SET_MAP_LOADED'; payload: boolean }
  | { type: 'TOGGLE_TEXT'; payload: boolean }
  | { type: 'TOGGLE_GOOGLE_LAYER'; payload: boolean }
  | { type: 'UPDATE_VIEW_STATE'; payload: typeof MAP_CONFIG.initialViewState };
  // | { type: 'SET_CURRENT_PROJECT'; payload: any }

// Map style types
export interface MapStyle {
  id?: string;
  type?: string;
  paint?: {
    'hover-fill-color'?: string;
    'hover-fill-opacity'?: number;
    'fill-color'?: string;
    'fill-opacity'?: number;
    [key: string]: any;
  },
  background?: {
    type: 'line';
    paint: {
      'line-color': string;
      'line-width': number;
      'line-opacity': number;
    };
    layout: {
      'line-cap': 'round' | 'butt' | 'square';
      'line-join': 'round' | 'bevel' | 'miter';
    };
  };
  dashed?: {
    type: 'line';
    paint: {
      'line-color': string;
      'line-width': number;
      'line-dasharray': number[];
    };
  };
  [key: string]: any;
}
  
// Project details types
export interface ProjectDetails {
Location?: string;
Department?: string;
[key: string]: string | undefined;
}

// Feature properties
export interface FeatureProperties {
id: string;
name: string;
lng: number;
lat: number;
hiddenAnchor: boolean;
noHover: boolean;
description?: string;
image?: string;
url?: string;
details?: ProjectDetails;
style: MapStyle;
}

export type ProjectProperties = { [name: string]: any } | null

export interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectProperties | null;
}

export interface MapFeature {
type: 'Feature';
properties: FeatureProperties;
geometry: GeoJSON.Geometry;
}

export interface FeatureCollection {
type: 'FeatureCollection';
features: MapFeature[];
}

export interface HoveredFeature {
  name: string;
  x: number;
  y: number;
  properties?: Record<string, any>;
}

export interface MarkerConfig {
  iconColor?: string;
  backgroundColor?: string;
  pulseColor?: string;
  icon?: React.ReactNode;
}

export interface MapControlsProps {
  showGoogleLayer: boolean;
  toggleGoogleLayer: () => void;
  handleZoomOut: () => void;
  isZoomedOut: boolean;
  mapBox?: React.RefObject<MapRef>;
  showMarkers: boolean;
  showPolygons: boolean;
  setShowMarkers: (show: boolean) => void;
  setShowPolygons: (show: boolean) => void;
}

export interface MapControlsStyleOption {
  id: string;
  name: string;
  value: string;
  icon: React.ReactNode;
  action?: () => void;
}
