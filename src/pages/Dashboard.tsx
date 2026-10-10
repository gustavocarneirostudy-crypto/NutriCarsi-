import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { getDashboardData, DashboardStats, PacienteSemRetorno } from '@/lib/database'
import {
  Users,
  CalendarCheck,
  ClockAlert,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  User,
  Activity,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return

    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const data = await getDashboardData(user.id)
      setStats(data)
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError(
        err?.message ||
          'Não foi possível carregar as métricas do Neon. Verifique a conexão com o banco de dados.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      const parts = dateStr.split('-')
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      }
      return new Date(dateStr).toLocaleDateString('pt-BR')
    } catch {
      return dateStr
    }
  }

  const currentDateGreeting = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in-50 duration-300">
        {/* Header / Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-400/30 text-emerald-200 text-xs font-semibold capitalize">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{currentDateGreeting}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {user?.name || 'Nutricionista'}! 🌿
            </h1>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              Aqui está o panorama atualizado dos seus atendimentos e pacientes no Neon.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all rounded-xl gap-2 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Erro ao sincronizar com o banco de dados</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              className="text-xs bg-white text-red-600 border-red-200 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* 3 Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 — Total de pacientes ativos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  Cadastrados
                </span>
              </div>

              <h2 className="text-sm font-semibold text-slate-600">
                Total de Pacientes Ativos
              </h2>

              {loading ? (
                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl my-2" />
              ) : (
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {stats.totalPacientes}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {stats.totalPacientes === 1 ? 'paciente' : 'pacientes'}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Pacientes vinculados à sua conta profissional.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-600">
              <Link
                to="/pacientes"
                className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors group-hover:translate-x-0.5 transform duration-150"
              >
                <span>Ver lista de pacientes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 — Consultas da semana */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100 hover:shadow-lg hover:border-teal-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 shadow-sm">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/50">
                  Esta Semana
                </span>
              </div>

              <h2 className="text-sm font-semibold text-slate-600">
                Consultas da Semana
              </h2>

              {loading ? (
                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl my-2" />
              ) : (
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {stats.consultasSemana}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {stats.consultasSemana === 1 ? 'consulta' : 'consultas'}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Consultas registradas de segunda a domingo da semana atual.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-teal-600">
              <span className="text-slate-400">Semana corrente</span>
              <span className="font-semibold text-teal-700">Neon Live</span>
            </div>
          </div>

          {/* Card 3 Summary Badge on Grid (for 3-col balance) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 shadow-sm">
                  <ClockAlert className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">
                  {stats.pacientesSemRetorno.length > 0 ? 'Atenção' : 'Em dia'}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-slate-600">
                Alerta de Retorno
              </h2>

              {loading ? (
                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl my-2" />
              ) : (
                <div className="flex items-baseline gap-2 my-2">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${
                      stats.pacientesSemRetorno.length > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {stats.pacientesSemRetorno.length}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {stats.pacientesSemRetorno.length === 1 ? 'paciente sem retorno' : 'pacientes sem retorno'}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Última consulta há mais de 30 dias e sem agendamento futuro.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">Critério: &gt; 30 dias</span>
              <span className="text-amber-700 font-semibold">Prioridade clínica</span>
            </div>
          </div>
        </div>

        {/* Card 3 — Pacientes sem retorno (Lista Detalhada e Clicável) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md shadow-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <ClockAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pacientes sem retorno
                </h2>
                <p className="text-xs text-slate-500">
                  Pacientes cuja última consulta foi realizada há mais de 30 dias e ainda não possuem próximo retorno marcado.
                </p>
              </div>
            </div>

            {stats.pacientesSemRetorno.length > 0 && (
              <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                {stats.pacientesSemRetorno.length}{' '}
                {stats.pacientesSemRetorno.length === 1 ? 'paciente' : 'pacientes'}
              </span>
            )}
          </div>

          {/* List Content */}
          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 animate-pulse flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="space-y-1.5">
                        <div className="w-36 h-4 bg-slate-200 rounded" />
                        <div className="w-24 h-3 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="w-20 h-6 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            ) : stats.pacientesSemRetorno.length === 0 ? (
              /* Empty State */
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-sm border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Nenhum paciente sem retorno no momento
                </h3>
                <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                  Excelente! Todos os seus pacientes ativos tiveram consultas recentes ou já possuem uma data de retorno agendada.
                </p>
              </div>
            ) : (
              /* Patients List */
              <div className="divide-y divide-slate-100">
                {stats.pacientesSemRetorno.map((item) => {
                  const initial = item.paciente_nome ? item.paciente_nome.trim().charAt(0).toUpperCase() : 'P'
                  return (
                    <Link
                      key={item.paciente_id}
                      to={`/pacientes/${item.paciente_id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 -mx-2 sm:mx-0 rounded-2xl hover:bg-emerald-50/50 transition-all duration-150 gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-800 font-bold text-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base block truncate">
                            {item.paciente_nome}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>Última consulta: <strong>{formatDate(item.ultima_consulta)}</strong></span>
                            {item.whatsapp && (
                              <span className="text-slate-400">• {item.whatsapp}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                          <ClockAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Há {item.dias_sem_consulta} dias</span>
                        </span>

                        <div className="p-2 rounded-xl text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100/50 transition-colors">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
