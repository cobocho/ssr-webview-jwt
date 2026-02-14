import { useBridge } from '@webview-bridge/react-native';
import { router } from 'expo-router';
import { HTTPError } from 'ky';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NitroCookies from 'react-native-nitro-cookies';

import { ACCESS_TOKEN_EXPIRATION_TIME } from '../constants/token';
import { WEBVIEW_BASE_URL } from '../constants/url';
import { appBridge } from '../lib/bridge';
import { getRefreshToken } from '../lib/http';

const MAX_REFRESH_RETRIES = 2;
const REFRESH_RETRY_DELAY_MS = 1000;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

interface TokenResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

interface AuthContextValue {
  initialized: boolean;
  isAuthenticated: boolean;
  cookieVersion: number;
  login: (token: TokenResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function clearAuthCookies(): Promise<void> {
  NitroCookies.clearAll();
}

async function syncCookies(token: TokenResponse): Promise<void> {
  if (!token.accessToken || !token.refreshToken) {
    await clearAuthCookies();
    return;
  }

  await Promise.all([
    NitroCookies.set(WEBVIEW_BASE_URL, {
      name: STORAGE_KEYS.ACCESS_TOKEN,
      value: token.accessToken,
      path: '/',
      expires: new Date(token.accessTokenExpiresAt).toUTCString(),
      secure: false,
      httpOnly: false,
    }),
    NitroCookies.set(WEBVIEW_BASE_URL, {
      name: STORAGE_KEYS.REFRESH_TOKEN,
      value: token.refreshToken,
      path: '/',
      expires: new Date(token.refreshTokenExpiresAt).toUTCString(),
      secure: false,
      httpOnly: false,
    }),
  ]);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshTokenWithRetry(): Promise<TokenResponse | null> {
  for (let attempt = 0; attempt <= MAX_REFRESH_RETRIES; attempt++) {
    try {
      return await getRefreshToken();
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          console.warn('[Auth] Refresh rejected by server:', status);
          return null;
        }
      }

      if (attempt === MAX_REFRESH_RETRIES) {
        console.error('[Auth] Refresh failed after retries:', error);
        return null;
      }

      console.warn(`[Auth] Refresh attempt ${attempt + 1} failed, retrying...`);
      await delay(REFRESH_RETRY_DELAY_MS);
    }
  }
  return null;
}

async function applyToken(
  tokenResponse: TokenResponse,
  setToken: (token: {
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }) => void,
): Promise<void> {
  setToken({
    accessToken: tokenResponse.accessToken,
    accessTokenExpiresAt: tokenResponse.accessTokenExpiresAt,
    refreshToken: tokenResponse.refreshToken,
    refreshTokenExpiresAt: tokenResponse.refreshTokenExpiresAt,
  });
  await syncCookies(tokenResponse);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useBridge(appBridge, (state) => state.token);
  const setToken = useBridge(appBridge, (state) => state.setToken);
  const getBridgeRefreshToken = useBridge(appBridge, (state) => state.getRefreshToken);
  const clearToken = useBridge(appBridge, (state) => state.clearToken);

  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cookieVersion, setCookieVersion] = useState(0);

  const hasBootstrapped = useRef(false);
  const skipNextSyncRef = useRef(false);

  const clearSession = useCallback(async () => {
    await Promise.all([clearToken(), clearAuthCookies()]);
    setIsAuthenticated(false);
  }, [clearToken]);

  const login = useCallback(
    async (tokenResponse: TokenResponse) => {
      skipNextSyncRef.current = true;
      await applyToken(tokenResponse, setToken);
      setCookieVersion((v) => v + 1);
      setIsAuthenticated(true);
    },
    [setToken],
  );

  const logout = useCallback(async () => {
    try {
      await clearSession();
      router.replace('/login');
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
    }
  }, [clearSession]);

  useEffect(
    function bootstrap() {
      if (hasBootstrapped.current) return;
      hasBootstrapped.current = true;

      (async () => {
        try {
          const storedRefreshToken = await getBridgeRefreshToken();

          if (!storedRefreshToken) {
            setInitialized(true);
            return;
          }

          const refreshedToken = await refreshTokenWithRetry();

          if (refreshedToken) {
            skipNextSyncRef.current = true;
            await applyToken(refreshedToken, setToken);
            setCookieVersion((v) => v + 1);
            setIsAuthenticated(true);
          } else {
            console.warn('[Auth] Bootstrap refresh failed — clearing session');
            await clearSession();
          }
        } catch (error) {
          console.error('[Auth] Bootstrap failed:', error);
          await clearSession();
        } finally {
          setInitialized(true);
        }
      })();
    },
    [setToken, clearSession, getBridgeRefreshToken],
  );

  useEffect(
    function syncWebViewCookies() {
      if (!initialized) return;

      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }

      (async () => {
        try {
          if (!token) {
            await clearSession();
            return;
          }

          if (!token.accessToken || !token.refreshToken) {
            await clearSession();
            return;
          }

          await syncCookies(token);
          setCookieVersion((v) => v + 1);
          setIsAuthenticated(true);
          appBridge.setState({ token });
        } catch (error) {
          console.error('[Auth] Sync failed:', error);
        }
      })();
    },
    [initialized, token, clearSession],
  );

  const handleRefresh = useCallback(async () => {
    const newToken = await refreshTokenWithRetry();

    if (newToken) {
      setToken(newToken);
      return;
    }

    console.error('[Auth] Periodic refresh failed — logging out');
    await logout();
  }, [setToken, logout]);

  useEffect(() => {
    if (!token?.refreshToken) return;

    const intervalId = setInterval(handleRefresh, ACCESS_TOKEN_EXPIRATION_TIME - 1000);

    return () => clearInterval(intervalId);
  }, [token?.refreshToken, handleRefresh]);

  const contextValue = useMemo(
    () => ({ initialized, isAuthenticated, cookieVersion, login, logout }),
    [initialized, isAuthenticated, cookieVersion, login, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
