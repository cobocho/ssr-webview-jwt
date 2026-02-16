import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { PostList } from '@/components/post-list';
import { getQueryClient } from '@/lib/query-client';
import { serverAPI } from '@/lib/server-http';

const LIMIT = 10;

export default async function Home() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts', { limit: LIMIT }],
    queryFn: ({ pageParam }) => serverAPI.getPosts({ page: pageParam as number, limit: LIMIT }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="overflow-y-scroll p-4">
        <PostList />
      </div>
    </HydrationBoundary>
  );
}
