import { api } from "./api"

export interface Agent {
  id: number
  agentCode: string
  status: string
  companyName?: string | null

  // Dados financeiros do AgentProfile
  currentBalance?: number
  totalSales?: number
  totalCommission?: number
  commissionBalance?: number

  isActive?: boolean
  createdAt?: string

  user: {
    id: number
    publicId: string
    fullName: string
    email: string
    phone: string
    balance?: number
    isBlocked?: boolean
    isAgentApproved?: boolean
  }

  subAgents?: Array<{
    id: number
    employeeCode: string
    workstation: string | null
    position: string | null
    user: {
      fullName: string
      email: string
      phone: string
    }
  }>
}

export interface SubAgentSale {
  id: number
  amount: number
  cost: number | null
  profit: number | null
  status: string
  serviceName: string | null
  serviceGroupName: string | null
  planName: string | null
  providerName: string | null
  customerReference: string | null
  customerName: string | null
  createdAt: string
  completedAt: string | null
  transactionId: number | null
  transaction: {
    id: number
    reference: string | null
    status: string | null
  } | null
}

export interface SubAgentSalesResponse {
  subAgent: {
    id: number
    employeeCode: string
    fullName: string | null
    phone: string | null
  }
  summary: {
    totalOperations: number
    completedSales: number
    totalSales: number
    totalProfit: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  sales: SubAgentSale[]
}

// Interface auxiliar para os dados enviados na criação
export interface CreateAgentPayload {
  fullName: string
  email: string
  phone: string
  workstation?: string
  position?: string
  department?: string
  address?: string
  pin: string
}

// Interface auxiliar para os dados enviados na atualização
export interface UpdateAgentPayload {
  fullName?: string
  email?: string
  phone?: string
  workstation?: string
  position?: string
  department?: string
  address?: string
}

class AdminAgentService {
  async getAll() {
    const { data } = await api.get(
      "/admin/agents"
    )
    return data as Agent[]
  }

  async getById(id: number) {
    const { data } = await api.get(
      `/admin/agents/${id}`
    )
    return data
  }

  // Processar a criação de Agentes via Admin
  async create(payload: CreateAgentPayload) {
    const { data } = await api.post(
      "/admin/agents",
      payload
    )
    return data
  }

  // Aprovar Agente
  async approveAgent(id: number) {
    const { data } = await api.patch(`/admin/agents/${id}/approve`)
    return data
  }

  // Rejeitar Agente
  async rejectAgent(id: number, notes?: string) {
    const { data } = await api.patch(`/admin/agents/${id}/reject`, { notes })
    return data
  }

  // Suspender Agente
  async suspendAgent(id: number, notes?: string) {
    const { data } = await api.patch(`/admin/agents/${id}/suspend`, { notes })
    return data
  }

  // Reativar Agente
  async reactivateAgent(id: number) {
    const { data } = await api.patch(`/admin/agents/${id}/reactivate`)
    return data
  }

  /* =====================================================
     NOVOS MÉTODOS ADICIONADOS PARA REPLICAR OS SUB-AGENTES
  ===================================================== */

  // Editar dados do Agente
  async update(id: number, payload: UpdateAgentPayload) {
    const { data } = await api.put(
      `/admin/agents/${id}`,
      payload
    )
    return data
  }

  // Alternar Bloqueio (Bloquear/Desbloquear)
  async toggleBlock(id: number) {
    const { data } = await api.patch(
      `/admin/agents/${id}/toggle-block`
    )
    return data
  }

    async getSubAgentSales(
    agentId: number,
    subAgentId: number,
    page = 1,
    limit = 10
  ): Promise<SubAgentSalesResponse> {
    const { data } = await api.get(
      `/admin/agents/${agentId}/sub-agents/${subAgentId}/sales`,
      {
        params: { page, limit }
      }
    )

    return data
  }

  // Redefinir/Resetar PIN do Agente
  async resetPin(id: number, pin: string) {
    const { data } = await api.patch(
      `/admin/agents/${id}/reset-pin`,
      { pin }
    )
    return data
  }
}

export default new AdminAgentService()