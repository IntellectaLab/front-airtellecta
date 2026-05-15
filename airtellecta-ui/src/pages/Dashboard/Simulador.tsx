import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorBanner }  from '../../components/ErrorBanner/ErrorBanner'
import { useSimulacion } from '../../hooks/useSimulacion'
import { proyectarTendenciaBase } from '../../lib/simulacionModel'
import type { SimulacionRequest } from '../../types/api'

const POLITICAS = [
  { clave: 'ADVERTENCIAS',          label: 'Advertencias gráficas obligatorias' },
  { clave: 'PROHIBICION_PUBLICIDAD', label: 'Prohibición de publicidad y patrocinio' },
  { clave: 'ESPACIOS_LIBRES',       label: 'Espacios 100% libres de humo' },
  { clave: 'CESSATION',             label: 'Programas de cesación tabáquica' },
]

function fmtM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('es-MX')
}

export function Simulador() {
  const { mutate, reset, data, isPending, isError, error } = useSimulacion()

  const [politicas, setPoliticas] = useState<string[]>([])
  const [impuesto, setImpuesto]   = useState(75)
  const [horizonte, setHorizonte] = useState(5)

  function togglePolitica(clave: string) {
    setPoliticas((prev) =>
      prev.includes(clave) ? prev.filter((p) => p !== clave) : [...prev, clave]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const req: SimulacionRequest = {
      politicas:         politicas.length ? politicas : undefined,
      impuestoPctPrecio: impuesto,
      horizonteAnios:    horizonte,
    }
    mutate(req)
  }

  function handleReset() {
    setPoliticas([])
    setImpuesto(75)
    setHorizonte(5)
    reset()
  }

  const chartData = useMemo(() => {
    if (!data) return []
    const anioInicio = data.proyeccion[0]?.anio ?? (new Date().getFullYear() + 1)
    const tendencia  = proyectarTendenciaBase(
      data.parametrosBase.prevalenciaBasePct,
      anioInicio,
      data.proyeccion.length,
    )
    return data.proyeccion.map((row, i) => ({
      anio:             row.anio,
      conIntervencion:  row.prevalenciaPct,
      sinIntervencion:  tendencia[i]?.sinIntervencion ?? null,
    }))
  }, [data])

  return (
    <div className="flex flex-col gap-6" data-testid="simulador">

      {/* ── Formulario ── */}
      <div className="metric-card-glass rounded-[18px] p-6" data-testid="simulador-form-card">
        <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Política fiscal y de salud
        </p>
        <h2 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white mb-6">
          Configurar simulación
        </h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit} data-testid="simulador-form">

          {/* Políticas */}
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60">
              Políticas adicionales de control
            </p>
            <div className="grid grid-cols-2 gap-3">
              {POLITICAS.map((p) => {
                const checked = politicas.includes(p.clave)
                return (
                  <label
                    key={p.clave}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer border transition-colors ${
                      checked
                        ? 'bg-[rgba(26,86,219,0.08)] border-[rgba(26,86,219,0.30)] dark:bg-[rgba(147,197,253,0.10)] dark:border-[rgba(147,197,253,0.25)]'
                        : 'border-[rgba(180,210,240,0.35)] dark:border-white/[0.08] hover:border-[rgba(180,210,240,0.60)] dark:hover:border-white/[0.15]'
                    }`}
                    data-testid={`politica-${p.clave.toLowerCase()}`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#2563eb]"
                      checked={checked}
                      onChange={() => togglePolitica(p.clave)}
                    />
                    <span className="text-[13px] font-medium text-[#0c1f3f] dark:text-white/80">
                      {p.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Impuesto */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60">
                Impuesto IEPS como % del precio
              </p>
              <span className="font-display text-[22px] font-extrabold text-[#2563eb] dark:text-[#93c5fd]" data-testid="impuesto-valor">
                {impuesto}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={150}
              step={5}
              value={impuesto}
              onChange={(e) => setImpuesto(Number(e.target.value))}
              className="w-full accent-[#2563eb]"
              data-testid="impuesto-slider"
            />
            <div className="flex justify-between text-[11px] text-[#5580a8] dark:text-white/35">
              <span>0%</span>
              <span>75% (actual)</span>
              <span>150%</span>
            </div>
          </div>

          {/* Horizonte */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60">
                Horizonte de proyección
              </p>
              <span className="font-display text-[22px] font-extrabold text-[#2563eb] dark:text-[#93c5fd]" data-testid="horizonte-valor">
                {horizonte} años
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={horizonte}
              onChange={(e) => setHorizonte(Number(e.target.value))}
              className="w-full accent-[#2563eb]"
              data-testid="horizonte-slider"
            />
            <div className="flex justify-between text-[11px] text-[#5580a8] dark:text-white/35">
              <span>1 año</span>
              <span>10 años</span>
              <span>20 años</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary-glass flex-1 py-[13px] text-[15px] font-bold tracking-[0.3px] border-none text-center rounded-[13px] font-sans disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isPending}
              data-testid="simulador-submit"
            >
              {isPending ? 'Calculando...' : 'Ejecutar simulación →'}
            </button>

            {(data ?? isError) && (
              <button
                type="button"
                className="btn-cancel-glass px-5 py-[13px] text-[14px] font-semibold rounded-[13px] border-none font-sans shrink-0"
                onClick={handleReset}
                data-testid="simulador-reset"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {isError && (
        <ErrorBanner
          message={`Error en la simulación: ${(error as Error)?.message ?? 'Intenta de nuevo.'}`}
        />
      )}

      {/* ── Resultados ── */}
      {data && (
        <>
          {/* Resumen final */}
          <div className="grid grid-cols-3 gap-4" data-testid="simulacion-resumen">
            {[
              {
                label: 'Prevalencia final',
                value: `${Number(data.resumenFinal.prevalenciaFinalPct).toFixed(1)}%`,
                sub:   `Reducción de ${Number(data.resumenFinal.reduccionPuntosPct).toFixed(1)}pp`,
                green: true,
              },
              {
                label: 'Fumadores evitados',
                value: fmtM(data.resumenFinal.fumadoresEvitadosTotal),
                sub:   'personas',
                green: true,
              },
              {
                label: 'Ahorro acumulado',
                value: `$${Number(data.resumenFinal.ahorroAcumuladoMdp).toLocaleString('es-MX')} Mdp`,
                sub:   `en ${horizonte} años`,
                green: true,
              },
            ].map((card) => (
              <div key={card.label} className="metric-card-glass flex flex-col gap-2.5 p-5 rounded-[18px]">
                <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
                  {card.label}
                </p>
                <p className={`font-display text-[32px] font-extrabold leading-none tracking-[-1.2px] ${card.green ? 'text-green-700 dark:text-green-400' : 'text-[#0c1f3f] dark:text-white'}`}>
                  {card.value}
                </p>
                <p className="text-[13px] text-[#5580a8] dark:text-white/40">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfica de pronóstico */}
          <div className="metric-card-glass rounded-[18px] p-5" data-testid="grafica-pronostico">
            <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
              Pronóstico epidemiológico
            </p>
            <p className="text-[20px] font-semibold text-[#0c1f3f] dark:text-white mb-5">
              Prevalencia proyectada (%)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,210,240,0.25)" />
                <XAxis
                  dataKey="anio"
                  tick={{ fontSize: 11, fill: '#5580a8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fontSize: 11, fill: '#5580a8' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.92)',
                    border: '1px solid rgba(180,210,240,0.5)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'conIntervencion' ? 'Con intervención' : 'Tendencia base',
                  ]}
                  labelFormatter={(label) => `Año ${label}`}
                />
                <ReferenceLine
                  y={data?.parametrosBase.prevalenciaBasePct}
                  stroke="rgba(180,210,240,0.6)"
                  strokeDasharray="4 4"
                  label={{ value: 'Base', fontSize: 10, fill: '#5580a8', position: 'insideRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="sinIntervencion"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                  name="sinIntervencion"
                />
                <Line
                  type="monotone"
                  dataKey="conIntervencion"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                  name="conIntervencion"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-[#2563eb] rounded-full shrink-0" />
                <span className="text-[11px] text-[#5580a8] dark:text-white/40">Con intervención</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex gap-0.5 shrink-0">
                  <span className="w-2 h-0.5 bg-[#94a3b8] rounded-full" />
                  <span className="w-2 h-0.5 bg-[#94a3b8] rounded-full" />
                </span>
                <span className="text-[11px] text-[#5580a8] dark:text-white/40">Tendencia base</span>
              </div>
            </div>
          </div>

          {/* Tabla proyección anual */}
          <div className="metric-card-glass rounded-[18px] overflow-hidden" data-testid="tabla-proyeccion">
            <div className="px-5 pt-5 pb-3 border-b border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
              <p className="text-[20px] font-semibold text-[#0c1f3f] dark:text-white">
                Proyección anual
              </p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
                    <th className="text-left px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Año</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Prevalencia</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Fumadores</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Defunciones evitadas</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">Ahorro (Mdp)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.proyeccion.map((row) => (
                    <tr
                      key={row.anio}
                      className="border-b border-[rgba(180,210,240,0.10)] dark:border-white/[0.04] hover:bg-[rgba(180,210,240,0.10)] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-[#0c1f3f] dark:text-white">{row.anio}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-[#3a5a80] dark:text-white/70">
                        {Number(row.prevalenciaPct).toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-[#3a5a80] dark:text-white/70">
                        {fmtM(row.fumadoresAbsolutos)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-green-600 dark:text-green-400 font-semibold">
                        {fmtM(row.defuncionesEvitadas)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold text-[#0c1f3f] dark:text-white">
                        ${Number(row.ahorroMdp).toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Políticas aplicadas */}
          {data.politicasAplicadas?.length > 0 && (
            <div className="metric-card-glass rounded-[18px] p-5">
              <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-3">
                Efectos aplicados
              </p>
              <div className="flex flex-wrap gap-2">
                {data.politicasAplicadas.map((p) => (
                  <span
                    key={p.clave}
                    className="px-3 py-1.5 rounded-full bg-[rgba(26,86,219,0.08)] dark:bg-[rgba(147,197,253,0.10)] border border-[rgba(26,86,219,0.20)] dark:border-[rgba(147,197,253,0.20)] text-[12px] font-semibold text-[#1344c4] dark:text-[#93c5fd]"
                  >
                    {p.nombre} ({Number(p.efectoPct).toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}
