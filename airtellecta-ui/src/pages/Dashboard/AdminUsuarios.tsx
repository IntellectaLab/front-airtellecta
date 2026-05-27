import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiService } from '../../services/api'
import type { UsuarioDto, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../../types/api'

// ── Modal state union ──────────────────────────────────────────────────────────
type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'edit'; usuario: UsuarioDto }
  | { type: 'success'; usuario: UsuarioDto }

// ── Form shape used by both modals ────────────────────────────────────────────
interface UsuarioForm {
  email: string
  nombreCompleto: string
  cargo: string
  institucion: string
  rol: 'admin' | 'user'
}

const emptyForm: UsuarioForm = {
  email: '',
  nombreCompleto: '',
  cargo: '',
  institucion: '',
  rol: 'user',
}

function formFromUsuario(u: UsuarioDto): UsuarioForm {
  return {
    email: u.email,
    nombreCompleto: u.nombreCompleto,
    cargo: u.cargo ?? '',
    institucion: u.institucion ?? '',
    rol: u.rol.toLowerCase() === 'admin' ? 'admin' : 'user',
  }
}

// ── Badges ────────────────────────────────────────────────────────────────────
function RolBadge({ rol }: { rol: string }) {
  const isAdmin = rol.toUpperCase() === 'ADMIN'
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
        isAdmin
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
      }`}
    >
      {isAdmin ? 'ADMIN' : 'USER'}
    </span>
  )
}

function EstadoBadge({ activo, ultimoAcceso }: { activo: boolean; ultimoAcceso: string | null }) {
  if (!activo) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
        Inactivo
      </span>
    )
  }
  if (!ultimoAcceso) {
    return (
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
        Pendiente
      </span>
    )
  }
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-100 text-emerald-700 dark:bg-green-500/20 dark:text-green-300">
      Activo
    </span>
  )
}

// ── Shared input classes ───────────────────────────────────────────────────────
const inputCls =
  'config-input-glass w-full rounded-[10px] px-[14px] py-[10px] text-sm text-[#0c1f3f] dark:text-white font-sans focus:outline-none focus:ring-2 focus:ring-blue-400/40'

const labelCls = 'block text-[13px] font-semibold text-[#1e3a5f] dark:text-white/60 mb-1'

// ── Modal component ────────────────────────────────────────────────────────────
interface ModalProps {
  modal: ModalState
  onClose: () => void
  onSubmit: (form: UsuarioForm) => Promise<void>
  submitting: boolean
}

function UsuarioModal({ modal, onClose, onSubmit, submitting }: ModalProps) {
  const isEdit = modal.type === 'edit'
  const [form, setForm] = useState<UsuarioForm>(
    isEdit ? formFromUsuario((modal as { type: 'edit'; usuario: UsuarioDto }).usuario) : emptyForm,
  )

  // Reset form when modal changes
  useEffect(() => {
    if (modal.type === 'edit') {
      setForm(formFromUsuario(modal.usuario))
    } else if (modal.type === 'create') {
      setForm(emptyForm)
    }
  }, [modal])

  function set<K extends keyof UsuarioForm>(key: K, value: UsuarioForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void onSubmit(form)
  }

  return (
    <div className="modal-overlay-glass fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="config-modal-glass w-full max-w-md rounded-[22px] overflow-hidden mx-4" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-[22px] pt-[22px] pb-4 border-b border-[rgba(180,210,240,0.30)] dark:border-white/[0.07]">
          <h2 className="font-display text-[18px] font-extrabold text-[#0c1f3f] m-0 dark:text-white">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-modal-close-glass w-[30px] h-[30px] flex items-center justify-center rounded-[8px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-[22px] py-[18px] flex flex-col gap-4">
          {!isEdit && (
            <div>
              <label className={labelCls}>Email *</label>
              <input
                type="email"
                required
                className={inputCls}
                placeholder="usuario@ejemplo.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
          )}

          <div>
            <label className={labelCls}>Nombre completo *</label>
            <input
              type="text"
              required
              className={inputCls}
              placeholder="Nombre Apellido"
              value={form.nombreCompleto}
              onChange={e => set('nombreCompleto', e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Cargo</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Director, Analista..."
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Institucion</label>
            <input
              type="text"
              className={inputCls}
              placeholder="IMSS, SSA..."
              value={form.institucion}
              onChange={e => set('institucion', e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Rol</label>
            <select
              className={inputCls}
              value={form.rol}
              onChange={e => set('rol', e.target.value as 'admin' | 'user')}
            >
              <option value="user">USER</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-[rgba(180,210,240,0.25)] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel-glass px-[18px] py-[9px] rounded-[10px] text-sm font-semibold font-sans border-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-glass px-[18px] py-[9px] rounded-[10px] text-sm font-semibold font-sans border-none disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ usuario, onClose }: { usuario: UsuarioDto; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    if (!usuario.activationLink) return
    void navigator.clipboard.writeText(usuario.activationLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="modal-overlay-glass fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="config-modal-glass w-full max-w-md rounded-[22px] overflow-hidden mx-4" onClick={e => e.stopPropagation()}>
        <div className="text-center px-[22px] pt-[22px] pb-4">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-lg font-extrabold text-[#0c1f3f] dark:text-white font-display">Usuario creado</h2>
          <p className="text-sm text-[#5580a8] dark:text-white/60 mt-1">
            Se envio un email de activacion a <strong className="text-[#0c1f3f] dark:text-white">{usuario.email}</strong>
          </p>
        </div>

        {usuario.activationLink && (
          <div className="px-[22px] space-y-2">
            <p className="text-xs text-[#7a9ab8] dark:text-white/50">
              Si el email no llega, comparte este link de activacion:
            </p>
            <div className="flex items-center gap-2 config-input-glass rounded-[10px] px-3 py-2.5">
              <input
                readOnly
                value={usuario.activationLink}
                className="flex-1 bg-transparent text-xs text-[#3a5a80] dark:text-white/70 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="btn-primary-glass shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold font-sans border-none"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center px-[22px] py-5">
          <button
            onClick={onClose}
            className="btn-primary-glass px-6 py-2 rounded-[10px] text-sm font-semibold font-sans border-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AdminUsuarios() {
  const { role } = useAuth()

  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [submitting, setSubmitting] = useState(false)

  // ── Role guard ───────────────────────────────────────────────────────────────
  if (role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600 text-lg font-medium">Acceso denegado</p>
      </div>
    )
  }

  // ── Load ─────────────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.listarUsuarios()
      setUsuarios(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit (create / edit) ────────────────────────────────────────────────────
  async function handleSubmit(form: UsuarioForm) {
    setSubmitting(true)
    setError(null)
    try {
      if (modal.type === 'create') {
        const req: CrearUsuarioRequest = {
          email: form.email,
          nombreCompleto: form.nombreCompleto,
          ...(form.cargo ? { cargo: form.cargo } : {}),
          ...(form.institucion ? { institucion: form.institucion } : {}),
          rol: form.rol,
        }
        const nuevo = await apiService.crearUsuario(req)
        setUsuarios(prev => [nuevo, ...prev])
        setModal({ type: 'success', usuario: nuevo })
        setSubmitting(false)
        return
      } else if (modal.type === 'edit') {
        const req: ActualizarUsuarioRequest = {
          nombreCompleto: form.nombreCompleto,
          ...(form.cargo ? { cargo: form.cargo } : { cargo: '' }),
          ...(form.institucion ? { institucion: form.institucion } : { institucion: '' }),
          rol: form.rol,
        }
        const actualizado = await apiService.actualizarUsuario(modal.usuario.id, req)
        setUsuarios(prev => prev.map(u => (u.id === actualizado.id ? actualizado : u)))
      }
      setModal({ type: 'closed' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Toggle activo ─────────────────────────────────────────────────────────────
  async function handleToggleActivo(usuario: UsuarioDto) {
    setError(null)
    try {
      const actualizado = await apiService.actualizarUsuario(usuario.id, {
        activo: !usuario.activo,
      })
      setUsuarios(prev => prev.map(u => (u.id === actualizado.id ? actualizado : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

  // ── Format date ───────────────────────────────────────────────────────────────
  function formatDate(iso: string | null): string {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-[#0c1f3f] dark:text-white">Usuarios</h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="btn-primary-glass flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-sm font-semibold font-sans border-none cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/30 dark:bg-red-500/10">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-400 hover:text-red-600 dark:hover:text-red-200 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-[#5580a8] dark:text-white/50">Cargando...</p>
      ) : (
        /* Table */
        <div className="panel-glass overflow-x-auto rounded-[20px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(180,210,240,0.35)] dark:border-white/10 text-left text-[11px] font-bold uppercase tracking-[0.8px] text-[#7a9ab8] dark:text-white/40">
                <th className="px-5 py-3.5">Nombre</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Rol</th>
                <th className="px-5 py-3.5">Institucion</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Ultimo acceso</th>
                <th className="px-5 py-3.5">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#7a9ab8] dark:text-white/40">
                    Sin usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-[rgba(180,210,240,0.20)] dark:border-white/5 transition hover:bg-[rgba(26,86,219,0.04)] dark:hover:bg-white/5 last:border-0"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[#0c1f3f] dark:text-white">
                      {u.nombreCompleto}
                    </td>
                    <td className="px-5 py-3.5 text-[#3a5a80] dark:text-white/60">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <RolBadge rol={u.rol} />
                    </td>
                    <td className="px-5 py-3.5 text-[#3a5a80] dark:text-white/60">
                      {u.institucion ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <EstadoBadge activo={u.activo} ultimoAcceso={u.ultimoAcceso} />
                        {u.activo && !u.ultimoAcceso && u.activationLink && (
                          <button
                            title="Copiar link de activacion"
                            onClick={() => void navigator.clipboard.writeText(u.activationLink!)}
                            className="text-amber-500/70 hover:text-amber-600 dark:text-yellow-400/70 dark:hover:text-yellow-300 transition"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#3a5a80] dark:text-white/60">
                      {formatDate(u.ultimoAcceso)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ type: 'edit', usuario: u })}
                          className="rounded-[8px] border border-[rgba(180,210,240,0.45)] dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-[#1e3a5f] dark:text-white/70 transition hover:bg-[rgba(26,86,219,0.08)] hover:text-[#1344c4] dark:hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => void handleToggleActivo(u)}
                          className={`rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition ${
                            u.activo
                              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-green-500/30 dark:text-green-300 dark:hover:bg-green-500/10'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal.type === 'create' || modal.type === 'edit') && (
        <UsuarioModal
          modal={modal}
          onClose={() => setModal({ type: 'closed' })}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {/* Success Modal */}
      {modal.type === 'success' && (
        <SuccessModal
          usuario={modal.usuario}
          onClose={() => { setModal({ type: 'closed' }); void load() }}
        />
      )}
    </div>
  )
}
