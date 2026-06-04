import { ErrorBanner }        from '../../components/ErrorBanner/ErrorBanner'
import { EmptyState }         from '../../components/EmptyState/EmptyState'
import { usePanelEjecutivo }  from '../../hooks/usePanelEjecutivo'
import { VerificationBadge }  from '../../components/VerificationBadge/VerificationBadge'
import { ExportButtons }      from '../../components/reports/ExportButtons'
import { PanelEjecutivoReport } from '../../components/reports/PanelEjecutivoReport'
import { useAuth }            from '../../context/AuthContext'

function fmtMdp(n: number): string {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Mdp`
}

function KpiSkeleton() {
  return (
    <div className="metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px] animate-pulse">
      <div className="h-3 w-28 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-9 w-36 rounded bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.08]" />
      <div className="h-3 w-44 rounded bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05]" />
    </div>
  )
}

interface KpiCardProps {
  label:       string
  value:       string
  description: string
  accent?:     'default' | 'red' | 'green'
  testId?:     string
}

function KpiCard({ label, value, description, accent = 'default', testId }: KpiCardProps) {
  const valClass =
    accent === 'red'   ? 'text-red-600 dark:text-red-400' :
    accent === 'green' ? 'text-green-700 dark:text-green-400' :
                         'text-[#0c1f3f] dark:text-white'

  return (
    <div className="metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px]" data-testid={testId ?? 'kpi-card'}>
      <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
        {label}
      </p>
      <p className={`font-display text-[39px] font-extrabold leading-none tracking-[-1.5px] ${valClass}`}>
        {value}
      </p>
      <p className="text-[16px] leading-[1.4] text-[#5580a8] dark:text-white/40">
        {description}
      </p>
    </div>
  )
}

export function PanelEjecutivo() {
  const { data, isLoading, isError, refetch } = usePanelEjecutivo()
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6" data-testid="panel-ejecutivo">

      {isError && (
        <ErrorBanner
          message="No se pudo cargar el panel ejecutivo."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      )}

      {!data && !isLoading && !isError && (
        <EmptyState title="Sin datos" description="No hay información disponible en este momento." />
      )}

      {/* ── KPIs ── */}
      <div>
        <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Indicadores clave
        </p>
        <h2 className="font-display text-[22px] font-extrabold text-[#0c1f3f] dark:text-white mb-4">
          Resumen ejecutivo nacional
        </h2>

        {data && (
          <div className="flex justify-end mb-4">
            <ExportButtons
              pdfDocument={
                <PanelEjecutivoReport
                  data={data}
                  userName={user?.displayName || user?.email || 'Usuario'}
                />
              }
              pdfFileName={`panel-ejecutivo-airtellecta-${new Date().toISOString().slice(0, 10)}.pdf`}
              onExcelDownload={async () => {
                const { apiService } = await import('../../services/api')
                await apiService.exportPanelEjecutivoExcel()
              }}
              onPdfDownload={() => {
                import('../../services/api').then(({ apiService }) => apiService.logPanelEjecutivoPdf())
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : data ? (
            <>
              <KpiCard
                label="Costo directo en salud"
                value={fmtMdp(data.cargaEconomica.costoDirectoAnualMdp)}
                description="costo anual directo al sistema de salud"
                accent="red"
                testId="kpi-costo-directo"
              />
              <KpiCard
                label="Recaudación IEPS"
                value={fmtMdp(data.recaudacion.iepsMasRecienteMdp)}
                description={`último dato disponible (${data.recaudacion.anio})`}
                accent="green"
                testId="kpi-recaudacion"
              />
              <KpiCard
                label="Prevalencia actual"
                value={`${Number(data.epidemiologia.prevalenciaActualPct).toFixed(1)}%`}
                description={`Δ ${Number(data.epidemiologia.deltaPp).toFixed(1)}pp vs. referencia histórica`}
                testId="kpi-prevalencia"
              />
            </>
          ) : null}
        </div>
      </div>

      {/* ── Costos por patología ── */}
      {data?.costosPorPatologia && data.costosPorPatologia.length > 0 && (
        <div className="metric-card-glass rounded-[18px] overflow-hidden" data-testid="tabla-costos-patologia">
          <div className="px-5 pt-5 pb-3 border-b border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
            <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
              Desglose económico
            </p>
            <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
              Costos por patología atribuible
            </p>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm" data-testid="costos-table">
              <thead>
                <tr className="border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
                  <th className="text-left px-5 py-3 text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Código</th>
                  <th className="text-left px-5 py-3 text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Trastorno</th>
                  <th className="text-right px-5 py-3 text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Costo 2025</th>
                  <th className="text-right px-5 py-3 text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {data.costosPorPatologia.map((c) => (
                  <tr
                    key={c.codigo}
                    className="border-b border-[rgba(180,210,240,0.10)] dark:border-white/[0.04] hover:bg-[rgba(180,210,240,0.10)] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[14px] text-[#2563eb] dark:text-[#93c5fd]">{c.codigo}</td>
                    <td className="px-5 py-3 text-[#0c1f3f] dark:text-white/80 max-w-[260px]">{c.trastorno}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#0c1f3f] dark:text-white">
                      ${Number(c.costoAjustado2025).toLocaleString('es-MX')}
                    </td>
                    <td className="px-5 py-3 text-right text-[14px] text-[#5580a8] dark:text-white/40 max-w-[180px] truncate">
                      {c.fuente}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fuentes de datos ── */}
      {data?.cargaEconomica.fuentes && data.cargaEconomica.fuentes.length > 0 && (
        <div className="metric-card-glass rounded-[18px] p-5">
          <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-3">
            Fuentes y verificación
          </p>
          <div className="flex flex-col gap-2">
            {data.cargaEconomica.fuentes.map((f) => (
              <div key={f.campo} className="flex items-start gap-3 text-sm">
                <span className="text-[#2563eb] dark:text-[#93c5fd] font-semibold min-w-[140px] shrink-0">{f.campo}</span>
                <span className="text-[#3a5a80] dark:text-white/60">{f.fuente}</span>
                <VerificationBadge nivel={f.nivelVerificacion} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
