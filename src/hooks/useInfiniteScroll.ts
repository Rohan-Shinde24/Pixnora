// src/hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  /** Callback to load the next page */
  onLoadMore: () => void;
  /** Whether there is more data to load */
  hasMore: boolean;
  /** Loading state – prevents duplicate calls */
  loading: boolean;
}

export const useInfiniteScroll = ({ onLoadMore, hasMore, loading }: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const handleObserve = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!node) return;
      observer.current = new IntersectionObserver(entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      });
      observer.current.observe(node);
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    handleObserve(sentinelRef.current);
    return () => {
      observer.current?.disconnect();
    };
  }, [handleObserve]);

  return sentinelRef;
};
