import { Page, View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS } from './pdfStyles'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.white,
    position: 'relative',
  },
  // Left accent sidebar
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 48,
    backgroundColor: COLORS.primary,
  },
  sidebarAccent: {
    position: 'absolute',
    top: 0,
    left: 48,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.accent,
  },
  // Content area
  content: {
    paddingLeft: 72,
    paddingRight: 50,
    paddingTop: 60,
    paddingBottom: 50,
    flex: 1,
    justifyContent: 'space-between',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoLetter: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 7,
    color: COLORS.gray,
    letterSpacing: 1,
    marginTop: 1,
  },
  institutionBox: {
    textAlign: 'right',
    maxWidth: 180,
  },
  institutionText: {
    fontSize: 9,
    color: COLORS.gray,
    lineHeight: 1.4,
  },
  // Title section
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  accentDot: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    lineHeight: 1.15,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 1.6,
    maxWidth: 380,
  },
  // Decorative divider
  decorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  decorDash: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
    marginRight: 6,
  },
  decorDashSmall: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.grayMedium,
    borderRadius: 1,
    marginRight: 6,
  },
  // Footer metadata
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    color: COLORS.primary,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  classBadge: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.amber,
    backgroundColor: COLORS.amberLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})

interface ReportCoverProps {
  title: string
  subtitle: string
  userName: string
  institutionName?: string
}

export function ReportCover({ title, subtitle, userName, institutionName }: ReportCoverProps) {
  const now = new Date()
  const fecha = now.toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const hora = now.toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <Page size="LETTER" style={s.page}>
      {/* Left sidebar */}
      <View style={s.sidebar} />
      <View style={s.sidebarAccent} />

      <View style={s.content}>
        {/* Header with branding */}
        <View style={s.header}>
          <View>
            <View style={s.brandRow}>
              <View style={s.logoMark}>
                <Text style={s.logoLetter}>A</Text>
              </View>
              <View>
                <Text style={s.brandName}>AIRTELLECTA</Text>
                <Text style={s.brandSub}>INTELIGENCIA EPIDEMIOLOGICA</Text>
              </View>
            </View>
          </View>
          {institutionName && (
            <View style={s.institutionBox}>
              <Text style={s.institutionText}>{institutionName}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <View style={s.titleBlock}>
          <View style={s.decorLine}>
            <View style={s.decorDash} />
            <View style={s.decorDashSmall} />
            <View style={s.decorDashSmall} />
          </View>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>

        {/* Footer metadata */}
        <View style={s.footer}>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Generado por</Text>
              <Text style={s.metaValue}>{userName}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Fecha de generacion</Text>
              <Text style={s.metaValue}>{fecha}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Hora</Text>
              <Text style={s.metaValue}>{hora}</Text>
            </View>
          </View>
          <View style={s.classRow}>
            <Text style={s.classBadge}>Documento ejecutivo — Uso interno</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}
