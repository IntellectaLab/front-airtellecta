import { Document, Page, View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS, styles } from './pdfStyles'
import { ReportCover } from './ReportCover'
import { ReportFooter } from './ReportFooter'
import { PdfChart } from './PdfChart'
import type { SimulacionResultado } from '../../types/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SimuladorReportProps {
  resultado: SimulacionResultado
  horizonte: number
  impuesto: number
  userName: string
  institutionName?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, d = 0): string {
  return n.toLocaleString('es-MX', { maximumFractionDigits: d })
}

const POLICY_LABELS: Record<string, string> = {
  SMOKE_FREE_WORKSITE:       'Lugares de trabajo (enforcement alto)',
  SMOKE_FREE_RESTAURANT:     'Restaurantes libres de humo',
  SMOKE_FREE_PUBS_BARS:      'Bares y pubs libres de humo',
  SMOKE_FREE_OTHER:          'Otros lugares publicos',
  HEALTH_WARNINGS_HIGH:      'Pictogramas graficos >=50% empaque',
  HEALTH_WARNINGS_MODERATE:  'Etiquetado moderado >=30% empaque',
  HEALTH_WARNINGS_LOW:       'Etiquetado bajo (<30%)',
  MARKETING_BAN_FULL:        'Prohibicion publicidad comprehensiva',
  MARKETING_BAN_MODERATE:    'Prohibicion publicidad moderada',
  MARKETING_BAN_MINIMAL:     'Prohibicion publicidad minima',
  CAMPAIGN_HIGH:             'Campana nacional TV + social marketing',
  CAMPAIGN_MEDIUM:           'Campana medios moderada',
  CAMPAIGN_LOW:              'Campana medios baja',
  CESSATION_ALL_COMBINED:    'Tratamientos cesacion completos',
  CESSATION_FINANCIAL_COVERAGE: 'Cobertura financiera tratamiento',
  CESSATION_QUIT_LINE:       'Linea de cesacion activa',
  CESSATION_BRIEF_INTERVENTIONS: 'Intervenciones breves del proveedor',
  CESSATION_PHARMA:          'Disponibilidad farmacoterapia',
  VENDING_MACHINE_BAN:       'Prohibicion maquinas expendedoras',
  SELF_SERVICE_BAN:          'Prohibicion venta en autoservicio',
  YOUTH_ACCESS_STRONG:       'Restriccion menores (enforcement fuerte)',
  YOUTH_ACCESS_MODERATE:     'Restriccion menores (enforcement moderado)',
  YOUTH_ACCESS_LOW:          'Restriccion menores (enforcement bajo)',
}

// ─── Local styles ────────────────────────────────────────────────────────────

const ls = StyleSheet.create({
  // KPI enhancement
  kpiArrow: {
    fontSize: 10,
    marginRight: 4,
  },
  kpiDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  kpiChange: {
    fontSize: 7,
  },
  // Formula pipeline
  pipelineContainer: {
    marginVertical: 10,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepConnector: {
    width: 22,
    alignItems: 'center',
    marginRight: 8,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotNum: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
  },
  stepTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  stepFormula: {
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 3,
    marginVertical: 4,
    color: COLORS.primaryLight,
  },
  stepDesc: {
    fontSize: 7.5,
    color: COLORS.grayDark,
    lineHeight: 1.5,
  },
  stepSource: {
    fontSize: 6.5,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginTop: 3,
  },
  // Result callout
  resultCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginRight: 14,
  },
  resultLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 8,
    color: COLORS.grayDark,
  },
  // Policy tag
  policyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 0.5,
    borderColor: '#bbf7d0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  policyTagRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  policyText: {
    fontSize: 7.5,
    color: COLORS.grayDark,
  },
  policyEffect: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 6,
  },
  // Inline mini-bar for projection
  miniBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
})

// ─── Reusable: Section Header ────────────────────────────────────────────────

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionNumber}>{num}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )
}

// ─── Page 2: Executive Summary ───────────────────────────────────────────────

