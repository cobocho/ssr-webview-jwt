import type { KyInstance } from 'ky';

export interface TokenResponse {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken?: string;
}

export interface PublicResponse {
  message: string;
}

export interface ProtectedResponse {
  message: string;
  user: string;
}

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
}

export class Api {
  constructor(private readonly httpClient: KyInstance) {}

  async login(request: LoginRequest): Promise<TokenResponse> {
    return this.httpClient.post('login', { json: request }).json();
  }

  async refresh(request?: RefreshRequest): Promise<TokenResponse> {
    const headers: Record<string, string> = {};
    if (request?.refreshToken) {
      headers['Authorization'] = `Bearer ${request.refreshToken}`;
    }
    return this.httpClient.post('refresh', { headers }).json();
  }

  async getPublic(): Promise<PublicResponse> {
    return this.httpClient.get('public').json();
  }

  async getProtected(): Promise<ProtectedResponse> {
    return this.httpClient.get('protected').json();
  }
}
