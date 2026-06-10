import { StyleSheet } from '@react-pdf/renderer'

// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
  primary:      '#0c1f3f',
  primaryLight: '#1a3260',
  accent:       '#1d5ce8',
  accentLight:  '#e8effd',
  green:        '#16a34a',
  greenLight:   '#dcfce7',
  greenDark:    '#166534',
  red:          '#dc2626',
  redLight:     '#fee2e2',
  redDark:      '#991b1b',
  amber:        '#d97706',
  amberLight:   '#fef3c7',
  gray:         '#64748b',
  grayLight:    '#f1f5f9',
  grayMedium:   '#cbd5e1',
  grayDark:     '#334155',
  white:        '#ffffff',
  black:        '#0f172a',
}

// ─── Shared styles ───────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  // ── Page ──
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 48,
    color: COLORS.primary,
    backgroundColor: COLORS.white,
  },

  // ── Section headers ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  sectionNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    backgroundColor: COLORS.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    paddingTop: 4,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    color: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: 5,
  },
  h3: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: COLORS.primaryLight,
  },

  // ── Body text ──
  body: {
    fontSize: 9,
    lineHeight: 1.6,
    color: COLORS.grayDark,
  },
  bodySmall: {
    fontSize: 8,
    lineHeight: 1.5,
    color: COLORS.gray,
  },

  // ── KPI cards ──
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    marginRight: 8,
  },
  kpiLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: COLORS.gray,
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  kpiUnit: {
    fontSize: 8,
    color: COLORS.gray,
  },

  // ── Tables ──
  table: {
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: COLORS.grayMedium,
    borderRadius: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 28,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 28,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 8.5,
    color: COLORS.grayDark,
    lineHeight: 1.4,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },
  tableCellSource: {
    fontSize: 7,
    color: COLORS.gray,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tableColDivider: {
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
    marginRight: 10,
    paddingRight: 10,
  },

  // ── Formula pipeline ──
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  formulaBox: {
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    flex: 1,
  },
  formulaStepNum: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    backgroundColor: COLORS.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    paddingTop: 3,
    marginBottom: 4,
  },
  formulaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  formulaValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  formulaExpression: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: COLORS.grayDark,
    backgroundColor: '#f8fafc',
    padding: 4,
    borderRadius: 3,
    marginBottom: 3,
  },
  formulaSource: {
    fontSize: 6.5,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  formulaArrow: {
    width: 20,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.grayMedium,
    marginHorizontal: 2,
  },

  // ── Chart image ──
  chartContainer: {
    marginVertical: 12,
    borderWidth: 0.5,
    borderColor: COLORS.grayMedium,
    borderRadius: 6,
    padding: 8,
    backgroundColor: COLORS.white,
  },
  chartImage: {
    width: '100%',
    height: 210,
    objectFit: 'contain',
  },
  chartCaption: {
    fontSize: 7,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // ── Narrative block ──
  narrativeBox: {
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
  },

  // ── Sources ──
  sourceSection: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayMedium,
  },
  sourceItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  sourceNum: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
    width: 16,
    marginRight: 4,
  },
  sourceText: {
    fontSize: 7,
    color: COLORS.gray,
    lineHeight: 1.4,
    flex: 1,
  },

  // ── Badges / tags ──
  badge: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── Divider ──
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.grayMedium,
    marginVertical: 10,
  },
})