function PageExecutiveSummary({ resultado, horizonte, impuesto }: {
  resultado: SimulacionResultado; horizonte: number; impuesto: number
}) {
  const rf = resultado.resumenFinal
  const pb = resultado.parametrosBase
  const isPositive = rf.reduccionPuntosPct >= 0
  const accent = isPositive ? COLORS.green : COLORS.red
  const accentLight = isPositive ? COLORS.greenLight : COLORS.redLight
  const accentDark = isPositive ? COLORS.greenDark : COLORS.redDark
  const arrow = isPositive ? '\u2193' : '\u2191' // down or up arrow

  const narrativa = isPositive
    ? `Con las politicas seleccionadas, el modelo SimSmoke proyecta una reduccion de ${fmt(rf.reduccionPuntosPct, 2)} puntos porcentuales en la prevalencia de tabaquismo en un horizonte de ${horizonte} anos. Esto equivale a ${fmt(rf.fumadoresEvitadosTotal)} fumadores evitados y ${fmt(rf.defuncionesEvitadasTotal)} muertes prevenidas, generando un ahorro acumulado de $${fmt(rf.ahorroAcumuladoMdp, 1)} MDP para el sistema de salud publico.`
    : `ADVERTENCIA: El escenario configurado proyecta un aumento de ${fmt(Math.abs(rf.reduccionPuntosPct), 2)} pp en la prevalencia de tabaquismo en ${horizonte} anos. Se recomienda revisar la combinacion de politicas e impuesto para revertir esta tendencia.`

  return (
    <Page size="LETTER" style={styles.page}>
      <ReportFooter />

      <SectionHeader num="1" title="Resumen Ejecutivo" />

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {[
          { label: 'Reduccion prevalencia', value: `${fmt(rf.reduccionPuntosPct, 2)}`, unit: 'puntos porcentuales' },
          { label: 'Fumadores evitados', value: fmt(rf.fumadoresEvitadosTotal), unit: 'personas acumuladas' },
          { label: 'Muertes prevenidas', value: fmt(rf.defuncionesEvitadasTotal), unit: 'defunciones evitadas' },
          { label: 'Ahorro acumulado', value: `$${fmt(rf.ahorroAcumuladoMdp, 1)}`, unit: 'millones de pesos' },
        ].map((kpi, i) => (
          <View key={i} style={[styles.kpiCard, { borderLeftColor: accent, backgroundColor: accentLight }]}>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={[styles.kpiValue, { color: accentDark }]}>{kpi.value}</Text>
            <Text style={styles.kpiUnit}>{kpi.unit}</Text>
          </View>
        ))}
      </View>

      {/* Narrative */}
      <View style={[styles.narrativeBox, { backgroundColor: accentLight, borderLeftColor: accent }]}>
        <Text style={[styles.body, { color: accentDark }]}>{narrativa}</Text>
      </View>

      {/* Parameters */}
      <Text style={styles.h3}>Parametros del Escenario</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Parametro</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Valor</Text>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Fuente</Text>
        </View>
        {[
          { p: 'Prevalencia base',       v: `${fmt(pb.prevalenciaBasePct, 2)}%`,   f: 'ENCODAT 2016-2017' },
          { p: 'Poblacion 18+ anos',     v: fmt(pb.poblacion18Plus),               f: 'CONAPO 2025' },
          { p: 'Fumadores base',         v: fmt(pb.fumadoresBase),                 f: 'Calculado (prev x pob)' },
          { p: 'Defunciones atribuibles', v: fmt(pb.defuncionesAtribuiblesBase),    f: 'GBD 2023 + INEGI EDR' },
          { p: 'Impuesto configurado',   v: `${fmt(impuesto, 1)}% del precio`,    f: 'Parametro usuario' },
          { p: 'Horizonte',              v: `${horizonte} anos`,                   f: 'Parametro usuario' },
        ].map((r, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{r.p}</Text>
            <Text style={[styles.tableCellBold, { flex: 2, textAlign: 'right' }]}>{r.v}</Text>
            <Text style={[styles.tableCell, { flex: 3, color: COLORS.gray, fontStyle: 'italic' }]}>{r.f}</Text>
          </View>
        ))}
      </View>

      {/* Policies */}
      {resultado.politicasAplicadas.length > 0 && (
        <>
          <Text style={[styles.h3, { marginTop: 8 }]}>Politicas Aplicadas ({resultado.politicasAplicadas.length})</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {resultado.politicasAplicadas.map((p, i) => (
              <View key={i} style={[ls.policyTag, p.efectoPct > 0 ? ls.policyTagRed : {}]}>
                <Text style={ls.policyText}>{POLICY_LABELS[p.clave] ?? p.nombre}</Text>
                <Text style={[ls.policyEffect, { color: p.efectoPct <= 0 ? COLORS.green : COLORS.red }]}>
                  {p.efectoPct > 0 ? '+' : ''}{fmt(p.efectoPct, 1)}%
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Page>
  )
}

// ─── Page 3: Projection Chart + Table ────────────────────────────────────────

function PageProjection({ resultado }: {
  resultado: SimulacionResultado
}) {
  const proj = resultado.proyeccion
  const maxPrev = Math.max(...proj.map(r => r.prevalenciaPct))

  return (
    <Page size="LETTER" style={styles.page}>
      <ReportFooter />

      <SectionHeader num="2" title="Proyeccion Anual" />

      {/* Chart — native SVG, vectorial */}
      <View style={styles.chartContainer}>
        <PdfChart
          data={resultado.proyeccion}
          baselinePrevalencia={resultado.parametrosBase.prevalenciaBasePct}
          isPositive={resultado.resumenFinal.reduccionPuntosPct >= 0}
        />
        <Text style={styles.chartCaption}>
          Evolucion de prevalencia y muertes evitadas por ano de proyeccion
        </Text>
      </View>

      {/* Projection table with mini-bars */}
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: 35 }]}>Ano</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Prevalencia</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{''}</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Fumadores</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Muertes evit.</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>Ahorro MDP</Text>
        </View>
        {proj.map((row, i) => {
          const barWidth = maxPrev > 0 ? (row.prevalenciaPct / maxPrev) * 100 : 0
          return (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCellBold, { width: 35 }]}>{row.anio}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                {fmt(row.prevalenciaPct, 2)}%
              </Text>
              <View style={{ flex: 2, justifyContent: 'center', paddingHorizontal: 4 }}>
                <View style={[ls.miniBar, {
                  width: `${barWidth}%`,
                  backgroundColor: row.prevalenciaPct <= resultado.parametrosBase.prevalenciaBasePct
                    ? COLORS.green : COLORS.red,
                  opacity: 0.4,
                }]} />
              </View>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                {fmt(row.fumadoresAbsolutos)}
              </Text>
              <Text style={[styles.tableCellBold, { flex: 2, textAlign: 'right', color: COLORS.green }]}>
                {fmt(row.defuncionesEvitadas)}
              </Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>
                ${fmt(row.ahorroMdp, 1)}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Summary row */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 4,
      }}>
        <Text style={{ flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>
          TOTAL ACUMULADO
        </Text>
        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginRight: 30 }}>
          {fmt(resultado.resumenFinal.defuncionesEvitadasTotal)} muertes evitadas
        </Text>
        <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>
          ${fmt(resultado.resumenFinal.ahorroAcumuladoMdp, 1)} MDP ahorrados
        </Text>
      </View>
    </Page>
  )
}

// ─── Page 4: Radiografia del Calculo (Visual Pipeline) ──────────────────────

function PageMethodology({ resultado }: { resultado: SimulacionResultado }) {
  const pb = resultado.parametrosBase
  const rf = resultado.resumenFinal
  const ea = resultado.elasticidadesAplicadas
  const pols = resultado.politicasAplicadas
  const isPositive = rf.reduccionPuntosPct >= 0
  const accent = isPositive ? COLORS.green : COLORS.red
  const accentBg = isPositive ? COLORS.greenLight : COLORS.redLight

  // Calculate post-policy prevalence (before price effect)
  const polFactor = pols.reduce((acc, p) => acc * (1 + p.efectoPct / 100), 1)
  const prevPostPol = pb.prevalenciaBasePct * polFactor

  const steps = [
    {
      num: '1',
      title: 'Dato Base: Prevalencia de Tabaquismo',
      formula: `P_base = ${fmt(pb.prevalenciaBasePct, 2)}%`,
      desc: `Prevalencia de consumo actual de tabaco en poblacion adulta mexicana (18+ anos). Poblacion base: ${fmt(pb.poblacion18Plus)} personas = ${fmt(pb.fumadoresBase)} fumadores estimados.`,
      source: 'ENCODAT 2016-2017 (INSP/CONADIC) + CONAPO 2025',
      color: COLORS.accent,
      bg: COLORS.accentLight,
    },
    {
      num: '2',
      title: `Efecto de ${pols.length} Politica${pols.length !== 1 ? 's' : ''} (Modelo SimSmoke)`,
      formula: pols.length > 0
        ? `P_post = ${fmt(pb.prevalenciaBasePct, 2)}% x ${pols.map(p => `(1 ${p.efectoPct >= 0 ? '+' : ''}${fmt(p.efectoPct / 100, 4)})`).join(' x ')} = ${fmt(prevPostPol, 2)}%`
        : 'Sin politicas seleccionadas',
      desc: `Cada politica se aplica de forma multiplicativa. Los efectos provienen del modelo SimSmoke (Levy et al., 2006), calibrado con evidencia internacional para paises de ingresos medios-altos.`,
      source: 'Levy DT et al. SimSmoke model, Drug Alcohol Rev 2006; 25(6):595-600',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    ...(ea ? [{
      num: '3',
      title: 'Efecto del Precio (Elasticidad)',
      formula: `Impuesto: ${fmt(ea.impuestoNuevoPctPrecio, 1)}% → +${fmt(ea.incrementoPrecioPct, 1)}% precio → ${fmt(ea.efectoPromedioPct, 1)}% consumo`,
      desc: `El incremento impositivo genera un alza del ${fmt(ea.incrementoPrecioPct, 1)}% en el precio al consumidor. La elasticidad-precio promedio para Mexico (${fmt(ea.efectoPromedioPct, 2)}%) reduce adicionalmente la prevalencia.`,
      source: 'Chaloupka FJ et al., Tobacco Control 2012 + SHCP/SAT datos fiscales',
      color: COLORS.amber,
      bg: COLORS.amberLight,
    }] : []),
    {
      num: ea ? '4' : '3',
      title: 'Convergencia Gradual (5 anos)',
      formula: `P(t) = P_base + (P_final - P_base) x min(t/5, 1)`,
      desc: `El efecto total no se aplica de golpe: se distribuye linealmente en 5 anos (convergencia gradual), siguiendo la evidencia de que las politicas de control del tabaco toman tiempo en alcanzar su efecto completo.`,
      source: 'SimSmoke gradual convergence model, Levy et al. 2006',
      color: '#0891b2',
      bg: '#ecfeff',
    },
  ]

  return (
    <Page size="LETTER" style={styles.page}>
      <ReportFooter />

      <SectionHeader num="3" title="Radiografia del Calculo" />

      <Text style={[styles.bodySmall, { marginBottom: 12 }]}>
        A continuacion se detalla paso a paso como se calcula cada resultado del simulador, con las formulas
        matematicas exactas y la fuente de cada dato. Cada numero es verificable y trazable.
      </Text>

      {/* Visual pipeline */}
      <View style={ls.pipelineContainer}>
        {steps.map((step, i) => (
          <View key={i} style={ls.stepRow}>
            {/* Connector column */}
            <View style={ls.stepConnector}>
              <View style={[ls.stepDot, { backgroundColor: step.color }]}>
                <Text style={ls.stepDotNum}>{step.num}</Text>
              </View>
              {i < steps.length - 1 && (
                <View style={[ls.stepLine, { backgroundColor: step.color, opacity: 0.3 }]} />
              )}
            </View>
            {/* Content card */}
            <View style={[ls.stepContent, { borderColor: step.color, backgroundColor: step.bg }]}>
              <Text style={[ls.stepTitle, { color: step.color }]}>{step.title}</Text>
              <Text style={ls.stepFormula}>{step.formula}</Text>
              <Text style={ls.stepDesc}>{step.desc}</Text>
              <Text style={ls.stepSource}>{step.source}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Final result callout */}
      <View style={[ls.resultCallout, { backgroundColor: accentBg, borderWidth: 1, borderColor: accent }]}>
        <Text style={[ls.resultValue, { color: accent }]}>
          {fmt(rf.prevalenciaFinalPct, 2)}%
        </Text>
        <View>
          <Text style={[ls.resultLabel, { color: accent }]}>
            Prevalencia Final Proyectada
          </Text>
          <Text style={ls.resultSub}>
            {isPositive ? 'Reduccion' : 'Aumento'} de {fmt(Math.abs(rf.reduccionPuntosPct), 2)} pp respecto al {fmt(pb.prevalenciaBasePct, 2)}% base
            {' '}→ {fmt(rf.fumadoresEvitadosTotal)} fumadores evitados, {fmt(rf.defuncionesEvitadasTotal)} muertes prevenidas
          </Text>
        </View>
      </View>
    </Page>
  )
}

// ─── Page 5: Sources & References ───────────────────────────────────────────

function PageSources() {
  const refs = [
    {
      num: '1',
      text: 'INSP / CONADIC. Encuesta Nacional de Consumo de Drogas, Alcohol y Tabaco (ENCODAT 2016-2017). Instituto Nacional de Salud Publica, Mexico.',
    },
    {
      num: '2',
      text: 'CONAPO (2025). Proyecciones de la Poblacion de Mexico 2020-2070. Consejo Nacional de Poblacion. https://www.gob.mx/conapo',
    },
    {
      num: '3',
      text: 'Levy, D. T., et al. (2006). "SimSmoke: A simulation model to predict the effect of tobacco control policies on smoking and smoking-attributable death rates." Drug and Alcohol Review, 25(6), 595-600. doi:10.1080/09595230600944169',
    },
    {
      num: '4',
      text: 'INEGI (2023). Estadisticas de Defunciones Registradas (EDR) 2023. Instituto Nacional de Estadistica y Geografia. https://www.inegi.org.mx',
    },
    {
      num: '5',
      text: 'GBD 2023 Tobacco Collaborators. "Smoking prevalence and attributable disease burden in 204 countries and territories, 1990-2019." Global Burden of Disease Study. IHME, Seattle, WA. https://www.healthdata.org',
    },
    {
      num: '6',
      text: 'Chaloupka, F. J., Yurekli, A., & Fong, G. T. (2012). "Tobacco taxes as a tobacco control strategy." Tobacco Control, 21(2), 172-180. doi:10.1136/tobaccocontrol-2011-050417',
    },
    {
      num: '7',
      text: 'Reynales-Shigematsu, L. M. (2006). "Costos de atencion medica atribuibles al consumo de tabaco en el IMSS." Salud Publica de Mexico, 48(supl 1), S48-S64.',
    },
    {
      num: '8',
      text: 'WHO FCTC (2021). WHO Report on the Global Tobacco Epidemic. Framework Convention on Tobacco Control. World Health Organization. https://www.who.int/tobacco',
    },
    {
      num: '9',
      text: 'SHCP / SAT. Datos de recaudacion IEPS tabaco. Secretaria de Hacienda y Credito Publico. https://www.gob.mx/shcp',
    },
  ]

  return (
    <Page size="LETTER" style={styles.page}>
      <ReportFooter />

      <SectionHeader num="4" title="Fuentes y Metodologia" />

      {/* Methodology note */}
      <View style={{
        backgroundColor: COLORS.accentLight,
        borderRadius: 6,
        padding: 12,
        marginBottom: 14,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.accent,
      }}>
        <Text style={[styles.h3, { color: COLORS.accent, marginBottom: 4 }]}>Nota Metodologica</Text>
        <Text style={styles.bodySmall}>
          Este reporte fue generado mediante el modelo SimSmoke, desarrollado por la Universidad de Georgetown
          (Levy et al., 2006). El modelo aplica efectos multiplicativos de politicas de control del tabaco sobre
          la prevalencia base, con convergencia gradual en 5 anos. Los efectos de precio se calculan mediante
          elasticidad-precio de la demanda. Todos los datos de entrada son verificables y provienen de fuentes
          oficiales mexicanas e internacionales listadas a continuacion.
        </Text>
      </View>

      {/* References */}
      <Text style={[styles.h3, { marginBottom: 8 }]}>Referencias Bibliograficas</Text>
      {refs.map((ref, i) => (
        <View key={i} style={styles.sourceItem}>
          <Text style={styles.sourceNum}>[{ref.num}]</Text>
          <Text style={styles.sourceText}>{ref.text}</Text>
        </View>
      ))}

      {/* Disclaimer */}
      <View style={{
        marginTop: 16,
        paddingTop: 10,
        borderTopWidth: 0.5,
        borderTopColor: COLORS.grayMedium,
      }}>
        <Text style={[styles.bodySmall, { fontStyle: 'italic' }]}>
          Disclaimer: Las proyecciones presentadas son estimaciones basadas en modelos matematicos y datos
          disponibles. Los resultados reales pueden variar segun factores no contemplados en el modelo.
          Este documento es de caracter informativo y no constituye recomendacion de politica publica por
          si solo. Se recomienda complementar con analisis de factibilidad politica, economica y social.
        </Text>
      </View>
    </Page>
  )
}

// ─── Main Document ───────────────────────────────────────────────────────────

export function SimuladorReport({
  resultado,
  horizonte,
  impuesto,
  userName,
  institutionName,
}: SimuladorReportProps) {
  return (
    <Document>
      <ReportCover
        title="Proyeccion de Impacto — Politicas de Control del Tabaco"
        subtitle={`Simulacion basada en modelo SimSmoke · Horizonte de ${horizonte} anos · Impuesto ${fmt(impuesto, 0)}% del precio de venta`}
        userName={userName}
        institutionName={institutionName}
      />
      <PageExecutiveSummary resultado={resultado} horizonte={horizonte} impuesto={impuesto} />
      <PageProjection resultado={resultado} />
      <PageMethodology resultado={resultado} />
      <PageSources />
    </Document>
  )
}
