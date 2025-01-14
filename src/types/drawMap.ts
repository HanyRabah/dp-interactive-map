// types.ts
export interface Marker {
    id: string;
    longitude: number;
    latitude: number;
    name: string;
  }
  
  export interface Feature {
    id: string;
    geometry: {
      type: 'Polygon' | 'LineString' | string,
      coordinates: number[][] | number[][][];
    };
  }
  
  export interface FeatureNames {
    [key: string]: string;
  }
  
  export const MODES = {
    DRAW: 'draw',
    MARKER: 'marker',
    VIEW: 'view',
  } as const;
  
  export type Mode = typeof MODES[keyof typeof MODES];

  export interface HandleNameChange {
    (featureId: string, newName: string): void;
  }

  export interface HandleMarkerNameChange {
    (markerId: string, newName: string): void;
  }