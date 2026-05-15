import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, useLoadScript, Polygon } from '@react-google-maps/api'
import { geoCentroid } from 'd3-geo'
import { useMapaEstatal } from '../../hooks/useMapaEstatal'
import { useGeoMexico, normalizarNombre } from '../../hooks/useGeoMexico'
import type { EntidadPrevalencia } from '../../types/api'
import type { GeoFeature } from '../../hooks/useGeoMexico'

// ── Polygon coords from GeoJSON feature ────────────────────────────────────

function geoToLatLng(ring: number[][]): google.maps.LatLngLiteral[] {
  return ring.map(([lng, lat]) => ({ lat, lng }))
}

function extractPolygons(feature: GeoFeature): google.maps.LatLngLiteral[][] {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon')
    return [geoToLatLng((coordinates as number[][][])[0])]
  if (type === 'MultiPolygon')
    return (coordinates as number[][][][]).map(p => geoToLatLng(p[0]))
  return []
}

// ── Estado detail panel ─────────────────────────────────────────────────────

const DETAIL_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  gestureHandling: 'none',
  styles: [
    { elementType: 'geometry',          stylers: [{ color: '#e8f0f8' }] },
    { elementType: 'labels',            stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8d4f0' }] },
    { featureType: 'road',              stylers: [{ visibility: 'off' }] },
    { featureType: 'poi',               stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#1e40af' }, { weight: 1 }] },
  ],
}

function fmtN(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('es-MX')
}

function riesgoLabel(prev: number): { label: string; cls: string } {
  if (prev >= 20) return { label: 'Zona roja',    cls: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' }
  if (prev >= 15) return { label: 'Zona naranja', cls: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' }
  if (prev >= 10) return { label: 'Zona amarilla',cls: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' }
  return          { label: 'Zona verde',    cls: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' }
}

interface EstadoDetalleProps {
  feature: GeoFeature
  estado:  EntidadPrevalencia
  isLoaded: boolean
  onClose: () => void
}

function EstadoDetalle({ feature, estado, isLoaded, onClose }: EstadoDetalleProps) {
  const prev      = Number(estado.prevalencia)
  const color     = getColorForPrevalencia(prev)
  const { label, cls } = riesgoLabel(prev)
  const national  = 15.06
  const polygons  = extractPolygons(feature)
  const centroid  = geoCentroid(feature)
  const center    = { lat: centroid[1], lng: centroid[0] }

  return (
    <div className="absolute inset-0 z-20 flex flex-col rounded-[18px] overflow-hidden bg-white/96 dark:bg-[rgba(10,16,38,0.97)] backdrop-blur-sm">

      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[rgba(180,210,240,0.30)] dark:border-white/[0.07] shrink-0">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.8px] text-[#5580a8] dark:text-white/35">
            Vulnerabilidad estatal
          </p>
          <h3 className="font-display text-[20px] font-extrabold text-[#0c1f3f] dark:text-white tracking-[-0.3px]">
            {estado.nombre}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[8px] border-none bg-transparent cursor-pointer text-[#5580a8] hover:text-[#0c1f3f] dark:text-white/40 dark:hover:text-white transition-colors"
            aria-label="Cerrar"
            data-testid="btn-cerrar-detalle"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mapa del estado */}
      <div className="shrink-0 border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '200px' }}
            center={center}
            zoom={6}
            options={DETAIL_MAP_OPTIONS}
          >
            {polygons.map((path, i) => (
              <Polygon
                key={i}
                paths={path}
                options={{
                  fillColor:    color,
                  fillOpacity:  0.35,
                  strokeColor:  color,
                  strokeWeight: 2,
                  strokeOpacity: 0.9,
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="h-[200px] flex items-center justify-center bg-[rgba(235,242,252,0.60)] dark:bg-white/[0.03]">
            <span className="text-[14px] text-[#5580a8] dark:text-white/30">Cargando mapa…</span>
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-3">

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Prevalencia',    value: `${prev.toFixed(1)}%`, accent: true  },
            { label: 'vs Nacional',    value: `${prev >= national ? '+' : ''}${(prev - national).toFixed(1)}pp`, accent: false },
            { label: 'Fumadores est.', value: fmtN(Number(estado.fumadoresEstimados)), accent: false },
            { label: 'Tasa / 100K',    value: Number(estado.tasa100k).toFixed(1),     accent: false },
          ].map(k => (
            <div key={k.label} className="metric-card-glass rounded-[12px] p-3 flex flex-col gap-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#5580a8] dark:text-white/30">{k.label}</p>
              <p
                className={`font-display text-[22px] font-extrabold tracking-[-0.5px] ${k.accent ? '' : 'text-[#5580a8] dark:text-white/60'}`}
                style={k.accent ? { color } : {}}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Barra comparativa */}
        <div className="metric-card-glass rounded-[12px] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#5580a8] dark:text-white/30 mb-2">Comparativa</p>
          {[
            { label: estado.abreviatura, val: prev,    color },
            { label: 'Nacional',         val: national, color: '#5580a8' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold w-10 text-[#5580a8] dark:text-white/40 shrink-0">{b.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-[rgba(180,210,240,0.25)] dark:bg-white/[0.06]">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(b.val / 30 * 100, 100)}%`, background: b.color }} />
              </div>
              <span className="text-[11px] font-bold w-9 text-right" style={{ color: b.color }}>{b.val.toFixed(1)}%</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[#5580a8] dark:text-white/20 text-center leading-relaxed">
          Datos ENCODAT 2025 · Granularidad municipal no disponible en este módulo
        </p>
      </div>
    </div>
  )
}

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
  const { geo } = useGeoMexico()
  const [map, setMap]               = useState<google.maps.Map | null>(null)
  const [hoveredEstado, setHovered] = useState<EntidadPrevalencia | null>(null)
  const [selected, setSelected]     = useState<{ feature: GeoFeature; estado: EntidadPrevalencia } | null>(null)
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

    layer.addListener('click', (e: google.maps.Data.MouseEvent) => {
      const name   = (e.feature.getProperty('NAME_1') as string) ?? ''
      const estado = findEstado(name)
      if (!estado || !geo) return
      const feature = geo.features.find(
        f => normalizarNombre(f.properties.NAME_1) === normalizarNombre(name) ||
             findEstadoByGadmName(f.properties.NAME_1, byNombre)?.cveEntidad === estado.cveEntidad
      )
      if (feature) setSelected({ feature, estado })
    })

    return () => {
      cancelled = true
      layer.setMap(null)
    }
  }, [map, findEstado, geo, byNombre])

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
        <p className="text-[15px] font-bold text-[#f97316]">
          API Key de Google Maps no configurada
        </p>
        <p className="text-[14px] text-[#5580a8] dark:text-white/40 max-w-[280px] leading-relaxed">
          Agrega <code className="bg-[rgba(180,210,240,0.35)] dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px]">VITE_GOOGLE_MAPS_API_KEY</code> en tu archivo{' '}
          <code className="bg-[rgba(180,210,240,0.35)] dark:bg-white/10 px-1.5 py-0.5 rounded text-[13px]">.env.local</code>
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
        <p className="text-[15px] text-[#ef4444]">No se pudo cargar Google Maps</p>
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
        <p className="text-[15px] font-bold tracking-[0.8px] text-[#5580a8] uppercase dark:text-white/35">
          Mapa de Vulnerabilidad
        </p>
        <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
          Índice de riesgo por estado
        </p>
      </div>

      {/* Wrapper relativo para tooltip y panel de detalle */}
      <div className="relative mx-4 mb-2">

        {/* Estado detail panel — se superpone al mapa */}
        {selected && (
          <EstadoDetalle
            feature={selected.feature}
            estado={selected.estado}
            isLoaded={isLoaded}
            onClose={() => setSelected(null)}
          />
        )}

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
              <p className="text-[15px] font-bold text-[#0c1f3f] dark:text-white leading-tight">
                {hoveredEstado.nombre}
              </p>
              <p className="text-[14px] text-[#5580a8] dark:text-white/50 mt-0.5">
                Prevalencia:{' '}
                <span
                  className="font-semibold"
                  style={{ color: getColorForPrevalencia(Number(hoveredEstado.prevalencia)) }}
                >
                  {Number(hoveredEstado.prevalencia).toFixed(1)}%
                </span>
              </p>
              <p className="text-[13px] text-[#8aaac5] dark:text-white/30 mt-px">
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
            <span className="text-[13px] text-[#5580a8] dark:text-white/40">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
