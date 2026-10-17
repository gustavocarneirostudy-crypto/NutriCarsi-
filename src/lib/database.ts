import { neon } from '@neondatabase/serverless'

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL || ''

export interface Paciente {
  id: string
  nutricionista_id: string
  nome: string
  data_nascimento?: string | null
  sexo?: string | null
  whatsapp?: string | null
  telefone?: string | null
  email?: string | null
  peso_inicial?: number | null
  altura?: number | null
  objetivos?: string[] | null
  objetivo_texto?: string | null
  nivel_atividade?: string | null
  patologias?: string[] | null
  restricoes_alimentares?: string[] | null
  alergias?: string[] | null
  medicamentos?: string | null
  suplementos?: string | null
  refeicoes_por_dia?: number | null
  horario_acorda?: string | null
  horario_dorme?: string | null
  litros_agua?: number | null
  atividade_fisica?: boolean | null
  atividade_fisica_descricao?: string | null
  observacoes?: string | null
  created_at?: string
  total_consultas?: number
  ultima_consulta?: string | null
}

export interface Consulta {
  id: string
  paciente_id: string
  data_consulta: string
  peso?: number | null
  cintura?: number | null
  quadril?: number | null
  percentual_gordura?: number | null
  observacoes?: string | null
  proximo_retorno?: string | null
  created_at?: string
}

export interface PacienteSemRetorno {
  paciente_id: string
  paciente_nome: string
  email?: string | null
  whatsapp?: string | null
  telefone?: string | null
  ultima_consulta: string
  proximo_retorno?: string | null
  dias_sem_consulta: number
}

export interface DashboardStats {
  totalPacientes: number
  consultasSemana: number
  pacientesSemRetorno: PacienteSemRetorno[]
}

export const getDb = () => {
  if (!DATABASE_URL) {
    throw new Error('VITE_NEON_DATABASE_URL não configurada no ambiente.')
  }
  return neon(DATABASE_URL)
}

