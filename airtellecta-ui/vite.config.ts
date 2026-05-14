import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
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
