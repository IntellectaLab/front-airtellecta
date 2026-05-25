import html2canvas from 'html2canvas'

/**
 * Captures a DOM element (containing a Recharts chart) as a PNG data URL.
 * Uses html2canvas which properly handles SVG + CSS rendering.
 */
export async function captureChartAsImage(
  element: HTMLElement | null,
): Promise<string | null> {
  if (!element) return null
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
    })
    return canvas.toDataURL('image/png')
  } catch (err) {
    console.error('Chart capture failed:', err)
    return null
  }
}
