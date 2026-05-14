import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
<<<<<<< Updated upstream
import { auth } from '../../firebase'
=======
import { auth } from '../../lib/firebase'
>>>>>>> Stashed changes

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M4 21v-2a4 4 0 0 1 3-3.87" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const LayersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <path d="M20 7L5 14.5L20 22L35 14.5L20 7Z" fill="white" fillOpacity="0.9" />
    <path d="M5 20L20 27.5L35 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 25.5L20 33L35 25.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
  </svg>
)

function useTypewriter(text: string, speed = 80, delay = 300) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(interval)
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, speed, delay])
  return displayed
}

export function LoginPage() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const titulo = useTypewriter('AIRTELLECTA', 75, 350)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!usuario.trim() || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    setError('')
    setLoading(true)
    try {
<<<<<<< Updated upstream
      await signInWithEmailAndPassword(auth, usuario.trim(), password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.')
=======
      if (!auth) {
        setError('Firebase no está configurado. Contacta al administrador del sistema.')
        setLoading(false)
        return
      }
      await signInWithEmailAndPassword(auth, usuario.trim(), password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta de nuevo más tarde.')
>>>>>>> Stashed changes
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg relative min-h-dvh flex flex-col items-center justify-center py-10 px-4 gap-7 overflow-hidden">

      <header className="flex flex-col items-center gap-2 text-center relative z-10 animate-fade-up">
        <div className="logo-glass w-[72px] h-[72px] rounded-[22px] flex items-center justify-center mb-1 animate-pop-in">
          <LayersIcon />
        </div>

        <h1 className="font-display text-[28px] font-extrabold tracking-[5px] text-[#0c1f3f] [text-shadow:0_1px_0_rgba(255,255,255,0.6)] animate-fade-up-d1">
          {titulo}
          <span className="inline-block text-[#1d5ce8] font-light ml-px animate-blink">|</span>
        </h1>

        <p className="text-sm font-medium text-[#2d5a9e] tracking-[0.2px] animate-fade-up-d2">
          Plataforma de Inteligencia Epidemiológica
        </p>
        <p className="text-[12.5px] text-[#4a7ab5] animate-fade-up-d3">
          Sistema de Análisis de Salud Pública
        </p>
      </header>

      <form
        className="login-card-glass w-full max-w-[440px] rounded-[28px] px-[38px] pt-9 pb-[30px] flex flex-col gap-[18px] relative z-10 animate-fade-up-d4"
        onSubmit={handleSubmit}
        noValidate
      >
        {error && (
          <div className="bg-[rgba(254,226,226,0.75)] text-[#991b1b] border border-[rgba(252,165,165,0.6)] rounded-[11px] py-2.5 px-3.5 text-[13px] font-semibold backdrop-blur-[8px]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">
            Usuario
          </label>
          <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
            <span className="flex items-center text-[#8baac8] shrink-0"><UserIcon /></span>
            <input
              className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light"
              type="text"
              placeholder="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              autoFocus
              data-testid="login-usuario"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[7px]">
          <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">
            Contraseña
          </label>
          <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
            <span className="flex items-center text-[#8baac8] shrink-0"><LockIcon /></span>
            <input
              className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              data-testid="login-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary-glass w-full py-[15px] text-[15px] font-bold tracking-[0.3px] border-none text-center rounded-[13px] mt-1 font-sans"
          disabled={loading}
          data-testid="login-submit"
        >
          {loading ? 'Verificando...' : 'Acceder al Sistema'}
        </button>

        <p className="text-center text-xs text-[#6a8aaa] mt-0.5">
          Sistema seguro · Acceso autorizado únicamente
        </p>
      </form>

      <footer className="text-xs text-[#5a7a9a] text-center relative z-10 animate-fade-up-d5">
        <p>© 2026 INTELLECTA · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
