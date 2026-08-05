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

export interface WalletOverview {
  companyWallet: {
    address: string
    bnb: string
    usdt: string
  }
  totalBalance: number
  totalRecharges: number
  totalWithdrawals: number
  revenue: number
  costs: number
  profit: number
}

export interface ClientCommissionItem {
  id: string | number
  name: string
  phone: string
  totalPurchases: number
  totalSpent: string
  commissionEarned: string
  status: "ATIVO" | "INATIVO" | "VIP"
}

export const adminDashboardService = {
  // Mantém o dashboard geral intacto
  getOverview: async (): Promise<DashboardSummary> => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // Método exclusivo para puxar os dados da Wallet Ematea
  getWalletOverview: async (): Promise<WalletOverview> => {
    const { data } = await api.get("/admin/wallet")
    return data
  },

  // ✨ Novo método adicionado para buscar as comissões e atividade de clientes
  getClientCommissions: async (): Promise<ClientCommissionItem[]> => {
    const { data } = await api.get("/admin/commissions/clients")
    // Dependendo de como a sua API encapsula a resposta (ex: data.data ou direto data), ajustamos aqui:
    return data.data || data
  },
}