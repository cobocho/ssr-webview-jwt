import { type JWTPayload, jwtVerify, SignJWT } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'access-secret-change-in-production',
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-change-in-production',
);

export const ACCESS_TOKEN_EXPIRES_IN = 10;
export const REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 14;

export interface TokenPayload extends JWTPayload {
  sub: string;
}

export async function signAccessToken(sub: string): Promise<string> {
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(sub: string): Promise<string> {
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_EXPIRES_IN}s`)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as TokenPayload;
}
