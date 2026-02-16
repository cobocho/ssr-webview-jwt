import type { Post } from '@ssr-webview-jwt/api';

import { useBridgeStore } from '@/providers/bridge-provider';

export function PostItem({ post }: { post: Post }) {
  const navigateTo = useBridgeStore((state) => state.navigateTo);

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-gray-200 p-4"
      onClick={() => navigateTo(`/post/${post.id}`)}
    >
      <h3 className="text-lg font-bold">{post.title}</h3>
      <p className="text-sm text-gray-500">{post.content}</p>
    </div>
  );
}
