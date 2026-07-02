import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface Auth0Env {
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
}

export interface AuthenticatedUser {
  sub: string;
  email?: string;
  name?: string;
  roles?: string[];
}

/**
 * Verify an Auth0 access token using JWKS.
 */
export async function verifyToken(
  token: string,
  env: Auth0Env
): Promise<JWTPayload> {
  const jwksUrl = `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`;
  const jwks = createRemoteJWKSet(new URL(jwksUrl));

  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://${env.AUTH0_DOMAIN}/`,
    audience: env.AUTH0_CLIENT_ID,
  });

  return payload;
}

/**
 * Extract user information from a verified JWT payload.
 */
export function extractUser(payload: JWTPayload): AuthenticatedUser {
  return {
    sub: payload.sub ?? "",
    email: payload.email as string | undefined,
    name: payload.name as string | undefined,
    roles: payload["https://booking-app/roles"] as string[] | undefined,
  };
}

/**
 * Extract the Bearer token from the Authorization header.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
