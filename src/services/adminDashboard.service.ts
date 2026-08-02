import { api } from "./api"

export interface DashboardSummary {
  totalUsers: number
  totalBalance: number
  totalRecharges: number
  totalWithdrawals: number
  totalInvested: number
  totalFrozenBalance: number
  pendingWithdrawals: number
  netFlow: number
  companyWallet: {
    address: string
    bnb: string
    usdt: string
  }
}

export const adminDashboardService = {
  getOverview: async (): Promise<DashboardSummary> => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },
}