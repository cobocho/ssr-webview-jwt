# ssr-webview-jwt

A sample monorepo demonstrating stable JWT management in a **React Native WebView + Next.js SSR** environment.

> Companion code for the blog post: [Using JWT Reliably in a Next.js WebView Environment](./next-js-webview-jwt.md)

---

## Overview

This project tackles a non-trivial problem: how to share authentication tokens across three different execution environments in a single app.

| Environment | Token Source |
|---|---|
| Native (React Native) | `expo-secure-store` |
| WebView — Server Side (Next.js SSR) | `httpOnly` Cookie |
| WebView — Client Side (Next.js CSR) | Bridge (in-memory) |

The core idea is to keep **SecureStore as the single source of truth** and sync the Access Token into a WebView cookie via `react-native-nitro-cookies` whenever it changes. This lets the SSR layer read the token from cookies without any bridge involvement, while the native layer and CSR layer each use their own path.

---

## Tech Stack

| App | Stack |
|---|---|
| `apps/server` | [Hono.js](https://hono.dev), [jose](https://github.com/panva/jose) |
| `apps/mobile` | Expo (Development Build), [webview-bridge](https://github.com/gronxb/webview-bridge), [react-native-nitro-cookies](https://github.com/patrickkabwe/react-native-nitro-cookies), expo-secure-store |
| `apps/webview` | Next.js 16 (App Router), React Query, [webview-bridge](https://github.com/gronxb/webview-bridge), ky |
| `packages/api` | Shared API client (typed with ky) |

---

## Project Structure

```
ssr-webview-jwt/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # Expo Router screens
│   │   └── src/
│   │       ├── components/bridged-webview.tsx
│   │       ├── context/auth-provider.tsx   # Core auth lifecycle
│   │       ├── lib/bridge.ts               # webview-bridge definition
│   │       └── lib/http.ts                 # Native HTTP client (ky)
│   ├── webview/         # Next.js WebView app
│   │   └── src/
│   │       ├── app/                        # App Router pages & error boundaries
│   │       ├── lib/server-http.ts          # SSR HTTP client (reads cookie)
│   │       ├── lib/client-http.ts          # CSR HTTP client (reads bridge)
│   │       └── providers/bridge-provider.tsx
│   └── server/          # Hono API server
│       └── src/
│           ├── lib/jwt.ts                  # Token sign / verify (jose)
│           ├── middleware/auth.ts
│           └── routes/auth.ts              # /login, /refresh
└── packages/
    └── api/             # Shared typed API client
```

---

## Token Policy

| Token | Expiry | Storage |
|---|---|---|
| Access Token | 1 hour | Bridge memory (native) / `httpOnly` cookie (WebView) |
| Refresh Token | 14 days | `expo-secure-store` |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9
- Xcode (iOS) or Android Studio (Android)

### Install

```bash
pnpm install
```

### Run all apps in parallel

```bash
pnpm dev
```

Or run each app individually:

```bash
# API server (port 8787)
pnpm --filter @ssr-webview-jwt/server dev

# Next.js WebView (port 3000)
pnpm --filter webview dev

# Expo mobile app
pnpm --filter @ssr-webview-jwt/mobile ios
# or
pnpm --filter @ssr-webview-jwt/mobile android
```

### Demo credentials

```
email:    user@example.com
password: 1234
```

---

## Key Implementation Details

### AuthProvider (Native)

Manages the full auth lifecycle:

1. **Bootstrap** — On app start, reads Refresh Token from SecureStore, issues a new Access Token, and syncs the cookie before the WebView mounts.
2. **Periodic refresh** — Runs an interval that fires 1 second before Access Token expiry. Stops when the app goes to background, restarts on foreground.
3. **Cookie sync** — Every time the bridge token state changes, `react-native-nitro-cookies` pushes the new Access Token into the WebView's cookie jar (`httpOnly: true`).
4. **Logout** — Clears SecureStore, bridge memory, and the WebView cookie atomically.

### BridgedWebView (Native)

- Does **not** render until `initialized === true` (bootstrap complete + cookie synced).
- Listens for `{ type: 'reload' }` messages from the WebView to remount via `key` change — used for SSR auth error recovery.
- Handles WebView process crashes on both iOS (`onContentProcessDidTerminate`) and Android (`onRenderProcessGone`).

### SSR HTTP client (WebView)

Reads `accessToken` from the `httpOnly` cookie via `next/headers`. On 4xx responses, throws typed error classes (`UnauthorizedError`, `ForbiddenError`, …) that Next.js `error.tsx` boundaries catch.

### CSR HTTP client (WebView)

Calls `bridge.getAccessToken()` to get the in-memory Access Token. On 401, calls `bridge.refreshToken()` — a single shared `refreshPromise` prevents duplicate refresh requests from concurrent calls.

### SSR token expiry recovery

```
error.tsx (UnauthorizedError)
  → bridge.refreshToken()
  → ReactNativeWebView.postMessage({ type: 'reload' })
  → BridgedWebView remounts with fresh cookie
  → SSR re-runs with valid token
```

---

## License

MIT
