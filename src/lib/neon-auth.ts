import { neon } from '@neondatabase/serverless'

const NEON_AUTH_BASE_URL =
  import.meta.env.VITE_NEON_AUTH_URL ||
  'https://ep-lucky-frog-b6jejfkg.neonauth.c-2.sa-east-1.aws.neon.tech/neondb/auth'

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL || ''

export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt?: string
}

export interface AuthSession {
  id?: string
  token?: string
  userId?: string
  expiresAt?: string
}

export interface AuthResponse {
  user: AuthUser | null
  session?: AuthSession | null
  token?: string | null
}

const STORAGE_KEY_SESSION = 'nutricarsi_auth_session'
const STORAGE_KEY_USER = 'nutricarsi_auth_user'
const STORAGE_KEY_TOKEN = 'nutricarsi_auth_token'

export const neonAuth = {
  getStoredSession(): { user: AuthUser | null; token: string | null } {
    try {
      const userStr = localStorage.getItem(STORAGE_KEY_USER)
      const token = localStorage.getItem(STORAGE_KEY_TOKEN)
      if (userStr && token) {
        return { user: JSON.parse(userStr), token }
      }
    } catch (e) {
      console.error('Failed to parse stored session', e)
    }
    return { user: null, token: null }
  },

  setStoredSession(user: AuthUser, token: string) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
  },

  clearStoredSession() {
    localStorage.removeItem(STORAGE_KEY_USER)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_SESSION)
  },

  async signUp(nome: string, email: string, password: string): Promise<AuthUser> {
    if (password.length < 9) {
      throw new Error('A senha deve ter no mínimo 9 caracteres.')
    }

    try {
      const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: nome,
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          (data?.code === 'USER_ALREADY_EXISTS'
            ? 'Este email já está cadastrado.'
            : 'Erro ao criar conta. Verifique os dados.')
        throw new Error(errorMsg)
      }

      const user: AuthUser = {
        id: data.user?.id || data.id,
        name: data.user?.name || nome,
        email: data.user?.email || email.trim().toLowerCase(),
        createdAt: data.user?.createdAt || new Date().toISOString(),
      }

      const token = data.token || data.session?.token || data.user?.id || 'session_token'
      this.setStoredSession(user, token)

      // Synchronize with public.nutricionistas table if database URL is available
      await this.syncNutricionistaTable(user)

      return user
    } catch (err: any) {
      console.error('Sign up error:', err)
      throw new Error(err.message || 'Erro ao realizar cadastro.')
    }
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (password.length < 9) {
      throw new Error('A senha deve ter no mínimo 9 caracteres.')
    }

    try {
      const response = await fetch(`${NEON_AUTH_BASE_URL}/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        let msg = 'Email ou senha incorretos.'
        if (data?.message) {
          if (data.message.includes('Invalid') || data.message.includes('password') || data.message.includes('credential')) {
            msg = 'Email ou senha inválidos. Por favor, confira os dados.'
          } else {
            msg = data.message
          }
        }
        throw new Error(msg)
      }

      const user: AuthUser = {
        id: data.user?.id || data.id,
        name: data.user?.name || 'Nutricionista',
        email: data.user?.email || email.trim().toLowerCase(),
        createdAt: data.user?.createdAt || new Date().toISOString(),
      }

      const token = data.token || data.session?.token || data.user?.id || 'session_token'
      this.setStoredSession(user, token)

      // Ensure user exists in nutricionistas table
      await this.syncNutricionistaTable(user)

      return user
    } catch (err: any) {
      console.error('Sign in error:', err)
      throw new Error(err.message || 'Erro ao realizar login.')
    }
  },

  async signOut(): Promise<void> {
    try {
      await fetch(`${NEON_AUTH_BASE_URL}/sign-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      }).catch(() => {})
    } finally {
      this.clearStoredSession()
    }
  },

  async verifySession(): Promise<AuthUser | null> {
    const { user, token } = this.getStoredSession()
    if (!user || !token) return null

    try {
      const response = await fetch(`${NEON_AUTH_BASE_URL}/get-session`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.user) {
          const updatedUser: AuthUser = {
            id: data.user.id,
            name: data.user.name || user.name,
            email: data.user.email || user.email,
            createdAt: data.user.createdAt || user.createdAt,
          }
          this.setStoredSession(updatedUser, token)
          return updatedUser
        }
      }
    } catch (e) {
      console.warn('Session check remote fetch failed, falling back to local session', e)
    }

    // Keep stored local session if valid
    return user
  },

  async syncNutricionistaTable(user: AuthUser): Promise<void> {
    if (!DATABASE_URL) return
    try {
      const sql = neon(DATABASE_URL)
      await sql`
        INSERT INTO public.nutricionistas (id, nome, email, created_at)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.createdAt || new Date().toISOString()})
        ON CONFLICT (id) DO UPDATE 
        SET nome = EXCLUDED.nome, email = EXCLUDED.email;
      `
    } catch (e) {
      console.warn('Direct database sync error (handled gracefully by DB triggers):', e)
    }
  },
}
