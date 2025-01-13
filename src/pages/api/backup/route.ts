import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');

      // Create backups directory if it doesn't exist
      await fs.mkdir(backupDir, { recursive: true });

      // Backup MAP_DATA
      const mapData = (await import('@/data/data')).MAP_DATA;
      await fs.writeFile(
        path.join(backupDir, `map-data-${timestamp}.json`),
        JSON.stringify(mapData, null, 2)
      );

      // Backup ProjectsData
      const projectsData = (await import('@/data/ProjectsData')).ProjectsData;
      await fs.writeFile(
        path.join(backupDir, `projects-data-${timestamp}.json`),
        JSON.stringify(projectsData, null, 2)
      );

      return res.status(200).json({ message: 'Backup created successfully' });
    } catch (error) {
      console.error('Error creating backup:', error);
      return res.status(500).json({ message: 'Error creating backup' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}