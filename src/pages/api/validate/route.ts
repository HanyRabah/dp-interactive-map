import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body;
      
      // Check MAP_DATA
      const mapData = (await import('@/data/data')).MAP_DATA;
      const mapPointExists = mapData.some((point) => point.id === id);
      
      // Check ProjectsData
      const projectsData = (await import('@/data/ProjectsData')).ProjectsData;
      const projectExists = projectsData.features.some(
        (feature) => feature.properties.id === id
      );

      if (mapPointExists || projectExists) {
        return res.status(200).json({ exists: true });
      }

      return res.status(200).json({ exists: false });
    } catch (error) {
      console.error('Error validating ID:', error);
      return res.status(500).json({ message: 'Error validating ID' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}