export async function getDashboardData(nutricionistaId: string): Promise<DashboardStats> {
  const sql = getDb()

  try {
    // 1. Total de pacientes ativos cadastrados pela nutricionista logada
    const totalPacientesRes = await sql`
      SELECT COUNT(*)::int AS total
      FROM public.pacientes
      WHERE nutricionista_id = ${nutricionistaId};
    `
    const totalPacientes = totalPacientesRes[0]?.total || 0

    // 2. Consultas da semana atual (segunda a domingo da semana corrente)
    const consultasSemanaRes = await sql`
      SELECT COUNT(*)::int AS total
      FROM public.consultas c
      INNER JOIN public.pacientes p ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutricionistaId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)::date
        AND c.data_consulta <= (date_trunc('week', CURRENT_DATE) + interval '6 days')::date;
    `
    const consultasSemana = consultasSemanaRes[0]?.total || 0

    // 3. Pacientes sem retorno: última consulta há mais de 30 dias e sem próximo retorno agendado
    const pacientesSemRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          p.id AS paciente_id,
          p.nome AS paciente_nome,
          p.email,
          p.whatsapp,
          p.telefone,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno
        FROM public.pacientes p
        LEFT JOIN public.consultas c ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
        GROUP BY p.id, p.nome, p.email, p.whatsapp, p.telefone
      )
      SELECT 
        paciente_id,
        paciente_nome,
        email,
        whatsapp,
        telefone,
        ultima_consulta,
        proximo_retorno,
        (CURRENT_DATE - ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas
      WHERE ultima_consulta IS NOT NULL
        AND ultima_consulta < (CURRENT_DATE - INTERVAL '30 days')
        AND (proximo_retorno IS NULL OR proximo_retorno < CURRENT_DATE)
      ORDER BY ultima_consulta ASC;
    `

    const pacientesSemRetorno: PacienteSemRetorno[] = pacientesSemRetornoRes.map((row: any) => ({
      paciente_id: row.paciente_id,
      paciente_nome: row.paciente_nome,
      email: row.email,
      whatsapp: row.whatsapp,
      telefone: row.telefone,
      ultima_consulta: row.ultima_consulta ? String(row.ultima_consulta).split('T')[0] : '',
      proximo_retorno: row.proximo_retorno ? String(row.proximo_retorno).split('T')[0] : null,
      dias_sem_consulta: Number(row.dias_sem_consulta) || 0,
    }))

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno,
    }
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard no Neon:', error)
    throw error
  }
}

export async function getPacientesByNutri(nutricionistaId: string): Promise<Paciente[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT 
      p.*,
      COUNT(c.id)::int AS total_consultas,
      MAX(c.data_consulta) AS ultima_consulta
    FROM public.pacientes p
    LEFT JOIN public.consultas c ON c.paciente_id = p.id
    WHERE p.nutricionista_id = ${nutricionistaId}
    GROUP BY p.id
    ORDER BY p.nome ASC;
  `
  return rows.map((r: any) => ({
    ...r,
    ultima_consulta: r.ultima_consulta ? String(r.ultima_consulta).split('T')[0] : null,
  }))
}

export async function createPaciente(paciente: Omit<Paciente, 'id' | 'created_at' | 'total_consultas' | 'ultima_consulta'>): Promise<Paciente> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO public.pacientes (
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      whatsapp,
      telefone,
      email,
      peso_inicial,
      altura,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    ) VALUES (
      ${paciente.nutricionista_id},
      ${paciente.nome},
      ${paciente.data_nascimento || null},
      ${paciente.sexo || null},
      ${paciente.whatsapp || null},
      ${paciente.telefone || null},
      ${paciente.email || null},
      ${paciente.peso_inicial != null && !isNaN(Number(paciente.peso_inicial)) ? Number(paciente.peso_inicial) : null},
      ${paciente.altura != null && !isNaN(Number(paciente.altura)) ? Number(paciente.altura) : null},
      ${paciente.objetivos && paciente.objetivos.length > 0 ? paciente.objetivos : null},
      ${paciente.objetivo_texto || null},
      ${paciente.nivel_atividade || null},
      ${paciente.patologias && paciente.patologias.length > 0 ? paciente.patologias : null},
      ${paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0 ? paciente.restricoes_alimentares : null},
      ${paciente.alergias && paciente.alergias.length > 0 ? paciente.alergias : null},
      ${paciente.medicamentos || null},
      ${paciente.suplementos || null},
      ${paciente.refeicoes_por_dia != null && !isNaN(Number(paciente.refeicoes_por_dia)) ? Number(paciente.refeicoes_por_dia) : null},
      ${paciente.horario_acorda || null},
      ${paciente.horario_dorme || null},
      ${paciente.litros_agua != null && !isNaN(Number(paciente.litros_agua)) ? Number(paciente.litros_agua) : null},
      ${paciente.atividade_fisica ?? null},
      ${paciente.atividade_fisica_descricao || null},
      ${paciente.observacoes || null}
    )
    RETURNING *;
  `
  return rows[0] as Paciente
}

export async function getPacienteById(id: string, nutricionistaId: string): Promise<{ paciente: Paciente; consultas: Consulta[] } | null> {
  const sql = getDb()
  const pacienteRows = await sql`
    SELECT * FROM public.pacientes
    WHERE id = ${id} AND nutricionista_id = ${nutricionistaId}
    LIMIT 1;
  `
  if (!pacienteRows || pacienteRows.length === 0) return null

  const consultasRows = await sql`
    SELECT * FROM public.consultas
    WHERE paciente_id = ${id}
    ORDER BY data_consulta DESC;
  `

  return {
    paciente: pacienteRows[0] as Paciente,
    consultas: consultasRows.map((c: any) => ({
      ...c,
      data_consulta: c.data_consulta ? String(c.data_consulta).split('T')[0] : '',
      proximo_retorno: c.proximo_retorno ? String(c.proximo_retorno).split('T')[0] : null,
    })) as Consulta[],
  }
}


