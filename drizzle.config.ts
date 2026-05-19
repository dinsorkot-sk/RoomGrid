import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_URL || './local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})