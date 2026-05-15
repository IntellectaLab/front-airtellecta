import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '../firebase'

export type UserRole = 'ADMIN' | 'USER'

interface AuthContextType {
  user:    User | null
  role:    UserRole
  loading: boolean
  logout:    () => Promise<void>
  getToken:  () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [role,    setRole]    = useState<UserRole>('ADMIN')
  const [loading, setLoading] = useState(true)

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
          setRole(claim?.toUpperCase() === 'USER' ? 'USER' : 'ADMIN')
        } catch {
          setRole('ADMIN')
        }
      } else {
        setRole('ADMIN')
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

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
