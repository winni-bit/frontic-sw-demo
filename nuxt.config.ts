// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Runtime Config - Sensible Daten aus Environment Variables
  runtimeConfig: {
    // Server-only (nicht im Client sichtbar)
    shopwareAccessKey: process.env.SHOPWARE_ACCESS_KEY || '',
    shopwareApiUrl: process.env.SHOPWARE_API_URL || '',
    
    // Public (im Client verfügbar, aber keine Secrets!)
    public: {
      shopwareStorefrontUrl: process.env.SHOPWARE_STOREFRONT_URL || '',
    }
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *"
      }
    }
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': "frame-ancestors *"
        }
      }
    }
  }
})
