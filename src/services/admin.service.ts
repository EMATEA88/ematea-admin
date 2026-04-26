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

  // ================= OTC FINANCE (🔥 NOVO PADRÃO) =================
  financialSummary: async () => {
    const { data } = await api.get("/admin/otc/financial-summary")
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

  // ================= OTC =================
  otcOrders: async (params?: any) => {
    const { data } = await api.get("/admin/otc/orders", { params })
    return data
  },

  otcOrderDetail: async (id: number) => {
    const { data } = await api.get(`/admin/otc/orders/${id}`)
    return data
  },

  otcStats: async () => {
    const { data } = await api.get("/admin/otc/stats")
    return data
  },

  cancelOtcOrder: async (id: number) => {
    const { data } = await api.patch(`/admin/otc/orders/${id}/cancel`)
    return data
  },

  releaseOtcOrder: async (id: number) => {
    const { data } = await api.patch(`/admin/otc/orders/${id}/release`)
    return data
  },

  markSellAsPaid: async (id: number) => {
  const { data } = await api.patch(`/admin/otc/orders/${id}/sell-paid`)
  return data
},

  otcAssets: async () => {
    const { data } = await api.get("/admin/otc/assets")
    return data
  },

  updateOtcAsset: async (
    id: number,
    buyPrice: number,
    sellPrice: number
  ) => {
    const { data } = await api.patch(
      `/admin/otc/assets/${id}`,
      { buyPrice, sellPrice }
    )
    return data
  },

  otcPriceHistory: async (page = 1, limit = 20) => {
    const { data } = await api.get(
      "/admin/otc/price-history",
      { params: { page, limit } }
    )
    return data
  },

  otcAudit: async (page = 1, limit = 20) => {
    const { data } = await api.get(
      "/admin/otc/audit",
      { params: { page, limit } }
    )
    return data
  },

  // 🔥 ALIAS (mantido para compatibilidade)
  getOtcFinancialSummary: async () => {
    const { data } = await api.get("/admin/otc/financial-summary")
    return data
  },

  // ================= SERVICE REFUNDS =================
  getServiceRefunds: async (params?: { status?: string }) => {
    const { data } = await api.get("/admin/service-refunds", { params })
    return data
  },

  getServiceRefundStats: async () => {
    const { data } = await api.get("/admin/service-refunds/stats")
    return data
  },

  refundService: async (id: number) => {
    const { data } = await api.patch(`/admin/service-refunds/${id}/refund`)
    return data
  },

  // ================= SERVICE REQUESTS =================
  getServiceRequests: async () => {
    const { data } = await api.get("/admin/services")
    return data
  },

  completeService: async (id: number) => {
    const { data } = await api.patch(`/admin/services/${id}/complete`)
    return data
  },

  // ================= SETTLEMENTS =================
  getSettlements: async (params?: any) => {
    const { data } = await api.get("/admin/settlements", { params })
    return data
  },

  getSettlementStats: async () => {
    const { data } = await api.get("/admin/settlements/stats")
    return data
  },

  paySettlement: async (id: number) => {
    const { data } = await api.patch(`/admin/settlements/${id}/pay`)
    return data
  },

  // ================= SUPPORT =================
  supportList: async () => {
    const { data } = await api.get("/admin/support")
    return data
  },

  supportAdminSend: async (payload: {
    conversationId: number
    message: string
  }) => {
    const { data } = await api.post("/admin/support/send", payload)
    return data
  },

  // ================= TRANSACTIONS =================
  transactions: async () => {
    const { data } = await api.get("/admin/transactions")
    return data
  },

  // ================= OTC CHAT =================
  sendOtcMessage: async (
    orderId: number,
    content: string,
    type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO" = "TEXT"
  ) => {
    const { data } = await api.post(
      `/admin/otc/chat/${orderId}`,
      { content, type }
    )
    return data
  },

  uploadOtcImage: async (orderId: number, file: File) => {
    const form = new FormData()
    form.append("image", file)

    const { data } = await api.post(
      `/admin/otc/chat/${orderId}/image`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    )

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