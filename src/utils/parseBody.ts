// utils/parseBody.ts
import { NextApiRequest } from 'next';

export async function parseBody(req: NextApiRequest) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      // If already parsed, return as is
      return req.body;
    }
  }
  return req.body;
}