import { useState } from 'react'
import { createPortal } from 'react-dom'

export interface EstadoRanking {
  rank:   number
  nombre: string
  valor:  number
  riesgo: 'critico' | 'alto' | 'medio' | 'bajo'
}

interface RankingEstadosProps {
  estados?:   EstadoRanking[]
  isLoading?: boolean
  isError?:   boolean
}

const FALLBACK_ESTADOS: EstadoRanking[] = [
  { rank:  1, nombre: 'Colima',              valor: 28.4, riesgo: 'critico' },
  { rank:  2, nombre: 'Jalisco',             valor: 24.1, riesgo: 'critico' },
  { rank:  3, nombre: 'Ciudad de México',    valor: 22.8, riesgo: 'critico' },
  { rank:  4, nombre: 'Nuevo León',          valor: 20.4, riesgo: 'critico' },
  { rank:  5, nombre: 'Baja California',     valor: 18.7, riesgo: 'alto'    },
  { rank:  6, nombre: 'Estado de México',    valor: 17.3, riesgo: 'alto'    },
  { rank:  7, nombre: 'Querétaro',           valor: 16.1, riesgo: 'alto'    },
  { rank:  8, nombre: 'Puebla',              valor: 15.0, riesgo: 'alto'    },
  { rank:  9, nombre: 'Sonora',              valor: 14.8, riesgo: 'medio'   },
  { rank: 10, nombre: 'Sinaloa',             valor: 14.2, riesgo: 'medio'   },
  { rank: 11, nombre: 'Aguascalientes',      valor: 13.9, riesgo: 'medio'   },
  { rank: 12, nombre: 'Tamaulipas',          valor: 13.5, riesgo: 'medio'   },
  { rank: 13, nombre: 'Coahuila',            valor: 13.1, riesgo: 'medio'   },
  { rank: 14, nombre: 'Baja California Sur', valor: 12.8, riesgo: 'medio'   },
  { rank: 15, nombre: 'Morelos',             valor: 12.5, riesgo: 'medio'   },
  { rank: 16, nombre: 'Guanajuato',          valor: 12.2, riesgo: 'medio'   },
  { rank: 17, nombre: 'Michoacán',           valor: 11.9, riesgo: 'medio'   },
  { rank: 18, nombre: 'Quintana Roo',        valor: 11.6, riesgo: 'medio'   },
  { rank: 19, nombre: 'Hidalgo',             valor: 11.3, riesgo: 'medio'   },
  { rank: 20, nombre: 'Tlaxcala',            valor: 11.0, riesgo: 'medio'   },
  { rank: 21, nombre: 'Yucatán',             valor: 10.7, riesgo: 'bajo'    },
  { rank: 22, nombre: 'San Luis Potosí',     valor: 10.4, riesgo: 'bajo'    },
  { rank: 23, nombre: 'Durango',             valor: 10.1, riesgo: 'bajo'    },
  { rank: 24, nombre: 'Nayarit',             valor:  9.8, riesgo: 'bajo'    },
  { rank: 25, nombre: 'Veracruz',            valor:  9.5, riesgo: 'bajo'    },
  { rank: 26, nombre: 'Tabasco',             valor:  9.2, riesgo: 'bajo'    },
  { rank: 27, nombre: 'Zacatecas',           valor:  8.9, riesgo: 'bajo'    },
  { rank: 28, nombre: 'Campeche',            valor:  8.6, riesgo: 'bajo'    },
  { rank: 29, nombre: 'Chihuahua',           valor:  8.3, riesgo: 'bajo'    },
  { rank: 30, nombre: 'Chiapas',             valor:  7.8, riesgo: 'bajo'    },
  { rank: 31, nombre: 'Guerrero',            valor:  7.4, riesgo: 'bajo'    },
  { rank: 32, nombre: 'Oaxaca',              valor:  6.9, riesgo: 'bajo'    },
]

