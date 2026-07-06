import { api } from "./api"

export interface Agent {
  id: number
  agentCode: string
  status: string
  companyName?: string | null
  commissionBalance?: number
  totalSales?: number
  totalCommission?: number
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