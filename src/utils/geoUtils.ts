export const geoUtils = {
    getDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },
  
    getBoundingBox: (lat: number, lon: number, radiusKm: number) => {
      const R = 6371;
      const radDist = radiusKm / R;
      
      const degLat = lat * Math.PI / 180;
      const degLon = lon * Math.PI / 180;
      
      const latMin = (degLat - radDist) * 180 / Math.PI;
      const latMax = (degLat + radDist) * 180 / Math.PI;
      
      const lonMin = (degLon - radDist / Math.cos(degLat)) * 180 / Math.PI;
      const lonMax = (degLon + radDist / Math.cos(degLat)) * 180 / Math.PI;
      
      return {
        latMin,
        latMax,
        lonMin,
        lonMax
      };
    },
  
    getPolygonCenter: (coordinates: number[][]): { lat: number; lng: number } => {
      const lats = coordinates.map(coord => coord[1]);
      const lngs = coordinates.map(coord => coord[0]);
      
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      return { lat: centerLat, lng: centerLng };
    },

    getPolygonBounds: (coordinates: number[][]) => {
        const bounds = coordinates.reduce(
          (acc, coord) => {
            acc.minLng = Math.min(acc.minLng, coord[0]);
            acc.maxLng = Math.max(acc.maxLng, coord[0]);
            acc.minLat = Math.min(acc.minLat, coord[1]);
            acc.maxLat = Math.max(acc.maxLat, coord[1]);
            return acc;
          },
          { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
        );
    
        // Add buffer around the polygon (approximately 2km)
        const buffer = 0.2; // roughly 2km in degrees
        return {
          latMin: bounds.minLat - buffer,
          latMax: bounds.maxLat + buffer,
          lonMin: bounds.minLng - buffer,
          lonMax: bounds.maxLng + buffer
        };
      },
    
      isPointInBounds: (point: { lat: number; lng: number }, bounds: { latMin: number; latMax: number; lonMin: number; lonMax: number }) => {
        return point.lat >= bounds.latMin &&
               point.lat <= bounds.latMax &&
               point.lng >= bounds.lonMin &&
               point.lng <= bounds.lonMax;
      }
};