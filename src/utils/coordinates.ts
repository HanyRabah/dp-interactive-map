// utils/coordinateUtils.ts

export type LatLng = {
  lat: number;
  lng: number;
};

export type Coordinates = number[][];

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJsonLineString {
  type: 'LineString';
  coordinates: number[][];
}


export type GeoJsonGeometry = GeoJsonPolygon | GeoJsonLineString;

export const coordinateUtils = {
  // Convert coordinates from database string to array format
  fromDb(dbString: string): Coordinates {
    try {
      return JSON.parse(dbString);
    } catch (error) {
      console.error('Error parsing coordinates from DB:', error);
      return [];
    }
  },

  // Convert coordinates to database string format
  toDb(coords: Coordinates): string {
    try {
      return JSON.stringify(coords);
    } catch (error) {
      console.error('Error stringifying coordinates for DB:', error);
      return '[]';
    }
  },


  // Convert from GeoJSON format to our internal format
  // fromGeoJson(geometry: GeoJsonGeometry): Coordinates {
  //   if (geometry.type === 'Polygon') {
  //     return geometry.coordinates[0]; // Take the outer ring only
  //   }
  //   return geometry.coordinates;
  // },


  fromGeoJson(geometry: GeoJsonGeometry): Coordinates {

    if (geometry.type === 'Polygon') {

      return geometry.coordinates[0]; // Take the outer ring only

    } else if (geometry.type === 'LineString') {

      return geometry.coordinates;

    }

    throw new Error(`Unsupported geometry type: ${geometry.type}`);

  },


  // Convert to GeoJSON format
  toGeoJson(coords: Coordinates, type: 'Polygon' | 'LineString'): GeoJsonGeometry {
    if (type === 'Polygon') {
      return {
        type: 'Polygon',
        coordinates: [coords] // Wrap in array for outer ring
      };
    }
    return {
      type: 'LineString',
      coordinates: coords
    };
  },

  // Parse coordinates from any format (string or array)
  parse(input: string | Coordinates): Coordinates {
    if (Array.isArray(input)) {
      return input;
    }
    try {
      const cleaned = input.replace(/\\"/g, '"');
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return [];
    }
  },

  // Validate coordinates format
  validate(coords: any[]): boolean {
    if (!Array.isArray(coords)) return false;
    // For polygons, expecting array of arrays of coordinates
    if (!coords.every(coord => Array.isArray(coord))) return false;
    // Each coordinate should be [number, number]

    return coords.every(coordArray => 
      Array.isArray(coordArray) && // Check if coordArray is an array
      coordArray.length === 2 &&   // Check if it has exactly 2 elements
      typeof coordArray[0] === 'number' && // Check if the first element is a number
      typeof coordArray[1] === 'number'    // Check if the second element is a number
    );

  },

  // Format for display (e.g., in UI components)
  formatForDisplay(coords: Coordinates): string {
    return JSON.stringify(coords, null, 2);
  },

  // Convert between [lng, lat] and {lat, lng} formats
  arrayToLatLng(coord: number[]): LatLng {
    return { lat: coord[1], lng: coord[0] };
  },

  latLngToArray(latLng: LatLng): number[] {
    return [latLng.lng, latLng.lat];
  },

  // Convert array of coordinates to array of LatLng objects
  coordsToLatLngs(coords: Coordinates): LatLng[] {
    return coords.map(coord => this.arrayToLatLng(coord));
  },

  // Convert array of LatLng objects to array of coordinates
  latLngsToCoords(latLngs: LatLng[]): Coordinates {
    return latLngs.map(latLng => this.latLngToArray(latLng));
  }
};