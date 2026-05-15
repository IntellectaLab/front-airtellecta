import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { useMapaEstatal } from '../../hooks/useMapaEstatal'
import type { EntidadPrevalencia } from '../../types/api'

// ── Color scale ──────────────────────────────────────────────────────────────

function getColorForPrevalencia(prev: number): string {
  if (prev >= 20) return '#ef4444'
  if (prev >= 15) return '#f97316'
  if (prev >= 10) return '#eab308'
  return '#22c55e'
}

function getOpacityForPrevalencia(prev: number): number {
  if (prev >= 20) return 0.80
  if (prev >= 15) return 0.70
  if (prev >= 10) return 0.58
  return prev > 0 ? 0.45 : 0.15
}

// ── Name normalization ───────────────────────────────────────────────────────

function normalizeNombre(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// GADM 4.1 puede usar nombres históricos o cortos que difieren de los del API (INEGI)
const GADM_ALIASES: Record<string, string> = {
  'distrito federal':             'ciudad de mexico',   // nombre pre-2016
  'mexico city':                  'ciudad de mexico',
  'coahuila':                     'coahuila de zaragoza',
  'michoacan':                    'michoacan de ocampo',
  'veracruz':                     'veracruz de ignacio de la llave',
}

function findEstadoByGadmName(
  gadmName: string,
  byNombre: Map<string, EntidadPrevalencia>,
): EntidadPrevalencia | undefined {
  const norm = normalizeNombre(gadmName)

  // 1. Coincidencia directa
  const direct = byNombre.get(norm)
  if (direct) return direct

  // 2. Alias conocidos (nombre histórico / corto → nombre oficial INEGI)
  const alias = GADM_ALIASES[norm]
  if (alias) {
    const aliased = byNombre.get(alias)
    if (aliased) return aliased
  }

  // 3. Prefijo: "Coahuila" coincide con "Coahuila de Zaragoza"
  for (const [key, value] of byNombre) {
    if (key.startsWith(norm) || norm.startsWith(key)) return value
  }

  return undefined
}

// ── Constants ────────────────────────────────────────────────────────────────

const MEXICO_CENTER: google.maps.LatLngLiteral = { lat: 23.9, lng: -102.5 }

// Dev: proxied through Vite to avoid CORS; Prod: set VITE_MEXICO_GEOJSON_URL
const GEOJSON_URL: string =
  import.meta.env.VITE_MEXICO_GEOJSON_URL ??
  (import.meta.env.DEV ? '/geojson-mexico' : 'https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_MEX_1.json')

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: true,
  zoom: 4,
  restriction: {
    latLngBounds: { north: 34, south: 13, west: -122, east: -84 },
    strictBounds: false,
  },
  styles: [
    { elementType: 'geometry',        stylers: [{ color: '#dbeafe' }] },
    { elementType: 'labels',          stylers: [{ visibility: 'off' }] },
    { featureType: 'water',           elementType: 'geometry', stylers: [{ color: '#7dd3fc' }] },
    { featureType: 'road',            stylers: [{ visibility: 'off' }] },
    { featureType: 'poi',             stylers: [{ visibility: 'off' }] },
    { featureType: 'transit',         stylers: [{ visibility: 'off' }] },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1e40af' }, { weight: 1.5 }],
    },
  ],
}

const LEGEND = [
  { label: 'Crítico (≥20%)', color: '#ef4444' },
  { label: 'Alto (15–19%)', color: '#f97316' },
  { label: 'Medio (10–14%)', color: '#eab308' },
  { label: 'Bajo (<10%)',    color: '#22c55e' },
]

// ── Component ────────────────────────────────────────────────────────────────

