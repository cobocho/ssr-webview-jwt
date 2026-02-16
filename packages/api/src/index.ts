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

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
}

export interface UserDetail extends User {
  postCount: number;
}

export interface PostAuthor {
  id: string;
  name: string;
  avatar: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: PostAuthor | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface UserListParams {
  page?: number;
  limit?: number;
}

export interface PostListParams {
  page?: number;
  limit?: number;
  userId?: string;
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

  async getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    return this.httpClient.get('users', { searchParams: { ...params } }).json();
  }

  async getUser(userId: string): Promise<{ data: UserDetail }> {
    return this.httpClient.get(`users/${userId}`).json();
  }

  async getPosts(params?: PostListParams): Promise<PaginatedResponse<Post>> {
    return this.httpClient.get('posts', { searchParams: { ...params } }).json();
  }

  async getPost(postId: string): Promise<{ data: Post }> {
    return this.httpClient.get(`posts/${postId}`).json();
  }

  async getUserPosts(
    userId: string,
    params?: Omit<PostListParams, 'userId'>,
  ): Promise<PaginatedResponse<Post>> {
    return this.httpClient
      .get(`posts`, { searchParams: { ...params, userId } })
      .json();
  }
}
