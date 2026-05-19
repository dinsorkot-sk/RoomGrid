// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // --- Nuxt Hub module ---
  modules: ['@nuxthub/core'],

  hub: {
    // Enable SQLite/Turso database
    db: 'sqlite',
  },
})
