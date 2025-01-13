import { prisma } from './prisma';

export async function getMapFeatures(bounds?: { minLat: number, maxLat: number, minLng: number, maxLng: number }, zoom?: number) {
  const anchors = await prisma.anchor.findMany({
    include: {
      details: true,
      style: true,
      polygons: {
        include: {
          style: true
        },
        where: zoom ? {
          AND: [
            { minZoom: { lte: zoom } },
            { 
              OR: [
                { maxZoom: { gte: zoom } },
                { maxZoom: null }
              ]
            }
          ]
        } : undefined
      }
    },
    where: bounds ? {
      AND: [
        { lat: { gte: bounds.minLat, lte: bounds.maxLat } },
        { lng: { gte: bounds.minLng, lte: bounds.maxLng } }
      ]
    } : undefined
  });

  return anchors.map(anchor => ({
    anchor: {
      lat: anchor.lat,
      lng: anchor.lng,
      name: anchor.name,
      hideMarker: anchor.hideMarker
    },
    details: anchor.details ? {
      location: anchor.details.location,
      department: anchor.details.department,
      // ... other details
    } : null,
    polygons: anchor.polygons.map(polygon => ({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          name: polygon.name,
          // Use polygon-specific style if available, otherwise fall back to anchor style
          style: polygon.style || anchor.style
        },
        geometry: {
          type: polygon.type,
          coordinates: JSON.parse(polygon.coordinates)
        }
      }]
    })),
    style: anchor.style
  }));
}

export async function addMapFeature(data: {
  anchor: { lat: number; lng: number; name: string; hideMarker?: boolean };
  details?: { location?: string; department?: string; /* ... */ };
  polygons: Array<{ type: string; coordinates: number[][][]; name?: string; style?: any }>;
  style?: any;
}) {
  return prisma.anchor.create({
    data: {
      lat: data.anchor.lat,
      lng: data.anchor.lng,
      name: data.anchor.name,
      hideMarker: data.anchor.hideMarker || false,
      details: data.details ? {
        create: data.details
      } : undefined,
      polygons: {
        create: data.polygons.map(polygon => ({
          type: polygon.type,
          name: polygon.name,
          coordinates: JSON.stringify(polygon.coordinates),
          style: polygon.style ? {
            create: polygon.style
          } : undefined
        }))
      },
      style: data.style ? {
        create: data.style
      } : undefined
    },
    include: {
      details: true,
      polygons: {
        include: {
          style: true
        }
      },
      style: true
    }
  });
}