import { Platform } from 'react-native';

export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';

export const WEBVIEW_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const WEBVIEW_ROUTES = {
  home: `${WEBVIEW_BASE_URL}`,
  postDetail: `${WEBVIEW_BASE_URL}/post/:id`,
  userDetail: `${WEBVIEW_BASE_URL}/user/:id`,
} as const;
