import { Svg, G, Line, Rect, Path, Circle, Text as SvgText } from '@react-pdf/renderer'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DataPoint {
  anio: number
  prevalenciaPct: number
  defuncionesEvitadas: number
  prevalenciaBaselinePct?: number
  defuncionesEvitadasAcumuladas?: number
}

interface PdfChartProps {
  data: DataPoint[]
  baselinePrevalencia: number
  isPositive: boolean
  width?: number
  height?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

function niceStep(range: number, targetTicks: number): number {
  const rough = range / targetTicks
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  let step: number
  if (norm <= 1.5) step = 1
  else if (norm <= 3.5) step = 2
  else if (norm <= 7.5) step = 5
  else step = 10
  return step * mag
}

function fmt(n: number, d = 0): string {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toFixed(d)
}

// ─── Chart Colors ────────────────────────────────────────────────────────────

const CHART = {
  gridColor: '#e2e8f0',
  axisColor: '#94a3b8',
  labelColor: '#64748b',
  prevalenciaStroke: '#3b82f6',
  prevalenciaFill: '#3b82f6',
  defuncionesStrokePos: '#22c55e',
  defuncionesStrokeNeg: '#ef4444',
  baselineColor: '#94a3b8',
  bgColor: '#fafbfc',
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PdfChart({
  data,
  baselinePrevalencia,
  isPositive,
  width = 480,
  height = 220,
}: PdfChartProps) {
  if (!data || data.length === 0) return null

  const hasBaseline = data[0]?.prevalenciaBaselinePct != null
  const hasCumulativeDeaths = data[0]?.defuncionesEvitadasAcumuladas != null

  // Layout
  const marginTop = 20
  const marginRight = 55
  const marginBottom = 35
  const marginLeft = 50
  const plotW = width - marginLeft - marginRight
  const plotH = height - marginTop - marginBottom

  // ── Left Y-axis: Prevalencia ──
  const prevValues = data.map(d => d.prevalenciaPct)
  const baselineValues = hasBaseline ? data.map(d => d.prevalenciaBaselinePct!) : [baselinePrevalencia]
  const allPrevValues = [...prevValues, ...baselineValues]
  const prevMin = Math.min(...allPrevValues) * 0.95
  const prevMax = Math.max(...allPrevValues) * 1.05
  const prevRange = prevMax - prevMin
  const prevStep = niceStep(prevRange, 4)
  const prevAxisMin = Math.floor(prevMin / prevStep) * prevStep
  const prevAxisMax = Math.ceil(prevMax / prevStep) * prevStep

  // ── Right Y-axis: Deaths (cumulative if available, otherwise annual) ──
  const defValues = data.map(d => hasCumulativeDeaths ? d.defuncionesEvitadasAcumuladas! : d.defuncionesEvitadas)
  const defMax = Math.max(...defValues, 1)
  const defMin = Math.min(...defValues, 0)
  const defRange = defMax - defMin || 1
  const defStep = niceStep(defRange, 4)
  const defAxisMin = Math.floor(defMin / defStep) * defStep
  const defAxisMax = Math.ceil(defMax / defStep) * defStep

  // ── X positions ──
  const xPositions = data.map((_, i) =>
    marginLeft + (i / Math.max(data.length - 1, 1)) * plotW
  )

  // ── Y mappers ──
  const yPrev = (v: number) =>
    marginTop + plotH - lerp(v, prevAxisMin, prevAxisMax, 0, plotH)
  const yDef = (v: number) =>
    marginTop + plotH - lerp(v, defAxisMin, defAxisMax, 0, plotH)

  // ── Build paths ──
  const prevPoints = data.map((d, i) => ({ x: xPositions[i], y: yPrev(d.prevalenciaPct) }))
  const defPoints = data.map((d, i) => ({ x: xPositions[i], y: yDef(hasCumulativeDeaths ? d.defuncionesEvitadasAcumuladas! : d.defuncionesEvitadas) }))

  const prevLinePath = prevPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Area path (fill under prevalence line)
  const prevAreaPath = prevLinePath +
    ` L${prevPoints[prevPoints.length - 1].x.toFixed(1)},${(marginTop + plotH).toFixed(1)}` +
    ` L${prevPoints[0].x.toFixed(1)},${(marginTop + plotH).toFixed(1)} Z`

  const defLinePath = defPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Baseline prevalence line (dynamic, from v2 data)
  const baselinePoints = hasBaseline
    ? data.map((d, i) => ({ x: xPositions[i], y: yPrev(d.prevalenciaBaselinePct!) }))
    : []
  const baselineLinePath = hasBaseline
    ? baselinePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : ''

  // ── Grid lines (horizontal) ──
  const prevTicks: number[] = []
  for (let v = prevAxisMin; v <= prevAxisMax + 0.001; v += prevStep) {
    prevTicks.push(Math.round(v * 100) / 100)
  }

  const defTicks: number[] = []
  for (let v = defAxisMin; v <= defAxisMax + 0.001; v += defStep) {
    defTicks.push(Math.round(v * 100) / 100)
  }

  // Baseline Y (fallback for v1 data)
  const baselineY = yPrev(baselinePrevalencia)

  const defColor = isPositive ? CHART.defuncionesStrokePos : CHART.defuncionesStrokeNeg

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Background */}
      <Rect x={marginLeft} y={marginTop} width={plotW} height={plotH} fill={CHART.bgColor} />

      {/* Horizontal grid lines (left axis) */}
      {prevTicks.map((v, i) => {
        const y = yPrev(v)
        return (
          <G key={`grid-${i}`}>
            <Line
              x1={marginLeft} y1={y} x2={marginLeft + plotW} y2={y}
              stroke={CHART.gridColor} strokeWidth={0.5}
            />
            <SvgText
              x={marginLeft - 6} y={y + 3}
              fill={CHART.labelColor}
              style={{ fontSize: 7, textAnchor: 'end' } as any}
            >
              {v.toFixed(1)}%
            </SvgText>
          </G>
        )
      })}

      {/* Right axis labels */}
      {defTicks.map((v, i) => {
        const y = yDef(v)
        return (
          <SvgText
            key={`def-label-${i}`}
            x={marginLeft + plotW + 6} y={y + 3}
            fill={defColor}
            style={{ fontSize: 7, textAnchor: 'start' } as any}
          >
            {fmt(v)}
          </SvgText>
        )
      })}

      {/* Baseline prevalence line (dynamic v2 or static v1 fallback) */}
      {hasBaseline ? (
        <Path d={baselineLinePath} stroke={CHART.baselineColor} strokeWidth={1.5} fill="none" strokeDasharray="4,3" />
      ) : (
        <Line
          x1={marginLeft} y1={baselineY}
          x2={marginLeft + plotW} y2={baselineY}
          stroke={CHART.baselineColor} strokeWidth={1} strokeDasharray="4,3"
        />
      )}

      {/* Area fill under prevalence */}
      <Path d={prevAreaPath} fill={CHART.prevalenciaFill} fillOpacity={0.08} />

      {/* Prevalence line (intervention) */}
      <Path d={prevLinePath} stroke={CHART.prevalenciaStroke} strokeWidth={2} fill="none" />

      {/* Deaths line (cumulative in v2, solid) */}
      <Path d={defLinePath} stroke={defColor} strokeWidth={1.5} fill="none" />

      {/* Data points - prevalence */}
      {prevPoints.map((p, i) => (
        <Circle key={`prev-dot-${i}`} cx={p.x} cy={p.y} r={3} fill={CHART.prevalenciaStroke} />
      ))}

      {/* Data points - defunciones */}
      {defPoints.map((p, i) => (
        <Circle key={`def-dot-${i}`} cx={p.x} cy={p.y} r={2.5} fill={defColor} />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <SvgText
          key={`x-${i}`}
          x={xPositions[i]} y={marginTop + plotH + 14}
          fill={CHART.labelColor}
          style={{ fontSize: 7, textAnchor: 'middle' } as any}
        >
          {d.anio}
        </SvgText>
      ))}

      {/* Axes */}
      <Line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + plotH} stroke={CHART.axisColor} strokeWidth={1} />
      <Line x1={marginLeft} y1={marginTop + plotH} x2={marginLeft + plotW} y2={marginTop + plotH} stroke={CHART.axisColor} strokeWidth={1} />
      <Line x1={marginLeft + plotW} y1={marginTop} x2={marginLeft + plotW} y2={marginTop + plotH} stroke={defColor} strokeWidth={0.5} />

