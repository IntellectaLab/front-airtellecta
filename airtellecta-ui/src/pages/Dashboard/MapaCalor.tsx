import { EstadoCard, type EstadoRiesgo } from '../../components/EstadoCard/EstadoCard'
import { MapaVulnerabilidad }            from '../../components/MapaVulnerabilidad/MapaVulnerabilidad'
import { RankingEstados, type EstadoRanking } from '../../components/RankingEstados/RankingEstados'
import { DemograficoChart }              from '../../components/DemograficoChart/DemograficoChart'
import { ConsumoAnualChart }             from '../../components/ConsumoAnualChart/ConsumoAnualChart'
import { ErrorBanner }                   from '../../components/ErrorBanner/ErrorBanner'
import { useMapaEstatal }                from '../../hooks/useMapaEstatal'

function fmtMillones(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('es-MX')
}

function toCardRiesgo(prevalencia: number): EstadoRiesgo {
  if (prevalencia >= 20) return 'critico'
  if (prevalencia >= 15) return 'alto'
  return 'medio'
}

function toRankingRiesgo(prevalencia: number): EstadoRanking['riesgo'] {
  if (prevalencia >= 20) return 'critico'
  if (prevalencia >= 15) return 'alto'
  if (prevalencia >= 10) return 'medio'
  return 'bajo'
}

function CardSkeleton() {
  return (
    <div className="metric-card-glass flex flex-col gap-3 p-5 rounded-[18px] animate-pulse">
      <div className="h-3 w-20 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-10 w-24 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-3 w-36 rounded bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05]" />
    </div>
  )
}

export function MapaCalor() {
  const { data: estados, isLoading, isError, refetch } = useMapaEstatal()

  const sorted = [...(estados ?? [])].sort(
    (a, b) => Number(b.prevalencia) - Number(a.prevalencia)
  )

  const avg = sorted.length
    ? sorted.reduce((s, e) => s + Number(e.prevalencia), 0) / sorted.length
    : 0

  const top3 = sorted.slice(0, 3)

  const rankingData: EstadoRanking[] = sorted.map((e, i) => ({
    rank:   i + 1,
    nombre: e.nombre,
    valor:  Number(e.prevalencia),
    riesgo: toRankingRiesgo(Number(e.prevalencia)),
  }))

  return (
    <div className="flex flex-col gap-4" data-testid="mapa-calor">

      {isError && (
        <ErrorBanner
          message="No se pudo cargar el mapa estatal."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      )}

      {/* ── Fila 1 — Cards de estados críticos ── */}
      <div>
        <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Alerta de consumo
        </p>
        <h2 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white mb-4">
          Estados con mayor riesgo
        </h2>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[580px]:grid-cols-1">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : top3.map((e) => {
            const prev = Number(e.prevalencia)
            const diff = prev - avg
            return (
              <EstadoCard
                key={e.cveEntidad}
                estado={e.nombre}
                consumo={`${prev.toFixed(1)}%`}
                vsNacional={`${diff >= 0 ? '+' : ''}${diff.toFixed(1)}pp`}
                poblacion={fmtMillones(Number(e.fumadoresEstimados))}
                riesgo={toCardRiesgo(prev)}
              />
            )
          })}
        </div>
      </div>

      {/* ── Fila 2 — Mapa + Ranking ── */}
      <div className="grid grid-cols-2 gap-4">
        <MapaVulnerabilidad />
        <RankingEstados
          estados={rankingData.length ? rankingData : undefined}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* ── Fila 3 — Demográficos + Consumo anual ── */}
      <div className="grid grid-cols-2 gap-4">
        <DemograficoChart />
        <ConsumoAnualChart />
      </div>

    </div>
  )
}
