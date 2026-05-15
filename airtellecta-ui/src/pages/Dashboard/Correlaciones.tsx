import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ── Datos epidemiológicos ─────────────────────────────────────────────────────
// Fuentes: ENCODAT 2016-17 (INSP/SS), revisiones sistemáticas OPS/OMS 2021,
// INSP Encuesta Nacional de Adicciones, estudios de cohorte LAC.

const DATOS_SUSTANCIAS = [
  { sustancia: 'Alcohol',         fumadores: 72.3, noFumadores: 38.4, ratio: 1.9 },
  { sustancia: 'Marihuana',       fumadores: 24.8, noFumadores:  6.8, ratio: 3.6 },
  { sustancia: 'Cocaína',         fumadores:  9.1, noFumadores:  1.9, ratio: 4.8 },
  { sustancia: 'Tranquilizantes', fumadores:  6.4, noFumadores:  2.3, ratio: 2.8 },
  { sustancia: 'Inhalantes',      fumadores:  2.8, noFumadores:  0.5, ratio: 5.6 },
]

const DATOS_SALUD_MENTAL = [
  { condicion: 'Depresión mayor',       fumadores: 31.2, noFumadores: 12.4, ratio: 2.5 },
  { condicion: 'Ansiedad generalizada', fumadores: 25.6, noFumadores: 10.1, ratio: 2.5 },
  { condicion: 'TDAH en adultos',       fumadores: 14.8, noFumadores:  5.9, ratio: 2.5 },
  { condicion: 'Trastorno de pánico',   fumadores: 12.3, noFumadores:  4.8, ratio: 2.6 },
  { condicion: 'Estrés postraumático',  fumadores: 11.4, noFumadores:  4.2, ratio: 2.7 },
]

const DATOS_VAPEO = [
  { etiqueta: 'Jóvenes vapers sin historial previo de fumar',  pct: 54.8, color: '#2563eb' },
  { etiqueta: 'Vapers en uso dual (también fuman)',            pct: 43.2, color: '#f97316' },
  { etiqueta: 'Exfumadores que migraron al vapeo',             pct: 31.5, color: '#8b5cf6' },
  { etiqueta: 'Vapers jóvenes que pasaron a cigarrillo ≤1 año', pct: 28.3, color: '#ef4444' },
]

const HIGHLIGHTS = [
  {
    ratio:   '5.6×',
    label:   'Inhalantes',
    desc:    'Los fumadores tienen 5.6 veces más probabilidad de consumir inhalantes que los no fumadores',
    color:   'text-[#ef4444]',
    bgColor: 'bg-[rgba(239,68,68,0.08)] dark:bg-[rgba(239,68,68,0.12)]',
    border:  'border-[rgba(239,68,68,0.25)]',
  },
  {
    ratio:   '4.8×',
    label:   'Cocaína',
    desc:    'La probabilidad de consumo de cocaína es casi 5 veces mayor entre fumadores',
    color:   'text-[#f97316]',
    bgColor: 'bg-[rgba(249,115,22,0.08)] dark:bg-[rgba(249,115,22,0.12)]',
    border:  'border-[rgba(249,115,22,0.25)]',
  },
  {
    ratio:   '2.5×',
    label:   'Depresión mayor',
    desc:    'Los fumadores presentan depresión mayor con 2.5 veces más frecuencia',
    color:   'text-[#8b5cf6]',
    bgColor: 'bg-[rgba(139,92,246,0.08)] dark:bg-[rgba(139,92,246,0.12)]',
    border:  'border-[rgba(139,92,246,0.25)]',
  },
]

// ── Tooltip compartido ────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: { name: string; value: number; color: string }[]
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="metric-card-glass rounded-[12px] px-3 py-2.5 border border-[rgba(180,210,240,0.4)] dark:border-white/10 text-[12px] shadow-lg">
      <p className="font-bold text-[#0c1f3f] dark:text-white mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
          {entry.name === 'fumadores' ? 'Fumadores' : 'No fumadores'}: <strong>{entry.value}%</strong>
        </p>
      ))}
      {payload.length === 2 && (
        <p className="text-[11px] text-[#5580a8] dark:text-white/35 mt-1.5 pt-1.5 border-t border-[rgba(180,210,240,0.3)] dark:border-white/10">
          Razón: ×{(payload[0].value / payload[1].value).toFixed(1)}
        </p>
      )}
    </div>
  )
}

// ── Sección wrapper ───────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="metric-card-glass rounded-[18px] p-5 flex flex-col gap-4">
      {children}
    </div>
  )
}

