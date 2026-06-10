import { Document, Page, View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { styles, COLORS } from './pdfStyles'
import { ReportCover } from './ReportCover'
import { ReportFooter } from './ReportFooter'
import type { PanelEjecutivo } from '../../types/api'

function fmt(n: number, d = 0) {
  return n.toLocaleString('es-MX', { maximumFractionDigits: d })
}

// ─── Local styles ────────────────────────────────────────────────────────────

const ls = StyleSheet.create({
  kpiCardLarge: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    borderTopWidth: 4,
  },
  ratioBar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    marginVertical: 10,
  },
  ratioSegment: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  ratioLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  insightBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.amber,
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 8,
    color: '#92400e',
    lineHeight: 1.5,
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

// ─── Main Component ──────────────────────────────────────────────────────────

interface PanelEjecutivoReportProps {
  data: PanelEjecutivo
  userName: string
  institutionName?: string
}

export function PanelEjecutivoReport({ data, userName, institutionName }: PanelEjecutivoReportProps) {
  const { cargaEconomica, recaudacion, epidemiologia, costosPorPatologia } = data

  // Cost vs revenue ratio for visual
  const costoDir = cargaEconomica.costoDirectoAnualMdp
  const recIeps = recaudacion.iepsMasRecienteMdp
  const total = costoDir + recIeps
  const costoPct = total > 0 ? (costoDir / total) * 100 : 50
  const recPct = 100 - costoPct

  return (
    <Document>
      {/* ── Page 1: Cover ── */}
      <ReportCover
        title="Panel Ejecutivo — Control del Tabaco en Mexico"
        subtitle="Resumen ejecutivo de indicadores epidemiologicos, carga economica y recaudacion fiscal"
        userName={userName}
        institutionName={institutionName}
      />

      {/* ── Page 2: Key Indicators ── */}
      <Page size="LETTER" style={styles.page}>
        <ReportFooter />

        <SectionHeader num="1" title="Indicadores Clave" />

        {/* KPI Cards */}
        <View style={[styles.kpiRow, { marginBottom: 10 }]}>
          <View style={[ls.kpiCardLarge, { borderTopColor: COLORS.accent, backgroundColor: COLORS.accentLight }]}>
            <Text style={styles.kpiLabel}>Costo Directo Anual</Text>
            <Text style={[styles.kpiValue, { color: COLORS.accent }]}>${fmt(costoDir)}</Text>
            <Text style={styles.kpiUnit}>millones de pesos</Text>
          </View>
          <View style={[ls.kpiCardLarge, { borderTopColor: COLORS.amber, backgroundColor: COLORS.amberLight }]}>
            <Text style={styles.kpiLabel}>Recaudacion IEPS</Text>
            <Text style={[styles.kpiValue, { color: COLORS.amber }]}>${fmt(recIeps)}</Text>
            <Text style={styles.kpiUnit}>Mdp ({recaudacion.anio})</Text>
          </View>
          <View style={[ls.kpiCardLarge, { borderTopColor: COLORS.green, backgroundColor: COLORS.greenLight }]}>
            <Text style={styles.kpiLabel}>Prevalencia Actual</Text>
            <Text style={[styles.kpiValue, { color: COLORS.greenDark }]}>{fmt(epidemiologia.prevalenciaActualPct, 1)}%</Text>
            <Text style={styles.kpiUnit}>fumadores activos</Text>
          </View>
          <View style={[ls.kpiCardLarge, { borderTopColor: COLORS.red, backgroundColor: COLORS.redLight }]}>
            <Text style={styles.kpiLabel}>Defunciones Atribuibles</Text>
            <Text style={[styles.kpiValue, { color: COLORS.redDark }]}>{fmt(epidemiologia.defuncionesAtribuiblesAnual)}</Text>
            <Text style={styles.kpiUnit}>muertes / ano</Text>
          </View>
        </View>

        {/* Visual: Cost vs Revenue bar */}
        <Text style={[styles.h3, { marginTop: 6 }]}>Costo de Salud vs Recaudacion Fiscal</Text>
        <View style={ls.ratioBar}>
          <View style={[ls.ratioSegment, { backgroundColor: COLORS.red, width: `${costoPct}%` }]}>
            <Text style={ls.ratioLabel}>Costo: ${fmt(costoDir)} Mdp</Text>
          </View>
          <View style={[ls.ratioSegment, { backgroundColor: COLORS.green, width: `${recPct}%` }]}>
            <Text style={ls.ratioLabel}>IEPS: ${fmt(recIeps)} Mdp</Text>
          </View>
        </View>

        {/* Insight */}
        <View style={ls.insightBox}>
          <Text style={ls.insightText}>
            Por cada peso recaudado via IEPS tabaco, el sistema de salud gasta
            ${costoDir > 0 && recIeps > 0 ? ` $${fmt(costoDir / recIeps, 1)}` : ' —'} pesos en atencion de enfermedades
            atribuibles al tabaquismo. El costo social total (${fmt(cargaEconomica.costoSocialAnualMdp)} Mdp) amplifica
            esta brecha significativamente.
          </Text>
        </View>

        {/* Economic burden table */}
        <Text style={styles.h3}>Carga Economica Detallada</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 3 }]}>Concepto</Text>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 2, textAlign: 'right' }]}>Valor (Mdp)</Text>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Fuente</Text>
          </View>
          {(() => {
            const rows = [
              { l: 'Costo directo anual', v: `$${fmt(costoDir)}`, f: cargaEconomica.fuentes.find(f => f.campo === 'costoDirectoAnualMdp')?.fuente ?? '—' },
              { l: 'Costo social anual', v: `$${fmt(cargaEconomica.costoSocialAnualMdp)}`, f: cargaEconomica.fuentes.find(f => f.campo === 'costoSocialAnualMdp')?.fuente ?? '—' },
              { l: 'Inversion en prevencion', v: `$${fmt(cargaEconomica.inversionPrevencionMdp)}`, f: cargaEconomica.fuentes.find(f => f.campo === 'inversionPrevencionMdp')?.fuente ?? '—' },
            ]
            return rows.map((r, i) => {
              const isLast = i === rows.length - 1
              return (
                <View key={i} style={[isLast ? styles.tableRowLast : styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, styles.tableColDivider, { flex: 3 }]}>{r.l}</Text>
                  <Text style={[styles.tableCellBold, styles.tableColDivider, { flex: 2, textAlign: 'right', color: COLORS.accent }]}>{r.v}</Text>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.tableCellSource}>{r.f}</Text>
                  </View>
                </View>
              )
            })
          })()}
        </View>

        {/* Epidemiology table */}
        <Text style={[styles.h3, { marginTop: 10 }]}>Indicadores Epidemiologicos</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 3 }]}>Indicador</Text>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 2, textAlign: 'right' }]}>Valor</Text>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Fuente</Text>
          </View>
          {(() => {
            const rows = [
              { l: 'Prevalencia actual', v: `${fmt(epidemiologia.prevalenciaActualPct, 1)}%`, f: epidemiologia.fuentes.find(f => f.campo === 'prevalenciaActualPct')?.fuente ?? '—' },
              { l: 'Fumadores estimados', v: fmt(epidemiologia.fumadoresEstimados), f: epidemiologia.fuentes.find(f => f.campo === 'fumadoresEstimados')?.fuente ?? '—' },
              { l: 'Poblacion 18+', v: fmt(epidemiologia.poblacion18Plus), f: epidemiologia.fuentes.find(f => f.campo === 'poblacion18Plus')?.fuente ?? '—' },
              { l: 'Defunciones atribuibles', v: fmt(epidemiologia.defuncionesAtribuiblesAnual), f: epidemiologia.fuentes.find(f => f.campo === 'defuncionesAtribuiblesAnual')?.fuente ?? '—' },
            ]
            return rows.map((r, i) => {
              const isLast = i === rows.length - 1
              return (
                <View key={i} style={[isLast ? styles.tableRowLast : styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, styles.tableColDivider, { flex: 3 }]}>{r.l}</Text>
                  <Text style={[styles.tableCellBold, styles.tableColDivider, { flex: 2, textAlign: 'right', color: COLORS.accent }]}>{r.v}</Text>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.tableCellSource}>{r.f}</Text>
                  </View>
                </View>
              )
            })
          })()}
        </View>
      </Page>

      {/* ── Page 3: Costos por Patologia ── */}
      <Page size="LETTER" style={styles.page}>
        <ReportFooter />

        <SectionHeader num="2" title="Costos por Patologia Atribuible" />

        <Text style={[styles.bodySmall, { marginBottom: 10 }]}>
          Desglose del costo de atencion medica por trastorno atribuible al consumo de tabaco,
          ajustado a precios 2025 con base en datos del IMSS y fuentes academicas.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { width: 44 }]}>CIE-10</Text>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 4 }]}>Trastorno</Text>
            <Text style={[styles.tableHeaderCell, styles.tableColDivider, { flex: 2, textAlign: 'right' }]}>Costo 2025 (MDP)</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Fuente</Text>
          </View>

          {costosPorPatologia.map((c, i) => {
            const isLast = i === costosPorPatologia.length - 1
            return (
              <View key={c.codigo} style={[isLast ? styles.tableRowLast : styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <View style={[styles.tableColDivider, { width: 44, justifyContent: 'center' }]}>
                  <Text style={[styles.tableCellBold, { color: COLORS.white, backgroundColor: COLORS.accent, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2, fontSize: 7.5, textAlign: 'center' }]}>
                    {c.codigo}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.tableColDivider, { flex: 4 }]}>{c.trastorno}</Text>
                <Text style={[styles.tableCellBold, styles.tableColDivider, { flex: 2, textAlign: 'right', color: COLORS.accent }]}>
                  ${fmt(c.costoAjustado2025)}
                </Text>
                <View style={{ flex: 2.5 }}>
                  <Text style={styles.tableCellSource}>{c.fuente}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Sources */}
        <View style={styles.sourceSection}>
          <Text style={[styles.h3, { marginBottom: 8 }]}>Fuentes de Datos</Text>
          {cargaEconomica.fuentes.map((f, i) => (
            <View key={f.campo} style={styles.sourceItem}>
              <Text style={styles.sourceNum}>[{i + 1}]</Text>
              <Text style={styles.sourceText}>
                {f.fuente} ({f.anioReferencia}) — Campo: {f.campo}
              </Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={{ marginTop: 14, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: COLORS.grayMedium }}>
          <Text style={[styles.bodySmall, { fontStyle: 'italic' }]}>
            Datos provenientes de fuentes oficiales mexicanas e internacionales. Los costos han sido
            ajustados a precios 2025 utilizando indices de inflacion del INEGI. Este documento es de
            caracter informativo y no constituye recomendacion de politica publica por si solo.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
