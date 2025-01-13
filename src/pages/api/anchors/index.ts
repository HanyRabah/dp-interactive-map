import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Project, ProjectPolygon, ProjectDetails, PolygonStyle } from '@prisma/client';

// Define the complete type including relations
type ProjectWithRelations = Project & {
  details: ProjectDetails | null;
  polygons: (ProjectPolygon & {
    style: PolygonStyle | null;
  })[];
  style: PolygonStyle | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const projects = await prisma.project.findMany({
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

      const transformedProjects = projects.map((project: ProjectWithRelations) => ({
        id: project.id,
        lat: project.lat,
        lng: project.lng,
        name: project.name,
        hideMarker: project.hideMarker,
        zoom: project.zoom,
        description: project.description,
        details: project.details ? {
          location: project.details.location,
          image: project.details.image,
          url: project.details.url
        } : null,
        polygons: project.polygons.map(polygon => ({
          id: polygon.id,
          type: polygon.type,
          features: [{
            type: 'Feature',
            properties: {
              name: polygon.name,
              minZoom: polygon.minZoom,
              maxZoom: polygon.maxZoom
            },
            geometry: {
              type: polygon.type,
              coordinates: JSON.parse(polygon.coordinates)
            }
          }],
          style: polygon.style ? {
            fillColor: polygon.style.fillColor,
            hoverFillColor: polygon.style.hoverFillColor,
            fillOpacity: polygon.style.fillOpacity,
            hoverFillOpacity: polygon.style.hoverFillOpacity,
            lineColor: polygon.style.lineColor,
            lineWidth: polygon.style.lineWidth,
            lineOpacity: polygon.style.lineOpacity,
            lineDashArray: polygon.style.lineDashArray ? JSON.parse(polygon.style.lineDashArray) : null
          } : null
        })),
        style: project.style ? {
          fillColor: project.style.fillColor,
          hoverFillColor: project.style.hoverFillColor,
          fillOpacity: project.style.fillOpacity,
          hoverFillOpacity: project.style.hoverFillOpacity,
          lineColor: project.style.lineColor,
          lineWidth: project.style.lineWidth,
          lineOpacity: project.style.lineOpacity,
          lineDashArray: project.style.lineDashArray ? JSON.parse(project.style.lineDashArray) : null
        } : null
      }));

      return res.status(200).json({ projects: transformedProjects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ message: 'Error fetching projects' });
    }
  }

  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}