const GRUPOS = [
  { label: '12-17', valor: 8.4,  widthClass: 'w-[45%]',  colorClass: 'bg-orange-400' },
  { label: '18-25', valor: 18.5, widthClass: 'w-full',    colorClass: 'bg-red-500'   },
  { label: '26-35', valor: 13.1, widthClass: 'w-[71%]',  colorClass: 'bg-amber-400' },
  { label: '36-50', valor: 9.6,  widthClass: 'w-[52%]',  colorClass: 'bg-yellow-400'},
  { label: '50+',   valor: 5.5,  widthClass: 'w-[30%]',  colorClass: 'bg-lime-500'  },
]

export function DemograficoChart() {
  return (
    <div className="metric-card-glass flex flex-col gap-4 p-5 rounded-[18px] h-full" data-testid="demografico-chart">
      <div>
        <p className="text-[15px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
          Demográfico
        </p>
        <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">Consumo por edad</p>
      </div>

      <div className="flex flex-col gap-3">
        {GRUPOS.map((g) => (
          <div key={g.label} className="flex items-center gap-3">
            <span className="text-[14px] font-semibold text-[#5580a8] dark:text-white/50 w-10 shrink-0 text-right">
              {g.label}
            </span>
            <div className="flex-1 bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
              <div className={`h-full rounded-full ${g.widthClass} ${g.colorClass}`} />
            </div>
            <span className="text-[15px] font-bold text-[#0c1f3f] dark:text-white w-10 shrink-0">
              {g.valor}%
            </span>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[#5580a8] dark:text-white/30 mt-auto">
        Fuente: ENCODAT 2023 · Población 12–65 años
      </p>
    </div>
  )
}
