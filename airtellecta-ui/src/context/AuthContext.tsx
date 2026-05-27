import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, multiFactor, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { apiService } from '../services/api'

export type UserRole = 'ADMIN' | 'USER'

export interface UserProfile {
  nombreCompleto: string
  cargo: string | null
  institucion: string | null
  email: string
}

interface AuthContextType {
  user:    User | null
  role:    UserRole
  loading: boolean
  mfaEnrolled: boolean
  profile: UserProfile | null
  logout:    () => Promise<void>
  getToken:  () => Promise<string | null>
  refreshMfaStatus: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [role,    setRole]    = useState<UserRole>('USER')
  const [loading, setLoading] = useState(true)
  const [mfaEnrolled, setMfaEnrolled] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const result = await firebaseUser.getIdTokenResult()
          const claim  = result.claims['role'] as string | undefined
          setRole(claim?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER')
        } catch {
          setRole('USER')
        }
        setMfaEnrolled(multiFactor(firebaseUser).enrolledFactors.length > 0)

        // Fetch backend profile (also updates ultimo_acceso)
        try {
          const me = await apiService.me()
          if (me) {
            setProfile({
              nombreCompleto: me.nombreCompleto,
              cargo: me.cargo,
              institucion: me.institucion,
              email: me.email,
            })
          }
        } catch {
          // Profile fetch is best-effort
        }
      } else {
        setRole('USER')
        setMfaEnrolled(false)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = async () => {
    if (auth) await signOut(auth)
  }

  const getToken = async (): Promise<string | null> => {
    if (!auth?.currentUser) return null
    return auth.currentUser.getIdToken()
  }

  const refreshMfaStatus = () => {
    if (auth?.currentUser) {
      setMfaEnrolled(multiFactor(auth.currentUser).enrolledFactors.length > 0)
    }
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, mfaEnrolled, profile, logout, getToken, refreshMfaStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
