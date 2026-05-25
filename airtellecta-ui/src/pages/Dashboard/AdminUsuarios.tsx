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
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
        isAdmin
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-blue-500/20 text-blue-300'
      }`}
    >
      {isAdmin ? 'ADMIN' : 'USER'}
    </span>
  )
}

function EstadoBadge({ activo, ultimoAcceso }: { activo: boolean; ultimoAcceso: string | null }) {
  if (!activo) {
    return <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-300">Inactivo</span>
  }
  if (!ultimoAcceso) {
    return <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-300">Pendiente</span>
  }
  return <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-300">Activo</span>
}

// ── Shared input classes ───────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'

const labelCls = 'block text-xs font-medium text-white/60 mb-1'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-semibold text-white">
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email — only shown and required on create */}
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

          {/* Nombre completo */}
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

          {/* Cargo */}
          <div>
            <label className={labelCls}>Cargo</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Director, Analista…"
              value={form.cargo}
              onChange={e => set('cargo', e.target.value)}
            />
          </div>

          {/* Institución */}
          <div>
            <label className={labelCls}>Institución</label>
            <input
              type="text"
              className={inputCls}
              placeholder="IMSS, SSA…"
              value={form.institucion}
              onChange={e => set('institucion', e.target.value)}
            />
          </div>

          {/* Rol */}
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
            >
              {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1117] p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-lg font-semibold text-white">Usuario creado</h2>
          <p className="text-sm text-white/60 mt-1">
            Se envio un email de activacion a <strong className="text-white">{usuario.email}</strong>
          </p>
        </div>

        {usuario.activationLink && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-white/50">
              Si el email no llega, comparte este link de activacion:
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
              <input
                readOnly
                value={usuario.activationLink}
                className="flex-1 bg-transparent text-xs text-white/70 outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/20"
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
        <p className="text-red-400 text-lg font-medium">Acceso denegado</p>
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
        <h1 className="text-xl font-semibold text-white">Usuarios</h1>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <span className="text-sm text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-400 hover:text-red-200 transition"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-white/50">Cargando...</p>
      ) : (
        /* Table */
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-sm text-white/80">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Institución</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Último acceso</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                    Sin usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 transition hover:bg-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {u.nombreCompleto}
                    </td>
                    <td className="px-4 py-3 text-white/60">{u.email}</td>
                    <td className="px-4 py-3">
                      <RolBadge rol={u.rol} />
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {u.institucion ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <EstadoBadge activo={u.activo} ultimoAcceso={u.ultimoAcceso} />
                        {u.activo && !u.ultimoAcceso && u.activationLink && (
                          <button
                            title="Copiar link de activacion"
                            onClick={() => void navigator.clipboard.writeText(u.activationLink!)}
                            className="text-yellow-400/70 hover:text-yellow-300 transition"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {formatDate(u.ultimoAcceso)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ type: 'edit', usuario: u })}
                          className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => void handleToggleActivo(u)}
                          className={`rounded-md border px-3 py-1 text-xs transition ${
                            u.activo
                              ? 'border-red-500/30 text-red-300 hover:bg-red-500/10'
                              : 'border-green-500/30 text-green-300 hover:bg-green-500/10'
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
