'use client';

import { clientAPI } from '@/lib/client-http';
import { useBridgeStatus } from '@/providers/bridge-provider';

export function Client() {
  const { isWebViewBridgeAvailable } = useBridgeStatus();

  return (
    <div>
      {isWebViewBridgeAvailable ? 'Bridge Available' : 'Bridge Not Available'}
      <button
        onClick={async () => {
          const data = await clientAPI.getProtected();
          alert(data.message);
        }}
      >
        Protected
      </button>
      <button
        onClick={async () => {
          const data = await clientAPI.getPublic();
          alert(data.message);
        }}
      >
        Public
      </button>
    </div>
  );
}
