export default function PostDetailLoading() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />

      <div className="flex flex-col gap-3">
        <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex gap-1">
          <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
      </div>

      <span className="sr-only">{'x'.repeat(1600)}</span>
    </div>
  );
}
