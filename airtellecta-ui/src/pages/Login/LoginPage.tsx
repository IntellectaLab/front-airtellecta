import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  TotpSecret,
  multiFactor,
  type MultiFactorError,
  type MultiFactorResolver,
} from 'firebase/auth'
import ReCAPTCHA from 'react-google-recaptcha'
import { auth } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

const isCypress = typeof window !== 'undefined' && !!(window as Record<string, unknown>).Cypress
const RECAPTCHA_SITE_KEY = isCypress ? '' : (import.meta.env.VITE_RECAPTCHA_SITE_KEY || '')

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
  const { refreshMfaStatus } = useAuth()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const [mfaStep, setMfaStep] = useState<'none' | 'challenge' | 'enroll'>('none')
  const [totpCode, setTotpCode] = useState('')
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null)
  const [qrUri, setQrUri] = useState('')
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null)

  const titulo = useTypewriter('AIRTELLECTA', 75, 350)

  const startEnrollment = async () => {
    if (!auth?.currentUser) return
    setLoading(true)
    setError('')
    try {
      const session = await multiFactor(auth.currentUser).getSession()
      const secret = await TotpMultiFactorGenerator.generateSecret(session)
      const uri = secret.generateQrCodeUrl(auth.currentUser.email || '', 'AirTellecta')
      setTotpSecret(secret)
      setQrUri(uri)
      setMfaStep('enroll')
    } catch (err: unknown) {
      console.error('TOTP enrollment error:', err)
      const code = (err as { code?: string })?.code
      if (code === 'auth/unsupported-first-factor' || code === 'auth/operation-not-allowed') {
        setError('MFA no está habilitado en el proyecto Firebase. Contacta al administrador.')
      } else {
        setError('Error al generar el código QR. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!totpCode.trim() || totpSecret === null || !auth?.currentUser) return
    setLoading(true)
    setError('')
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, totpCode)
      await multiFactor(auth.currentUser).enroll(assertion, 'App de autenticación')
      refreshMfaStatus()
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('TOTP verify error:', err)
      setError('Código incorrecto. Escanea el QR de nuevo e intenta.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!usuario.trim() || !password) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (RECAPTCHA_SITE_KEY && !captchaToken) {
      setError('Por favor completa el captcha.')
      return
    }
    if (!auth) {
      setError('Firebase no está configurado. Agrega las credenciales en .env.local')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, usuario.trim(), password)
      const enrolledFactors = multiFactor(result.user).enrolledFactors
      if (enrolledFactors.length === 0 && !isCypress) {
        await startEnrollment()
        return
      }
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Login error:', err)
      const code = (err as { code?: string })?.code
      if (code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMultiFactorResolver(auth, err as MultiFactorError)
          setMfaResolver(resolver)
          setMfaStep('challenge')
          setError('')
        } catch (mfaErr) {
          console.error('MFA resolver error:', mfaErr)
          setError('Error al iniciar el desafío MFA. Intenta de nuevo.')
        }
      } else if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.')
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    }
  }

  const handleMfaChallenge = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!totpCode.trim() || !mfaResolver) return
    setLoading(true)
    setError('')
    try {
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        mfaResolver.hints[0].uid,
        totpCode
      )
      await mfaResolver.resolveSignIn(assertion)
      navigate('/dashboard')
    } catch {
      setError('Código incorrecto. Verifica tu app de autenticación.')
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

      {mfaStep === 'none' && (
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
            <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">Usuario</label>
            <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
              <span className="flex items-center text-[#8baac8] shrink-0"><UserIcon /></span>
              <input
                className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light"
                type="text" placeholder="usuario" value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username" autoFocus data-testid="login-usuario"
              />
            </div>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">Contraseña</label>
            <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
              <span className="flex items-center text-[#8baac8] shrink-0"><LockIcon /></span>
              <input
                className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light"
                type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" data-testid="login-password"
              />
            </div>
          </div>
          {RECAPTCHA_SITE_KEY && (
            <div className="flex justify-center">
              <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)} />
            </div>
          )}
          <button type="submit"
            className="btn-primary-glass w-full py-[15px] text-[15px] font-bold tracking-[0.3px] border-none text-center rounded-[13px] mt-1 font-sans"
            disabled={loading} data-testid="login-submit">
            {loading ? 'Verificando...' : 'Acceder al Sistema'}
          </button>
          <p className="text-center text-xs text-[#6a8aaa] mt-0.5">
            Sistema seguro · Acceso autorizado únicamente
          </p>
        </form>
      )}

      {mfaStep === 'challenge' && (
        <form
          className="login-card-glass w-full max-w-[440px] rounded-[28px] px-[38px] pt-9 pb-[30px] flex flex-col gap-[18px] relative z-10 animate-fade-up-d4"
          onSubmit={handleMfaChallenge} noValidate
        >
          {error && (
            <div className="bg-[rgba(254,226,226,0.75)] text-[#991b1b] border border-[rgba(252,165,165,0.6)] rounded-[11px] py-2.5 px-3.5 text-[13px] font-semibold backdrop-blur-[8px]">
              {error}
            </div>
          )}
          <div className="text-center">
            <div className="text-[40px] mb-2">🔐</div>
            <h2 className="text-[18px] font-bold text-[#0c1a2e]">Autenticación de dos factores</h2>
            <p className="text-[13px] text-[#4a7ab5] mt-1">Ingresa el código de 6 dígitos de tu app de autenticación</p>
          </div>
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">Código de verificación</label>
            <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
              <span className="flex items-center text-[#8baac8] shrink-0"><LockIcon /></span>
              <input
                className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light tracking-[8px] text-center"
                type="text" placeholder="000000" value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus inputMode="numeric" maxLength={6}
              />
            </div>
          </div>
          <button type="submit"
            className="btn-primary-glass w-full py-[15px] text-[15px] font-bold tracking-[0.3px] border-none text-center rounded-[13px] mt-1 font-sans"
            disabled={loading || totpCode.length !== 6}>
            {loading ? 'Verificando...' : 'Confirmar código'}
          </button>
          <button type="button"
            className="text-[13px] text-[#2d5a9e] font-medium hover:underline"
            onClick={() => { setMfaStep('none'); setError(''); setTotpCode('') }}>
            ← Volver al inicio de sesión
          </button>
        </form>
      )}

      {mfaStep === 'enroll' && (
        <form
          className="login-card-glass w-full max-w-[440px] rounded-[28px] px-[38px] pt-9 pb-[30px] flex flex-col gap-[18px] relative z-10 animate-fade-up-d4"
          onSubmit={handleEnrollVerify} noValidate
        >
          {error && (
            <div className="bg-[rgba(254,226,226,0.75)] text-[#991b1b] border border-[rgba(252,165,165,0.6)] rounded-[11px] py-2.5 px-3.5 text-[13px] font-semibold backdrop-blur-[8px]">
              {error}
            </div>
          )}
          <div className="text-center">
            <div className="text-[40px] mb-2">🔑</div>
            <h2 className="text-[18px] font-bold text-[#0c1a2e]">Configurar autenticación</h2>
            <p className="text-[13px] text-[#4a7ab5] mt-1">Escanea el código QR con Google Authenticator u otra app</p>
          </div>
          {qrUri && (
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`}
                alt="QR Code" className="rounded-[12px] border-2 border-[rgba(255,255,255,0.5)]"
                width={200} height={200}
              />
            </div>
          )}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[#0c1a2e] tracking-[0.1px] pl-0.5">Código de la app</label>
            <div className="input-glass flex items-center rounded-[13px] px-3.5 gap-2.5">
              <span className="flex items-center text-[#8baac8] shrink-0"><LockIcon /></span>
              <input
                className="flex-1 border-none outline-none bg-transparent py-[13px] text-[15px] text-[#0c1a2e] placeholder:text-[#a0b8d0] placeholder:font-light tracking-[8px] text-center"
                type="text" placeholder="000000" value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoFocus inputMode="numeric" maxLength={6}
              />
            </div>
          </div>
          <button type="submit"
            className="btn-primary-glass w-full py-[15px] text-[15px] font-bold tracking-[0.3px] border-none text-center rounded-[13px] mt-1 font-sans"
            disabled={loading || totpCode.length !== 6}>
            {loading ? 'Activando...' : 'Activar doble autenticación'}
          </button>
        </form>
      )}

      <footer className="text-xs text-[#5a7a9a] text-center relative z-10 animate-fade-up-d5">
        <p>© 2026 INTELLECTA · Todos los derechos reservados</p>
      </footer>
    </div>
  )
}