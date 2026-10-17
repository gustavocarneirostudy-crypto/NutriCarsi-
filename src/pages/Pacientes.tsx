import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { getPacientesByNutri, Paciente } from '@/lib/database'
import {
  Users,
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Pacientes: React.FC = () => {
  const { user } = useAuth()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPacientes = async (isRefresh = false) => {
    if (!user?.id) return
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const data = await getPacientesByNutri(user.id)
      setPacientes(data)
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadPacientes()
  }, [user?.id])

  const filteredPacientes = pacientes.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      p.nome.toLowerCase().includes(term) ||
      (p.email && p.email.toLowerCase().includes(term)) ||
      (p.whatsapp && p.whatsapp.includes(term)) ||
      (p.telefone && p.telefone.includes(term))
    )
  })

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Nenhuma consulta'
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              Pacientes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie seus pacientes cadastrados, histórico de consultas e dados antropométricos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPacientes(true)}
              disabled={loading || refreshing}
              className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Link to="/pacientes/novo">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar paciente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total:{' '}
            <span className="font-bold text-slate-800">
              {filteredPacientes.length}
            </span>{' '}
            {filteredPacientes.length === 1 ? 'paciente' : 'pacientes'}
          </div>
        </div>

        {/* Pacientes List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md shadow-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredPacientes.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado ainda'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {searchTerm
                  ? 'Tente buscar com outro nome.'
                  : 'Comece adicionando seu primeiro paciente para gerenciar anamnese e consultas.'}
              </p>
              {!searchTerm && (
                <Link to="/pacientes/novo">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Paciente
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPacientes.map((p) => {
                const initial = p.nome ? p.nome.trim().charAt(0).toUpperCase() : 'P'
                return (
                  <Link
                    key={p.id}
                    to={`/pacientes/${p.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-emerald-50/40 transition-all duration-150 group gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base block truncate">
                          {p.nome}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                          {/* Objetivo */}
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            🎯 {p.objetivos && p.objetivos.length > 0
                              ? p.objetivos.slice(0, 2).join(', ') + (p.objetivos.length > 2 ? '...' : '')
                              : p.objetivo_texto || 'Sem objetivo definido'}
                          </span>

                          {p.email && (
                            <span className="hidden sm:inline-flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {p.email}
                            </span>
                          )}
                          {(p.whatsapp || p.telefone) && (
                            <span className="hidden sm:inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {p.whatsapp || p.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-slate-500">
                      <div className="text-left sm:text-right">
                        <span className="block text-[11px] text-slate-400 uppercase font-semibold">
                          Última Consulta
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatDate(p.ultima_consulta)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 transition-colors">
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
    </DashboardLayout>
  )
}

export default Pacientes
