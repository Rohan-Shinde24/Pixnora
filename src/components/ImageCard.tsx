"use client";
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Copy, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageCardProps {
  id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  model: string;
  likes?: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ id, title, imageUrl, prompt, model, likes = 0 }) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const toggleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    try {
      const res = await fetch(`/api/images/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save like');
      setLikeCount(data.likes);
      setLiked(data.liked);
      toast.success(data.liked ? 'Liked' : 'Like removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save like');
    } finally {
      setLiking(false);
    }
  }, [id, liking]);

  const copyPrompt = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied');
    } catch {
      toast.error('Could not copy prompt');
    }
  }, [prompt]);

  return (
    <Link
      href={`/image/${id}`}
      className="block mb-4 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer fade-in"
      aria-label={`View prompt: ${title}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform .3s ease, box-shadow .3s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[var(--bg-glass)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="block w-full h-auto object-cover"
          style={{ transition: 'transform .5s ease' }}
          loading="lazy"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        />

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 flex flex-col justify-end gap-2 p-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 50%, transparent 100%)',
            transition: 'opacity .3s ease',
          }}
        >
          {/* Model chip */}
          <span
            className="self-start text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,.72)', color: '#fff' }}
          >
            {model}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={copyPrompt}
              aria-label="Copy prompt"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>

            <button
              onClick={toggleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff' }}
            >
              <Heart className={`w-3 h-3 ${liked ? 'fill-white' : ''}`} />
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <p className="truncate text-sm font-semibold" style={{ color: 'var(--fg)' }}>{title}</p>
        <p className="mt-1 truncate text-xs" style={{ color: 'var(--fg-muted)' }}>{model}</p>
      </div>

      {/* Like count badge (always visible at bottom) */}
      {likeCount > 0 && (
        <div
          className="flex items-center gap-1 px-3 py-1.5 text-xs"
          style={{ color: 'var(--fg-muted)', borderTop: '1px solid var(--border)' }}
        >
          <Heart className={`w-3 h-3 ${liked ? 'fill-[var(--fg)]' : ''}`} />
          <span style={{ color: 'var(--fg-muted)' }}>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        </div>
      )}
    </Link>
  );
};

export default ImageCard;
