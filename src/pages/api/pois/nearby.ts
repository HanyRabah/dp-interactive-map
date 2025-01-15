import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { latMin, latMax, lonMin, lonMax } = req.query;
    
    if (!latMin || !latMax || !lonMin || !lonMax) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const pois = await prisma.pOI.findMany({
      where: {
        AND: [
          { lat: { gte: parseFloat(latMin as string) } },
          { lat: { lte: parseFloat(latMax as string) } },
          { lng: { gte: parseFloat(lonMin as string) } },
          { lng: { lte: parseFloat(lonMax as string) } }
        ]
      },
      include: {
        type: true
      }
    });

    return res.status(200).json(pois);
  } catch (error) {
    console.error('Error fetching nearby POIs:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}