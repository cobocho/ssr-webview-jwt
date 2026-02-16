import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { PostDetail } from '@/components/post-detail';
import { getQueryClient } from '@/lib/query-client';
import { serverAPI } from '@/lib/server-http';

import PostDetailLoading from './loading';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const queryClient = getQueryClient();

  await queryClient.fetchQuery({
    queryKey: ['post', id],
    queryFn: () => serverAPI.getPost(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<PostDetailLoading />}>
        <PostDetail postId={id} />
      </Suspense>
    </HydrationBoundary>
  );
}
