import { defineConfig } from 'drizzle-kit';

// Per-service drizzle configs
// Usage: npx drizzle-kit generate --config=drizzle.config.users.ts
// Or use the default config for all schemas

export default defineConfig({
  schema: './src/**/*-schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db',
  },
});
