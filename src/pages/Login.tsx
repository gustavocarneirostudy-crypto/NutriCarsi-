import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    if (password.length < 9) {
      setError('A senha deve ter no mínimo 9 caracteres.')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique seu email e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-radial-gradient flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Gerencie seus pacientes, consultas e planos alimentares com segurança
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-950/5">
          {error && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email profissional</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@nutricionista.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <span className="text-xs text-slate-400">Mínimo 9 caracteres</span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-base font-semibold h-12 shadow-lg shadow-emerald-600/25 group"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Entrando no sistema...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Entrar</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Não tem conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Security / trust badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Ambiente seguro com criptografia e isolamento RLS Neon</span>
        </div>
      </div>
    </div>
  )
}