      {/* Axis titles */}
      <SvgText x={12} y={marginTop + plotH / 2} fill={CHART.prevalenciaStroke} style={{ fontSize: 7, textAnchor: 'middle' } as any} transform={`rotate(-90, 12, ${marginTop + plotH / 2})`}>
        Prevalencia (%)
      </SvgText>
      <SvgText x={width - 8} y={marginTop + plotH / 2} fill={defColor} style={{ fontSize: 7, textAnchor: 'middle' } as any} transform={`rotate(90, ${width - 8}, ${marginTop + plotH / 2})`}>
        {hasCumulativeDeaths ? 'Muertes evitadas (acum.)' : 'Muertes evitadas'}
      </SvgText>

      {/* Legend */}
      <Line x1={marginLeft + 10} y1={height - 8} x2={marginLeft + 30} y2={height - 8} stroke={CHART.prevalenciaStroke} strokeWidth={2} />
      <SvgText x={marginLeft + 34} y={height - 5} fill={CHART.labelColor} style={{ fontSize: 6 } as any}>Con intervención %</SvgText>
      <Line x1={marginLeft + 120} y1={height - 8} x2={marginLeft + 140} y2={height - 8} stroke={CHART.baselineColor} strokeWidth={1.5} strokeDasharray="4,3" />
      <SvgText x={marginLeft + 144} y={height - 5} fill={CHART.labelColor} style={{ fontSize: 6 } as any}>Sin intervención %</SvgText>
      <Line x1={marginLeft + 240} y1={height - 8} x2={marginLeft + 260} y2={height - 8} stroke={defColor} strokeWidth={1.5} />
      <SvgText x={marginLeft + 264} y={height - 5} fill={CHART.labelColor} style={{ fontSize: 6 } as any}>{isPositive ? 'Muertes evitadas (acum.)' : 'Muertes adicionales (acum.)'}</SvgText>
    </Svg>
  )
}
