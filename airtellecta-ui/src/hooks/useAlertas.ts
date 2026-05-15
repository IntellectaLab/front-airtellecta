import { useState, useEffect, useCallback } from 'react'
import type { AlertaDefinicion, AlertaDisparada } from '../types/alertas'
import type { EntidadPrevalencia } from '../types/api'

const STORAGE_KEY = 'airtellecta-alertas'

function cargarAlertas(): AlertaDefinicion[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function guardarAlertas(alertas: AlertaDefinicion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alertas))
}

export function evaluarAlertas(
  alertas: AlertaDefinicion[],
  estados: EntidadPrevalencia[] | undefined,
): AlertaDisparada[] {
  if (!estados?.length) return []
  const disparadas: AlertaDisparada[] = []

  for (const alerta of alertas) {
    const candidatos =
      alerta.scope === 'estado_especifico'
        ? estados.filter((e) => e.cveEntidad === alerta.estadoCve)
        : estados

    for (const estado of candidatos) {
      const valor = Number(estado.prevalencia)
      const cumple =
        alerta.operador === '>' ? valor > alerta.umbral : valor < alerta.umbral
      if (cumple) {
        disparadas.push({ alerta, estadoNombre: estado.nombre, valorActual: valor })
      }
    }
  }

  return disparadas
}

export function useAlertas() {
  const [alertas, setAlertas] = useState<AlertaDefinicion[]>(cargarAlertas)

  useEffect(() => {
    guardarAlertas(alertas)
  }, [alertas])

  const crearAlerta = useCallback((nueva: Omit<AlertaDefinicion, 'id' | 'creadaEn'>) => {
    const def: AlertaDefinicion = {
      ...nueva,
      id:       crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
    }
    setAlertas((prev) => [def, ...prev])
  }, [])

  const eliminarAlerta = useCallback((id: string) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { alertas, crearAlerta, eliminarAlerta }
}
