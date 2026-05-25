export interface ApiResponse<T> {
  success: boolean
  data:    T
  error?:  string
}

export interface ResumenNacional {
  prevalenciaFumadores: number
  poblacionFumadores: number
  usuariosVapeo: number
  usoDual: number
  defuncionesF17: number
  urgenciasF17: number
  poblacionTotal: number
}

export interface EntidadPrevalencia {
  cveEntidad: number
  nombre: string
  abreviatura: string
  fumadoresEstimados: number
  pobTotal: number
  tasa100k: number
  prevalencia: number
}

export interface FuenteDato {
  campo: string
  fuente: string
  fuenteUrl: string
  anioReferencia: number
  nivelVerificacion: string
}

export interface CargaEconomica {
  costoDirectoAnualMdp: number
  costoSocialAnualMdp: number
  inversionPrevencionMdp: number
  fuentes: FuenteDato[]
}

export interface RecaudacionPanel {
  iepsMasRecienteMdp: number
  anio: number
  fuente: string
  fuenteUrl: string
  nivelVerificacion: string
}

export interface EpidemiologiaPanel {
  prevalenciaActualPct: number
  prevalenciaHistoricaPct: number
  deltaPp: number
  fumadoresEstimados: number
  defuncionesAtribuiblesAnual: number
  poblacion18Plus: number
  fuentes: FuenteDato[]
}

export interface CostoPatologia {
  codigo: string
  trastorno: string
  costoAjustado2025: number
  anioBase: number
  fuente: string
  fuenteDoi: string
}

export interface PanelEjecutivo {
  cargaEconomica: CargaEconomica
  recaudacion: RecaudacionPanel
  epidemiologia: EpidemiologiaPanel
  costosPorPatologia: CostoPatologia[]
}

export interface Tendencias {
  prevalencia2016: number
  prevalencia2025: number
  deltaPp: number
  fumadores2016: number
  fumadores2025: number
  vapeo2016: number
  vapeo2025: number
  dual2016: number
  dual2025: number
}

export interface RecaudacionAnual {
  anio:     number
  montoMdp: number
  fuente:   string
}

export interface SimulacionRequest {
  politicas?: string[]
  impuestoPctPrecio?: number
  horizonteAnios?: number
}

export interface ParametrosBase {
  prevalenciaBasePct: number
  poblacion18Plus: number
  fumadoresBase: number
  defuncionesAtribuiblesBase: number
  impuestoActualPctPrecio: number
}

export interface ProyeccionAnual {
  anio: number
  prevalenciaPct: number
  fumadoresAbsolutos: number
  defuncionesEvitadas: number
  ahorroMdp: number
}

export interface ResumenFinal {
  prevalenciaFinalPct: number
  reduccionPuntosPct: number
  fumadoresEvitadosTotal: number
  defuncionesEvitadasTotal: number
  ahorroAcumuladoMdp: number
}

export interface PoliticaAplicada {
  clave: string
  nombre: string
  efectoPct: number
}

export interface ElasticidadesAplicadas {
  impuestoNuevoPctPrecio: number
  incrementoPrecioPct: number
  efectoPromedioPct: number
}

export interface SimulacionResultado {
  parametrosBase: ParametrosBase
  proyeccion: ProyeccionAnual[]
  resumenFinal: ResumenFinal
  politicasAplicadas: PoliticaAplicada[]
  elasticidadesAplicadas: ElasticidadesAplicadas
}

export interface UsuarioDto {
  id: number
  email: string
  nombreCompleto: string
  cargo: string | null
  institucion: string | null
  rol: string
  entidadId: number | null
  activo: boolean
  activationLink: string | null
  ultimoAcceso: string | null
  createdAt: string
}

export interface CrearUsuarioRequest {
  email: string
  nombreCompleto: string
  cargo?: string
  institucion?: string
  rol: 'admin' | 'user'
  entidadId?: number
}

export interface ActualizarUsuarioRequest {
  nombreCompleto?: string
  cargo?: string
  institucion?: string
  rol?: 'admin' | 'user'
  entidadId?: number
  activo?: boolean
}
