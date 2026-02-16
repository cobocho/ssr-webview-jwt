'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { clientAPI } from '@/lib/client-http';

import { PostItem } from './post-item';

const LIMIT = 10;

interface UserPostListProps {
  userId: string;
}

export function UserPostList({ userId }: UserPostListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['posts', { userId, limit: LIMIT }],
    queryFn: ({ pageParam }) => clientAPI.getUserPosts(userId, { page: pageParam, limit: LIMIT }),
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
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-base font-semibold text-gray-700">Posts</h2>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
      <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-400">
        {isFetchingNextPage ? 'Loading more...' : hasNextPage ? '' : 'No more posts'}
      </div>
    </div>
  );
}
