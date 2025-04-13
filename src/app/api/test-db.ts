// pages/api/test-db.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const count = await prisma.project.count();
    
    return res.status(200).json({ 
      connected: true, 
      projectCount: count 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}