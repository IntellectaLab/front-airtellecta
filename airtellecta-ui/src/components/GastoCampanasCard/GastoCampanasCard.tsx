import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const CANALES = [
  { name: 'Digital',  valor: 1_080_000, color: '#2563eb' },
  { name: 'TV',       valor:   600_000, color: '#7c3aed' },
  { name: 'Radio',    valor:   360_000, color: '#0891b2' },
  { name: 'Impresa',  valor:   360_000, color: '#059669' },
]
const TOTAL = CANALES.reduce((s, d) => s + d.valor, 0)

interface TooltipEntry { name: string; value: number; color?: string }
interface TipProps { active?: boolean; payload?: TooltipEntry[] }

const CustomTooltip = ({ active, payload }: TipProps) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[10px] px-3 py-2 shadow-lg text-[14px]">
      <p className="font-bold text-slate-700 dark:text-white">{d.name}</p>
      <p className="text-slate-500 dark:text-white/50">
        ${(d.value / 1_000_000).toFixed(1)}M · {((d.value / TOTAL) * 100).toFixed(0)}%
      </p>
    </div>
  )
}

export function GastoCampanasCard() {
  return (
    <div className="metric-card-glass flex flex-col gap-4 p-5 rounded-[18px]" data-testid="gasto-campanas">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
            Gasto Anual en Campañas
          </p>
          <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
            Actual vs. estrategia optimizada
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-[14px] font-bold border border-green-200 dark:border-green-500/25 shrink-0">
          -33%
        </span>
      </div>

      {/* Donut + Proyección */}
      <div className="grid grid-cols-2 gap-4">

        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-[#5580a8] dark:text-white/40">Distribución por canal — 2025</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={CANALES} dataKey="valor" cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} stroke="none">
                  {CANALES.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[13px] text-[#5580a8] dark:text-white/40">total</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {CANALES.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-[13px] text-[#5580a8] dark:text-white/50">{c.name}</span>
                </div>
                <span className="text-[13px] font-semibold text-[#0c1f3f] dark:text-white">
                  {((c.valor / TOTAL) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proyección */}
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-[#5580a8] dark:text-white/40">Proyección con segmentación</p>

          <div className="flex flex-col gap-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[14px] text-[#5580a8] dark:text-white/50">Actual</span>
                <span className="text-[14px] font-bold text-[#0c1f3f] dark:text-white">$2.4M</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.06] overflow-hidden">
                <div className="h-full w-full rounded-full bg-[#2563eb]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[14px] text-[#5580a8] dark:text-white/50">Optimizada</span>
                <span className="text-[14px] font-bold text-green-600 dark:text-green-400">$1.6M</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.06] overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>

          {/* Ahorro box */}
          <div className="mt-auto rounded-[12px] bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-green-700 dark:text-green-400">Ahorro total proyectado</p>
            <p className="font-display text-[25px] font-extrabold text-green-700 dark:text-green-400 leading-tight">$2.8M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
