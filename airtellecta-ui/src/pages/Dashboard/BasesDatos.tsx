const BASES = [
  {
    id:          'encodat',
    nombre:      'ENCODAT 2016–2017',
    siglas:      'ENCODAT',
    institucion: 'INSP / Secretaría de Salud',
    anio:        2017,
    registros:   56_877,
    categoria:   'Encuesta',
    descripcion: 'Encuesta Nacional de Consumo de Drogas, Alcohol y Tabaco. Muestra representativa nacional. Principal fuente de prevalencia de tabaquismo y vapeo por estado, edad y sexo.',
    tablas:      ['encuesta_encodat'],
    url:         'https://www.insp.mx/resources/images/stories/Produccion/pdf/100517_Encodat2016-2017.pdf',
    color:       '#2563eb',
  },
  {
    id:          'encodat25',
    nombre:      'ENCODAT 2025',
    siglas:      'ENCODAT 2025',
    institucion: 'INSP / Secretaría de Salud',
    anio:        2025,
    registros:   null,
    categoria:   'Encuesta',
    descripcion: 'Edición 2025 de la encuesta ENCODAT. Datos preliminares cargados al sistema. Se utilizan para proyecciones de prevalencia base y cálculo de tendencias comparativas.',
    tablas:      ['encuesta_encodat_2025'],
    url:         'https://www.insp.mx',
    color:       '#1d4ed8',
  },
  {
    id:          'ensanut18',
    nombre:      'ENSANUT 2018',
    siglas:      'ENSANUT 18',
    institucion: 'INSP / INEGI',
    anio:        2018,
    registros:   43_070 + 158_044,
    categoria:   'Encuesta',
    descripcion: 'Encuesta Nacional de Salud y Nutrición 2018. Incluye módulo de residentes (158,044 registros) y adultos (43,070 registros). Fuente de comorbilidades, uso de servicios de salud y cobertura de atención.',
    tablas:      ['ensanut_2018_residentes', 'encuesta_ensanut_2018'],
    url:         'https://ensanut.insp.mx/encuestas/ensanut2018/descargas.php',
    color:       '#7c3aed',
  },
  {
    id:          'ensanut23',
    nombre:      'ENSANUT 2023',
    siglas:      'ENSANUT 23',
    institucion: 'INSP / INEGI',
    anio:        2023,
    registros:   6_772 + 20_018,
    categoria:   'Encuesta',
    descripcion: 'Encuesta Nacional de Salud y Nutrición 2023. Residentes (20,018 registros) y adultos (6,772 registros). Versión más reciente para análisis de salud pública post-pandemia.',
    tablas:      ['ensanut_2023_residentes', 'encuesta_ensanut_2023'],
    url:         'https://ensanut.insp.mx',
    color:       '#6d28d9',
  },
  {
    id:          'defunciones',
    nombre:      'Defunciones INEGI',
    siglas:      'EDR',
    institucion: 'INEGI',
    anio:        2023,
    registros:   12_186,
    categoria:   'Registros Administrativos',
    descripcion: 'Estadísticas de Defunciones Registradas. Filtradas por códigos CIE-10 atribuibles al tabaco (F17, J43, J44, C32, C34, I25 y otros). Período 2011–2023.',
    tablas:      ['defunciones'],
    url:         'https://www.inegi.org.mx/programas/mortalidad/',
    color:       '#dc2626',
  },
  {
    id:          'urgencias',
    nombre:      'Urgencias INEGI',
    siglas:      'URG',
    institucion: 'INEGI',
    anio:        2023,
    registros:   13_708,
    categoria:   'Registros Administrativos',
    descripcion: 'Registros de urgencias hospitalarias atribuibles al tabaco (CIE-10 F17 y relacionados). Período 2011–2023. Fuente para estimación de carga en servicios de salud.',
    tablas:      ['urgencias'],
    url:         'https://www.inegi.org.mx/programas/egasp/',
    color:       '#ea580c',
  },
  {
    id:          'conapo',
    nombre:      'Proyecciones de Población CONAPO',
    siglas:      'CONAPO',
    institucion: 'CONAPO',
    anio:        2023,
    registros:   832,
    categoria:   'Proyecciones',
    descripcion: 'Proyecciones de población 2011–2030 por entidad federativa, sexo y grupo de edad. Base para calcular prevalencias relativas, tasas por 100,000 habitantes y fumadores estimados.',
    tablas:      ['pob_proyecciones'],
    url:         'https://www.gob.mx/conapo/acciones-y-programas/proyecciones-de-la-poblacion-de-mexico-y-de-las-entidades-federativas-2016-2050',
    color:       '#059669',
  },
  {
    id:          'ieps',
    nombre:      'Recaudación IEPS Tabaco',
    siglas:      'IEPS',
    institucion: 'SHCP / SAT',
    anio:        2024,
    registros:   null,
    categoria:   'Fiscal',
    descripcion: 'Recaudación anual del Impuesto Especial sobre Producción y Servicios (IEPS) correspondiente a productos del tabaco. Serie histórica utilizada en el módulo del simulador de políticas.',
    tablas:      ['recaudacion_ieps_anual'],
    url:         'https://www.sat.gob.mx/estadisticas_tributarias',
    color:       '#d97706',
  },
  {
    id:          'cie10',
    nombre:      'Catálogo CIE-10',
    siglas:      'CIE-10',
    institucion: 'OMS / SS México',
    anio:        2019,
    registros:   null,
    categoria:   'Catálogo',
    descripcion: 'Clasificación Internacional de Enfermedades, 10ª revisión. Subconjunto de códigos relevantes para tabaquismo y vapeo: F17 (trastornos por nicotina), J43, J44, C32, C34, I25 y relacionados.',
    tablas:      ['cat_cie10', 'costos_referencia'],
    url:         'https://www.who.int/classifications/classification-of-diseases',
    color:       '#0891b2',
  },
]

