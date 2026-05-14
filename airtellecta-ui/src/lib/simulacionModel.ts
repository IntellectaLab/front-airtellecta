import type { SimulacionResultado } from '../types/api'

// ── Constantes epidemiológicas ────────────────────────────────────────────────
// Fuentes: INSP, OPS/OMS MPOWER, OCDE, CONEVAL

/** Elasticidad precio-demanda de tabaco en México (OCDE / Jiménez-Ruiz et al. 2020) */
export const ELASTICIDAD_PRECIO = -0.42

/** Declinación tendencial histórica de prevalencia en México, pp/año
 *  ENCODAT 2016 → 2021: de 17.6% a 15.9% = -0.34pp/año */
export const TENDENCIA_PP_ANUAL = -0.40

/** Tasa de mortalidad atribuible por fumador por año (INSP 2021) */
const TASA_MORTALIDAD = 0.0045

/** Valor estadístico de la vida en México, millones de MXN 2025 (CONEVAL) */
const COSTO_VIDA_MDP = 3.2

// ── Efectos de políticas MPOWER ───────────────────────────────────────────────
// Reducción acumulada de prevalencia (pp) al implementar cada política plenamente.
// Estimados para México/LAC (revisiones sistemáticas OPS 2021, WHO FCTC evidence briefs).

interface PoliticaMeta {
  nombre: string
  /** pp de reducción de prevalencia acumulada sobre el horizonte de proyección */
  efectoTotalPp: number
}

export const POLITICA_META: Record<string, PoliticaMeta> = {
  ADVERTENCIAS:           { nombre: 'Advertencias gráficas obligatorias',    efectoTotalPp: 3.5 },
  PROHIBICION_PUBLICIDAD: { nombre: 'Prohibición de publicidad y patrocinio', efectoTotalPp: 2.5 },
  ESPACIOS_LIBRES:        { nombre: 'Espacios 100% libres de humo',           efectoTotalPp: 5.0 },
  CESSATION:              { nombre: 'Programas de cesación tabáquica',         efectoTotalPp: 2.5 },
}

// ── Ajuste de políticas sobre resultado del backend ───────────────────────────

/**
 * Aplica los efectos de las políticas seleccionadas encima de un resultado
 * baseline ya calculado por el backend.
 *
 * Se usa cuando el endpoint /api/simulacion devuelve 400 con políticas incluidas:
 * se obtiene el baseline del backend (sin políticas) y este módulo calcula
 * el efecto incremental de cada política.
 */
export function aplicarEfectoPoliticas(
  baseline: SimulacionResultado,
  politicas: string[],
): SimulacionResultado {
  const validas = politicas.filter((c) => POLITICA_META[c])
  if (!validas.length) return baseline

  const politicasAplicadas = validas.map((clave) => ({
    clave,
    nombre:    POLITICA_META[clave].nombre,
    efectoPct: POLITICA_META[clave].efectoTotalPp,
  }))

  const efectoTotalPp = politicasAplicadas.reduce((s, p) => s + p.efectoPct, 0)
  const horizonte     = baseline.proyeccion.length
  const pobBase       = baseline.parametrosBase.poblacion18Plus

  // Distribución logarítmica: mayor impacto en los primeros años (curva de adopción)
  const logPesos = Array.from({ length: horizonte }, (_, i) => Math.log(i + 2))
  const logSum   = logPesos.reduce((a, b) => a + b, 0)

  let fumadoresEvitadosAcum   = 0
  let defuncionesEvitadasAcum = 0
  let ahorroAcumMdp           = 0

  const proyeccion = baseline.proyeccion.map((row, t) => {
    const reduccionAnio   = efectoTotalPp * (logPesos[t] / logSum)
    const prevAjustada    = Math.max(0.5, row.prevalenciaPct - reduccionAnio)
    const fumadoresAjust  = Math.round((prevAjustada / 100) * pobBase)
    const defuncionesAjust = Math.round(fumadoresAjust * TASA_MORTALIDAD)

    const defuncionesEvitadas = Math.max(
      0,
      baseline.parametrosBase.defuncionesAtribuiblesBase - defuncionesAjust,
    )
    const ahorroMdp = defuncionesEvitadas * COSTO_VIDA_MDP

    fumadoresEvitadosAcum   += Math.max(0, baseline.parametrosBase.fumadoresBase - fumadoresAjust)
    defuncionesEvitadasAcum += defuncionesEvitadas
    ahorroAcumMdp           += ahorroMdp

    return {
      ...row,
      prevalenciaPct:      Math.round(prevAjustada * 10) / 10,
      fumadoresAbsolutos:  fumadoresAjust,
      defuncionesEvitadas,
      ahorroMdp: Math.round(ahorroMdp * 10) / 10,
    }
  })

  const prevalenciaFinal = proyeccion[proyeccion.length - 1].prevalenciaPct
  const prevBase         = baseline.parametrosBase.prevalenciaBasePct

  return {
    ...baseline,
    proyeccion,
    politicasAplicadas,
    resumenFinal: {
      prevalenciaFinalPct:      prevalenciaFinal,
      reduccionPuntosPct:       Math.round((prevBase - prevalenciaFinal) * 10) / 10,
      fumadoresEvitadosTotal:   fumadoresEvitadosAcum,
      defuncionesEvitadasTotal: defuncionesEvitadasAcum,
      ahorroAcumuladoMdp:       Math.round(ahorroAcumMdp * 10) / 10,
    },
  }
}

// ── Línea base para gráfica de pronóstico ─────────────────────────────────────

/**
 * Genera la proyección de tendencia base (sin ninguna intervención) a partir
 * de la prevalencia base del backend. Se usa como comparador en la gráfica.
 */
export function proyectarTendenciaBase(
  prevalenciaBase: number,
  anioInicio: number,
  horizonte: number,
): { anio: number; sinIntervencion: number }[] {
  return Array.from({ length: horizonte }, (_, t) => ({
    anio:            anioInicio + t,
    sinIntervencion: Math.max(
      0.5,
      Math.round((prevalenciaBase + (t + 1) * TENDENCIA_PP_ANUAL) * 10) / 10,
    ),
  }))
}
