export interface Coordinate {
    lat: number;
    lng: number;
  }
  
  export interface Polygon {
    id: string;
    name: string;
    type: 'Normal Polygon' | 'Line';
    coordinates: Coordinate[];
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    lat: number;
    lng: number;
    zoomLevel: number;
    hideMarker: boolean;
    polygons: Polygon[];
  }