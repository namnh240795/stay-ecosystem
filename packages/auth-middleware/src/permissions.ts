import type { MiddlewareHandler } from 'hono';
import type { AuthUser, AuthEnv } from './auth0';

// ─── requireRole ─────────────────────────────────────────────────────────────

/**
 * Middleware that restricts access to users with one of the given roles.
 *
 * Usage:
 *   app.get('/admin/users', requireRole('admin'), handler);
 *   app.post('/properties', requireRole('partner', 'admin'), handler);
 */
export function requireRole(...allowedRoles: string[]): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        401,
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          },
        },
        403,
      );
    }

    await next();
  };
}

// ─── requireOwnership ────────────────────────────────────────────────────────

/**
 * Middleware that ensures the authenticated user owns the resource.
 *
 * The `getPartnerId` callback extracts the partner ID from the resource
 * (typically from route params or a database lookup).
 *
 * Usage:
 *   app.put(
 *     '/properties/:id',
 *     requireOwnership(async (c) => {
 *       const property = await getProperty(c.req.param('id'));
 *       return property?.partnerId;
 *     }),
 *     handler,
 *   );
 */
export function requireOwnership(
  getPartnerId: (c: any) => string | Promise<string | undefined>,
): MiddlewareHandler<AuthEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        401,
      );
    }

    // Admins bypass ownership checks
    if (user.role === 'admin') {
      await next();
      return;
    }

    const resourcePartnerId = await getPartnerId(c);

    if (!resourcePartnerId) {
      return c.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } },
        404,
      );
    }

    if (!user.partnerId || user.partnerId !== resourcePartnerId) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resource',
          },
        },
        403,
      );
    }

    await next();
  };
}