function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return n.toLocaleString('es-MX')
}

const CAT_COLORS: Record<string, string> = {
  'Encuesta':                 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'Registros Administrativos':'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  'Proyecciones':             'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  'Fiscal':                   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  'Catálogo':                 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
}

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const DbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
)

export function BasesDatos() {
  const categorias = [...new Set(BASES.map(b => b.categoria))]
  const totalRegistros = BASES.reduce((s, b) => s + (b.registros ?? 0), 0)

  return (
    <div className="flex flex-col gap-6" data-testid="bases-datos">

      {/* Header */}
      <div>
        <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35 mb-1">
          Panel de administración
        </p>
        <h1 className="font-display text-[25px] font-extrabold text-[#0c1f3f] dark:text-white mb-1">
          Bases de Datos del Sistema
        </h1>
        <p className="text-[16px] text-[#5580a8] dark:text-white/45 leading-relaxed max-w-[680px]">
          Fuentes de datos epidemiológicas, administrativas y de referencia que alimentan todos los módulos del dashboard.
        </p>
      </div>

      {/* KPIs resumen */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Bases de datos',    value: BASES.length.toString(),             sub: 'fuentes integradas' },
          { label: 'Total registros',   value: fmtN(totalRegistros),                sub: 'filas en el sistema' },
          { label: 'Instituciones',     value: '6',                                  sub: 'INSP, INEGI, CONAPO…' },
          { label: 'Cobertura',         value: '2011–2025',                          sub: 'período disponible' },
        ].map(k => (
          <div key={k.label} className="metric-card-glass flex flex-col gap-1.5 p-5 rounded-[18px]">
            <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">{k.label}</p>
            <p className="font-display text-[34px] font-extrabold leading-none tracking-[-1.2px] text-[#0c1f3f] dark:text-white">{k.value}</p>
            <p className="text-[14px] text-[#5580a8] dark:text-white/40">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Bases por categoría */}
      {categorias.map(cat => {
        const bases = BASES.filter(b => b.categoria === cat)
        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[13px] font-bold px-3 py-1 rounded-full border ${CAT_COLORS[cat] ?? ''}`}>{cat}</span>
              <span className="text-[14px] text-[#5580a8] dark:text-white/30">{bases.length} {bases.length === 1 ? 'fuente' : 'fuentes'}</span>
              <span className="flex-1 h-px bg-[rgba(180,210,240,0.30)] dark:bg-white/[0.07]" />
            </div>

            <div className="flex flex-col gap-3">
              {bases.map(base => (
                <div key={base.id} className="metric-card-glass rounded-[18px] p-5 flex flex-col gap-3" data-testid={`db-${base.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Color indicator */}
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${base.color}18`, color: base.color }}>
                        <DbIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="text-[16px] font-bold text-[#0c1f3f] dark:text-white">{base.nombre}</h3>
                          <span className="text-[12px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-[rgba(180,210,240,0.25)] dark:bg-white/[0.06] text-[#5580a8] dark:text-white/40">
                            {base.siglas}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#5580a8] dark:text-white/45">{base.institucion} · {base.anio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {base.registros && (
                        <div className="text-right">
                          <p className="font-display text-[22px] font-extrabold text-[#0c1f3f] dark:text-white leading-none" style={{ color: base.color }}>
                            {fmtN(base.registros)}
                          </p>
                          <p className="text-[12px] text-[#5580a8] dark:text-white/30">registros</p>
                        </div>
                      )}
                      <a
                        href={base.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-[10px] border-none cursor-pointer transition-colors text-[#2563eb] dark:text-[#60a5fa] hover:bg-[rgba(37,99,235,0.08)] dark:hover:bg-[rgba(96,165,250,0.10)]"
                        style={{ textDecoration: 'none' }}
                      >
                        <ExternalIcon />
                        Fuente
                      </a>
                    </div>
                  </div>

                  <p className="text-[15px] text-[#3a5a80] dark:text-white/55 leading-relaxed">
                    {base.descripcion}
                  </p>

                  {/* Tablas */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-[#5580a8] dark:text-white/30 font-semibold">Tablas:</span>
                    {base.tablas.map(t => (
                      <span key={t} className="text-[12px] font-mono px-2 py-0.5 rounded-[6px] bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05] text-[#0c1f3f] dark:text-white/50 border border-[rgba(180,210,240,0.30)] dark:border-white/[0.08]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Footer */}
      <div className="metric-card-glass rounded-[18px] px-5 py-4 flex items-start gap-3">
        <svg className="shrink-0 mt-0.5 text-[#2563eb]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p className="text-[14px] text-[#5580a8] dark:text-white/45 leading-relaxed">
          Esta sección es visible únicamente para administradores del sistema. Los datos mostrados corresponden a las fuentes cargadas en la base de datos MySQL del backend. Para agregar nuevas fuentes o actualizar registros, contactar al responsable técnico del proyecto.
        </p>
      </div>
    </div>
  )
}
