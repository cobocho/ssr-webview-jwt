'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { clientAPI } from '@/lib/client-http';
import { useBridgeStore } from '@/providers/bridge-provider';

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps) {

  const goBack = useBridgeStore((state) => state.goBack);

  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => clientAPI.getUser(userId),
  });

  const user = data.data;

  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 p-4">
      <button
        className="flex w-fit items-center gap-1 text-sm text-gray-500"
        onClick={() => goBack()}
      >
        ← Back
      </button>

      <div className="flex items-center gap-3">
        <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full" />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600">{user.bio}</p>

      <p className="text-xs text-gray-400">
        Joined{' '}
        {new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        {' · '}
        {user.postCount} posts
      </p>
    </div>
  );
}
