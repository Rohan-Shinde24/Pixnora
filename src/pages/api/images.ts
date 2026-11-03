// src/pages/api/images.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';

const categoryGroups: Record<string, string[]> = {
  Portraits: ['Professional ID Photo', 'LinkedIn Profile Photo', 'Professional Portrait'],
  Photography: ['Cinematic Photography', 'Product Photography', 'Fashion Photography', 'Nature', 'Architecture'],
  'Art & Design': ['Anime', 'Fantasy Art', '3D Art', 'Digital Art', 'Social Media', 'Illustration', 'Other'],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const db = await connectDB();
  if (!db) {
    return res.status(503).json({ error: 'Image catalog is temporarily unavailable' });
  }

  try {
    const { page = '1', limit = '20', search = '', category = '' } = req.query;
    if ([page, limit, search, category].some((value) => Array.isArray(value))) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    const pageNum = Number(page);
    const requestedLimit = Number(limit);
    if (!Number.isInteger(pageNum) || pageNum < 1 || !Number.isInteger(requestedLimit) || requestedLimit < 1) {
      return res.status(400).json({ error: 'Page and limit must be positive integers' });
    }
    const limitNum = Math.min(50, requestedLimit);
    const skip = (pageNum - 1) * limitNum;
    const searchTerm = typeof search === 'string' ? search.trim() : '';
    const categoryTerm = typeof category === 'string' ? category.trim() : '';
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const filter: Record<string, unknown> = {};
    if (searchTerm) {
      const regex = { $regex: escapeRegex(searchTerm), $options: 'i' };
      filter.$or = [
        { title: regex },
        { prompt: regex },
        { model: regex },
        { tags: regex },
      ];
    }
    if (categoryTerm) {
      const groupedCategories = categoryGroups[categoryTerm];
      filter.category = groupedCategories
        ? { $in: groupedCategories }
        : { $regex: `^${escapeRegex(categoryTerm)}$`, $options: 'i' };
    }

    const [images, total] = await Promise.all([
      ImageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-likedIps').lean(),
      ImageModel.countDocuments(filter),
    ]);

    return res.status(200).json({ images, hasMore: skip + images.length < total, total, page: pageNum });
  } catch (err) {
    console.error('[GET /api/images]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
