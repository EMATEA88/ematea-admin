import { api } from "../services/api"

export interface AdminLogItem {
  id: number
  adminId: number
  action: string
  entity?: string | null
  entityId?: number | null
  metadata?: any
  createdAt: string
  admin?: {
    id: number
    phone: string
  }
}

export const AdminService = {

  // ================= DASHBOARD =================
  dashboard: async () => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // ================= LOGS =================
  logs: async (
    page = 1,
    limit = 20,
    action?: string,
    entity?: string
  ) => {
    const params: any = { page, limit }
    if (action) params.action = action
    if (entity) params.entity = entity

    const { data } = await api.get("/admin/logs", { params })
    return data
  },

  // ================= FINANCE (GLOBAL) =================
  finance: async () => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // ================= USERS =================
  users: async () => {
    const { data } = await api.get("/admin/users")
    return data
  },

  userDetails: async (id: number) => {
    const { data } = await api.get(`/admin/users/${id}`)
    return data
  },

  updateUserRole: async (id: number, role: "USER" | "ADMIN") => {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role })
    return data
  },

  adjustUserBalance: async (
    id: number,
    payload: { amount: number; action: "ADD" | "SUBTRACT" }
  ) => {
    const { data } = await api.patch(`/admin/users/${id}/balance`, payload)
    return data
  },

  blockUser: async (id: number) => {
    const { data } = await api.patch(`/admin/users/${id}/block`)
    return data
  },

  unblockUser: async (id: number) => {
    const { data } = await api.patch(`/admin/users/${id}/unblock`)
    return data
  },

  commissions: async () => {
    const { data } = await api.get("/admin/commissions")
    return data
  },

  // ================= AGENTS =================
  agents: async (
    params?: {
      status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
      page?: number
      limit?: number
      search?: string
    }
  ) => {
    const { data } = await api.get("/admin/agents", { params })
    return data
  },

  agentDetails: async (id: number) => {
    const { data } = await api.get(`/admin/agents/${id}`)
    return data
  },

  approveAgent: async (id: number) => {
    const { data } = await api.patch(`/admin/agents/${id}/approve`)
    return data
  },

  rejectAgent: async (id: number, reason: string) => {
    const { data } = await api.patch(
      `/admin/agents/${id}/reject`,
      { reason }
    )
    return data
  },

  suspendAgent: async (id: number, reason: string) => {
    const { data } = await api.patch(
      `/admin/agents/${id}/suspend`,
      { reason }
    )
    return data
  },

  activateAgent: async (id: number) => {
    const { data } = await api.patch(
      `/admin/agents/${id}/activate`
    )
    return data
  },

  adjustAgentCommission: async (id: number, amount: number) => {
    const { data } = await api.patch(
      `/admin/agents/${id}/commission`,
      { amount }
    )
    return data
  },

  agentStatistics: async () => {
    const { data } = await api.get(
      "/admin/agents/statistics"
    )
    return data
  },

  // ================= RECHARGES =================
  recharges: async () => {
    const response = await api.get("/admin/recharges")

    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.data?.data)) return response.data.data

    return []
  },

  approveRecharge: async (id: number) => {
    if (!id || isNaN(id)) throw new Error("INVALID_ID")
    const { data } = await api.patch(`/admin/recharges/${id}/approve`)
    return data
  },

  rejectRecharge: async (id: number) => {
    if (!id || isNaN(id)) throw new Error("INVALID_ID")
    const { data } = await api.patch(`/admin/recharges/${id}/reject`)
    return data
  },

  // ================= WITHDRAWALS =================
  withdrawals: async (
    page = 1,
    limit = 20,
    status?: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    const params: any = { page, limit }
    if (status) params.status = status
    const { data } = await api.get("/admin/withdrawals", { params })
    return data
  },

  approveWithdrawal: async (id: number) => {
    const { data } = await api.patch(`/admin/withdrawals/${id}/approve`)
    return data
  },

  rejectWithdrawal: async (id: number) => {
    const { data } = await api.patch(`/admin/withdrawals/${id}/reject`)
    return data
  },

  exportWithdrawals: async (
    status: "PENDING" | "APPROVED" | "REJECTED" = "PENDING"
  ) => {
    const { data } = await api.get(
      "/admin/withdrawals/export",
      { params: { status } }
    )
    return data
  },

    // ================= SERVICE REQUESTS =================

  getServiceRequests: async (
    page = 1,
    limit = 20,
    status?: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
  ) => {
    const params: any = { page, limit }

    if (status) {
      params.status = status
    }

    const { data } = await api.get(
      "/admin/service-requests",
      { params }
    )

    return data
  },

  completeService: async (id: number) => {
    const { data } = await api.patch(
      `/admin/service-requests/${id}/complete`
    )

    return data
  },

  // ================= TRANSACTIONS =================
  transactions: async () => {
    const { data } = await api.get("/admin/transactions")
    return data
  },

  // ================= BANKS =================
  banks: async () => {
    const { data } = await api.get("/admin/bank-admin")
    return data
  },

  createBank: async (payload: {
    name: string
    bank: string
    iban: string
  }) => {
    const { data } = await api.post("/admin/bank-admin", payload)
    return data
  },

  updateBank: async (
    id: number,
    payload: { name?: string; bank?: string; iban?: string }
  ) => {
    const { data } = await api.put(`/admin/bank-admin/${id}`, payload)
    return data
  },

  deleteBank: async (id: number) => {
    const { data } = await api.delete(`/admin/bank-admin/${id}`)
    return data
  }
}