import { EmptyState }          from '../../components/EmptyState/EmptyState'
import { ErrorBanner }         from '../../components/ErrorBanner/ErrorBanner'
import { MapaVulnerabilidad }  from '../../components/MapaVulnerabilidad/MapaVulnerabilidad'
import { TendenciaChart }      from '../../components/TendenciaChart/TendenciaChart'
import { BalanceFiscalCard }   from '../../components/BalanceFiscalCard/BalanceFiscalCard'
import { DemograficoChart }    from '../../components/DemograficoChart/DemograficoChart'
import { useDashboardData }    from '../../hooks/useDashboardData'

function fmtMdp(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)},000`
  return `$${n.toLocaleString('es-MX')}`
}

function fmtNumero(n: number): string {
  return n.toLocaleString('es-MX')
}

// ── KPI Card ─────────────────────────────────────────────────

interface KpiCardProps {
  label:       string
  value:       string
  description: string
  descColor?:  string
  variant?:    'default' | 'critical' | 'warning'
  valueColor?: string
  source?:     string
  testId?:     string
}

function KpiCard({ label, value, description, descColor, variant = 'default', valueColor, source, testId }: KpiCardProps) {
  const variantClass = variant === 'critical'
    ? 'metric-card-glass--critical'
    : variant === 'warning'
      ? 'metric-card-glass--warning'
      : ''

  return (
    <div
      className={`metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px] ${variantClass}`}
      data-testid={testId ?? 'kpi-card'}
    >
      <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
        {label}
      </p>
      <p className={`font-display text-[43px] font-extrabold leading-none tracking-[-1.5px] ${valueColor ?? 'text-[#0c1f3f] dark:text-white'}`}>
        {value}
      </p>
      <p className={`text-[16px] leading-[1.4] ${descColor ?? 'text-[#5580a8] dark:text-white/40'}`}>
        {description}
      </p>
      {source && (
        <p className="text-[10px] text-[#5580a8]/50 dark:text-white/15 mt-0.5">{source}</p>
      )}
    </div>
  )
}

// ── Deficit Card (special two-line layout) ────────────────────

interface DeficitCardProps {
  ieps: number
  costo: number
  anioIeps: number
}

function DeficitCard({ ieps, costo, anioIeps }: DeficitCardProps) {
  const deficit = costo - ieps

  return (
    <div
      className="metric-card-glass metric-card-glass--warning flex flex-col gap-2 p-5 rounded-[18px]"
      data-testid="kpi-deficit"
    >
      <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-amber-600 dark:text-amber-400">
        Balance Fiscal Tabaco
      </p>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-[#5580a8] dark:text-white/40">Recauda</span>
          <span className="font-display text-[22px] font-extrabold text-green-600 dark:text-green-400">
            {fmtMdp(ieps)} MDP
          </span>
          <span className="text-[10px] text-[#5580a8]/50 dark:text-white/20">IEPS {anioIeps}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-[#5580a8] dark:text-white/40">Gasta</span>
          <span className="font-display text-[22px] font-extrabold text-red-500 dark:text-red-400">
            {fmtMdp(costo)} MDP
          </span>
          <span className="text-[10px] text-[#5580a8]/50 dark:text-white/20">salud directa</span>
        </div>
      </div>
      {deficit > 0 && (
        <span className="self-start px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 text-[13px] font-bold border border-red-200 dark:border-red-500/25">
          −{fmtMdp(deficit)} MDP déficit
        </span>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px] animate-pulse">
      <div className="h-3 w-24 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-10 w-32 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-3 w-40 rounded bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05]" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────

export function ResumenNacional() {
  const { data, isLoading, isError, refetch } = useDashboardData()

  return (
    <div className="flex flex-col gap-4" data-testid="resumen-nacional">

      {isError && (
        <ErrorBanner
          message="No se pudo cargar el resumen nacional."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      )}

      {!data && !isLoading && !isError && (
        <EmptyState title="Sin datos disponibles" description="No hay información disponible para el período seleccionado." />
      )}

      {/* ── Row 1 — 4 KPI cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : data ? (
          <>
            <KpiCard
              label="Prevalencia Fumadores"
              value={`${Number(data.resumen.prevalenciaFumadores).toFixed(1)}%`}
              description={`${fmtNumero(data.resumen.poblacionFumadores)} fumadores adultos`}
              source="ENCODAT 2025"
              testId="kpi-prevalencia"
            />
            <KpiCard
              label="Costo en Salud Pública"
              value={`${fmtMdp(Number(data.panel.cargaEconomica.costoDirectoAnualMdp))} MDP`}
              description="costo directo anual en atención médica"
              descColor="text-red-500 dark:text-red-400 font-medium"
              variant="critical"
              testId="kpi-costo"
            />
            <DeficitCard
              ieps={Number(data.panel.recaudacion.iepsMasRecienteMdp)}
              costo={Number(data.panel.cargaEconomica.costoDirectoAnualMdp)}
              anioIeps={data.panel.recaudacion.anio}
            />
            <KpiCard
              label="Muertes por Tabaco"
              value={fmtNumero(data.panel.epidemiologia.defuncionesAtribuiblesAnual)}
              description="muertes atribuibles al tabaco por año"
              valueColor="text-red-600 dark:text-red-400"
              source="GBD 2023 × INEGI EDR 2023"
              testId="kpi-muertes"
            />
          </>
        ) : null}
      </div>

      {/* ── Row 2 — Map (3/5) + Demographics (2/5) ── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <MapaVulnerabilidad />
        </div>
        <div className="col-span-2">
          <DemograficoChart />
        </div>
      </div>

      {/* ── Row 3 — Fiscal Balance (3/5) + Trends (2/5) ── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          {data ? (
            <BalanceFiscalCard
              iepsRecaudado={Number(data.panel.recaudacion.iepsMasRecienteMdp)}
              costoDirecto={Number(data.panel.cargaEconomica.costoDirectoAnualMdp)}
              costoSocial={Number(data.panel.cargaEconomica.costoSocialAnualMdp)}
              inversionPrevencion={Number(data.panel.cargaEconomica.inversionPrevencionMdp)}
              anioIeps={data.panel.recaudacion.anio}
            />
          ) : (
            <div className="metric-card-glass rounded-[18px] p-5 h-64 animate-pulse" />
          )}
        </div>
        <div className="col-span-2">
          <TendenciaChart />
        </div>
      </div>

    </div>
  )
}
