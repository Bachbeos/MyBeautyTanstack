import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  direction?: "top" | "bottom";
  threshold?: number;
  enabled?: boolean;
}

export function useInfiniteScroll<T extends HTMLElement>({
  onLoadMore,
  hasNextPage,
  isFetching,
  direction = "bottom",
  threshold = 80,
  enabled = true
}: UseInfiniteScrollOptions) {
  const ref = useRef<T>(null);

  const pendingRef = useRef(false);

  // Reset pendingRef khi fetch xong
  useEffect(() => {
    if (!isFetching) {
      pendingRef.current = false;
    }
  }, [isFetching]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el || !hasNextPage || isFetching || pendingRef.current || !enabled) return;

    const shouldFetch =
      direction === "top"
        ? el.scrollTop <= threshold
        : el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

    if (shouldFetch) {
      pendingRef.current = true; // Block ngay, không chờ state
      onLoadMore();
    }
  }, [hasNextPage, isFetching, direction, threshold, onLoadMore, enabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return ref;
}
