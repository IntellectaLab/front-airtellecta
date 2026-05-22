import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'https://airtellecta-back-589274708348.us-central1.run.app',
        changeOrigin: true,
      },
      '/geojson-mexico': {
        target: 'https://geodata.ucdavis.edu',
        changeOrigin: true,
        rewrite: () => '/gadm/gadm4.1/json/gadm41_MEX_1.json',
      },
    },
  },
})
