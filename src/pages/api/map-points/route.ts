import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const data = (await import('@/data/data')).MAP_DATA;
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error reading map points:', error);
      return res.status(500).json({ message: 'Error reading map points' });
    }
  }

  if (req.method === 'POST') {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'data.ts');
      const currentData = (await import('@/data/data')).MAP_DATA;
      
      // Add new point
      const newPoint = req.body;
      currentData.push(newPoint);

      // Write updated data
      const fileContent = `export const MAP_DATA = ${JSON.stringify(currentData, null, 2)};\n`;
      await fs.writeFile(dataPath, fileContent, 'utf8');

      return res.status(200).json({ message: 'Map point added successfully' });
    } catch (error) {
      console.error('Error saving map point:', error);
      return res.status(500).json({ message: 'Error saving map point' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}