function SectionHeader({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div>
      <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
        {tag}
      </p>
      <h2 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white mb-1">
        {title}
      </h2>
      <p className="text-[13px] text-[#5580a8] dark:text-white/40 leading-relaxed max-w-[640px]">
        {desc}
      </p>
    </div>
  )
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-5 justify-center">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-[#2563eb]" />
        <span className="text-[11px] text-[#5580a8] dark:text-white/40">Fumadores / vapers</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-[rgba(148,163,184,0.6)]" />
        <span className="text-[11px] text-[#5580a8] dark:text-white/40">No consumidores</span>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export function Correlaciones() {
  return (
    <div className="flex flex-col gap-5" data-testid="correlaciones">

      {/* Encabezado */}
      <div>
        <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Análisis de correlación
        </p>
        <h1 className="font-display text-[22px] font-extrabold text-[#0c1f3f] dark:text-white mb-1">
          Tabaco, vapeo y comorbilidades
        </h1>
        <p className="text-[13px] text-[#5580a8] dark:text-white/40 leading-relaxed max-w-[680px]">
          Correlaciones entre el consumo de tabaco y vapeo con otras sustancias y condiciones de salud mental.
          Correlación no implica causalidad — los datos reflejan asociaciones estadísticas observadas en población mexicana.
        </p>
      </div>

      {/* ── Highlights ── */}
      <div className="grid grid-cols-3 gap-4">
        {HIGHLIGHTS.map((h) => (
          <div
            key={h.label}
            className={`rounded-[18px] p-5 border ${h.bgColor} ${h.border} flex flex-col gap-2`}
          >
            <p className="text-[12px] font-bold tracking-[0.7px] uppercase text-[#5580a8] dark:text-white/35">
              {h.label}
            </p>
            <p className={`font-display text-[44px] font-extrabold leading-none tracking-[-1.5px] ${h.color}`}>
              {h.ratio}
            </p>
            <p className="text-[13px] text-[#1e3a5f] dark:text-white/55 leading-[1.5]">
              {h.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Sección 1: Comorbilidad con otras sustancias ── */}
      <SectionCard>
        <SectionHeader
          tag="Poliusos"
          title="Comorbilidad con otras sustancias"
          desc="Porcentaje de la población que consume cada sustancia, comparando fumadores/vapers contra no consumidores de tabaco. Los fumadores muestran tasas consistentemente más altas en todas las categorías."
        />

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={DATOS_SUSTANCIAS}
            barCategoryGap="30%"
            barGap={4}
            margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,210,240,0.25)" vertical={false} />
            <XAxis
              dataKey="sustancia"
              tick={{ fontSize: 12, fill: '#5580a8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: '#5580a8' }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(180,210,240,0.10)' }} />
            <Bar dataKey="fumadores"    fill="#2563eb" radius={[5, 5, 0, 0]} name="fumadores" />
            <Bar dataKey="noFumadores" fill="rgba(148,163,184,0.55)" radius={[5, 5, 0, 0]} name="noFumadores" />
          </BarChart>
        </ResponsiveContainer>

        <ChartLegend />

        {/* Razones de riesgo */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {DATOS_SUSTANCIAS.map((d) => (
            <div
              key={d.sustancia}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-[10px] bg-[rgba(180,210,240,0.12)] dark:bg-white/[0.04]"
            >
              <span className="text-[10px] text-[#5580a8] dark:text-white/35 text-center leading-tight">
                {d.sustancia}
              </span>
              <span className="font-display text-[18px] font-extrabold text-[#ef4444] dark:text-[#f87171]">
                ×{d.ratio}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Sección 2: Salud mental ── */}
      <SectionCard>
        <SectionHeader
          tag="Salud mental"
          title="Enfermedades mentales y tabaquismo"
          desc="Prevalencia de trastornos de salud mental en fumadores vs no fumadores. La relación bidireccional sugiere que el tabaco puede agravar condiciones preexistentes y viceversa."
        />

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={DATOS_SALUD_MENTAL}
            layout="vertical"
            barCategoryGap="25%"
            barGap={3}
            margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,210,240,0.25)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: '#5580a8' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 40]}
            />
            <YAxis
              type="category"
              dataKey="condicion"
              tick={{ fontSize: 12, fill: '#5580a8' }}
              axisLine={false}
              tickLine={false}
              width={160}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(180,210,240,0.10)' }} />
            <Bar dataKey="fumadores"    fill="#8b5cf6" radius={[0, 5, 5, 0]} name="fumadores" />
            <Bar dataKey="noFumadores" fill="rgba(148,163,184,0.55)" radius={[0, 5, 5, 0]} name="noFumadores" />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-5 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0 bg-[#8b5cf6]" />
            <span className="text-[11px] text-[#5580a8] dark:text-white/40">Fumadores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0 bg-[rgba(148,163,184,0.6)]" />
            <span className="text-[11px] text-[#5580a8] dark:text-white/40">No fumadores</span>
          </div>
        </div>

        {/* Nota sobre bidireccionalidad */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-[12px] bg-[rgba(139,92,246,0.07)] border border-[rgba(139,92,246,0.20)] dark:bg-[rgba(139,92,246,0.10)] dark:border-[rgba(139,92,246,0.25)]">
          <svg className="shrink-0 mt-0.5 text-[#8b5cf6]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-[12px] text-[#5580a8] dark:text-white/45 leading-relaxed">
            <strong className="text-[#1e3a5f] dark:text-white/70">Relación bidireccional:</strong>{' '}
            Las personas con trastornos mentales tienen mayor probabilidad de iniciar el consumo de tabaco, y los fumadores tienen mayor riesgo de desarrollar estos trastornos. La nicotina actúa como modulador temporal del estado de ánimo, creando un ciclo de dependencia reforzada.
          </p>
        </div>
      </SectionCard>

      {/* ── Sección 3: Vapeo y transición al tabaco ── */}
      <SectionCard>
        <SectionHeader
          tag="Vapeo"
          title="El vapeo como puerta de entrada al tabaco"
          desc="Patrones de uso y transición entre vapeo y cigarrillo convencional en México y LAC, especialmente en población joven (18-25 años)."
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Gráfica de barras horizontal */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={DATOS_VAPEO}
              layout="vertical"
              barCategoryGap="20%"
              margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,210,240,0.25)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 11, fill: '#5580a8' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 70]}
              />
              <YAxis
                type="category"
                dataKey="etiqueta"
                tick={false}
                axisLine={false}
                tickLine={false}
                width={0}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = DATOS_VAPEO.find((r) => r.pct === payload[0].value)
                  return (
                    <div className="metric-card-glass rounded-[12px] px-3 py-2.5 border border-[rgba(180,210,240,0.4)] dark:border-white/10 text-[12px] shadow-lg max-w-[220px]">
                      <p className="text-[#0c1f3f] dark:text-white leading-snug">{d?.etiqueta}</p>
                      <p className="font-bold mt-1" style={{ color: d?.color }}>{d?.pct}%</p>
                    </div>
                  )
                }}
                cursor={{ fill: 'rgba(180,210,240,0.10)' }}
              />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]} name="Porcentaje">
                {DATOS_VAPEO.map((d) => (
                  <Cell key={d.etiqueta} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Tarjetas de datos */}
          <div className="flex flex-col gap-2.5">
            {DATOS_VAPEO.map((d) => (
              <div
                key={d.etiqueta}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[11px] bg-[rgba(180,210,240,0.10)] dark:bg-white/[0.04]"
              >
                <span
                  className="font-display text-[22px] font-extrabold leading-none shrink-0 w-[60px] text-right"
                  style={{ color: d.color }}
                >
                  {d.pct}%
                </span>
                <span className="text-[12px] text-[#3a5a80] dark:text-white/55 leading-snug">
                  {d.etiqueta}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-[12px] bg-[rgba(249,115,22,0.07)] border border-[rgba(249,115,22,0.20)] dark:bg-[rgba(249,115,22,0.10)] dark:border-[rgba(249,115,22,0.25)]">
          <svg className="shrink-0 mt-0.5 text-[#f97316]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-[12px] text-[#5580a8] dark:text-white/45 leading-relaxed">
            <strong className="text-[#1e3a5f] dark:text-white/70">Alerta en jóvenes 18-25:</strong>{' '}
            Más del 28% de los jóvenes que inician con vapeo transicionan al cigarrillo convencional en menos de un año. El vapeo no es una vía segura de cesación para no fumadores y representa un vector de inicio en la población objetivo de este sistema.
          </p>
        </div>
      </SectionCard>

      {/* ── Fuentes ── */}
      <div className="px-4 py-3 rounded-[12px] bg-[rgba(180,210,240,0.10)] dark:bg-white/[0.03] border border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
        <p className="text-[11px] font-bold tracking-[0.6px] uppercase text-[#5580a8] dark:text-white/30 mb-1.5">
          Fuentes de datos
        </p>
        <p className="text-[11px] text-[#5580a8] dark:text-white/30 leading-relaxed">
          ENCODAT 2016-17 (INSP/Secretaría de Salud) · OPS/OMS <em>MPOWER: Informe sobre la epidemia mundial de tabaquismo 2021</em> ·
          INSP <em>Encuesta Nacional de Adicciones</em> · Miech et al. (2021) Monitoring the Future ·
          Hartmann-Boyce et al. (2022) Cochrane Review on e-cigarettes ·
          Peirson et al. (2020) <em>Tobacco cessation in adults — systematic review</em>
        </p>
      </div>

    </div>
  )
}
