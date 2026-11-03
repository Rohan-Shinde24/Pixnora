// src/pages/api/images/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    if (!db) {
      return res.status(503).json({ error: 'Image catalog is temporarily unavailable' });
    }

    const image = await ImageModel.findById(id).select('-likedIps').lean();
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    return res.status(200).json({ image });
  } catch (err) {
    console.error('[GET /api/images/[id]]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
