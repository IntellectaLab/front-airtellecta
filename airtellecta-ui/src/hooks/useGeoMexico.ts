import { useState, useEffect } from 'react'

export interface GeoFeature {
  type: 'Feature'
  properties: { NAME_1: string; GID_1: string }
  geometry: { type: string; coordinates: number[][][] | number[][][][] }
}

export interface GeoCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

const GEOJSON_URL: string =
  import.meta.env.VITE_MEXICO_GEOJSON_URL ??
  (import.meta.env.DEV ? '/geojson-mexico' : 'https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_MEX_1.json')

let cache: GeoCollection | null = null
let promise: Promise<GeoCollection> | null = null

function fetchGeo(): Promise<GeoCollection> {
  if (cache) return Promise.resolve(cache)
  if (!promise) {
    promise = fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(data => { cache = data; return data })
  }
  return promise
}

export function useGeoMexico() {
  const [geo, setGeo] = useState<GeoCollection | null>(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    fetchGeo().then(data => { setGeo(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return { geo, loading }
}

export function normalizarNombre(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+de\s+(zaragoza|ocampo|juarez|ignacio|la llave)\b/g, '')
    .replace(/estado de\s+/g, '')
    .trim()
}
