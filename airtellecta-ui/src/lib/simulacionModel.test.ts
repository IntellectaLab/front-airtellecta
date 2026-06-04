import { describe, it, expect } from 'vitest'
import {
  proyectarTendenciaBase,
  aplicarEfectoPoliticas,
  ELASTICIDAD_PRECIO,
  TENDENCIA_PP_ANUAL,
  POLITICA_META,
} from './simulacionModel'
import type { SimulacionResultado } from '../types/api'

// Helper: create a minimal SimulacionResultado baseline for testing
function makeBaseline(prevalencia = 16.0, horizonte = 5): SimulacionResultado {
  const proyeccion = Array.from({ length: horizonte }, (_, t) => ({
    anio:                 2025 + t,
    prevalenciaPct:       Math.max(0.5, prevalencia - t * 0.4),
    fumadoresAbsolutos:   Math.round(((prevalencia - t * 0.4) / 100) * 90_000_000),
    defuncionesEvitadas:  0,
    ahorroMdp:            0,
  }))

  return {
    proyeccion,
    parametrosBase: {
      prevalenciaBasePct:            prevalencia,
      poblacion18Plus:               90_000_000,
      fumadoresBase:                 Math.round((prevalencia / 100) * 90_000_000),
      defuncionesAtribuiblesBase:    Math.round(Math.round((prevalencia / 100) * 90_000_000) * 0.0045),
      impuestoActualPctPrecio:       68,
    },
    politicasAplicadas: [],
    resumenFinal: {
      prevalenciaFinalPct:      proyeccion[horizonte - 1].prevalenciaPct,
      reduccionPuntosPct:       0,
      fumadoresEvitadosTotal:   0,
      defuncionesEvitadasTotal: 0,
      ahorroAcumuladoMdp:       0,
    },
    elasticidadesAplicadas: {
      impuestoNuevoPctPrecio: 68,
      incrementoPrecioPct:    0,
      efectoPromedioPct:      0,
    },
  }
}

describe('simulacionModel', () => {
  describe('constantes exportadas', () => {
    it('ELASTICIDAD_PRECIO es negativa (tabaco es bien inelástico)', () => {
      expect(ELASTICIDAD_PRECIO).toBeLessThan(0)
      expect(ELASTICIDAD_PRECIO).toBe(-0.42)
    })

    it('TENDENCIA_PP_ANUAL es negativa (prevalencia declina)', () => {
      expect(TENDENCIA_PP_ANUAL).toBeLessThan(0)
    })

    it('POLITICA_META contiene las 4 políticas MPOWER', () => {
      expect(Object.keys(POLITICA_META)).toHaveLength(4)
      expect(POLITICA_META.ADVERTENCIAS.efectoTotalPp).toBeGreaterThan(0)
      expect(POLITICA_META.ESPACIOS_LIBRES.efectoTotalPp).toBeGreaterThan(0)
    })
  })

  describe('proyectarTendenciaBase', () => {
    it('genera la cantidad correcta de años', () => {
      const result = proyectarTendenciaBase(16.0, 2025, 5)
      expect(result).toHaveLength(5)
    })

    it('el primer año es el anioInicio', () => {
      const result = proyectarTendenciaBase(16.0, 2025, 3)
      expect(result[0].anio).toBe(2025)
      expect(result[2].anio).toBe(2027)
    })

    it('la prevalencia declina año a año', () => {
      const result = proyectarTendenciaBase(16.0, 2025, 5)
      for (let i = 1; i < result.length; i++) {
        expect(result[i].sinIntervencion).toBeLessThanOrEqual(result[i - 1].sinIntervencion)
      }
    })

    it('la prevalencia nunca cae por debajo de 0.5', () => {
      const result = proyectarTendenciaBase(1.0, 2025, 20)
      result.forEach((r) => {
        expect(r.sinIntervencion).toBeGreaterThanOrEqual(0.5)
      })
    })
  })

  describe('aplicarEfectoPoliticas', () => {
    it('sin políticas válidas retorna el baseline sin cambios', () => {
      const baseline = makeBaseline(16.0, 3)
      const result = aplicarEfectoPoliticas(baseline, [])
      expect(result).toBe(baseline) // same reference
    })

    it('con política inválida retorna el baseline sin cambios', () => {
      const baseline = makeBaseline(16.0, 3)
      const result = aplicarEfectoPoliticas(baseline, ['POLITICA_INEXISTENTE'])
      expect(result).toBe(baseline)
    })

    it('con políticas válidas reduce la prevalencia', () => {
      const baseline = makeBaseline(16.0, 5)
      const result = aplicarEfectoPoliticas(baseline, ['ADVERTENCIAS'])
      // Prevalencia ajustada debe ser menor que la original en algún punto
      const prevFinalOriginal = baseline.proyeccion[4].prevalenciaPct
      const prevFinalAjustada = result.proyeccion[4].prevalenciaPct
      expect(prevFinalAjustada).toBeLessThan(prevFinalOriginal)
    })

    it('incluye politicasAplicadas en el resultado', () => {
      const baseline = makeBaseline(16.0, 3)
      const result = aplicarEfectoPoliticas(baseline, ['ADVERTENCIAS', 'CESSATION'])
      expect(result.politicasAplicadas).toHaveLength(2)
      expect(result.politicasAplicadas[0].clave).toBe('ADVERTENCIAS')
    })

    it('el resumenFinal incluye reduccionPuntosPct > 0 con políticas', () => {
      const baseline = makeBaseline(16.0, 5)
      const result = aplicarEfectoPoliticas(baseline, ['ESPACIOS_LIBRES'])
      expect(result.resumenFinal.reduccionPuntosPct).toBeGreaterThan(0)
    })

    it('la prevalencia nunca cae por debajo de 0.5', () => {
      const baseline = makeBaseline(3.0, 10) // low starting prevalence
      const result = aplicarEfectoPoliticas(baseline, [
        'ADVERTENCIAS', 'PROHIBICION_PUBLICIDAD', 'ESPACIOS_LIBRES', 'CESSATION'
      ])
      result.proyeccion.forEach((row) => {
        expect(row.prevalenciaPct).toBeGreaterThanOrEqual(0.5)
      })
    })
  })
})
