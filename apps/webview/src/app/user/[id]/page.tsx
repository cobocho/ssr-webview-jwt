import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { UserDetail } from '@/components/user-detail';
import { UserPostList } from '@/components/user-post-list';
import { getQueryClient } from '@/lib/query-client';
import { serverAPI } from '@/lib/server-http';

import { UserDetailLoading, UserPostListLoading } from './loading';

interface UserPageProps {
  params: Promise<{ id: string }>;
}

const LIMIT = 10;

async function UserDetailFetcher({ id }: { id: string }) {
  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: ['user', id],
    queryFn: () => serverAPI.getUser(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetail userId={id} />
    </HydrationBoundary>
  );
}

async function UserPostListFetcher({ id }: { id: string }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts', { userId: id, limit: LIMIT }],
    queryFn: ({ pageParam }) =>
      serverAPI.getUserPosts(id, { page: pageParam as number, limit: LIMIT }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserPostList userId={id} />
    </HydrationBoundary>
  );
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  return (
    <div className="overflow-y-scroll">
      <Suspense fallback={<UserDetailLoading />}>
        <UserDetailFetcher id={id} />
      </Suspense>
      <Suspense fallback={<UserPostListLoading />}>
        <UserPostListFetcher id={id} />
      </Suspense>
    </div>
  );
}
