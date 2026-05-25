import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS } from './pdfStyles'

const s = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  brand: {
    fontSize: 7,
    color: COLORS.gray,
  },
  pageNum: {
    fontSize: 7,
    color: COLORS.gray,
  },
})

export function ReportFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={s.left}>
        <View style={s.mark} />
        <Text style={s.brand}>
          AirTellecta — Inteligencia Epidemiologica
        </Text>
      </View>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) =>
        `Pagina ${pageNumber} de ${totalPages}`
      } />
    </View>
  )
}
