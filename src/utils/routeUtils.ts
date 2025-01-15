const OPENROUTESERVICE_API_BASE = 'https://api.openrouteservice.org/v2/directions';
const OPENROUTESERVICE_API_KEY = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
const MAPBOX_API_BASE = 'https://api.mapbox.com/directions/v5/mapbox';

interface RouteResponse {
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  duration: number;
  distance: number;
}
interface RouteError {
  message: string;
  details?: any;
}


export const routeUtils = {
  fetchRoute: async (
    start: [number, number],
    end: [number, number],
    profile: 'driving-car' | 'foot-walking' | 'cycling-regular'
  ): Promise<RouteResponse | RouteError> => {
    try {
      const response = await fetch(
        `${OPENROUTESERVICE_API_BASE}/${profile}` +
        `?start=${start[1]},${start[0]}` +
        `&end=${end[1]},${end[0]}` +
        `&format=geojson` +
        `&api_key=${OPENROUTESERVICE_API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch route: ${errorData.error.message}`);
      }

      const data = await response.json();
 
      if (!data.features?.[0]) {
        throw new Error('No route found');
      }

      return {
        geometry: data.features[0].geometry,
        duration: data.features[0].properties.summary.duration,
        distance: data.features[0].properties.summary.distance
      };
    } catch (error) {
      console.error('Error fetching route:', error);
        return {
          message: 'Error fetching route',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
    }
  },
  fetchRouteMapBox: async (
      start: [number, number],
      end: [number, number],
      profile: 'driving' | 'walking'
    ): Promise<RouteResponse | RouteError> => {
      try {
        const response = await fetch(
          `${MAPBOX_API_BASE}/${profile}/` +
          `${start[0]},${start[1]};${end[0]},${end[1]}` +
          `?geometries=geojson` +
          `&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch route (${response.status}): ${errorData.message || 'Unknown error'}`);
        }  
        const data = await response.json();
        
        if (data.code === 'NoRoute') {
          return {
            message: 'No route found',
            details: data.message,
          }
        }

        return {
          geometry: data.routes[0].geometry,
          duration: data.routes[0].duration,
          distance: data.routes[0].distance
        };
      }  catch (error) {
        console.error('Error fetching route:', error);
        return {
          message: 'Error fetching route',
          details: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
};