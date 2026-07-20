import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (callback, hasMore, loading) => {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setIsFetching(true);
          callback().finally(() => setIsFetching(false));
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, isFetching, callback],
  );

  return { lastElementRef, isFetching };
};