export function MapaVulnerabilidad() {
  const { data: estados } = useMapaEstatal()
  const [map, setMap]               = useState<google.maps.Map | null>(null)
  const [hoveredEstado, setHovered] = useState<EntidadPrevalencia | null>(null)
  const dataLayerRef                = useRef<google.maps.Data | null>(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: apiKey })

  const byNombre = useMemo(() => {
    const m = new Map<string, EntidadPrevalencia>()
    for (const e of estados ?? []) m.set(normalizeNombre(e.nombre), e)
    return m
  }, [estados])

  const findEstado = useCallback(
    (gadmName: string) => findEstadoByGadmName(gadmName, byNombre),
    [byNombre],
  )

  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), [])

  // Load GeoJSON and bind styles + events when map + data are ready
  useEffect(() => {
    if (!map) return

    dataLayerRef.current?.setMap(null)

    let cancelled = false
    const layer = new google.maps.Data({ map })
    dataLayerRef.current = layer

    layer.loadGeoJson(GEOJSON_URL, {}, () => {
      if (cancelled) return
      layer.setStyle((feature) => {
        const name   = (feature.getProperty('NAME_1') as string) ?? ''
        const estado = findEstado(name)
        const prev   = estado ? Number(estado.prevalencia) : 0
        return {
          fillColor:    getColorForPrevalencia(prev),
          fillOpacity:  getOpacityForPrevalencia(prev),
          strokeColor:  '#1e3a5f',
          strokeWeight: 0.7,
          strokeOpacity: 0.6,
          cursor: estado ? 'pointer' : 'default',
        }
      })
    })

    layer.addListener('mouseover', (e: google.maps.Data.MouseEvent) => {
      const name   = (e.feature.getProperty('NAME_1') as string) ?? ''
      const estado = findEstado(name)
      layer.overrideStyle(e.feature, { strokeWeight: 2.5, strokeOpacity: 1, fillOpacity: 0.92 })
      setHovered(estado ?? null)
    })

    layer.addListener('mouseout', (e: google.maps.Data.MouseEvent) => {
      layer.revertStyle(e.feature)
      setHovered(null)
    })

    return () => {
      cancelled = true
      layer.setMap(null)
    }
  }, [map, findEstado])

  // ── No API key configured ────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div
        className="metric-card-glass flex flex-col items-center justify-center rounded-[18px] h-[440px] gap-3 px-6 text-center"
        data-testid="mapa-vulnerabilidad"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[13px] font-bold text-[#f97316]">
          API Key de Google Maps no configurada
        </p>
        <p className="text-[12px] text-[#5580a8] dark:text-white/40 max-w-[280px] leading-relaxed">
          Agrega <code className="bg-[rgba(180,210,240,0.35)] dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code> en tu archivo{' '}
          <code className="bg-[rgba(180,210,240,0.35)] dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px]">.env.local</code>
        </p>
      </div>
    )
  }

  // ── Google Maps load error ───────────────────────────────────────────────
  if (loadError) {
    return (
      <div
        className="metric-card-glass flex items-center justify-center rounded-[18px] min-h-[320px]"
        data-testid="mapa-vulnerabilidad"
      >
        <p className="text-[13px] text-[#ef4444]">No se pudo cargar Google Maps</p>
      </div>
    )
  }

  // ── Map ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="metric-card-glass flex flex-col rounded-[18px] overflow-hidden"
      data-testid="mapa-vulnerabilidad"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-2 shrink-0">
        <p className="text-[13px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
          Mapa de Vulnerabilidad
        </p>
        <p className="text-[20px] font-semibold text-[#0c1f3f] dark:text-white">
          Índice de riesgo por estado
        </p>
      </div>

      {/* Wrapper relativo para posicionar el tooltip sobre el mapa */}
      <div className="relative mx-4 mb-2">

        {/* Map — overflow-hidden acota solo el render del mapa */}
        <div className="h-[320px] rounded-[12px] overflow-hidden">
          {!isLoaded ? (
            <div className="w-full h-full animate-pulse bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.05] rounded-[12px]" />
          ) : (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={MEXICO_CENTER}
              zoom={4}
              options={MAP_OPTIONS}
              onLoad={onMapLoad}
            />
          )}
        </div>

        {/* Tooltip — fuera del overflow-hidden para que no se recorte */}
        {hoveredEstado && (
          <div className="absolute bottom-3 left-3 pointer-events-none z-10">
            <div className="metric-card-glass rounded-[12px] px-3 py-2.5 shadow-lg border border-[rgba(180,210,240,0.40)] dark:border-white/[0.10]">
              <p className="text-[13px] font-bold text-[#0c1f3f] dark:text-white leading-tight">
                {hoveredEstado.nombre}
              </p>
              <p className="text-[12px] text-[#5580a8] dark:text-white/50 mt-0.5">
                Prevalencia:{' '}
                <span
                  className="font-semibold"
                  style={{ color: getColorForPrevalencia(Number(hoveredEstado.prevalencia)) }}
                >
                  {Number(hoveredEstado.prevalencia).toFixed(1)}%
                </span>
              </p>
              <p className="text-[11px] text-[#8aaac5] dark:text-white/30 mt-px">
                ~{Number(hoveredEstado.fumadoresEstimados).toLocaleString('es-MX')} fumadores est.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-5 pt-1 pb-4 shrink-0 flex-wrap">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: l.color }}
            />
            <span className="text-[11px] text-[#5580a8] dark:text-white/40">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
