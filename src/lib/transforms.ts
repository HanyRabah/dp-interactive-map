// lib/transforms.ts
import { Project, ProjectDetails, ProjectPolygon, PolygonStyle } from '@prisma/client';
import { coordinateUtils } from '@/utils/coordinates';

// Input types from frontend
export interface PolygonStyle {
  fillColor?: string;
  hoverFillColor?: string;
  fillOpacity?: number;
  hoverFillOpacity?: number;
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  lineDashArray?: number[];  // Frontend sends as array
}

export interface PopupDetails {
  title?: string;
  image?: string;
  description?: string;
  link?: string;
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

// Database types with relations
export type ProjectWithRelations = Project & {
  details?: ProjectDetails | null;
  polygons: (ProjectPolygon & {
    style?: PolygonStyle | null;
  })[];
};

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
  polygons: TransformedPolygon[];
}

/**
 * Transforms a polygon style from database format to frontend format
 */
export function transformPolygonStyle(style: PolygonStyle | null): TransformedPolygonStyle | null {
  if (!style) return null;
  
  return {
    ...style,
    lineDashArray: style.lineDashArray 
      ? JSON.parse(style.lineDashArray)
      : null
  };
}

/**
 * Transforms a polygon from database format to frontend format
 */
export function transformPolygon(polygon: ProjectPolygon & { style?: PolygonStyle | null }): TransformedPolygon {
  return {
    ...polygon,
    coordinates: coordinateUtils.fromDb(polygon.coordinates),
    style: transformPolygonStyle(polygon.style || null)
  };
}

/**
 * Transforms a complete project response from database format to frontend format
 */
export function transformProjectResponse(project: ProjectWithRelations | null): TransformedProject | null {
  if (!project) return null;

  return {
    ...project,
    polygons: project.polygons.map(transformPolygon)
  };
}

// Type guard to check if a polygon has valid coordinates
export function hasValidCoordinates(polygon: PolygonInput): boolean {
  try {
    const coords = coordinateUtils.parse(polygon.coordinates);
    return coordinateUtils.validate(coords);
  } catch (error) {
    return false;
  }
}