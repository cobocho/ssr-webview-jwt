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
import type { AppStateStatus } from 'react-native';
import { AppState, Platform } from 'react-native';
import NitroCookies from 'react-native-nitro-cookies';

import { ACCESS_TOKEN_EXPIRATION_TIME } from '../constants/token';
import { WEBVIEW_BASE_URL } from '../constants/url';
import { appBridge } from '../lib/bridge';
import { getRefreshToken } from '../lib/http';

const MAX_REFRESH_RETRIES = 2;
const REFRESH_RETRY_DELAY_MS = 1000;
const REFRESH_INTERVAL_MS = ACCESS_TOKEN_EXPIRATION_TIME - 1000;

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
  await NitroCookies.clearByNameSync(WEBVIEW_BASE_URL, STORAGE_KEYS.ACCESS_TOKEN);
}

async function syncCookies(token: TokenResponse): Promise<void> {
  if (!token.accessToken || !token.refreshToken) {
    await clearAuthCookies();
    return;
  }

  console.log('syncCookies', token);

  await Promise.all([
    NitroCookies.set(
      WEBVIEW_BASE_URL,
      {
        name: STORAGE_KEYS.ACCESS_TOKEN,
        value: token.accessToken,
        path: '/',
        expires: new Date(token.accessTokenExpiresAt).toUTCString(),
        secure: false,
        httpOnly: true,
      },
      true,
    ),
    NitroCookies.set(WEBVIEW_BASE_URL, {
      name: 'Platform',
      value: Platform.OS,
      path: '/',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toUTCString(),
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
  setToken: (token: { accessToken: string; refreshToken: string }) => void,
): Promise<void> {
  setToken({
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
  });
  await syncCookies(tokenResponse);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken, getRefreshToken, clearToken } = useBridge(appBridge, (state) => ({
    token: state.token,
    setToken: state.setToken,
    clearToken: state.clearToken,
    getRefreshToken: state.getRefreshToken,
  }));

  const [initialized, setInitialized] = useState(false);

  const isAuthenticated = useMemo(
    () => !!(token?.accessToken && token?.refreshToken),
    [token?.accessToken, token?.refreshToken],
  );

  const hasBootstrapped = useRef(false);
  const skipNextSyncRef = useRef(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  const clearSession = useCallback(async () => {
    await Promise.all([clearToken(), clearAuthCookies()]);
  }, [clearToken]);

  const stopRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const performRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const refreshedToken = await refreshTokenWithRetry();
      if (refreshedToken) {
        skipNextSyncRef.current = true;
        await applyToken(refreshedToken, setToken);
      } else {
        console.warn('[Auth] Scheduled refresh failed — clearing session');
        stopRefreshInterval();
        await clearSession();
        router.replace('/login');
      }
    } catch (error) {
      console.error('[Auth] Scheduled refresh error:', error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [setToken, clearSession, stopRefreshInterval]);

  const startRefreshInterval = useCallback(() => {
    stopRefreshInterval();
    refreshIntervalRef.current = setInterval(performRefresh, REFRESH_INTERVAL_MS);
  }, [performRefresh, stopRefreshInterval]);

  const login = useCallback(
    async (tokenResponse: TokenResponse) => {
      skipNextSyncRef.current = true;
      await applyToken(tokenResponse, setToken);
      startRefreshInterval();
    },
    [setToken, startRefreshInterval],
  );

  const logout = useCallback(async () => {
    try {
      stopRefreshInterval();
      await clearSession();
      router.replace('/login');
    } catch (error) {
      console.error('[Auth] Logout failed:', error);
    }
  }, [clearSession, stopRefreshInterval]);

  useEffect(
    function bootstrap() {
      if (hasBootstrapped.current) return;
      hasBootstrapped.current = true;

      (async () => {
        try {
          const storedRefreshToken = await getRefreshToken();
          if (!storedRefreshToken) {
            setInitialized(true);
            return;
          }

          const refreshedToken = await refreshTokenWithRetry();
          if (refreshedToken) {
            skipNextSyncRef.current = true;
            await applyToken(refreshedToken, setToken);
            startRefreshInterval();
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
    [setToken, clearSession, getRefreshToken, startRefreshInterval],
  );

  useEffect(
    function handleAppState() {
      const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
        if (nextState === 'active' && isAuthenticated) {
          performRefresh().then(() => {
            startRefreshInterval();
          });
        } else if (nextState !== 'active') {
          stopRefreshInterval();
        }
      });

      return () => {
        subscription.remove();
      };
    },
    [isAuthenticated, performRefresh, startRefreshInterval, stopRefreshInterval],
  );

  useEffect(() => {
    return () => {
      stopRefreshInterval();
    };
  }, [stopRefreshInterval]);

  useEffect(
    function syncWebViewCookies() {
      if (!initialized) return;

      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }

      (async () => {
        try {
          if (!token?.accessToken || !token?.refreshToken) {
            await clearSession();
            return;
          }

          await syncCookies(token);
          appBridge.setState({ token });
        } catch (error) {
          console.error('[Auth] Sync failed:', error);
        }
      })();
    },
    [initialized, token, clearSession],
  );

  const contextValue = useMemo(
    () => ({ initialized, isAuthenticated, login, logout }),
    [initialized, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
