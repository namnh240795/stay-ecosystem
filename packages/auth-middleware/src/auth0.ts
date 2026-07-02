import { jwtVerify, type JWTPayload } from 'jose';
import type { Context, MiddlewareHandler } from 'hono';

// ─── Extended JWT Payload ────────────────────────────────────────────────────

export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
  role: 'guest' | 'partner' | 'admin';
  partnerId?: string;
}

export interface AuthJWTPayload extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  role?: string;
  partner_id?: string;
  'https://booking.com/role'?: string;
  'https://booking.com/partner_id'?: string;
}

// ─── Context Variables ──────────────────────────────────────────────────────

export type AuthEnv = {
  Variables: {
    user: AuthUser;
  };
};

// ─── JWT Verification Middleware ─────────────────────────────────────────────

/**
 * Creates Hono middleware that verifies Auth0 JWTs.
 *
 * Usage:
 *   import { createAuthMiddleware } from '@booking/auth-middleware';
 *
 *   const app = new Hono<Env>();
 *   app.use('/*', createAuthMiddleware({
 *     domain: 'your-tenant.auth0.com',
 *     audience: 'https://your-api.example.com',
 *   }));
 */
export function createAuthMiddleware(options: {
  domain: string;
  audience: string;
}): MiddlewareHandler<AuthEnv> {
  const { domain, audience } = options;

  // Build the JWKS URL for Auth0
  const jwksUrl = new URL(`/.well-known/jwks.json`, `https://${domain}`);

  return async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } },
        401,
      );
    }

    const token = authHeader.slice(7);

    try {
      const { payload } = await jwtVerify(token, createRemoteJWKSet(jwksUrl), {
        issuer: `https://${domain}/`,
        audience,
      });

      const jwtPayload = payload as AuthJWTPayload;

      // Extract role and partner_id from claims.
      // Auth0 custom claims are namespaced; check both the namespaced and flat versions.
      const role = (jwtPayload['https://booking.com/role'] ?? jwtPayload.role ?? 'guest') as AuthUser['role'];
      const partnerId = jwtPayload['https://booking.com/partner_id'] ?? jwtPayload.partner_id;

      const user: AuthUser = {
        sub: jwtPayload.sub,
        email: jwtPayload.email ?? '',
        name: jwtPayload.name,
        role,
        partnerId,
      };

      c.set('user', user);

      await next();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token verification failed';
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message } },
        401,
      );
    }
  };
}

// ─── Remote JWKS Fetcher (minimal re-export from jose) ───────────────────────

// We re-import the remote JWKS set helper from jose directly.
// This is the same `createRemoteJWKSet` that jose exports.
import { createRemoteJWKSet } from 'jose';
