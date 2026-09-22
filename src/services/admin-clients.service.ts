import { api } from "./api"

export type ClientStatus =
  | "ALL"
  | "ACTIVE"
  | "BLOCKED"

export interface ClientListItem {
  id: number
  publicId: string
  fullName: string | null
  phone: string
  email: string | null
  balance: number
  isBlocked: boolean
  isVerified: boolean
  createdAt: string
}

export interface ClientBank {
  id: number
  name: string
  bank: string
  iban: string | null
  createdAt: string
}

export interface ClientDetails extends ClientListItem {
  address: string | null
  country: string | null
  province: string | null
  neighborhood: string | null
  bio: string | null

  role: string

  frozenBalance: number

  bank: ClientBank | null

  verification: any | null

  recharges: any[]
  withdrawals: any[]
  transactions: any[]
}

export interface ClientListResponse {
  items: ClientListItem[]
  total: number
}

export interface UpdateClientData {
  fullName?: string
  phone?: string
  email?: string
  address?: string
  country?: string
  province?: string
  neighborhood?: string
  bio?: string
}

export type BalanceAction =
  | "ADD"
  | "SUBTRACT"

export interface AdjustBalanceResponse {
  success: boolean
  balance: number
}

export interface ResetResponse {
  success: boolean
}

export class AdminClientsService {

  // =========================================================
  // LIST CLIENTS
  // =========================================================

  static async list(
    search?: string,
    status: ClientStatus = "ALL"
  ): Promise<ClientListResponse> {

    const params: Record<string, string> = {
      status,
    }

    if (search?.trim()) {
      params.search = search.trim()
    }

    const { data } = await api.get<ClientListResponse>(
      "/admin/clients",
      {
        params,
      }
    )

    return data
  }

  // =========================================================
  // CLIENT DETAILS
  // =========================================================

  static async getById(
    id: number
  ): Promise<ClientDetails> {

    const { data } =
      await api.get<ClientDetails>(
        `/admin/clients/${id}`
      )

    return data
  }

  // =========================================================
  // UPDATE PERSONAL DATA
  // =========================================================

  static async updatePersonalData(
    id: number,
    data: UpdateClientData
  ): Promise<ClientListItem> {

    const response =
      await api.patch<ClientListItem>(
        `/admin/clients/${id}/profile`,
        data
      )

    return response.data
  }

  // =========================================================
  // BLOCK
  // =========================================================

  static async block(
    id: number
  ): Promise<ClientListItem> {

    const { data } =
      await api.patch<ClientListItem>(
        `/admin/clients/${id}/block`
      )

    return data
  }

  // =========================================================
  // UNBLOCK
  // =========================================================

  static async unblock(
    id: number
  ): Promise<ClientListItem> {

    const { data } =
      await api.patch<ClientListItem>(
        `/admin/clients/${id}/unblock`
      )

    return data
  }

  // =========================================================
  // ADJUST BALANCE
  // =========================================================

  static async adjustBalance(
    id: number,
    amount: number,
    action: BalanceAction
  ): Promise<AdjustBalanceResponse> {

    const { data } =
      await api.patch<AdjustBalanceResponse>(
        `/admin/clients/${id}/balance`,
        {
          amount,
          action,
        }
      )

    return data
  }

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  static async updateRole(
    id: number,
    role: string
  ): Promise<ClientListItem> {

    const { data } =
      await api.patch<ClientListItem>(
        `/admin/clients/${id}/role`,
        {
          role,
        }
      )

    return data
  }

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  static async resetPassword(
    id: number,
    newPassword: string
  ): Promise<ResetResponse> {

    const { data } =
      await api.patch<ResetResponse>(
        `/admin/clients/${id}/reset-password`,
        {
          newPassword,
        }
      )

    return data
  }

  // =========================================================
  // RESET PIN
  // =========================================================

  static async resetPin(
    id: number,
    newPin: string
  ): Promise<ResetResponse> {

    const { data } =
      await api.patch<ResetResponse>(
        `/admin/clients/${id}/reset-pin`,
        {
          newPin,
        }
      )

    return data
  }
}

export default AdminClientsService