// src/components/ImageMasonry.tsx
import React from 'react';
import ImageCard from './ImageCard';

interface ImageData {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  model: string;
}

interface ImageMasonryProps {
  images: ImageData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const ImageMasonry: React.FC<ImageMasonryProps> = ({ images, onLoadMore, hasMore, loading }) => {
  return (
    <div className="relative">
      {/* Masonry columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map(img => (
          <ImageCard
            key={img._id}
            id={img._id}
            title={img.title}
            imageUrl={img.imageUrl}
            prompt={img.prompt}
            model={img.model}
          />
        ))}
      </div>
      {/* Load more sentinel for infinite scroll */}
      {hasMore && !loading && <div id="load-more-sentinel" className="h-1" />}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default ImageMasonry;
