import { api } from "./api"

export const AdminCommissionService = {
  getCommissions: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get("/admin/commissions/history", { params })
    return data
  },
  
  getDashboard: async () => {
    const { data } = await api.get("/admin/commissions/dashboard")
    return data
  },

  getTopAgents: async () => {
    const { data } = await api.get("/admin/commissions/top-agents")
    return data
  },

  getTopSubAgents: async () => {
    const { data } = await api.get("/admin/commissions/top-subagents")
    return data
  },

  getHistory: async () => {
    const { data } = await api.get("/admin/commissions/history")
    return data
  },

  getCharts: async () => {
    const { data } = await api.get("/admin/commissions/charts")
    return data
  }
}