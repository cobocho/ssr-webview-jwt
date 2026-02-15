import { Client } from '@/components/client';
import { serverAPI } from '@/lib/server-http';

export default async function Home() {
  const data = await serverAPI.getProtected();

  return (
    <div className="w-screen p-4">
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Client />
    </div>
  );
}
