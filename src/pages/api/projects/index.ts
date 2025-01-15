// api/projects/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { APIError } from '@/lib/api-utils';
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        return await handleCreate(req, res);
      case 'GET':
        return await handleList(req, res);
      default:
        throw new APIError(405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error('Error in /api/projects:', error);
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    return res.status(400).json({ 
      error: 'Request body is missing' 
    });
  }
  try {
    const { polygon: polygonData } = req.body;
    const result = await prisma.$transaction(async (prisma) => {
      // Create project first
      const projectData = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        lat: req.body.lat,
        lng: req.body.lng,
        zoom: req.body.zoom,
        hideMarker: req.body.hideMarker,
      };

      // Prepare polygon data if it exists
      const polygonCreateData = polygonData ? {
        polygon: {
          create: {
            id: polygonData.id,
            name: polygonData.name,
            type: polygonData.type,
            coordinates: polygonData.coordinates,
            description: polygonData.description || '',
            style: polygonData.style ? {
              create: {
                fillColor: polygonData.style.fillColor,
                hoverFillColor: polygonData.style.hoverFillColor,
                fillOpacity: polygonData.style.fillOpacity,
                hoverFillOpacity: polygonData.style.hoverFillOpacity,
                lineColor: polygonData.style.lineColor,
                lineWidth: polygonData.style.lineWidth || 1,
                lineOpacity: polygonData.style.lineOpacity || 1,
                lineDashArray: polygonData.style.lineDashArray,
              }
            } : undefined,
            popupDetails: polygonData.popupDetails ? {
              create: {
                title: polygonData.popupDetails.title || '',
                image: polygonData.popupDetails.image || '',
                description: polygonData.popupDetails.description || '',
                ariealLink: polygonData.popupDetails.ariealLink || '',
                videoLink: polygonData.popupDetails.videoLink || '',
                imagesLink: polygonData.popupDetails.imagesLink || '',
                link: polygonData.popupDetails.link || '',
                type: polygonData.popupDetails.type || 'details',
              }
            } : undefined,
          }
        }
      } : {};

      // Create project with nested polygon data
      const project = await prisma.project.create({
        data: {
          ...projectData,
          ...polygonCreateData
        },
        include: {
          polygon: {
            include: {
              style: true,
              popupDetails: true
            }
          }
        }
      });

      return project;
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: result
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleList(req: NextApiRequest, res: NextApiResponse) {
  const projects = await prisma.project.findMany({
    include: {
      details: true,
      polygon: {
        include: {
          style: true,
          popupDetails: true,
        }
      }
    }
  });

  return res.status(200).json(projects);
}