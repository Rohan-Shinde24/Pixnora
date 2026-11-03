// src/pages/api/images/[id]/like.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Use IP as identifier (or a session cookie fallback)
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  try {
    const db = await connectDB();
    if (!db) {
      return res.status(503).json({ error: 'Image catalog is temporarily unavailable' });
    }

    const image = await ImageModel.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const alreadyLiked = image.likedIps.includes(ip);

    if (alreadyLiked) {
      // Unlike
      image.likes = Math.max(0, image.likes - 1);
      image.likedIps = image.likedIps.filter((storedIp) => storedIp !== ip);
    } else {
      // Like
      image.likes += 1;
      image.likedIps.push(ip);
    }

    await image.save();

    return res.status(200).json({
      likes: image.likes,
      liked: !alreadyLiked,
    });
  } catch (err) {
    console.error('[POST /api/images/[id]/like]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
