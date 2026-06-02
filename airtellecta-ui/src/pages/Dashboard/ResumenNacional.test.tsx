import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

// Mock heavy components that aren't relevant to this test
vi.mock('../../components/MapaVulnerabilidad/MapaVulnerabilidad', () => ({
  MapaVulnerabilidad: () => createElement('div', { 'data-testid': 'mapa-vulnerabilidad' }),
}))
vi.mock('../../components/TendenciaChart/TendenciaChart', () => ({
  TendenciaChart: () => createElement('div', { 'data-testid': 'tendencia-chart' }),
}))
vi.mock('../../components/GastoCampanasCard/GastoCampanasCard', () => ({
  GastoCampanasCard: () => createElement('div', { 'data-testid': 'gasto-campanas' }),
}))
vi.mock('../../components/DemograficoChart/DemograficoChart', () => ({
  DemograficoChart: () => createElement('div', { 'data-testid': 'demografico-chart' }),
}))

vi.mock('../../services/api', () => ({
  apiService: {
    resumenNacional: vi.fn(),
  },
}))

import { apiService } from '../../services/api'
import { ResumenNacional } from './ResumenNacional'

const mockResumenNacional = vi.mocked(apiService.resumenNacional)

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(createElement(QueryClientProvider, { client: queryClient }, ui))
}

const mockData = {
  prevalenciaFumadores: 16.4,
  defuncionesF17: 1_500_000,
  usuariosVapeo: 2_200_000,
  urgenciasF17: 45_230,
}

describe('ResumenNacional', () => {
  beforeEach(() => vi.clearAllMocks())

  it('muestra skeletons mientras carga', () => {
    mockResumenNacional.mockReturnValueOnce(new Promise(() => {}))
    renderWithQueryClient(<ResumenNacional />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('muestra los KPI cards cuando hay datos', async () => {
    mockResumenNacional.mockResolvedValueOnce(mockData as any)
    renderWithQueryClient(<ResumenNacional />)

    await waitFor(() => expect(screen.getByTestId('kpi-prevalencia')).toBeInTheDocument())
    expect(screen.getByTestId('kpi-salud')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-vapeadores')).toBeInTheDocument()
    expect(screen.getByTestId('kpi-urgencias')).toBeInTheDocument()
  })

  it('muestra ErrorBanner cuando la petición falla', async () => {
    mockResumenNacional.mockRejectedValueOnce(new Error('Error'))
    renderWithQueryClient(<ResumenNacional />)

    await waitFor(() =>
      expect(screen.getByTestId('error-banner')).toBeInTheDocument()
    )
    expect(screen.getByText('No se pudo cargar el resumen nacional.')).toBeInTheDocument()
  })

  it('el botón "Reintentar" llama refetch y carga datos', async () => {
    mockResumenNacional
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce(mockData as any)

    renderWithQueryClient(<ResumenNacional />)

    await waitFor(() => screen.getByRole('button', { name: 'Reintentar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() =>
      expect(screen.getByTestId('kpi-prevalencia')).toBeInTheDocument()
    )
  })

  it('tiene data-testid="resumen-nacional"', () => {
    mockResumenNacional.mockReturnValueOnce(new Promise(() => {}))
    renderWithQueryClient(<ResumenNacional />)
    expect(screen.getByTestId('resumen-nacional')).toBeInTheDocument()
  })
})
