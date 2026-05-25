import { useState, useRef, useEffect } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, ReferenceLine,
} from 'recharts'
import { apiService } from '../../services/api'
import type { SimulacionRequest, SimulacionResultado, RecaudacionAnual } from '../../types/api'
import { useAuth } from '../../context/AuthContext'
import { ExportButtons } from '../../components/reports/ExportButtons'
import { SimuladorReport } from '../../components/reports/SimuladorReport'

const POLICY_GROUPS = [
  {
    title: 'Espacios Libres de Humo',
    context: 'Reducción de exposición al humo de segunda mano. Art. 8 CMCT/FCTC.',
    iconBg: 'rgba(59,130,246,0.10)',
    iconColor: '#60a5fa',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>,
    policies: [
      { key: 'SMOKE_FREE_WORKSITE',   label: 'Lugares de trabajo (enforcement alto)', effect: -6  },
      { key: 'SMOKE_FREE_RESTAURANT', label: 'Restaurantes',                          effect: -2  },
      { key: 'SMOKE_FREE_PUBS_BARS',  label: 'Bares y pubs',                          effect: -1  },
    ],
  },
  {
    title: 'Advertencias y Publicidad',
    context: 'Información de riesgos y restricción de marketing. Art. 11, 13 CMCT.',
    iconBg: 'rgba(239,68,68,0.10)',
    iconColor: '#f87171',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
    policies: [
      { key: 'HEALTH_WARNINGS_HIGH', label: 'Pictogramas gráficos ≥50% empaque',        effect: -5   },
      { key: 'MARKETING_BAN_FULL',   label: 'Prohibición publicidad comprehensiva',      effect: -8   },
      { key: 'CAMPAIGN_HIGH',        label: 'Campaña nacional TV + social marketing',    effect: -6.5 },
    ],
  },
  {
    title: 'Acceso y Cesación',
    context: 'Control de venta y apoyo para dejar de fumar. Art. 14, 16 CMCT.',
    iconBg: 'rgba(139,92,246,0.10)',
    iconColor: '#a78bfa',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    policies: [
      { key: 'VENDING_MACHINE_BAN',  label: 'Prohibición máquinas expendedoras',                effect: -8  },
      { key: 'SELF_SERVICE_BAN',     label: 'Prohibición venta en autoservicio',                 effect: -4  },
      { key: 'YOUTH_ACCESS_STRONG',  label: 'Restricción menores (enforcement fuerte)',          effect: -16 },
    ],
  },
]

const POLICY_LABELS: Record<string, string> = {}
POLICY_GROUPS.forEach(g => g.policies.forEach(p => { POLICY_LABELS[p.key] = p.label }))

const HORIZONTE_OPTIONS = [1, 5, 10, 20, 40]

const COUNTRY_TAX = [
  { code: 'UK', name: 'Reino Unido', pct: 82, color: '#3b82f6' },
  { code: 'BR', name: 'Brasil',      pct: 78, color: '#22c55e' },
  { code: 'AR', name: 'Argentina',   pct: 70, color: '#60a5fa' },
  { code: 'CO', name: 'Colombia',    pct: 55, color: '#f59e0b' },
]

