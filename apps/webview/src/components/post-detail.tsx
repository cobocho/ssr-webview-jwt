'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { clientAPI } from '@/lib/client-http';
import { useBridgeStore } from '@/providers/bridge-provider';

interface PostDetailProps {
  postId: string;
}

export function PostDetail({ postId }: PostDetailProps) {
  const goBack = useBridgeStore((state) => state.goBack);
  const navigateTo = useBridgeStore((state) => state.navigateTo);

  const { data } = useSuspenseQuery({
    queryKey: ['post', postId],
    queryFn: () => clientAPI.getPost(postId),
  });

  const post = data.data;

  return (
    <div className="flex flex-col gap-6 p-4">
      <button
        className="flex w-fit items-center gap-1 text-sm text-gray-500"
        onClick={() => goBack()}
      >
        ← Back
      </button>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">{post.title}</h1>

        <div className="flex items-center gap-2">
          {post.author?.id && (
            <div
              className="flex items-center gap-1"
              onClick={() => navigateTo(`/user/${post.author?.id}`)}
            >
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-7 w-7 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
            </div>
          )}
          <span className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <p className="leading-relaxed text-gray-700">{post.content}</p>
    </div>
  );
}
