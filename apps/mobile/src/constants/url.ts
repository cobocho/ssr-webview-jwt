export const BASE_URL = 'http://localhost:8787';

export const WEBVIEW_BASE_URL = 'http://localhost:3000';

export const WEBVIEW_ROUTES = {
  home: `${WEBVIEW_BASE_URL}`,
  protected: `${WEBVIEW_BASE_URL}/protected`,
  public: `${WEBVIEW_BASE_URL}/public`,
} as const;