const BAR_COLOR: Record<string, string> = {
  critico: 'bg-red-500',
  alto:    'bg-orange-400',
  medio:   'bg-amber-400',
  bajo:    'bg-lime-500',
}
const VALUE_COLOR: Record<string, string> = {
  critico: 'text-red-600 dark:text-red-400 font-bold',
  alto:    'text-orange-600 dark:text-orange-400 font-semibold',
  medio:   'text-amber-600 dark:text-amber-400 font-semibold',
  bajo:    'text-lime-700 dark:text-lime-400 font-semibold',
}
const ROW_HL: Record<string, string> = {
  critico: 'bg-red-500/[0.07] dark:bg-red-500/10 rounded-[10px]',
  alto: '', medio: '', bajo: '',
}
const BADGE: Record<string, string> = {
  critico: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25',
  alto:    'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/25',
  medio:   'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
  bajo:    'bg-lime-100 dark:bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-500/25',
}
const BADGE_LABEL: Record<string, string> = {
  critico: 'CRÍTICO', alto: 'ALTO', medio: 'MEDIO', bajo: 'BAJO',
}

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function EstadoRow({ e, maxVal, compact = false }: { e: EstadoRanking; maxVal: number; compact?: boolean }) {
  const pct = (e.valor / maxVal) * 100
  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 ${ROW_HL[e.riesgo]}`}>
      <span className={`text-[14px] w-5 shrink-0 tabular-nums ${e.rank <= 4 ? 'font-bold text-[#0c1f3f] dark:text-white' : 'text-[#5580a8] dark:text-white/30'}`}>
        {e.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`truncate mb-1 ${compact ? 'text-[14px]' : 'text-[15px]'} ${e.rank <= 4 ? 'font-semibold text-[#0c1f3f] dark:text-white' : 'text-[#3a5a80] dark:text-white/60'}`}>
          {e.nombre}
        </p>
        <div className="h-1.5 rounded-full bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.06] overflow-hidden">
          <div className={`h-full rounded-full ${BAR_COLOR[e.riesgo]}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={`${compact ? 'text-[14px]' : 'text-[15px]'} shrink-0 tabular-nums ${VALUE_COLOR[e.riesgo]}`}>
        {e.valor.toFixed(1)}%
      </span>
    </div>
  )
}

function EstadosModal({ todos, onClose }: { todos: EstadoRanking[]; onClose: () => void }) {
  const max = todos[0]?.valor ?? 1
  return (
    <div className="modal-overlay-glass fixed inset-0 z-[500] flex items-center justify-center" onClick={onClose}>
      <div
        className="config-modal-glass w-full max-w-[560px] max-h-[85dvh] rounded-[22px] overflow-hidden mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(180,210,240,0.30)] dark:border-white/[0.07] shrink-0">
          <div>
            <p className="text-[13px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
              Ranking completo
            </p>
            <h2 className="font-display text-[22px] font-extrabold text-[#0c1f3f] dark:text-white">
              Los {todos.length} estados · 2025
            </h2>
          </div>
          <button
            className="btn-modal-close-glass w-[32px] h-[32px] flex items-center justify-center rounded-[9px] shrink-0"
            type="button"
            onClick={onClose}
            data-testid="modal-close"
          >
            <XIcon />
          </button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 shrink-0 border-b border-[rgba(180,210,240,0.20)] dark:border-white/[0.05]">
          {(['critico','alto','medio','bajo'] as const).map((r) => (
            <span key={r} className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${BADGE[r]}`}>
              {BADGE_LABEL[r]}
            </span>
          ))}
        </div>

        <div className="overflow-y-auto custom-scrollbar px-4 py-3 flex flex-col gap-0.5">
          {todos.map((e) => (
            <EstadoRow key={e.rank} e={e} maxVal={max} compact />
          ))}
        </div>

        <div className="px-6 py-4 border-t border-[rgba(180,210,240,0.25)] dark:border-white/[0.06] shrink-0">
          <p className="text-[13px] text-[#5580a8] dark:text-white/30 text-center">
            Fuente: ENCODAT · Datos actualizados 2025
          </p>
        </div>
      </div>
    </div>
  )
}

export function RankingEstados({ estados, isLoading, isError }: RankingEstadosProps) {
  const [showModal, setShowModal] = useState(false)
  const data  = estados ?? FALLBACK_ESTADOS
  const top8  = data.slice(0, 8)
  const max   = data[0]?.valor ?? 1

  return (
    <>
      <div className="metric-card-glass flex flex-col gap-4 p-5 rounded-[18px] h-full" data-testid="ranking-estados">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[15px] font-bold tracking-[0.8px] uppercase text-[#5580a8] dark:text-white/35">
              Ranking de Estados
            </p>
            <p className="text-[22px] font-semibold text-[#0c1f3f] dark:text-white">
              Ordenado por consumo
            </p>
          </div>
          <span className="text-[14px] text-[#5580a8] dark:text-white/40 mt-1">de {data.length}</span>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 rounded-[10px] bg-[rgba(180,210,240,0.20)] dark:bg-white/[0.06]" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <p className="text-sm text-red-500 dark:text-red-400">Error al cargar ranking.</p>
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col gap-1">
            {top8.map((e) => (
              <EstadoRow key={e.rank} e={e} maxVal={max} />
            ))}
          </div>
        )}

        <button
          className="mt-auto text-[15px] font-semibold text-[#2563eb] dark:text-[#93c5fd] hover:underline cursor-pointer bg-transparent border-none text-center w-full py-1"
          type="button"
          onClick={() => setShowModal(true)}
          data-testid="btn-ver-todos"
        >
          Ver los {data.length} estados ↓
        </button>
      </div>

      {showModal && createPortal(
        <EstadosModal todos={data} onClose={() => setShowModal(false)} />,
        document.body
      )}
    </>
  )
}
