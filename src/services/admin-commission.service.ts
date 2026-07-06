import { api } from "./api"

export class AdminCommissionService {

  static async getDashboard() {

    const { data } = await api.get(
      "/admin/commissions/dashboard"
    )

    return data

  }

  static async getHistory() {

    const { data } = await api.get(
      "/admin/commissions/history"
    )

    return data

  }

  static async getTopAgents() {

    const { data } = await api.get(
      "/admin/commissions/top-agents"
    )

    return data

  }

  static async getTopSubAgents() {

    const { data } = await api.get(
      "/admin/commissions/top-subagents"
    )

    return data

  }

  static async getCharts() {

    const { data } = await api.get(
      "/admin/commissions/charts"
    )

    return data

  }

}