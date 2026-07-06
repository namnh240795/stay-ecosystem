export { createAuthMiddleware } from './auth0';
export type { AuthUser, AuthJWTPayload, AuthEnv } from './auth0';

export { requireRole, requireOwnership } from './permissions';

export { Auth0ManagementClient } from './auth0-management';
export type {
  Auth0ManagementConfig,
  Auth0Role,
  Auth0Permission,
  Auth0UserRole,
  Auth0User,
} from './auth0-management';
