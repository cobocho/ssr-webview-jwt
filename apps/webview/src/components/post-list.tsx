'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { clientAPI } from '@/lib/client-http';
import { useBridgeStore } from '@/providers/bridge-provider';

import { PostItem } from './post-item';

const LIMIT = 10;

export function PostList() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const logout = useBridgeStore((state) => state.logout);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['posts', { limit: LIMIT }],
    queryFn: ({ pageParam }) => clientAPI.getPosts({ page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data.pages.flatMap((page) => page.data);

  return (
    <div className="flex flex-col gap-2 pt-10">
      <div className="fixed top-0 left-0 z-10 flex h-fit w-full items-center justify-end bg-white p-2 shadow-sm">
        <button
          className="text-sm font-semibold text-gray-500"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </button>
      </div>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-400">
        {isFetchingNextPage ? 'Loading more...' : hasNextPage ? '' : 'No more posts'}
      </div>
    </div>
  );
}
