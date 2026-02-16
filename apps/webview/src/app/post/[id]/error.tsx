'use client';

import { useBridgeStore } from '@/providers/bridge-provider';

interface ErrorProps {
  error: Error;
}

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export default function PostDetailError({ error }: ErrorProps) {
  const refreshToken = useBridgeStore((state) => state.refreshToken);

  const reset = async () => {
    await refreshToken();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'reload' }));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
        ⚠️
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800">Failed to load post</p>
        <p className="text-sm text-gray-500">{error.name}</p>
        <p className="text-sm text-gray-500">{error.message}</p>
      </div>
      {error.name === 'UnauthorizedError' && (
        <button
          onClick={reset}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white active:opacity-70"
        >
          Retry
        </button>
      )}
    </div>
  );
}
