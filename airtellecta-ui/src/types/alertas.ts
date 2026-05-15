export type AlertaSeveridad = 'rojo' | 'naranja' | 'amarillo'
export type AlertaOperador = '>' | '<'
export type AlertaScope = 'cualquier_estado' | 'estado_especifico'

export interface AlertaDefinicion {
  id:        string
  nombre:    string
  scope:     AlertaScope
  estadoCve?: number
  estadoNombre?: string
  operador:  AlertaOperador
  umbral:    number
  severidad: AlertaSeveridad
  creadaEn:  string
}

export interface AlertaDisparada {
  alerta:      AlertaDefinicion
  estadoNombre: string
  valorActual: number
}
