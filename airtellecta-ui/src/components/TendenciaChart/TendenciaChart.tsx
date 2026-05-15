import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts'

const DATA = [
  { year: "'18", vapeo: 8.2,  tabaco: 14.5 },
  { year: "'19", vapeo: 9.8,  tabaco: 14.1 },
  { year: "'20", vapeo: 11.4, tabaco: 13.8 },
  { year: "'21", vapeo: 13.6, tabaco: 13.2 },
  { year: "'22", vapeo: 15.2, tabaco: 12.9 },
  { year: "'23", vapeo: 16.8, tabaco: 12.5 },
  { year: "'24", vapeo: 18.0, tabaco: 12.1 },
  { year: "'25", vapeo: 19.4, tabaco: 11.8 },
]

interface TooltipEntry { name: string; value: number; color: string }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string }

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[10px] px-3 py-2 shadow-lg text-[14px]">
      <p className="font-bold text-slate-700 dark:text-white mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="my-0.5" style={{ color: e.color }}>
          {e.name}: <strong>{e.value}%</strong>
        </p>
      ))}
    </div>
  )
}

export function TendenciaChart() {
  return (
    <div className="metric-card-glass flex flex-col gap-3 p-5 rounded-[18px] h-full" data-testid="tendencia-chart">
      <div>
        <p className="text-[15px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
          Tendencia 2018–2025
        </p>
        <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">Consumo anual</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,200,0.15)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#5580a8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#5580a8' }} unit="%" domain={[0, 25]} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value) => <span className="text-[#5580a8] dark:text-white/50">{value}</span>}
          />
          <Line type="monotone" dataKey="vapeo"  name="Vapeo"  stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tabaco" name="Tabaco" stroke="#f97316" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
