# Auth0 M2M Application Setup Guide

## Overview

This guide sets up a Machine-to-Machine (M2M) application in Auth0 that enables:
- Creating and managing user roles
- Assigning permissions to roles
- Managing user-role assignments
- Accessing the Auth0 Management API

## Step 1: Create M2M Application in Auth0 Dashboard

1. Go to **Auth0 Dashboard** > **Applications** > **Applications**
2. Click **+ Create Application**
3. Name: `Booking System Management API`
4. Select **Machine to Machine Applications**
5. Click **Create**

## Step 2: Enable Management API Access

1. In the new M2M app, go to **Machine to Machine Apps** tab
2. Find **Auth0 Management API** and toggle it **ON**
3. Select the following permissions (scopes):
   - `read:users`
   - `update:users`
   - `create:users`
   - `delete:users`
   - `read:roles`
   - `create:roles`
   - `update:roles`
   - `delete:roles`
   - `read:role_members`
   - `update:role_members`
   - `read:permissions`
   - `create:permissions`
4. Click **Authorize**

## Step 3: Get Credentials

1. In the M2M app, go to **Settings** tab
2. Copy:
   - **Domain** (e.g., `your-tenant.auth0.com`)
   - **Client ID**
   - **Client Secret**
3. Add to your environment:

```bash
# .env
AUTH0_M2M_DOMAIN=your-tenant.auth0.com
AUTH0_M2M_CLIENT_ID=your-m2m-client-id
AUTH0_M2M_CLIENT_SECRET=your-m2m-client-secret
```

## Step 4: Run Setup Script

```bash
# Install dependencies
cd packages/auth-middleware
npm install

# Run the setup script to create roles and permissions
npx tsx src/auth0-management/setup.ts
```

This will create:

### Roles
| Role | Description |
|------|-------------|
| `guest` | Default customer role |
| `partner` | Property partner role |
| `admin` | System administrator |
| `super-admin` | Full system access |

### Permissions
| Permission | Description |
|------------|-------------|
| `read:properties` | View properties |
| `create:properties` | Create properties |
| `update:properties` | Update properties |
| `delete:properties` | Delete properties |
| `read:bookings` | View bookings |
| `create:bookings` | Create bookings |
| `update:bookings` | Update bookings |
| `cancel:bookings` | Cancel bookings |
| `read:users` | View users |
| `manage:users` | Manage user accounts |
| `read:reports` | View reports |
| `manage:payments` | Manage payments |
| `manage:reviews` | Manage reviews |
| `admin:full` | Full admin access |

## Step 5: Assign Roles to Users

### Via Management API
```typescript
import { Auth0ManagementClient } from '@booking/auth-middleware';

const management = new Auth0ManagementClient({
  domain: process.env.AUTH0_M2M_DOMAIN!,
  clientId: process.env.AUTH0_M2M_CLIENT_ID!,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET!,
});

// Assign role to user
await management.assignRoleToUser('auth0|user-id', 'role-id');

// Get user roles
const roles = await management.getUserRoles('auth0|user-id');

// Get role permissions
const permissions = await management.getRolePermissions('role-id');
```

### Via Auth0 Dashboard
1. Go to **User Management** > **Users**
2. Click on a user
3. Go to **Roles** tab
4. Assign roles

## Step 6: Configure JWT Claims

Add a Rule or Action in Auth0 to include roles in the JWT:

1. Go to **Auth0 Dashboard** > **Actions** > **Flows** > **Login**
2. Add a new Action:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://booking.com';
  
  // Get user roles from Auth0
  const managementClient = new Auth0ManagementClient({
    domain: auth0.domain,
    clientId: auth0.clientId,
    clientSecret: auth0.clientSecret,
  });

  const roles = await managementClient.users.getRoles({ id: event.user.user_id });
  
  // Set custom claims
  api.idToken.setCustomClaim(`${namespace}/roles`, roles.map(r => r.name));
  api.idToken.setCustomClaim(`${namespace}/role`, roles[0]?.name || 'guest');
  api.idToken.setCustomClaim(`${namespace}/permissions`, 
    roles.flatMap(r => r.permissions?.map(p => p.permission_name) || [])
  );
  
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles.map(r => r.name));
  api.accessToken.setCustomClaim(`${namespace}/role`, roles[0]?.name || 'guest');
};
```

3. Deploy the Action
4. Add it to the Login flow

## Environment Variables

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-primary-client-id

# M2M Application (for Management API)
AUTH0_M2M_DOMAIN=your-tenant.auth0.com
AUTH0_M2M_CLIENT_ID=your-m2m-client-id
AUTH0_M2M_CLIENT_SECRET=your-m2m-client-secret

# Frontend
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-primary-client-id
```

## API Endpoints

The auth service provides these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/auth/roles` | List all roles |
| POST | `/api/auth/roles` | Create a new role |
| GET | `/api/auth/roles/:id/permissions` | Get role permissions |
| POST | `/api/auth/roles/:id/permissions` | Add permissions to role |
| GET | `/api/auth/users/:id/roles` | Get user roles |
| POST | `/api/auth/users/:id/roles` | Assign role to user |
| DELETE | `/api/auth/users/:id/roles/:roleId` | Remove role from user |
