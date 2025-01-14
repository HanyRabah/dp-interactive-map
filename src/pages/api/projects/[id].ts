// api/projects/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          return await handleGetOne(req, res);
        }
      case 'PUT':
        return await handleUpdate(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Previous handleCreate and handleGetAll functions remain the same...

async function handleGetOne(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      polygons: {
        include: {
          style: true
        }
      }
    }
  });

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  return res.status(200).json(project);
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  const { name, lat, lng, zoom, hideMarker, description, polygons } = req.body;

  try {
    // First update the project
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        lat,
        lng,
        zoom: zoom,
        hideMarker
      }
    });

    // Handle polygon updates if provided
    if (polygons && Array.isArray(polygons)) {
      for (const polygon of polygons) {
        // First upsert the polygon
        const updatedPolygon = await prisma.projectPolygon.upsert({
          where: { id: polygon.id },
          create: {
            id: polygon.id,
            name: polygon.name,
            type: polygon.type,
            coordinates: polygon.coordinates,
            description: polygon.description,
            projectId: project.id,
            style: polygon.style ? {
              create: {
                fillColor: polygon.style.fillColor,
                hoverFillColor: polygon.style.hoverFillColor,
                fillOpacity: polygon.style.fillOpacity,
                hoverFillOpacity: polygon.style.hoverFillOpacity,
              }
            } : undefined
          },
          update: {
            name: polygon.name,
            type: polygon.type,
            coordinates: polygon.coordinates,
            description: polygon.description,
            style: polygon.style ? {
              upsert: {
                create: {
                  fillColor: polygon.style.fillColor,
                  hoverFillColor: polygon.style.hoverFillColor,
                  fillOpacity: polygon.style.fillOpacity,
                  hoverFillOpacity: polygon.style.hoverFillOpacity,
                },
                update: {
                  fillColor: polygon.style.fillColor,
                  hoverFillColor: polygon.style.hoverFillColor,
                  fillOpacity: polygon.style.fillOpacity,
                  hoverFillOpacity: polygon.style.hoverFillOpacity,
                }
              }
            } : undefined
          }
        });
    
        // Then handle popup details if it exists
        if (polygon.popupDetails) {
          await prisma.popupDetails.upsert({
            where: { 
              id: polygon.popupDetailsId || `new-${polygon.id}`  // Make unique fallback ID
            },
            create: {
              title: polygon.popupDetails.title || '',
              image: polygon.popupDetails.image || '',
              description: polygon.popupDetails.description || '',
              link: polygon.popupDetails.link || '',
              type: polygon.popupDetails.type || 'details',
              ProjectPolygon: {
                connect: { id: updatedPolygon.id }
              }
            },
            update: {
              title: polygon.popupDetails.title || '',
              image: polygon.popupDetails.image || '',
              description: polygon.popupDetails.description || '',
              link: polygon.popupDetails.link || '',
              type: polygon.popupDetails.type || 'details'
            }
          });
        }
      }
    }

    
    // Fetch final state
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      include: {
        polygons: {
          include: {
            popupDetails: true,
            style: true
          }
        }
      }
    });

    return res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid project ID' });
  }

  try {
    await prisma.project.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}