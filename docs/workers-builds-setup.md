# Workers Builds Setup Guide

Workers Builds is Cloudflare's native CI/CD solution. It connects directly to your GitHub/GitLab repo and handles authentication, building, and deployment automatically.

## Overview

```
Push to branch → Workers Builds → Build → Deploy → Tag Resources
```

No API tokens or secrets needed — Cloudflare handles everything.

## Setup Per Service

### 1. Auth Service

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Click **Create Application** → **Connect a Git repository**
3. Select your repo: `namnh240795/stay-ecosystem`
4. Configure:
   - **Project name**: `auth-service`
   - **Production branch**: `prod`
   - **Build command**: `cd services/auth && pnpm install && pnpm build`
   - **Deploy command**: `cd services/auth && wrangler deploy`
5. Add **Environment Variables**:
   - `AUTH0_DOMAIN`: Your Auth0 domain
   - `AUTH0_CLIENT_ID`: Your Auth0 client ID
6. Add **Secrets** (for sensitive values):
   - `AUTH0_CLIENT_SECRET`: Your Auth0 client secret
7. Click **Save and Deploy**

### 2. Users Service

Same steps as Auth, but:
- **Project name**: `users-service`
- **Build command**: `cd services/users && pnpm install && pnpm build`
- **Deploy command**: `cd services/users && wrangler deploy`

### 3. Properties Service

- **Project name**: `properties-service`
- **Build command**: `cd services/properties && pnpm install && pnpm build`
- **Deploy command**: `cd services/properties && wrangler deploy`

### 4. Bookings Service

- **Project name**: `bookings-service`
- **Build command**: `cd services/bookings && pnpm install && pnpm build`
- **Deploy command**: `cd services/bookings && wrangler deploy`

### 5. Payments Service

- **Project name**: `payments-service`
- **Build command**: `cd services/payments && pnpm install && pnpm build`
- **Deploy command**: `cd services/payments && wrangler deploy`

### 6. Reviews Service

- **Project name**: `reviews-service`
- **Build command**: `cd services/reviews && pnpm install && pnpm build`
- **Deploy command**: `cd services/reviews && wrangler deploy`

### 7. Gateway

- **Project name**: `gateway`
- **Build command**: `cd gateway && pnpm install && pnpm build`
- **Deploy command**: `cd gateway && wrangler deploy`

### 8. Frontend Apps (Cloudflare Pages)

For each app (web, admin, partner, login):
1. Go to **Workers & Pages** → **Create Application** → **Connect a Git repository**
2. Configure:
   - **Project name**: `stay-web`, `stay-admin`, `stay-partner`, `stay-login`
   - **Build command**: `cd apps/web && pnpm install && pnpm build` (adjust for each app)
   - **Build output directory**: `dist`
3. Add Environment Variables:
   - `VITE_AUTH0_DOMAIN`: Your Auth0 domain
   - `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID
4. Click **Save and Deploy**

## Branch Configuration

Workers Builds supports branch-based deployments:

| Branch | Behavior |
|--------|----------|
| `development` | Preview deployments (optional) |
| `sit` | Auto-deploy to SIT environment |
| `uat` | Auto-deploy to UAT environment |
| `prod` | Auto-deploy to production |

To configure branch deployments:
1. In the Workers Builds settings, go to **Build configurations**
2. Add build rules for each branch
3. Set the deploy command with `--env` flag for non-production branches

### Example: SIT Environment

For the auth service SIT deployment:
- **Branch**: `sit`
- **Deploy command**: `cd services/auth && wrangler deploy --env sit`

## Environment Variables

### Per-Environment Configuration

Workers Builds supports environment-specific variables. In the dashboard:

1. Go to your Worker → **Settings** → **Variables**
2. Add variables for each environment:

| Variable | SIT | UAT | Production |
|----------|-----|-----|------------|
| `AUTH0_DOMAIN` | `sit-xxx.auth0.com` | `uat-xxx.auth0.com` | `prod-xxx.auth0.com` |
| `AUTH0_CLIENT_ID` | `sit-client-id` | `uat-client-id` | `prod-client-id` |

### Secrets

For sensitive values, use **Secrets** instead of variables:
1. Go to **Settings** → **Secrets**
2. Add `AUTH0_CLIENT_SECRET` for each environment

## D1 Database Setup

Workers Builds can auto-provision D1 databases. When you deploy a Worker with a D1 binding:

1. The first deployment will fail with a binding error
2. Go to the Worker → **Settings** → **Bindings**
3. Click **Add binding** → **D1 Database**
4. Select or create a database for each environment

### Manual D1 Setup

If auto-provisioning doesn't work:

```bash
# Create databases for each environment
wrangler d1 create users-db-sit
wrangler d1 create users-db-uat
wrangler d1 create users-db-prod

# Update wrangler.toml with the database IDs
```

## Monitoring

### Build Logs
- Go to your Worker → **Builds** tab
- View build logs, deployment status, and errors

### Deployment History
- Each deployment is logged with commit SHA, branch, and timestamp
- Rollback to any previous deployment

## Troubleshooting

### Build Fails
1. Check build logs in Workers Builds
2. Verify build command is correct
3. Ensure all dependencies are in package.json

### Deploy Fails
1. Check if D1 databases are bound correctly
2. Verify environment variables are set
3. Check wrangler.toml for syntax errors

### Preview URLs Not Working
1. Ensure preview URLs are enabled in Worker settings
2. Check that the branch is configured for preview deployments
