import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPOIs(req, res);
      case 'POST':
        return await handleCreatePOI(req, res);
      default:
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error in /api/pois:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleGetPOIs(req: NextApiRequest, res: NextApiResponse) {
  const { type, bounds } = req.query;

  let whereClause = {};
  
  if (type) {
    whereClause = {
      ...whereClause,
      type: {
        name: type
      }
    };
  }

  if (bounds) {
    const [swLng, swLat, neLng, neLat] = (bounds as string).split(',').map(Number);
    whereClause = {
      ...whereClause,
      lat: { gte: swLat, lte: neLat },
      lng: { gte: swLng, lte: neLng }
    };
  }

  const pois = await prisma.pOI.findMany({
    where: whereClause,
    include: {
      type: true
    }
  });

  return res.status(200).json(pois);
}

async function handleCreatePOI(req: NextApiRequest, res: NextApiResponse) {
  const { title, lat, lng, type } = req.body;

  if (!title || !lat || !lng || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const poi = await prisma.pOI.create({
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

  return res.status(201).json(poi);
}