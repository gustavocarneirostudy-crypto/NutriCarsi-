import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { getPacienteById, Paciente, Consulta } from '@/lib/database'
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  Activity,
  Heart,
  Droplets,
  Weight,
  Ruler,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PacientePerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<{ paciente: Paciente; consultas: Consulta[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id || !user?.id) return
      try {
        const res = await getPacienteById(id, user.id)
        setData(res)
      } catch (e) {
        console.error('Erro ao carregar paciente:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id])

  const formatDate = (dateStr?: string | null) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Navigation back */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <span className="text-xs text-slate-400">/ Detalhes do Paciente</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-16 w-16 bg-slate-200 rounded-full mx-auto mb-4" />
            <div className="h-6 w-48 bg-slate-200 rounded mx-auto mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded mx-auto" />
          </div>
        ) : !data ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Paciente não encontrado</h2>
            <p className="text-xs text-slate-500 mt-1">
              O paciente solicitado não existe ou você não possui permissão para visualizá-lo.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="mt-4 rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              Ir para o Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md shadow-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 flex-shrink-0">
                  {data.paciente.nome.trim().charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-extrabold text-slate-900">
                      {data.paciente.nome}
                    </h1>
                    {data.paciente.sexo && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {data.paciente.sexo}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    {data.paciente.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {data.paciente.email}
                      </span>
                    )}
                    {(data.paciente.whatsapp || data.paciente.telefone) && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {data.paciente.whatsapp || data.paciente.telefone}
                      </span>
                    )}
                    {data.paciente.data_nascimento && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Nascimento: {formatDate(data.paciente.data_nascimento)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Antropometria & Hábitos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Weight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Peso Inicial</span>
                  <p className="text-base font-bold text-slate-800">
                    {data.paciente.peso_inicial ? `${data.paciente.peso_inicial} kg` : '-'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Altura</span>
                  <p className="text-base font-bold text-slate-800">
                    {data.paciente.altura ? `${data.paciente.altura} m` : '-'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Meta de Água</span>
                  <p className="text-base font-bold text-slate-800">
                    {data.paciente.litros_agua ? `${data.paciente.litros_agua} L / dia` : '-'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Total de Consultas</span>
                  <p className="text-base font-bold text-slate-800">
                    {data.consultas.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Consultas History */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md shadow-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Histórico de Consultas
              </h2>

              {data.consultas.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    Nenhuma consulta registrada para este paciente até o momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.consultas.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                            Consulta #{data.consultas.length - idx}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {formatDate(c.data_consulta)}
                          </span>
                        </div>
                        {c.proximo_retorno && (
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50 self-start sm:self-auto">
                            Próximo retorno: {formatDate(c.proximo_retorno)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 mt-3">
                        {c.peso && <div><span className="text-slate-400">Peso:</span> <strong className="text-slate-800">{c.peso} kg</strong></div>}
                        {c.cintura && <div><span className="text-slate-400">Cintura:</span> <strong className="text-slate-800">{c.cintura} cm</strong></div>}
                        {c.quadril && <div><span className="text-slate-400">Quadril:</span> <strong className="text-slate-800">{c.quadril} cm</strong></div>}
                        {c.percentual_gordura && <div><span className="text-slate-400">% Gordura:</span> <strong className="text-slate-800">{c.percentual_gordura}%</strong></div>}
                      </div>

                      {c.observacoes && (
                        <p className="text-xs text-slate-500 mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                          {c.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PacientePerfil
