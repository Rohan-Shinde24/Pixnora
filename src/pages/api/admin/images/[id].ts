// src/pages/api/admin/images/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import ImageModel from '@/models/Image';
import { withAdmin } from '@/lib/auth';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  // PATCH — update
  if (req.method === 'PATCH') {
    const updates = req.body;
    const image = await ImageModel.findByIdAndUpdate(id, updates, { new: true });
    if (!image) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ image });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const image = await ImageModel.findById(id);
    if (!image) return res.status(404).json({ error: 'Not found' });

    // Delete from ImageKit if we have the fileId
    if (image.imageKitFileId) {
      try {
        await imagekit.deleteFile(image.imageKitFileId);
      } catch {
        // non-fatal: file may already be deleted
      }
    }

    await ImageModel.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAdmin(handler);
