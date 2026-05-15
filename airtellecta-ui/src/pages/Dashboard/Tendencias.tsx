import { ErrorBanner }  from '../../components/ErrorBanner/ErrorBanner'
import { EmptyState }   from '../../components/EmptyState/EmptyState'
import { useTendencias } from '../../hooks/useTendencias'

interface StatPairProps {
  label:   string
  val2016: string
  val2025: string
  delta?:  string
  deltaUp?: boolean
  testId?: string
}

function StatPair({ label, val2016, val2025, delta, deltaUp, testId }: StatPairProps) {
  return (
    <div className="metric-card-glass flex flex-col gap-3 p-5 rounded-[18px]" data-testid={testId ?? 'stat-pair'}>
      <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-[#5580a8] dark:text-white/35 mb-1">2016</p>
          <p className="font-display text-[30px] font-extrabold text-[#5580a8] dark:text-white/50 leading-none tracking-[-1px]">
            {val2016}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-[#5580a8] dark:text-white/35 mb-1">2025</p>
          <p className="font-display text-[30px] font-extrabold text-[#0c1f3f] dark:text-white leading-none tracking-[-1px]">
            {val2025}
          </p>
        </div>
      </div>
      {delta && (
        <p className={`text-[13px] font-semibold ${deltaUp ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {delta}
        </p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="metric-card-glass flex flex-col gap-3 p-5 rounded-[18px] animate-pulse">
      <div className="h-3 w-24 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-8 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
        <div className="h-8 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      </div>
    </div>
  )
}

function fmtM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('es-MX')
}

export function Tendencias() {
  const { data, isLoading, isError, refetch } = useTendencias()

  return (
    <div className="flex flex-col gap-6" data-testid="tendencias">

      {isError && (
        <ErrorBanner
          message="No se pudo cargar los datos de tendencias."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      )}

      {!data && !isLoading && !isError && (
        <EmptyState title="Sin datos" description="No hay información de tendencias disponible." />
      )}

      <div>
        <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Comparativa histórica
        </p>
        <h2 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white mb-4">
          Evolución 2016 – 2025
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : data ? (
            <>
              <StatPair
                label="Prevalencia fumadores"
                val2016={`${Number(data.prevalencia2016).toFixed(1)}%`}
                val2025={`${Number(data.prevalencia2025).toFixed(1)}%`}
                delta={`Δ ${Number(data.deltaPp).toFixed(1)}pp`}
                deltaUp={Number(data.deltaPp) > 0}
                testId="stat-prevalencia"
              />
              <StatPair
                label="Fumadores estimados"
                val2016={fmtM(data.fumadores2016)}
                val2025={fmtM(data.fumadores2025)}
                delta={
                  data.fumadores2025 > data.fumadores2016
                    ? `+${fmtM(data.fumadores2025 - data.fumadores2016)} vs. 2016`
                    : `${fmtM(data.fumadores2025 - data.fumadores2016)} vs. 2016`
                }
                deltaUp={data.fumadores2025 > data.fumadores2016}
                testId="stat-fumadores"
              />
              <StatPair
                label="Usuarios de vapeo"
                val2016={fmtM(data.vapeo2016)}
                val2025={fmtM(data.vapeo2025)}
                delta={
                  data.vapeo2025 > data.vapeo2016
                    ? `+${fmtM(data.vapeo2025 - data.vapeo2016)} usuarios nuevos`
                    : `${fmtM(data.vapeo2025 - data.vapeo2016)} vs. 2016`
                }
                deltaUp={data.vapeo2025 > data.vapeo2016}
                testId="stat-vapeo"
              />
            </>
          ) : null}
        </div>
      </div>

      {/* ── Tabla detalle ── */}
      {data && (
        <div className="metric-card-glass rounded-[18px] overflow-hidden" data-testid="tabla-tendencias">
          <div className="px-5 pt-5 pb-3 border-b border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
            <p className="text-[20px] font-semibold text-[#0c1f3f] dark:text-white">
              Tabla comparativa
            </p>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Indicador</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">2016</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">2025</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Variación</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Prevalencia fumadores',
                    v16: `${Number(data.prevalencia2016).toFixed(1)}%`,
                    v25: `${Number(data.prevalencia2025).toFixed(1)}%`,
                    diff: Number(data.deltaPp).toFixed(1) + 'pp',
                    up: Number(data.deltaPp) > 0,
                  },
                  {
                    label: 'Fumadores estimados',
                    v16: fmtM(data.fumadores2016),
                    v25: fmtM(data.fumadores2025),
                    diff: (data.fumadores2025 > data.fumadores2016 ? '+' : '') + fmtM(data.fumadores2025 - data.fumadores2016),
                    up: data.fumadores2025 > data.fumadores2016,
                  },
                  {
                    label: 'Usuarios vapeo',
                    v16: fmtM(data.vapeo2016),
                    v25: fmtM(data.vapeo2025),
                    diff: (data.vapeo2025 > data.vapeo2016 ? '+' : '') + fmtM(data.vapeo2025 - data.vapeo2016),
                    up: data.vapeo2025 > data.vapeo2016,
                  },
                  {
                    label: 'Uso dual (tabaco + vapeo)',
                    v16: fmtM(data.dual2016),
                    v25: fmtM(data.dual2025),
                    diff: (data.dual2025 > data.dual2016 ? '+' : '') + fmtM(data.dual2025 - data.dual2016),
                    up: data.dual2025 > data.dual2016,
                  },
                ].map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-[rgba(180,210,240,0.10)] dark:border-white/[0.04] hover:bg-[rgba(180,210,240,0.10)] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3 text-[#0c1f3f] dark:text-white/80 font-medium">{row.label}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-[#5580a8] dark:text-white/50">{row.v16}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#0c1f3f] dark:text-white">{row.v25}</td>
                    <td className={`px-5 py-3 text-right tabular-nums font-bold ${row.up ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {row.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
