// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // --- Nuxt Hub module ---
  modules: ['@nuxthub/core'],

  hub: {
    storage: {},
    cache: {},
  },

  // --- Runtime config for server-side DB connection ---
  runtimeConfig: {
    // Private — server-only, not exposed to client
    tursoUrl: process.env.TURSO_URL || '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN || '',
    // Public — safe to expose to client
    public: {},
  },
})
