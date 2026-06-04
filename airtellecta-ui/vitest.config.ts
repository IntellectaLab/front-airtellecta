// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   80,
        statements: 80,
      },
      exclude: [
        'node_modules/**',
        'src/test/**',
        'src/stories/**',
        '**/*.stories.tsx',
        'src/main.tsx',
        'src/firebase.ts',
        'src/lib/firebase.ts',
        'src/lib/chartCapture.ts',
        'cypress/**',
        'docs/**',
        // Chart/visualization components (require recharts/d3 rendering, tested via E2E)
        'src/components/ComparisonChart/**',
        'src/components/ConsumoAnualChart/**',
        'src/components/DemograficoChart/**',
        'src/components/DonutChart/**',
        'src/components/TendenciaChart/**',
        'src/components/GastoCampanasCard/**',
        'src/components/RankingEstados/**',
        'src/components/EstadoCard/**',
        // Map components (require Google Maps API and d3-geo)
        'src/components/MapaVulnerabilidad/**',
        // PDF report components (require @react-pdf/renderer rendering)
        'src/components/reports/**',
        // Sidebar and VerificationBadge (visual navigation, tested via E2E)
        'src/components/Sidebar/**',
        'src/components/VerificationBadge/**',
        // Complex dashboard pages (tested via Cypress E2E)
        'src/pages/Dashboard/AdminUsuarios.tsx',
        'src/pages/Dashboard/BasesDatos.tsx',
        'src/pages/Dashboard/Correlaciones.tsx',
        'src/pages/Dashboard/DashboardLayout.tsx',
        'src/pages/Dashboard/MapaCalor.tsx',
        'src/pages/Dashboard/PanelEjecutivo.tsx',
        'src/pages/Dashboard/Simulador.tsx',
        'src/pages/Login/LoginPage.tsx',
        // Auth context (tested via ProtectedRoute + hooks)
        'src/context/**',
        // App router (tested via Cypress E2E)
        'src/App.tsx',
        // Type definitions (no logic to test)
        'src/types/**',
        // API service layer (requires Firebase auth + fetch, tested via Cypress E2E)
        'src/services/**',
      ],
    },
  },
})
