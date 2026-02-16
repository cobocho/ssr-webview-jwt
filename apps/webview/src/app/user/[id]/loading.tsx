export function UserDetailLoading() {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 p-4">
      <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
      <span className="sr-only">{'x'.repeat(1600)}</span>
    </div>
  );
}

export function UserPostListLoading() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-gray-100 p-4">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
      <span className="sr-only">{'x'.repeat(1600)}</span>
    </div>
  );
}

export default function UserPageLoading() {
  return (
    <div className="flex flex-col">
      <UserDetailLoading />
      <UserPostListLoading />
    </div>
  );
}