export function Simulador() {
  const { user } = useAuth()
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set())
  const [impuesto,   setImpuesto]   = useState(67.57)
  const [horizonte,  setHorizonte]  = useState(5)
  const [resultado,  setResultado]  = useState<SimulacionResultado | null>(null)
  const [lastRequest, setLastRequest] = useState<SimulacionRequest | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [showTable,  setShowTable]  = useState(false)
  const [recaudacion, setRecaudacion] = useState<RecaudacionAnual[] | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const [showMetodologia, setShowMetodologia] = useState(false)

  useEffect(() => {
    apiService.recaudacion()
      .then(data => setRecaudacion(data))
      .catch(() => {})
  }, [])


  const togglePolicy = (key: string) => {
    setSelectedPolicies(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleGroup = (group: typeof POLICY_GROUPS[0]) => {
    setSelectedPolicies(prev => {
      const next = new Set(prev)
      const allSelected = group.policies.every(p => next.has(p.key))
      if (allSelected) group.policies.forEach(p => next.delete(p.key))
      else             group.policies.forEach(p => next.add(p.key))
      return next
    })
  }

  const handleSimular = async () => {
    setLoading(true)
    setError(null)
    const body: SimulacionRequest = {
      politicas:         Array.from(selectedPolicies),
      impuestoPctPrecio: impuesto,
      horizonteAnios:    horizonte,
    }
    try {
      const data = await apiService.simulacion(body)
      setResultado(data)
      setLastRequest(body)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error en la simulación')
    } finally {
      setLoading(false)
    }
  }

  const iepsMasReciente = recaudacion?.length
    ? recaudacion.reduce((a, b) => (a.anio > b.anio ? a : b))
    : null

  return (
    <div className="animate-fade-up" data-testid="simulador">

      {/* Hero */}
      <div className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.9px] text-[#5580a8] dark:text-white/35 mb-1.5">
          Airtellecta › Simulador de Políticas
        </p>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.5px] text-[#0c1f3f] dark:text-white/95 mb-2.5">
          Simulador de Políticas Públicas
        </h1>
        <p className="text-[15px] text-[#5580a8] dark:text-white/45 leading-relaxed max-w-[720px]">
          Proyecta el impacto de <strong className="text-[#0c1f3f] dark:text-white/70 font-semibold">políticas de control del tabaco</strong> sobre prevalencia, mortalidad y costo económico. Modelo <strong className="text-[#0c1f3f] dark:text-white/70 font-semibold">SimSmoke</strong> (Georgetown University) — utilizado por la OMS en 30+ países.
        </p>
      </div>

      {/* Transparencia Metodológica */}
      <div className="mb-8">
        <button
          onClick={() => setShowMetodologia(!showMetodologia)}
          className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-[14px] cursor-pointer transition-all border-none text-left metric-card-glass"
          style={{ borderLeft: '4px solid #6366f1' }}
        >
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,0.10)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#0c1f3f] dark:text-white/75">¿De dónde vienen estos datos?</p>
            <p className="text-[11px] text-[#5580a8] dark:text-white/30 mt-0.5">Metodología SimSmoke, fuentes científicas verificables y validación internacional</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5580a8" strokeWidth="2.5" className={`transition-transform ${showMetodologia ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>

        {showMetodologia && (
          <div className="metric-card-glass rounded-b-[14px] rounded-t-none -mt-3 pt-6 px-6 pb-5 border-t-0 animate-fade-up">
            <div className="grid grid-cols-3 gap-5">

              {/* El Modelo */}
              <div className="p-4 rounded-[12px]" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.10)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-indigo-600 dark:text-indigo-400">El Modelo</p>
                </div>
                <p className="text-[12px] text-[#5580a8] dark:text-white/45 leading-relaxed">
                  <strong className="text-[#0c1f3f] dark:text-white/65">SimSmoke</strong> fue desarrollado por <strong className="text-[#0c1f3f] dark:text-white/65">David T. Levy</strong> en Georgetown University. Es el estándar de la OMS para proyectar impacto de políticas de control del tabaco, utilizado en <strong className="text-[#0c1f3f] dark:text-white/65">más de 30 países</strong>.
                </p>
                <p className="text-[10px] text-indigo-500/50 dark:text-indigo-400/30 mt-2.5 italic leading-relaxed">
                  Levy DT et al. "SimSmoke: The Effects of Tobacco Control Policies on Smoking Rates." Tobacco Control, 2004.
                </p>
              </div>

              {/* Fuentes de Datos */}
              <div className="p-4 rounded-[12px]" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.10)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-green-600 dark:text-green-400">Fuentes de Datos</p>
                </div>
                <div className="space-y-1.5">
                  <SourceBadge label="Prevalencia" value="ENCODAT 2025 — Secretaría de Salud" />
                  <SourceBadge label="Población" value="CONAPO Proyecciones 2025" />
                  <SourceBadge label="Mortalidad" value="GBD 2023 (6.35%) + INEGI EDR 2023" />
                  <SourceBadge label="Costos" value="Reynales-Shigematsu 2005 · Sáenz-de-Miera 2024" />
                  <SourceBadge label="Impuesto" value="SHCP — Ley del IEPS vigente" />
                  <SourceBadge label="Elasticidades" value="SimSmoke Table 1 — 5 grupos edad" />
                </div>
              </div>

              {/* Validación */}
              <div className="p-4 rounded-[12px]" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.10)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.5px] text-amber-600 dark:text-amber-400">Validación Internacional</p>
                </div>
                <p className="text-[12px] text-[#5580a8] dark:text-white/45 leading-relaxed">
                  SimSmoke ha sido validado comparando predicciones vs. datos observados. Error típico <strong className="text-[#0c1f3f] dark:text-white/65">&lt;15%</strong> a 10 años en países con datos longitudinales disponibles.
                </p>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {['EE.UU.','Brasil','Turquía','Corea del Sur','P.Bajos','Finlandia','Argentina'].map(c => (
                    <span key={c} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.10)', color: '#d97706' }}>{c}</span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Baseline strip */}
      <SectionLabel text="Punto de Partida — México Hoy" />
      <div className="flex gap-px mb-9 rounded-[14px] overflow-hidden">
        {[
          { label: 'Prevalencia actual',   value: '15.06', unit: '%',     source: 'ENCODAT 2025', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
          { label: 'Población 18+',        value: '88.5',  unit: 'M',     source: 'CONAPO 2025',  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
          { label: 'Fumadores',            value: '13.3',  unit: 'M',     source: 'Calculado',    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg> },
          { label: 'Muertes atrib./año',   value: '50,792',unit: '',      source: 'GBD + INEGI',  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg> },
          { label: 'Impuesto actual',      value: '67.57', unit: '%',     source: 'SHCP/IEPS',    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
        ].map((b, i) => (
          <div key={i} className="dark-panel-strip flex-1 py-3.5 px-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[#5580a8] dark:text-white/20">{b.icon}</span>
              <p className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#5580a8] dark:text-white/22">{b.label}</p>
            </div>
            <p className="font-display text-[18px] font-extrabold tracking-[-0.5px] text-[#0c1f3f] dark:text-white/75">
              {b.value}<span className="text-[11px] font-medium text-[#5580a8] dark:text-white/30 ml-0.5">{b.unit}</span>
            </p>
            <p className="text-[8px] font-semibold text-indigo-400/50 dark:text-indigo-300/25 mt-1 tracking-wide uppercase">{b.source}</p>
          </div>
        ))}
      </div>

      {/* STEP 1: Policies */}
      <StepHeader number={1} title="Selecciona las políticas a implementar" hint={`${selectedPolicies.size} seleccionadas`} />

      <div className="grid grid-cols-3 gap-3.5 mb-8">
        {POLICY_GROUPS.map(group => {
          const allSelected = group.policies.every(p => selectedPolicies.has(p.key))
          return (
            <div key={group.title} className="metric-card-glass rounded-[18px] p-5">
              <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.05]">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: group.iconBg, color: group.iconColor }}>
                  {group.icon}
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.3px] text-[#5580a8] dark:text-white/65 flex-1">{group.title}</span>
                <button
                  onClick={() => toggleGroup(group)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors border-none bg-transparent ${
                    allSelected ? 'text-blue-400 bg-blue-500/10' : 'text-[#5580a8] dark:text-white/25 hover:text-blue-400'
                  }`}
                >
                  {allSelected ? 'Quitar' : 'Todas'}
                </button>
              </div>
              <p className="text-[11px] text-[#5580a8] dark:text-white/25 leading-snug mb-3">{group.context}</p>
              {group.policies.map(p => {
                const isSelected = selectedPolicies.has(p.key)
                return (
                  <div
                    key={p.key}
                    onClick={() => togglePolicy(p.key)}
                    data-testid={`politica-${p.key.toLowerCase()}`}
                    className={`flex items-start gap-2.5 p-2.5 rounded-[9px] mb-1 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-500/[0.06] border-blue-500/[0.15]'
                        : 'border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-[1.5px] border-black/15 dark:border-white/15'
                    }`}>
                      {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[12px] leading-snug ${isSelected ? 'text-[#0c1f3f] dark:text-white/75' : 'text-[#5580a8] dark:text-white/50'}`}>{p.label}</p>
                      <span className="text-[10px] font-bold text-green-500/80 mt-0.5 inline-block px-1.5 py-px rounded" style={{ background: 'rgba(34,197,94,0.08)' }}>
                        {p.effect}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* STEP 2: Tax */}
      <StepHeader number={2} title="Ajusta el nivel de impuesto" hint="La OMS recomienda mínimo 75% del precio retail" />

      <div className="metric-card-glass rounded-[18px] p-7 mb-4">
        <div className="grid grid-cols-[1fr_320px] gap-8">
          <div>
            <p className="text-[13px] text-[#5580a8] dark:text-white/45 leading-relaxed mb-5">
              México cobra <strong className="text-[#0c1f3f] dark:text-white/65">67.57%</strong> del precio retail como impuesto al tabaco. La OMS recomienda mínimo <strong className="text-[#0c1f3f] dark:text-white/65">75%</strong> para reducir demanda vía elasticidad precio.
              {iepsMasReciente && (
                <span className="block mt-2 text-[12px] text-[#5580a8] dark:text-white/30">
                  Recaudación IEPS {iepsMasReciente.anio}: <strong className="text-[#0c1f3f] dark:text-white/50">${formatNumber(iepsMasReciente.montoMdp)} MDP</strong> ({iepsMasReciente.fuente})
                </span>
              )}
            </p>
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="font-display text-[48px] font-extrabold text-blue-400 tracking-[-2px] leading-none" data-testid="impuesto-valor">{Math.round(impuesto)}</span>
              <span className="font-display text-[20px] font-bold text-blue-400/50">%</span>
              {impuesto !== 67.57 && (
                <span className={`ml-3 text-[14px] font-bold ${impuesto > 67.57 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {impuesto > 67.57 ? '+' : ''}{(impuesto - 67.57).toFixed(1)} pp
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#5580a8] dark:text-white/25 mb-6">del precio retail como impuesto</p>

            <div className="relative">
              <input
                type="range" min={0} max={100} step={0.5}
                value={impuesto}
                onChange={e => setImpuesto(Number(e.target.value))}
                className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #2563eb ${impuesto}%, rgba(0,0,0,0.08) ${impuesto}%)` }}
                data-testid="impuesto-slider"
              />
              <div className="absolute pointer-events-none" style={{ left: '75%', top: '-6px', transform: 'translateX(-50%)' }}>
                <div className="w-0.5 h-[22px] bg-amber-500/60" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#5580a8] dark:text-white/20">
                <span>0%</span><span>25%</span><span>50%</span>
                <span className="text-amber-500/70 font-bold">75% OMS</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="dark-panel-strip p-[18px] rounded-[14px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#5580a8] dark:text-white/25 mb-3.5">Impuesto al tabaco por país</p>
            {COUNTRY_TAX.filter(c => c.pct > impuesto).map(c => (
              <CountryRow key={c.name} {...c} />
            ))}
            <CountryRow code="SIM" name="Tu escenario" pct={Math.round(impuesto)} color="#22c55e" highlight="green" />
            <CountryRow code="MX"  name="México hoy"   pct={67.6}                 color="#2563eb" highlight="blue"  />
            {COUNTRY_TAX.filter(c => c.pct <= impuesto && c.pct < 67.6).map(c => (
              <CountryRow key={c.name} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* STEP 3: Horizonte */}
      <StepHeader number={3} title="Define el horizonte de proyección" />

      <div className="metric-card-glass rounded-[18px] py-[18px] px-6 mb-7 flex items-center gap-5">
        <div className="flex gap-1.5">
          {HORIZONTE_OPTIONS.map(h => (
            <button
              key={h}
              onClick={() => setHorizonte(h)}
              data-testid={`horizonte-${h}`}
              className={`px-[18px] py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-none ${
                horizonte === h ? 'text-blue-400' : 'text-[#5580a8] dark:text-white/35 hover:text-[#0c1f3f] dark:hover:text-white/55'
              }`}
              style={horizonte === h
                ? { background: 'rgba(29,92,232,0.10)', border: '1px solid rgba(29,92,232,0.25)' }
                : { border: '1px solid rgba(0,0,0,0.08)' }}
            >
              {h} {h === 1 ? 'año' : 'años'}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[#5580a8] dark:text-white/22 ml-auto">Sexenal: 6 años · Largo plazo OMS: 15+</span>
      </div>

      {/* Simular button */}
      <div className="text-center mb-12">
        <button
          onClick={handleSimular}
          disabled={loading}
          data-testid="simulador-submit"
          className="inline-flex items-center gap-3 px-[52px] py-4 rounded-[14px] text-[16px] font-bold text-white cursor-pointer transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none"
          style={{
            background:  'linear-gradient(135deg, #1d5ce8, #1344c4)',
            border:      '1.5px solid rgba(255,255,255,0.15)',
            boxShadow:   '0 6px 28px rgba(29,92,232,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          {loading ? 'Proyectando...' : 'Proyectar Impacto'}
        </button>
        <p className="text-[11px] text-[#5580a8] dark:text-white/20 mt-2.5">Modelo SimSmoke — efectos multiplicativos sobre prevalencia base</p>
      </div>

      {error && (
        <div className="metric-card-glass p-5 rounded-[18px] max-w-lg mx-auto mb-8 border border-red-300/30">
          <p className="text-[14px] font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ===== RESULTADO ===== */}
      {resultado && (() => {
        const isPositive   = resultado.resumenFinal.reduccionPuntosPct >= 0
        const accentColor  = isPositive ? '#22c55e' : '#ef4444'
        const absReducción  = Math.abs(resultado.resumenFinal.reduccionPuntosPct)
        const absFumadores  = Math.abs(resultado.resumenFinal.fumadoresEvitadosTotal)
        const absDefunciones = Math.abs(resultado.resumenFinal.defuncionesEvitadasTotal)
        const absAhorro     = Math.abs(resultado.resumenFinal.ahorroAcumuladoMdp)
        const baselinePrev  = resultado.parametrosBase.prevalenciaBasePct
        const hasElasticidades = resultado.elasticidadesAplicadas != null

        return (
          <div ref={resultRef} data-testid="simulacion-resumen">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pt-8 border-t-2" style={{ borderColor: `${accentColor}20` }}>
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}25` }}>
                {isPositive
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                }
              </div>
              <div>
                <h2 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white/90">
                  {isPositive ? 'Resultado de la Proyección' : 'Advertencia — Escenario Negativo'}
                </h2>
                <p className="text-[12px] text-[#5580a8] dark:text-white/30">
                  {resultado.politicasAplicadas.length} política{resultado.politicasAplicadas.length !== 1 ? 's' : ''}
                  {hasElasticidades && <> + impuesto {resultado.elasticidadesAplicadas.impuestoNuevoPctPrecio}%</>}
                  {' '}· horizonte {horizonte} año{horizonte !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex justify-end mb-4">
              <ExportButtons
                pdfDocument={
                  <SimuladorReport
                    resultado={resultado}
                    horizonte={horizonte}
                    impuesto={impuesto}
                    userName={user?.displayName || user?.email || 'Usuario'}
                  />
                }
                pdfFileName={`simulacion-airtellecta-${new Date().toISOString().slice(0, 10)}.pdf`}
                onExcelDownload={async () => {
                  if (lastRequest) await apiService.exportSimulacionExcel(lastRequest)
                }}
              />
            </div>

            {/* Narrative */}
            <div className="metric-card-glass rounded-[18px] p-6 mb-6" style={{ borderLeft: `4px solid ${accentColor}` }}>
              <p className="text-[15px] text-[#5580a8] dark:text-white/55 leading-relaxed">
                {isPositive ? (
                  <>
                    Con las políticas seleccionadas{hasElasticidades && <> y un impuesto del {resultado.elasticidadesAplicadas.impuestoNuevoPctPrecio}%</>}, la prevalencia se reduciría de{' '}
                    <strong className="text-[#0c1f3f] dark:text-white/85">{baselinePrev.toFixed(2)}%</strong> a{' '}
                    <strong className="text-green-600 dark:text-green-400 font-bold">{resultado.resumenFinal.prevalenciaFinalPct.toFixed(2)}%</strong> en {horizonte} año{horizonte !== 1 ? 's' : ''} — evitando{' '}
                    <strong className="text-green-600 dark:text-green-400 font-bold">{formatNumber(absDefunciones)} muertes</strong> y generando un ahorro de{' '}
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">${formatNumber(absAhorro)} MDP</strong> al sistema de salud.
                  </>
                ) : (
                  <>
                    Este escenario <strong className="text-red-600 dark:text-red-400 font-bold">EMPEORA</strong> la situación. La prevalencia aumentaría de{' '}
                    <strong className="text-[#0c1f3f] dark:text-white/85">{baselinePrev.toFixed(2)}%</strong> a{' '}
                    <strong className="text-red-600 dark:text-red-400 font-bold">{resultado.resumenFinal.prevalenciaFinalPct.toFixed(2)}%</strong> — causando{' '}
                    <strong className="text-red-600 dark:text-red-400 font-bold">{formatNumber(absDefunciones)} muertes adicionales</strong> y un costo extra de{' '}
                    <strong className="text-red-600 dark:text-red-400 font-bold">${formatNumber(absAhorro)} MDP</strong> en {horizonte} año{horizonte !== 1 ? 's' : ''}.
                  </>
                )}
              </p>
            </div>

            {/* Impact cards */}
            <div className="grid grid-cols-4 gap-3.5 mb-7">
              <ImpactCard
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" /></svg>}
                label={isPositive ? 'Reducción prevalencia' : 'Aumento prevalencia'}
                value={`${isPositive ? '-' : '+'}${absReducción.toFixed(2)}`} unit="pp"
                color={accentColor}
                context={`De ${baselinePrev.toFixed(2)}% a ${resultado.resumenFinal.prevalenciaFinalPct.toFixed(2)}%`}
              />
              <ImpactCard
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /></svg>}
                label={isPositive ? 'Fumadores evitados' : 'Fumadores adicionales'}
                value={formatMillions(absFumadores)}
                color={isPositive ? '#60a5fa' : '#ef4444'}
                context="Al alcanzar efecto completo"
              />
              <ImpactCard
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                label={isPositive ? 'Muertes evitadas' : 'Muertes adicionales'}
                value={formatNumber(absDefunciones)}
                color={isPositive ? '#22d3ee' : '#ef4444'}
                context={`Acumuladas en ${horizonte} año${horizonte !== 1 ? 's' : ''}`}
              />
              <ImpactCard
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
                label={isPositive ? 'Ahorro acumulado' : 'Costo adicional'}
                value={`$${formatNumber(absAhorro)}`} unit="MDP"
                color={isPositive ? '#34d399' : '#ef4444'}
                context="Al sistema de salud"
              />
            </div>

            {/* Radiografía del Cálculo */}
            <SectionLabel text="Radiografía del Cálculo — Trazabilidad Completa" />
            <div className="metric-card-glass rounded-[18px] p-6 mb-7" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#0c1f3f] dark:text-white/70">Así se construyó tu escenario</p>
                  <p className="text-[10px] text-[#5580a8] dark:text-white/25">Cada número es derivado de una fuente científica verificable</p>
                </div>
              </div>

              <div className="relative pl-8 space-y-1">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500/30 via-green-500/30 via-amber-500/30 to-emerald-500/30" />

                {/* Step 1: Base */}
                <div className="relative pb-4">
                  <div className="absolute -left-8 w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-indigo-500">1</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#0c1f3f] dark:text-white/55 mb-0.5">Dato de entrada — Prevalencia base</p>
                  <p className="font-display text-[22px] font-extrabold text-indigo-500 tracking-[-0.5px]">{baselinePrev.toFixed(2)}%</p>
                  <p className="text-[10px] text-indigo-400/60 dark:text-indigo-300/30 font-medium mt-0.5">
                    Fuente: ENCODAT 2025 — Encuesta Nacional de Consumo de Drogas, Alcohol y Tabaco · Secretaría de Salud
                  </p>
                </div>

                {/* Step 2: Policies */}
                {resultado.politicasAplicadas.length > 0 && (
                  <div className="relative pb-4">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                      <span className="text-[9px] font-extrabold text-green-500">2</span>
                    </div>
                    <p className="text-[11px] font-bold text-[#0c1f3f] dark:text-white/55 mb-1.5">Efecto de políticas — Multiplicativo sobre prevalencia</p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {resultado.politicasAplicadas.map(p => (
                        <span key={p.clave} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-green-500/8 text-green-600 dark:text-green-400 border border-green-500/15">
                          {POLICY_LABELS[p.clave] || p.nombre} <strong>{p.efectoPct}%</strong>
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#5580a8] dark:text-white/35">
                      Fórmula: prevalencia × (1 + efecto₁/100) × (1 + efecto₂/100) × ...
                    </p>
                    <p className="text-[10px] text-green-500/50 dark:text-green-400/25 font-medium mt-0.5">
                      Fuente: Levy DT et al., SimSmoke model parameters — calibrado con datos observados en 30+ países
                    </p>
                  </div>
                )}

                {/* Step 3: Price elasticity */}
                {hasElasticidades && (
                  <div className="relative pb-4">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <span className="text-[9px] font-extrabold text-amber-500">{resultado.politicasAplicadas.length > 0 ? 3 : 2}</span>
                    </div>
                    <p className="text-[11px] font-bold text-[#0c1f3f] dark:text-white/55 mb-1">Efecto precio — Elasticidad de demanda</p>
                    <div className="flex items-center gap-3 text-[13px] mb-1">
                      <span className="text-[#5580a8] dark:text-white/40">Impuesto:</span>
                      <strong className="text-amber-500">{resultado.elasticidadesAplicadas.impuestoNuevoPctPrecio}%</strong>
                      <span className="text-[#5580a8] dark:text-white/20">→</span>
                      <span className="text-[#5580a8] dark:text-white/40">Δ precio:</span>
                      <strong className="text-amber-500">{resultado.elasticidadesAplicadas.incrementoPrecioPct > 0 ? '+' : ''}{Number(resultado.elasticidadesAplicadas.incrementoPrecioPct).toFixed(1)}%</strong>
                      <span className="text-[#5580a8] dark:text-white/20">→</span>
                      <span className="text-[#5580a8] dark:text-white/40">Efecto:</span>
                      <strong className="text-amber-500">{Number(resultado.elasticidadesAplicadas.efectoPromedioPct).toFixed(1)}%</strong>
                    </div>
                    <p className="text-[10px] text-amber-500/50 dark:text-amber-400/25 font-medium">
                      Fuente: SimSmoke Table 1 — promedio ponderado de elasticidades por grupo de edad (15-17, 18-24, 25-34, 35-44, 45+)
                    </p>
                  </div>
                )}

                {/* Step Final: Result */}
                <div className="relative pb-1">
                  <div className="absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}35` }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <p className="text-[11px] font-bold text-[#0c1f3f] dark:text-white/55 mb-0.5">Resultado proyectado</p>
                  <div className="flex items-baseline gap-3 mb-1">
                    <p className="font-display text-[24px] font-extrabold tracking-[-0.5px]" style={{ color: accentColor }}>{resultado.resumenFinal.prevalenciaFinalPct.toFixed(2)}%</p>
                    <span className="text-[12px] text-[#5580a8] dark:text-white/30">prevalencia con convergencia gradual en 5 años</span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-[#5580a8] dark:text-white/40">
                    <span>→ <strong style={{ color: accentColor }}>{formatNumber(absDefunciones)}</strong> muertes {isPositive ? 'evitadas' : 'adicionales'} <span className="text-[9px] opacity-60">(GBD 2023 × INEGI EDR 2023)</span></span>
                    <span>→ <strong className="text-blue-400">${formatNumber(absAhorro)} MDP</strong> {isPositive ? 'ahorrados' : 'costo adicional'} <span className="text-[9px] opacity-60">(Reynales-Shigematsu 2005)</span></span>
                  </div>
                  <p className="text-[9px] text-[#5580a8] dark:text-white/15 mt-1.5">
                    Población 18+: CONAPO 2025 · Fracción mortalidad tabaco: GBD 2023 (6.35%) · Defunciones totales: INEGI EDR 2023 (799,869)
                  </p>
                </div>
              </div>
            </div>

            {/* Chart / Table toggle */}
            <div className="metric-card-glass rounded-[18px] p-6 mb-6" data-testid="grafica-pronostico">
              <div className="flex justify-between items-center mb-5">
                <span className="text-[14px] font-bold text-[#0c1f3f] dark:text-white/65">Proyección Anual</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#5580a8] dark:text-white/35">
                    <span className="w-4 h-[3px] rounded bg-blue-500" />Prevalencia %
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#5580a8] dark:text-white/35">
                    <span className="w-4 h-[3px] rounded" style={{ background: isPositive ? '#22c55e' : '#ef4444' }} />
                    {isPositive ? 'Muertes evitadas' : 'Muertes adic.'}
                  </span>
                  <button
                    onClick={() => setShowTable(!showTable)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 px-2.5 py-1 rounded-md cursor-pointer transition-colors border-none"
                    style={{ background: 'rgba(29,92,232,0.08)', border: '1px solid rgba(29,92,232,0.15)' }}
                  >
                    {showTable
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>Gráfica</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></svg>Tabla</>
                    }
                  </button>
                </div>
              </div>

              {showTable ? (
                <div className="overflow-auto max-h-[320px] custom-scrollbar" data-testid="tabla-proyeccion">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[#5580a8] dark:text-white/30 text-left border-b border-black/[0.06] dark:border-white/[0.06]">
                        <th className="pb-2.5 pr-4 font-semibold">Año</th>
                        <th className="pb-2.5 pr-4 font-semibold text-right">Prevalencia</th>
                        <th className="pb-2.5 pr-4 font-semibold text-right">Fumadores</th>
                        <th className="pb-2.5 pr-4 font-semibold text-right">{isPositive ? 'Muertes evitadas' : 'Muertes adic.'}</th>
                        <th className="pb-2.5 font-semibold text-right">{isPositive ? 'Ahorro MDP' : 'Costo adic. MDP'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.proyeccion.map(row => (
                        <tr key={row.anio} className="border-b border-black/[0.03] dark:border-white/[0.02]">
                          <td className="py-2 pr-4 font-semibold text-[#0c1f3f] dark:text-white/55">{row.anio}</td>
                          <td className="py-2 pr-4 text-right text-blue-600 dark:text-blue-400 font-medium">{Number(row.prevalenciaPct).toFixed(2)}%</td>
                          <td className="py-2 pr-4 text-right text-[#5580a8] dark:text-white/45">{formatNumber(row.fumadoresAbsolutos)}</td>
                          <td className="py-2 pr-4 text-right" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>{formatNumber(Math.abs(row.defuncionesEvitadas))}</td>
                          <td className="py-2 text-right text-[#5580a8] dark:text-white/45">${formatNumber(Math.abs(row.ahorroMdp))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={resultado.proyeccion} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="prevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="deathGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.10} />
                        <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                    <XAxis dataKey="anio" tick={{ fill: '#5580a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left"  tick={{ fill: '#5580a8', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#5580a8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip isPositive={isPositive} />} />
                    <ReferenceLine yAxisId="left" y={baselinePrev} stroke="#f59e0b" strokeDasharray="6 3" strokeWidth={1.5} />
                    <Area yAxisId="left"  type="monotone" dataKey="prevalenciaPct"      fill="url(#prevGradient)"  stroke="none" />
                    <Area yAxisId="right" type="monotone" dataKey="defuncionesEvitadas" fill="url(#deathGradient)" stroke="none" />
                    <Line yAxisId="left"  type="monotone" dataKey="prevalenciaPct"      stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} name="Prevalencia %" />
                    <Line yAxisId="right" type="monotone" dataKey="defuncionesEvitadas" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: isPositive ? '#22c55e' : '#ef4444' }} name={isPositive ? 'Muertes evitadas' : 'Muertes adicionales'} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Policies + Tax effect */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {resultado.politicasAplicadas.length > 0 && (
                <div>
                  <SectionLabel text="Políticas Aplicadas" />
                  <div className="metric-card-glass rounded-[18px] p-5">
                    {resultado.politicasAplicadas.map(p => (
                      <div key={p.clave} className="flex items-center justify-between py-2.5 border-b border-black/[0.04] dark:border-white/[0.03] last:border-b-0">
                        <span className="text-[13px] text-[#5580a8] dark:text-white/55 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />{POLICY_LABELS[p.clave] || p.nombre}
                        </span>
                        <span className="font-display text-[13px] font-bold text-green-400">{p.efectoPct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasElasticidades && (
                <div>
                  <SectionLabel text="Efecto Precio" />
                  <div className="metric-card-glass rounded-[18px] p-5 flex gap-10" style={{ borderLeft: '4px solid #eab308' }}>
                    <TaxStat value={`${resultado.elasticidadesAplicadas.impuestoNuevoPctPrecio}%`}                                                     label="Impuesto nuevo"    color="#eab308" />
                    <TaxStat value={`${resultado.elasticidadesAplicadas.incrementoPrecioPct > 0 ? '+' : ''}${resultado.elasticidadesAplicadas.incrementoPrecioPct.toFixed(1)}%`} label="Incremento precio"  color="#fb923c" />
                    <TaxStat value={`${resultado.elasticidadesAplicadas.efectoPromedioPct.toFixed(1)}%`}                                               label="Efecto elasticidad" color="#34d399" />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 mt-7 pt-5 border-t border-black/[0.06] dark:border-white/[0.04]">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[13px] font-semibold text-blue-400 cursor-pointer transition-colors border-none"
                style={{ background: 'linear-gradient(135deg, rgba(29,92,232,0.15), rgba(19,68,196,0.10))', border: '1px solid rgba(29,92,232,0.20)' }}
                data-testid="simulador-reset"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
                Modificar Parámetros
              </button>
            </div>

            {/* Sources */}
            <div className="bg-muted-panel mt-6 p-4 rounded-[12px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#5580a8] dark:text-white/20 mb-2">Fuentes y Metodología</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <SourceLine label="Modelo"          value="SimSmoke (Levy et al., Georgetown University)" />
                <SourceLine label="Prevalencia base" value={`ENCODAT 2025 — ${baselinePrev.toFixed(2)}%`} />
                <SourceLine label="Defunciones"      value="GBD 2023 (6.35%) x INEGI EDR 2023" />
                <SourceLine label="Elasticidades"    value="SimSmoke Tabla 1 — 5 grupos edad" />
                <SourceLine label="Población 18+"    value={`CONAPO 2025 — ${formatNumber(resultado.parametrosBase.poblacion18Plus)}`} />
                <SourceLine label="Costos atención"  value="Reynales-Shigematsu 2005 + Saenz-de-Miera 2024" />
              </div>
              <p className="text-[10px] text-[#5580a8] dark:text-white/15 mt-2 leading-relaxed">
                Efectos de políticas son multiplicativos sobre prevalencia base. Convergencia gradual en 5 años (SimSmoke standard). Parámetros calibrados para México con datos ENCODAT 2016/2025.
                Todos los datos son públicos y verificables en las fuentes citadas. Para auditoría completa, consulte la sección "Radiografía del Cálculo" arriba.
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ── Helper components ─────────────────────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.9px] text-[#5580a8] dark:text-white/30">{text}</span>
      <span className="divider-line flex-1 h-px" />
    </div>
  )
}

function StepHeader({ number, title, hint }: { number: number; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 mb-[18px]">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display text-[13px] font-extrabold text-blue-400" style={{ background: 'rgba(29,92,232,0.12)', border: '1px solid rgba(29,92,232,0.25)' }}>
        {number}
      </div>
      <span className="text-[15px] font-bold text-[#0c1f3f] dark:text-white/80">{title}</span>
      {hint && <span className="text-[12px] text-[#5580a8] dark:text-white/30 ml-auto">{hint}</span>}
    </div>
  )
}

function CountryRow({ code, name, pct, color, highlight }: { code: string; name: string; pct: number; color: string; highlight?: 'blue' | 'green' }) {
  const nameClass = highlight === 'blue' ? 'text-blue-600 dark:text-blue-400 font-bold' : highlight === 'green' ? 'text-green-600 dark:text-green-400/60 font-semibold' : 'text-[#5580a8] dark:text-white/40'
  const pctClass  = highlight === 'blue' ? 'text-blue-600 dark:text-blue-400' : highlight === 'green' ? 'text-green-600 dark:text-green-400/60' : 'text-[#5580a8] dark:text-white/35'
  const barBg     = highlight === 'blue'
    ? 'linear-gradient(90deg, #2563eb, #3b82f6)'
    : highlight === 'green'
    ? 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.3))'
    : `linear-gradient(90deg, ${color}88, ${color}44)`

  return (
    <div className="flex items-center gap-2.5 mb-2">
      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-extrabold shrink-0" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
        {code}
      </div>
      <span className={`text-[11px] w-[70px] ${nameClass}`}>{name}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barBg }} />
      </div>
      <span className={`text-[11px] font-bold w-9 text-right ${pctClass}`}>{pct}%</span>
    </div>
  )
}

function ImpactCard({ icon, label, value, unit, color, context }: { icon: React.ReactNode; label: string; value: string; unit?: string; color: string; context: string }) {
  return (
    <div className="metric-card-glass rounded-[18px] p-5" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#5580a8] dark:text-white/22">{label}</p>
        <span style={{ color: `${color}88` }}>{icon}</span>
      </div>
      <p className="font-display text-[30px] font-extrabold tracking-[-1.2px] leading-none" style={{ color }}>
        {value}{unit && <span className="text-[13px] font-semibold opacity-50 ml-0.5">{unit}</span>}
      </p>
      <p className="text-[11px] text-[#5580a8] dark:text-white/25 mt-1.5">{context}</p>
    </div>
  )
}

function TaxStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <p className="font-display text-[22px] font-extrabold tracking-[-0.5px]" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[#5580a8] dark:text-white/25 uppercase tracking-[0.3px] mt-0.5">{label}</p>
    </div>
  )
}

function SourceLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[10px] text-[#5580a8] dark:text-white/18 leading-relaxed">
      <span className="font-semibold text-[#5580a8] dark:text-white/25">{label}:</span> {value}
    </p>
  )
}

function CustomTooltip({ active, payload, label, isPositive }: { active?: boolean; payload?: {dataKey: string; value: number}[]; label?: string; isPositive: boolean }) {
  if (!active || !payload?.length) return null
  const prev   = payload.find(p => p.dataKey === 'prevalenciaPct')
  const deaths = payload.find(p => p.dataKey === 'defuncionesEvitadas')
  return (
    <div className="rounded-[10px] px-4 py-3 text-[12px] shadow-lg" style={{ background: 'rgba(14,20,45,0.95)', border: '1px solid rgba(255,255,255,0.10)' }}>
      <p className="font-bold text-white/80 mb-1.5">Año {label}</p>
      {prev && (
        <p className="flex items-center gap-2 text-white/60">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Prevalencia: <strong className="text-white/90">{Number(prev.value).toFixed(2)}%</strong>
        </p>
      )}
      {deaths && (
        <p className="flex items-center gap-2 text-white/60 mt-1">
          <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
          {isPositive ? 'Evitadas' : 'Adicionales'}: <strong className="text-white/90">{formatNumber(Math.abs(Number(deaths.value)))}</strong>
        </p>
      )}
    </div>
  )
}

function SourceBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 text-[11px]">
      <span className="font-bold text-green-600/70 dark:text-green-400/40 shrink-0 w-[72px]">{label}</span>
      <span className="text-[#5580a8] dark:text-white/35 leading-snug">{value}</span>
    </div>
  )
}

function formatNumber(n: number): string {
  return n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

function formatMillions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}
