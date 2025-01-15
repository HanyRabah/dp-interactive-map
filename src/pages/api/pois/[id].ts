import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPOI(req, res);
      case 'PUT':
        return await handleUpdatePOI(req, res);
      case 'DELETE':
        return await handleDeletePOI(req, res);
      default:
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/pois/[id]:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetPOI(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid POI ID' });
  }

  const poi = await prisma.pOI.findUnique({
    where: { id },
    include: {
      type: true
    }
  });

  if (!poi) {
    return res.status(404).json({ error: 'POI not found' });
  }

  return res.status(200).json(poi);
}

async function handleUpdatePOI(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { title, lat, lng, type } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid POI ID' });
  }

  const poi = await prisma.pOI.update({
    where: { id },
    data: {
      title,
      lat,
      lng,
      type: {
        connect: {
          name: type
        }
      }
    },
    include: {
      type: true
    }
  });

  return res.status(200).json(poi);
}

async function handleDeletePOI(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid POI ID' });
  }

  await prisma.pOI.delete({
    where: { id }
  });

  return res.status(200).json({ message: 'POI deleted successfully' });
}