import React, { createContext, useContext, useState, useEffect } from 'react'
import { neonAuth, AuthUser } from '@/lib/neon-auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await neonAuth.verifySession()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to restore session:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const loggedUser = await neonAuth.signIn(email, password)
    setUser(loggedUser)
  }

  const register = async (nome: string, email: string, password: string) => {
    const registeredUser = await neonAuth.signUp(nome, email, password)
    setUser(registeredUser)
  }

  const logout = async () => {
    await neonAuth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
