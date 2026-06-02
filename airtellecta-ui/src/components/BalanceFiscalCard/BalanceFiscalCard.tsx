interface FiscalBarProps {
  label: string
  value: number
  maxValue: number
  color: string
  textColor: string
}

function FiscalBar({ label, value, maxValue, color, textColor }: FiscalBarProps) {
  const widthPct = Math.min((value / maxValue) * 100, 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[13px] text-[#5580a8] dark:text-white/50">{label}</span>
        <span className={`text-[14px] font-bold ${textColor}`}>
          ${value.toLocaleString('es-MX')} MDP
        </span>
      </div>
      <div className="h-3 rounded-full bg-[rgba(180,210,240,0.15)] dark:bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${widthPct}%`, background: color }}
        />
      </div>
    </div>
  )
}

interface BalanceFiscalCardProps {
  iepsRecaudado: number
  costoDirecto: number
  costoSocial: number
  inversionPrevencion: number
  anioIeps: number
}

export function BalanceFiscalCard({
  iepsRecaudado,
  costoDirecto,
  costoSocial,
  inversionPrevencion,
  anioIeps,
}: BalanceFiscalCardProps) {
  const maxValue = Math.max(iepsRecaudado, costoDirecto, costoSocial)
  const deficit = costoDirecto - iepsRecaudado

  return (
    <div className="metric-card-glass flex flex-col gap-4 p-5 rounded-[18px]" data-testid="balance-fiscal">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[15px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
            Balance Fiscal del Tabaco
          </p>
          <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
            Recaudación vs. costo en salud
          </p>
        </div>
        {deficit > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 text-[13px] font-bold border border-red-200 dark:border-red-500/25 shrink-0">
            −${deficit.toLocaleString('es-MX')} MDP déficit
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-3">
        <FiscalBar
          label={`Recaudación IEPS ${anioIeps}`}
          value={iepsRecaudado}
          maxValue={maxValue}
          color="#22c55e"
          textColor="text-green-600 dark:text-green-400"
        />
        <FiscalBar
          label="Costo directo en salud"
          value={costoDirecto}
          maxValue={maxValue}
          color="#ef4444"
          textColor="text-red-600 dark:text-red-400"
        />
        <FiscalBar
          label="Costo social total"
          value={costoSocial}
          maxValue={maxValue}
          color="#991b1b"
          textColor="text-red-800 dark:text-red-300"
        />
      </div>

      {/* Investment callout */}
      <div className="rounded-[12px] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 px-3.5 py-2.5">
        <div className="flex justify-between items-center">
          <p className="text-[13px] font-semibold text-amber-700 dark:text-amber-400">
            Inversión en prevención
          </p>
          <p className="font-display text-[18px] font-extrabold text-amber-700 dark:text-amber-400">
            ${inversionPrevencion.toLocaleString('es-MX')} MDP
          </p>
        </div>
      </div>

      {/* Sources */}
      <p className="text-[10px] text-[#5580a8]/60 dark:text-white/20">
        Fuentes: SHCP · INSP · Reynales-Shigematsu et al.
      </p>
    </div>
  )
}
