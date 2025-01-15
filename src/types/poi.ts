import { POIMarkers } from '@/components/POI/markers';

export interface POI {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: POIType;
  createdAt: Date;
  updatedAt: Date;
}

export interface POIType {
  id: string;
  name: keyof typeof POIMarkers;
  icon: string;
  color: string;
}

type RouteDetails = {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  duration: number;
  distance: number;
}

export interface RouteInfo {
  driving: RouteDetails | null;
  walking: RouteDetails| null;
  activeMode: 'driving' | 'walking';
}