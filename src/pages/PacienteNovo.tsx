import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { createPaciente } from '@/lib/database'
import {
  User,
  Activity,
  Heart,
  Calendar,
  Phone,
  Mail,
  Weight,
  Ruler,
  AlertCircle,
  CheckCircle2,
  Clock,
  Droplets,
  Plus,
  X,
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const OBJETIVOS_OPCOES = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
]

const NIVEIS_ATIVIDADE = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
]

const PATOLOGIAS_OPCOES = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
]

const RESTRICOES_OPCOES = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
]

const ALERGIAS_OPCOES = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
]

export const PacienteNovo: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Aba ativa: 'pessoal' | 'clinico' | 'habitos'
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal')

  // Estado do formulário - Aba 1: Pessoal
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [sexo, setSexo] = useState<'Feminino' | 'Masculino' | 'Outro' | ''>('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  // Estado do formulário - Aba 2: Clínico
  const [peso, setPeso] = useState<string>('')
  const [altura, setAltura] = useState<string>('')
  const [objetivos, setObjetivos] = useState<string[]>([])
  const [objetivoTexto, setObjetivoTexto] = useState('')
  const [nivelAtividade, setNivelAtividade] = useState('')
  const [patologias, setPatologias] = useState<string[]>([])
  const [patologiaExtra, setPatologiaExtra] = useState('')
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [restricaoExtra, setRestricaoExtra] = useState('')
  const [alergias, setAlergias] = useState<string[]>([])
  const [alergiaExtra, setAlergiaExtra] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [suplementos, setSuplementos] = useState('')

  // Estado do formulário - Aba 3: Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('')
  const [horarioAcordaInput, setHorarioAcordaInput] = useState('')
  const [horarioDormeInput, setHorarioDormeInput] = useState('')
  const [litrosAgua, setLitrosAgua] = useState<string>('')
  const [praticaAtividade, setPraticaAtividade] = useState<boolean | null>(null)
  const [atividadeDescricao, setAtividadeDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Feedback states
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  // Cálculo de idade automático
  const idade = React.useMemo(() => {
    if (!dataNascimento) return null
    const birthDate = new Date(dataNascimento)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 0 ? age : null
  }, [dataNascimento])

  // Cálculo de IMC automático
  const { imc, imcClassificacao } = React.useMemo(() => {
    const p = parseFloat(peso.replace(',', '.'))
    const a = parseFloat(altura.replace(',', '.'))
    if (!p || !a || a <= 0) return { imc: null, imcClassificacao: null }

    // Se altura foi digitada em cm (> 3), converte para metros
    const alturaMetros = a > 3 ? a / 100 : a
    const valorImc = p / (alturaMetros * alturaMetros)
    if (isNaN(valorImc) || !isFinite(valorImc)) return { imc: null, imcClassificacao: null }

    let classif = ''
    if (valorImc < 18.5) classif = 'Abaixo do peso'
    else if (valorImc < 25) classif = 'Peso normal'
    else if (valorImc < 30) classif = 'Sobrepeso'
    else if (valorImc < 35) classif = 'Obesidade Grau I'
    else if (valorImc < 40) classif = 'Obesidade Grau II'
    else classif = 'Obesidade Grau III'

    return { imc: valorImc.toFixed(1), imcClassificacao: classif }
  }, [peso, altura])

  // Formatação de WhatsApp (ex: (11) 99999-9999)
  const handleWhatsappChange = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 2) {
      setWhatsapp(numbers ? `(${numbers}` : '')
    } else if (numbers.length <= 7) {
      setWhatsapp(`(${numbers.slice(0, 2)}) ${numbers.slice(2)}`)
    } else {
      setWhatsapp(`(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`)
    }
  }

  // Conversão de horário: "6" -> "06:00", "630" -> "06:30", "23" -> "23:00", "2230" -> "22:30"
  const parseTime = (val: string): string => {
    const cleaned = val.replace(/\D/g, '').trim()
    if (!cleaned) return ''
    if (cleaned.length === 1 || cleaned.length === 2) {
      const h = parseInt(cleaned, 10)
      if (h >= 0 && h <= 23) {
        return `${String(h).padStart(2, '0')}:00`
      }
    }
    if (cleaned.length === 3) {
      const h = parseInt(cleaned.slice(0, 1), 10)
      const m = parseInt(cleaned.slice(1, 3), 10)
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    }
    if (cleaned.length >= 4) {
      const h = parseInt(cleaned.slice(0, 2), 10)
      const m = parseInt(cleaned.slice(2, 4), 10)
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      }
    }
    return val
  }

  // Helpers para listas com opção "Nenhum" e adição livre
  const toggleItemWithNone = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([])
      } else {
        setList(['Nenhum'])
      }
      return
    }

    const withoutNone = currentList.filter((x) => x !== 'Nenhum')
    if (withoutNone.includes(item)) {
      setList(withoutNone.filter((x) => x !== item))
    } else {
      setList([...withoutNone, item])
    }
  }

  const addCustomItem = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    customVal: string,
    setCustomVal: (v: string) => void
  ) => {
    const trimmed = customVal.trim()
    if (!trimmed) return
    const withoutNone = currentList.filter((x) => x !== 'Nenhum')
    if (!withoutNone.includes(trimmed)) {
      setList([...withoutNone, trimmed])
    }
    setCustomVal('')
  }

  const removeCustomItem = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList(currentList.filter((x) => x !== item))
  }

  const toggleObjetivo = (item: string) => {
    if (objetivos.includes(item)) {
      setObjetivos(objetivos.filter((x) => x !== item))
    } else {
      setObjetivos([...objetivos, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)

    if (!nome.trim()) {
      setErro('O nome completo é obrigatório.')
      setActiveTab('pessoal')
      return
    }

    if (!user?.id) {
      setErro('Você precisa estar autenticado como nutricionista.')
      return
    }

    setSubmitting(true)

    try {
      const pesoNum = peso ? parseFloat(peso.replace(',', '.')) : null
      const alturaNum = altura ? parseFloat(altura.replace(',', '.')) : null
      const refeicoesNum = refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null
      const litrosNum = litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null

      const created = await createPaciente({
        nutricionista_id: user.id,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        whatsapp: whatsapp || null,
        telefone: whatsapp || null,
        email: email.trim() || null,
        peso_inicial: pesoNum,
        altura: alturaNum,
        objetivos: objetivos.length > 0 ? objetivos : null,
        objetivo_texto: objetivoTexto.trim() || null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias.length > 0 ? patologias : null,
        restricoes_alimentares: restricoes.length > 0 ? restricoes : null,
        alergias: alergias.length > 0 ? alergias : null,
        medicamentos: medicamentos.trim() || null,
        suplementos: suplementos.trim() || null,
        refeicoes_por_dia: refeicoesNum,
        horario_acorda: parseTime(horarioAcordaInput) || null,
        horario_dorme: parseTime(horarioDormeInput) || null,
        litros_agua: litrosNum,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao: praticaAtividade ? atividadeDescricao.trim() || null : null,
        observacoes: observacoes.trim() || null,
      })

      setSucesso(true)
      setTimeout(() => {
        navigate(`/pacientes/${created.id}`)
      }, 1200)
    } catch (err: any) {
      console.error('Erro ao salvar paciente:', err)
      setErro(err?.message || 'Falha ao cadastrar paciente. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in-50 duration-300">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/pacientes')}
              className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-7 h-7 text-emerald-600" />
                Novo Paciente
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Preencha os dados de anamnese e histórico do paciente.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {erro && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Atenção</p>
              <p className="text-xs text-rose-600 mt-0.5">{erro}</p>
            </div>
          </div>
        )}

        {sucesso && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Paciente cadastrado com sucesso!</p>
              <p className="text-xs text-emerald-700">Redirecionando para o perfil do paciente...</p>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pessoal')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'pessoal'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-emerald-500/10 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              1. Pessoal
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clinico')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'clinico'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-emerald-500/10 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              2. Clínico
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('habitos')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'habitos'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-emerald-500/10 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Heart className="w-4 h-4 text-emerald-600" />
              3. Hábitos
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ========================================================
                ABA 1 — PESSOAL
               ======================================================== */}
            {activeTab === 'pessoal' && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Identificação Pessoal</h3>
                  <p className="text-xs text-slate-500">
                    O único campo obrigatório é o <strong>Nome completo</strong>. Os demais são opcionais.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Eduarda Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Data de Nascimento com Idade Calculada */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Data de Nascimento
                        </label>
                        {idade !== null && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {idade} {idade === 1 ? 'ano' : 'anos'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Sexo */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Sexo
                      </label>
                      <select
                        value={sexo}
                        onChange={(e) => setSexo(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                      >
                        <option value="">Selecione...</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder="(11) 98765-4321"
                          value={whatsapp}
                          onChange={(e) => handleWhatsappChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          placeholder="maria@exemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('clinico')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                  >
                    Avançar para Clínico →
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                ABA 2 — CLÍNICO
               ======================================================== */}
            {activeTab === 'clinico' && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Dados Clínicos e Antropométricos</h3>
                  <p className="text-xs text-slate-500">
                    Insira peso e altura para o cálculo em tempo real do IMC.
                  </p>
                </div>

                {/* Antropometria: Peso, Altura e IMC */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                  {/* Peso */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Peso Atual
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Altura */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Altura
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="170"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        className="w-full pr-10 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* IMC Calculado (somente leitura) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      IMC (Automático)
                    </label>
                    <div className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-800">
                        {imc ? `${imc} kg/m²` : '—'}
                      </span>
                      {imcClassificacao && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {imcClassificacao}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Objetivos (Múltipla escolha)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OBJETIVOS_OPCOES.map((obj) => {
                      const isSelected = objetivos.includes(obj)
                      return (
                        <button
                          key={obj}
                          type="button"
                          onClick={() => toggleObjetivo(obj)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {obj}
                        </button>
                      )
                    })}
                  </div>

                  <input
                    type="text"
                    placeholder="Outro objetivo ou observação específica sobre o objetivo..."
                    value={objetivoTexto}
                    onChange={(e) => setObjetivoTexto(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                {/* Nível de Atividade Física */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Nível de Atividade Física (Seleção única)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NIVEIS_ATIVIDADE.map((nivel) => {
                      const isSelected = nivelAtividade === nivel
                      return (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() => setNivelAtividade(nivel)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {nivel}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Patologias ou Condições de Saúde */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Patologias ou Condições de Saúde
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItemWithNone(patologias, setPatologias, 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        patologias.includes('Nenhum')
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {patologias.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>
                    {PATOLOGIAS_OPCOES.map((pat) => {
                      const isSelected = patologias.includes(pat)
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => toggleItemWithNone(patologias, setPatologias, pat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {pat}
                        </button>
                      )
                    })}
                    {/* Custom itens adicionados */}
                    {patologias
                      .filter((p) => !PATOLOGIAS_OPCOES.includes(p) && p !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem(patologias, setPatologias, custom)}
                            className="hover:text-rose-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  {/* Input para adicionar livremente */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Adicionar outra patologia..."
                      value={patologiaExtra}
                      onChange={(e) => setPatologiaExtra(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(patologias, setPatologias, patologiaExtra, setPatologiaExtra)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomItem(patologias, setPatologias, patologiaExtra, setPatologiaExtra)}
                      className="rounded-xl border-slate-200 text-xs text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Restrições Alimentares */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Restrições Alimentares
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItemWithNone(restricoes, setRestricoes, 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        restricoes.includes('Nenhum')
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {restricoes.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>
                    {RESTRICOES_OPCOES.map((res) => {
                      const isSelected = restricoes.includes(res)
                      return (
                        <button
                          key={res}
                          type="button"
                          onClick={() => toggleItemWithNone(restricoes, setRestricoes, res)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {res}
                        </button>
                      )
                    })}
                    {restricoes
                      .filter((r) => !RESTRICOES_OPCOES.includes(r) && r !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem(restricoes, setRestricoes, custom)}
                            className="hover:text-rose-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Adicionar outra restrição alimentar..."
                      value={restricaoExtra}
                      onChange={(e) => setRestricaoExtra(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(restricoes, setRestricoes, restricaoExtra, setRestricaoExtra)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomItem(restricoes, setRestricoes, restricaoExtra, setRestricaoExtra)}
                      className="rounded-xl border-slate-200 text-xs text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Alergias Alimentares */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Alergias Alimentares
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItemWithNone(alergias, setAlergias, 'Nenhum')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        alergias.includes('Nenhum')
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {alergias.includes('Nenhum') && '✓ '}
                      Nenhum
                    </button>
                    {ALERGIAS_OPCOES.map((al) => {
                      const isSelected = alergias.includes(al)
                      return (
                        <button
                          key={al}
                          type="button"
                          onClick={() => toggleItemWithNone(alergias, setAlergias, al)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {al}
                        </button>
                      )
                    })}
                    {alergias
                      .filter((a) => !ALERGIAS_OPCOES.includes(a) && a !== 'Nenhum')
                      .map((custom) => (
                        <span
                          key={custom}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCustomItem(alergias, setAlergias, custom)}
                            className="hover:text-rose-200"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Adicionar outra alergia alimentar..."
                      value={alergiaExtra}
                      onChange={(e) => setAlergiaExtra(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addCustomItem(alergias, setAlergias, alergiaExtra, setAlergiaExtra)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCustomItem(alergias, setAlergias, alergiaExtra, setAlergiaExtra)}
                      className="rounded-xl border-slate-200 text-xs text-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Medicamentos e Suplementos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Medicamentos Contínuos
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Losartana 50mg pela manhã..."
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Suplementos em Uso
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Creatina 5g, Vitamina D 2000UI..."
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('pessoal')}
                    className="rounded-xl border-slate-200 text-slate-700"
                  >
                    ← Voltar para Pessoal
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('habitos')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                  >
                    Avançar para Hábitos →
                  </Button>
                </div>
              </div>
            )}

            {/* ========================================================
                ABA 3 — HÁBITOS
               ======================================================== */}
            {activeTab === 'habitos' && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Rotina e Hábitos de Vida</h3>
                  <p className="text-xs text-slate-500">
                    Informações sobre sono, hidratação e prática de atividades físicas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Refeições por Dia */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Quantas refeições faz por dia
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="Ex: 4"
                      value={refeicoesPorDia}
                      onChange={(e) => setRefeicoesPorDia(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>

                  {/* Quantidade de Água */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Quantidade de água por dia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 2.5"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                        className="w-full pr-14 pl-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        litros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horários (Acorda e Dorme com conversão automática) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {/* Horário que Acorda */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Horário que acorda
                      </label>
                      {horarioAcordaInput && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {parseTime(horarioAcordaInput)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ex: 6 (06:00) ou 630 (06:30)"
                        value={horarioAcordaInput}
                        onChange={(e) => setHorarioAcordaInput(e.target.value)}
                        onBlur={() => setHorarioAcordaInput(parseTime(horarioAcordaInput))}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Converte automaticamente (ex: 7 → 07:00)</p>
                  </div>

                  {/* Horário que Dorme */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Horário que dorme
                      </label>
                      {horarioDormeInput && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          {parseTime(horarioDormeInput)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Ex: 23 (23:00) ou 2230 (22:30)"
                        value={horarioDormeInput}
                        onChange={(e) => setHorarioDormeInput(e.target.value)}
                        onBlur={() => setHorarioDormeInput(parseTime(horarioDormeInput))}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Converte automaticamente (ex: 23 → 23:00)</p>
                  </div>
                </div>

                {/* Pratica Atividade Física (Sim / Não) */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pratica atividade física?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPraticaAtividade(true)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        praticaAtividade === true
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPraticaAtividade(false)
                        setAtividadeDescricao('')
                      }}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                        praticaAtividade === false
                          ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Não
                    </button>
                  </div>

                  {/* Campo condicional se "Sim" */}
                  {praticaAtividade === true && (
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5 animate-in fade-in-50">
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Qual atividade e frequência semanal?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Musculação 4x na semana, corrida aos sábados"
                        value={atividadeDescricao}
                        onChange={(e) => setAtividadeDescricao(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  )}
                </div>

                {/* Observações Gerais */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Observações Gerais (Texto livre)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Anote detalhes adicionais, preferências, rotina familiar, etc..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('clinico')}
                    className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700"
                  >
                    ← Voltar para Clínico
                  </Button>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl px-8 py-3 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando Paciente...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Paciente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default PacienteNovo
