export class APIError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public details?: any
    ) {
      super(message);
      this.name = 'APIError';
    }
  }
  
  export const validateProjectInput = (data: any) => {
    if (!data.name?.trim()) {
      throw new APIError(400, 'Project name is required');
    }
    if (typeof data.lat !== 'number' || isNaN(data.lat)) {
      throw new APIError(400, 'Valid latitude is required');
    }
    if (typeof data.lng !== 'number' || isNaN(data.lng)) {
      throw new APIError(400, 'Valid longitude is required');
    }
  };
  
  export const validatePolygonInput = (polygon: any) => {
    if (!polygon.name?.trim()) {
      throw new APIError(400, 'Polygon name is required');
    }
    if (!polygon.type || !['Polygon', 'LineString'].includes(polygon.type)) {
      throw new APIError(400, 'Valid polygon type is required');
    }
    if (!polygon.coordinates) {
      throw new APIError(400, 'Polygon coordinates are required');
    }
  };