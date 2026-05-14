import { ErrorBanner } from '../../components/ErrorBanner/ErrorBanner'
import { EmptyState }  from '../../components/EmptyState/EmptyState'
import { useCostos }   from '../../hooks/useCostos'

function TableSkeleton() {
  return (
    <div className="metric-card-glass rounded-[18px] overflow-hidden animate-pulse">
      <div className="px-5 pt-5 pb-3 border-b border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
        <div className="h-4 w-48 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08] mb-2" />
        <div className="h-6 w-72 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      </div>
      <div className="p-5 flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-[8px] bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.04]" />
        ))}
      </div>
    </div>
  )
}

export function Costos() {
  const { data, isLoading, isError, refetch } = useCostos()

  return (
    <div className="flex flex-col gap-6" data-testid="costos">

      {isError && (
        <ErrorBanner
          message="No se pudo cargar los costos por patología."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      )}

      {!data && !isLoading && !isError && (
        <EmptyState title="Sin datos" description="No hay información de costos disponible." />
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : data ? (
        <div className="metric-card-glass rounded-[18px] overflow-hidden" data-testid="tabla-costos">
          <div className="px-5 pt-5 pb-3 border-b border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
            <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
              Clasificación CIE-10
            </p>
            <p className="text-[20px] font-semibold text-[#0c1f3f] dark:text-white">
              Costos por patología atribuible al tabaco
            </p>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Código</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Trastorno</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Costo/paciente</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Ajustado 2025</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Año base</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c.codigo}
                    className="border-b border-[rgba(180,210,240,0.10)] dark:border-white/[0.04] hover:bg-[rgba(180,210,240,0.10)] dark:hover:bg-white/[0.03] transition-colors"
                    data-testid={`costo-row-${c.codigo}`}
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-[#2563eb] dark:text-[#93c5fd] whitespace-nowrap">
                      {c.codigo}
                    </td>
                    <td className="px-5 py-3 text-[#0c1f3f] dark:text-white/80 max-w-[280px]">
                      {c.trastorno}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-[#3a5a80] dark:text-white/60">
                      ${Number(c.costoPorPaciente).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#0c1f3f] dark:text-white">
                      ${Number(c.costoAjustado2025).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-[#5580a8] dark:text-white/40">
                      {c.anioBase}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[#5580a8] dark:text-white/40 max-w-[200px] truncate">
                      {c.fuente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
            <p className="text-[11px] text-[#5580a8] dark:text-white/30">
              Costos en MXN. Ajustados con inflación al año 2025. Fuentes: literatura científica indexada y registros institucionales IMSS/ISSSTE/SSA.
            </p>
          </div>
        </div>
      ) : null}

    </div>
  )
}
