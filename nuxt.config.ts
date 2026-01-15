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
