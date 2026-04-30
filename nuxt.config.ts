// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-04-30',

  css: ["~~/assets/css/main.css"],
  
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
