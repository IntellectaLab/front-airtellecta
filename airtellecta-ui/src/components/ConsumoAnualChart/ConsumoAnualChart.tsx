import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts'

const DATA = [
  { año: '2017', valor: 14.2, proyectado: false },
  { año: '2018', valor: 15.1, proyectado: false },
  { año: '2019', valor: 16.3, proyectado: false },
  { año: '2020', valor: 15.8, proyectado: false },
  { año: '2021', valor: 16.9, proyectado: false },
  { año: '2022', valor: 17.8, proyectado: false },
  { año: '2023', valor: 18.5, proyectado: false },
  { año: '2024', valor: 19.1, proyectado: false },
  { año: '2025', valor: 18.5, proyectado: false },
  { año: '2026', valor: 19.8, proyectado: true  },
]

interface TipProps { active?: boolean; payload?: { value: number }[]; label?: string }

const CustomTooltip = ({ active, payload, label }: TipProps) => {
  if (!active || !payload?.length) return null
  const entry = DATA.find((d) => d.año === label)
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[10px] px-3 py-2 shadow-lg text-[14px]">
      <p className="font-bold text-slate-700 dark:text-white mb-0.5">
        {label}{entry?.proyectado ? ' (proyectado)' : ''}
      </p>
      <p className="text-slate-500 dark:text-white/50">
        Consumo: <strong>{payload[0].value}%</strong>
      </p>
    </div>
  )
}

export function ConsumoAnualChart() {
  return (
    <div className="metric-card-glass flex flex-col gap-3 p-5 rounded-[18px]" data-testid="consumo-anual-chart">
      <div>
        <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
          Consumo por año
        </p>
        <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
          Evolución nacional 2017–2026
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,200,0.12)" vertical={false} />
          <XAxis dataKey="año" tick={{ fontSize: 11, fill: '#5580a8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#5580a8' }} unit="%" domain={[0, 25]} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
          <Bar dataKey="valor" radius={[5, 5, 0, 0]}>
            {DATA.map((entry) => (
              <Cell key={entry.año} fill={entry.proyectado ? 'rgba(37,99,235,0.35)' : '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 text-[13px] text-[#5580a8] dark:text-white/40">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[3px] bg-[#2563eb] shrink-0" />
          <span>Consumo registrado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[3px] bg-[rgba(37,99,235,0.35)] shrink-0" />
          <span>Proyectado</span>
        </div>
      </div>
    </div>
  )
}
