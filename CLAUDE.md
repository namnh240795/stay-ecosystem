# Stay Ecosystem - Cloudflare Booking Apartment System

## Git Workflow: Worktree-based Branching

This project uses **git worktrees** to work on different branches simultaneously without switching branches.

### Branch Strategy

| Branch | Purpose | Worktree Path |
|--------|---------|---------------|
| `development` | Active development | `/Users/namnguyen/Documents/cloudflare-booking-apartment-system` (root) |
| `sit` | System Integration Testing | `/Users/namnguyen/Documents/stay-ecosystem-sit` |
| `uat` | User Acceptance Testing | `/Users/namnguyen/Documents/stay-ecosystem-uat` |
| `prod` | Production | `/Users/namnguyen/Documents/stay-ecosystem-prod` |

### Rules for Claude

1. **Always use worktrees** — Never `git checkout` to switch branches in the main worktree. Create or switch to the appropriate worktree instead.

2. **New features** → Work in `development` worktree (root directory)

3. **Integration testing** → Create a branch from `sit` in the SIT worktree:
   ```
   git worktree add /Users/namnguyen/Documents/stay-ecosystem-sit -b feature/xxx sit
   ```

4. **Bug fixes for UAT** → Create a branch from `uat` in the UAT worktree:
   ```
   git worktree add /Users/namnguyen/Documents/stay-ecosystem-uat -b fix/xxx uat
   ```

5. **Hotfixes for production** → Create a branch from `prod` in the PROD worktree:
   ```
   git worktree add /Users/namnguyen/Documents/stay-ecosystem-prod -b hotfix/xxx prod
   ```

6. **Promote code** between environments using merge or cherry-pick — never commit directly to `sit`, `uat`, or `prod` from the development worktree.

7. **List worktrees** before starting work:
   ```
   git worktree list
   ```

8. **Each worktree has its own `node_modules`** — run `pnpm install` in each worktree after creating it.

### Commit Message Convention

Use conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `chore:` — Maintenance
- `docs:` — Documentation
- `test:` — Tests
- `ci:` — CI/CD changes

### Project Structure

Monorepo with pnpm workspaces + Turborepo:
- `packages/` — Shared packages (shared, db, auth-middleware)
- `services/` — Cloudflare Workers microservices (6 services)
- `apps/` — React SPAs (login, web, partner, admin)
- `gateway/` — API gateway

### Tech Stack

- **Runtime:** Cloudflare Workers
- **Framework:** Hono + @hono/zod-openapi
- **ORM:** Drizzle ORM (D1/SQLite)
- **Auth:** Auth0 (3 connections: customers-db, partners-db, admins-db)
- **Frontend:** React + Vite + Auth0 SPA SDK
- **API Docs:** Scalar (@scalar/hono-api-reference)
- **Monorepo:** pnpm workspaces + Turborepo

### Development

```bash
pnpm install          # Install dependencies
cp .dev.vars.example .dev.vars  # Set up local env vars
pnpm turbo dev        # Start all services
pnpm turbo typecheck  # Type check
pnpm turbo build      # Build all
pnpm turbo test       # Run tests
```

### Database Migrations (Safe SQLite)

Drizzle ORM generates migrations from schema changes. For SQLite/D1:

```bash
# Generate migration files after schema changes
pnpm db:generate

# Review generated SQL in packages/db/drizzle/ before applying
# NEVER apply migrations directly to production without review

# Apply migrations per environment
wrangler d1 migrations apply users-db --env sit --remote
wrangler d1 migrations apply users-db --env uat --remote
wrangler d1 migrations apply users-db --env prod --remote
```

**SQLite Safety Rules:**
- Never `DROP COLUMN` — mark columns deprecated, ignore in code
- Never rename columns — add new, migrate data, drop old later
- Always use `IF NOT EXISTS` for tables/indexes
- Review generated SQL before applying to any environment

### Deployment

```bash
# Deploy to specific environment
pnpm deploy:services:sit    # Deploy all services to SIT
pnpm deploy:gateway:sit     # Deploy gateway to SIT
pnpm deploy:apps:sit        # Deploy frontend apps to SIT

# Same for uat and prod
pnpm deploy:services:uat
pnpm deploy:services:prod
```

### CI/CD Pipeline

```
PR → development: CI (typecheck + build + test)
Push to sit:      Auto-deploy to SIT
Push to uat:      Auto-deploy to UAT
Push to prod:     Manual approval → Deploy to PROD
```

GitHub Actions workflows:
- `.github/workflows/ci.yml` — Runs on PRs and pushes to development
- `.github/workflows/deploy-sit.yml` — Deploys to SIT on push to sit
- `.github/workflows/deploy-uat.yml` — Deploys to UAT on push to uat
- `.github/workflows/deploy-prod.yml` — Deploys to PROD on push to prod (requires approval)

### Environment Configuration

Each service has environment-specific configs in `wrangler.toml`:
- `[env.sit]` — SIT environment
- `[env.uat]` — UAT environment
- `[env.prod]` — Production environment

Secrets are managed via Cloudflare dashboard or `.dev.vars` for local development.
