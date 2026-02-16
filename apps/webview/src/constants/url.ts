import Cookies from 'js-cookie';

export const CLIENT_BASE_URL =
  Cookies.get('Platform') === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';

export const SERVER_BASE_URL = 'http://localhost:8787';
