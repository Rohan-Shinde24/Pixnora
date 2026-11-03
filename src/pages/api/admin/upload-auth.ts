// src/pages/api/admin/upload-auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import ImageKit from 'imagekit';
import { withAdmin } from '@/lib/auth';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const authParams = imagekit.getAuthenticationParameters();
  return res.status(200).json(authParams);
}

export default withAdmin(handler);
