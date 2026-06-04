import { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

interface ExportButtonsProps {
  pdfDocument: React.ReactElement
  pdfFileName: string
  onExcelDownload: () => Promise<void>
  onPdfDownload?: () => void
}

export function ExportButtons({ pdfDocument, pdfFileName, onExcelDownload, onPdfDownload }: ExportButtonsProps) {
  const [excelLoading, setExcelLoading] = useState(false)

  const handleExcel = async () => {
    setExcelLoading(true)
    try {
      await onExcelDownload()
    } catch (err) {
      console.error('Error downloading Excel:', err)
    } finally {
      setExcelLoading(false)
    }
  }

  return (
    <div className="flex gap-2.5">
      <PDFDownloadLink
        document={pdfDocument as any}
        fileName={pdfFileName}
        onClick={() => onPdfDownload?.()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-200 no-underline hover:shadow-md"
        style={{
          background: 'linear-gradient(135deg, rgba(220,38,38,0.12), rgba(220,38,38,0.06))',
          border: '1px solid rgba(220,38,38,0.20)',
          color: '#dc2626',
        }}
      >
        {({ loading }) => (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
            {loading ? 'Generando PDF...' : 'Descargar PDF'}
          </>
        )}
      </PDFDownloadLink>
      <button
        onClick={handleExcel}
        disabled={excelLoading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-200 border-none disabled:opacity-50 hover:shadow-md"
        style={{
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
          border: '1px solid rgba(34,197,94,0.20)',
          color: '#16a34a',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {excelLoading ? 'Descargando...' : 'Descargar Excel'}
      </button>
    </div>
  )
}
