// src/pages/api/admin/images.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';
import { withAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  // GET — list all images for admin
  if (req.method === 'GET') {
    const { page = '1', limit = '20', search = '' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const [images, total] = await Promise.all([
      ImageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ImageModel.countDocuments(filter),
    ]);

    return res.status(200).json({ images, total, page: pageNum });
  }

  // POST — create new image
  if (req.method === 'POST') {
    const { title, imageUrl, imageKitFileId, prompt, model, category, tags } = req.body;

    if (!title || !imageUrl || !prompt || !model) {
      return res.status(400).json({ error: 'title, imageUrl, prompt, and model are required' });
    }

    const image = await ImageModel.create({
      title,
      imageUrl,
      imageKitFileId: imageKitFileId || '',
      prompt,
      model,
      category: category || 'Uncategorized',
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map((t: string) => t.trim()) : []),
    });

    return res.status(201).json({ image });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
