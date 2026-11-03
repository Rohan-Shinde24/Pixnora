// src/models/Image.ts
import mongoose, { Schema, Model } from 'mongoose';

export interface IImage {
  title: string;
  slug: string;
  imageUrl: string;
  imageKitFileId: string;
  prompt: string;
  model: string;
  category: string;
  tags: string[];
  likes: number;
  likedIps: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    imageUrl: { type: String, required: true },
    imageKitFileId: { type: String, default: '' },
    prompt: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, default: 'Uncategorized' },
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    likedIps: [{ type: String }], // track IPs to prevent duplicate likes
  },
  { timestamps: true }
);

// Auto-generate slug from title
ImageSchema.pre('validate', function () {
  if (this.isNew && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
});

const ImageModel: Model<IImage> =
  mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);

export default ImageModel;
