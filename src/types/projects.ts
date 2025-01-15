 import { GeoJsonGeometry } from "@/utils/coordinates";
import { ProjectDetails } from "@prisma/client";

export interface Coordinate {
    lat: number;
    lng: number;
  }
  
  export interface Polygon {
    id: string;
    name: string;
    type: GeoJsonGeometry;
    coordinates: string;
    description?: string;
    popupType?: 'link' | 'details';
    popupDetails?: PopupDetails;
    projectId: string;
    style?: {
      fillColor?: string;
      hoverFillColor?: string;
      fillOpacity?: number;
      hoverFillOpacity?: number;
      lineColor?: string;
      lineWidth?: number;
      lineOpacity?: number;
      lineDashArray?: string | number[];
      noHover?: boolean;
    };
  }
  
  export interface PolygonStyle {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    fillOpacity: number | null;
    fillColor: string | null | undefined;
    hoverFillColor: string | null;
    hoverFillOpacity: number | null;
    lineColor: string | null;
    lineWidth: number | null;
    lineOpacity: number | null;
    lineDashArray: string | null;
    polygonId: string;
  }

  export interface PopupDetails {
    title?: string;
    image?: string;
    type?: 'link' | 'details';
    description?: string;
    link?: string;
    imagesLink?: string;
    videoLink?: string;
    ariealLink?: string;
  }
  
  export interface PolygonInput {
    id?: string;
    name: string;
    description?: string;
    type: 'Polygon' | 'LineString';
    coordinates: any[];  // Frontend sends as array of coordinates
    minZoom?: number;
    maxZoom?: number;
    popupType?: 'link' | 'details';
    popupDetails?: PopupDetails;
    style?: PolygonStyle;
  }
  
  // Response types (what gets sent back to frontend)
  export interface TransformedPolygon {
    id: string;
    name: string;
    description?: string | null;
    type: string;
    coordinates: any[];  // Transformed back to array format
    minZoom?: number | null;
    maxZoom?: number | null;
    popupType?: string | null;
    popupTitle?: string | null;
    popupImage?: string | null;
    popupDescription?: string | null;
    popupLink?: string | null;
    style?: TransformedPolygonStyle | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface TransformedPolygonStyle {
    id: string;
    fillColor?: string | null;
    hoverFillColor?: string | null;
    fillOpacity?: number | null;
    hoverFillOpacity?: number | null;
    lineColor?: string | null;
    lineWidth?: number | null;
    lineOpacity?: number | null;
    lineDashArray?: number[] | null;  // Transformed back to array
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface TransformedProject {
    id: string;
    name: string;
    lat: number;
    lng: number;
    description?: string | null;
    hideMarker: boolean;
    zoom: number;
    createdAt: Date;
    updatedAt: Date;
    details?: ProjectDetails | null;
    polygon: TransformedPolygon;
  }