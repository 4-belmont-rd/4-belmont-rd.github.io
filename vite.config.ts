import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 3000,
    proxy: {
      // In production this file is fetched at deploy time (see .github/workflows/main.yml)
      "/booked.ics": {
        target: "https://www.airbnb.com",
        changeOrigin: true,
        rewrite: () =>
          "/calendar/ical/1221766328608212785.ics?s=4d2dd1dfb1a415240779bbded1cfe075&locale=en-GB",
      },
    },
  }
})
