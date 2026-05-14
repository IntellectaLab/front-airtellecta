import { EmptyState }         from '../../components/EmptyState/EmptyState'
import { ErrorBanner }        from '../../components/ErrorBanner/ErrorBanner'
import { MapaVulnerabilidad } from '../../components/MapaVulnerabilidad/MapaVulnerabilidad'
import { TendenciaChart }     from '../../components/TendenciaChart/TendenciaChart'
import { GastoCampanasCard }  from '../../components/GastoCampanasCard/GastoCampanasCard'
import { DemograficoChart }   from '../../components/DemograficoChart/DemograficoChart'
import { useResumenNacional } from '../../hooks/useResumenNacional'

function fmtMillones(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('es-MX')
}

function fmtNumero(n: number): string {
  return n.toLocaleString('es-MX')
}

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
  </svg>
)

interface KpiCardProps {
  label:       string
  value:       string
  description: string
  descColor?:  string
  highlight?:  boolean
  icon?:       React.ReactNode
  testId?:     string
}

function KpiCard({ label, value, description, descColor, highlight, icon, testId }: KpiCardProps) {
  return (
    <div
      className={`metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px] ${highlight ? 'metric-card-glass--highlight' : ''}`}
      data-testid={testId ?? 'kpi-card'}
    >
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className={highlight ? 'text-green-600 dark:text-green-400' : 'text-[#5580a8] dark:text-white/35'}>
            {icon}
          </span>
        )}
        <p className={`text-[13px] font-bold tracking-[0.8px] uppercase ${highlight ? 'text-green-700 dark:text-green-400' : 'text-[#5580a8] dark:text-white/35'}`}>
          {label}
        </p>
      </div>
      <p className={`font-display text-[38px] font-extrabold leading-none tracking-[-1.5px] ${highlight ? 'text-green-700 dark:text-green-400' : 'text-[#0c1f3f] dark:text-white'}`}>
        {value}
      </p>
      <p className={`text-[14px] leading-[1.4] ${descColor ?? 'text-[#5580a8] dark:text-white/40'}`}>
        {description}
      </p>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px] animate-pulse">
      <div className="h-3 w-24 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-10 w-32 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-3 w-40 rounded bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05]" />
    </div>
  )
}

export function ResumenNacional() {
  const { data, isLoading, isError, refetch } = useResumenNacional()

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
        <EmptyState title="Sin datos disponibles" description="No hay información de consumo para el período seleccionado." />
      )}

      {/* ── Fila 1 — 4 KPI cards ── */}
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
              label="Prevalencia fumadores"
              value={`${Number(data.prevalenciaFumadores).toFixed(1)}%`}
              description="de la población adulta"
              testId="kpi-prevalencia"
            />
            <KpiCard
              label="Costo en salud pública"
              value={`$${fmtMillones(data.defuncionesF17)}`}
              description="↑ defunciones F17"
              descColor="text-red-500 dark:text-red-400 font-medium"
              testId="kpi-salud"
            />
            <KpiCard
              label="Vapeadores activos"
              value={fmtMillones(data.usuariosVapeo)}
              description="usuarios de vapeo estimados"
              highlight
              icon={<SparkleIcon />}
              testId="kpi-vapeadores"
            />
            <KpiCard
              label="Urgencias relacionadas"
              value={fmtNumero(data.urgenciasF17)}
              description="urgencias F17 registradas"
              icon={<TrendUpIcon />}
              testId="kpi-urgencias"
            />
          </>
        ) : null}
      </div>

      {/* ── Fila 2 — Mapa (3/5) + Consumo por edad (2/5) ── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <MapaVulnerabilidad />
        </div>
        <div className="col-span-2">
          <DemograficoChart />
        </div>
      </div>

      {/* ── Fila 3 — Gasto campañas (3/5) + Consumo anual (2/5) ── */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <GastoCampanasCard />
        </div>
        <div className="col-span-2">
          <TendenciaChart />
        </div>
      </div>

    </div>
  )
}
