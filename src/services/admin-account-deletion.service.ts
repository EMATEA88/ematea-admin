import { api } from "./api"

export type DeletionRole =
  | "ALL"
  | "CLIENT"
  | "AGENT"
  | "SUB_AGENT"

export interface DeletableUser {
  id: number
  publicId: string
  fullName: string | null
  phone: string
  email: string | null
  role: "CLIENT" | "AGENT" | "SUB_AGENT"
  balance: number
  frozenBalance: number
  isBlocked: boolean
  isVerified: boolean
  createdAt: string

  agentCode: string | null
  employeeCode: string | null
  companyName: string | null
  agentStatus: string | null
  position: string | null
  department: string | null
}

export interface DeletableUsersResponse {
  items: DeletableUser[]
  total: number
}

export interface DeletedUserDetails
  extends DeletableUser {
  agentProfile?: {
    id: number
    agentCode: string
    companyName: string | null
    currentBalance: number
    status: string
    isActive: boolean
  } | null

  subAgentProfile?: {
    id: number
    employeeCode: string
    position: string | null
    department: string | null
    isActive: boolean
    agentId: number | null
  } | null
}

export type DeletionType =
  | "LOGICAL"
  | "PERMANENT"

export interface DeleteAccountResponse {
  success: boolean
  type: DeletionType
  deletionId: number
  userId: number
  publicId: string
}

export class AdminAccountDeletionService {

  static async list(
    search?: string,
    role: DeletionRole = "ALL"
  ): Promise<DeletableUsersResponse> {

    const params: Record<string, string> = {
      role
    }

    if (search?.trim()) {
      params.search = search.trim()
    }

    const { data } =
      await api.get<DeletableUsersResponse>(
        "/admin/account-deletion",
        { params }
      )

    return data
  }


  static async getById(
    id: number
  ): Promise<DeletedUserDetails> {

    const { data } =
      await api.get<DeletedUserDetails>(
        `/admin/account-deletion/${id}`
      )

    return data
  }


  static async delete(
    id: number,
    deletionType: DeletionType,
    reason?: string
  ): Promise<DeleteAccountResponse> {

    const { data } =
      await api.delete<DeleteAccountResponse>(
        `/admin/account-deletion/${id}`,
        {
          data: {
            deletionType,
            reason:
              reason?.trim() || undefined
          }
        }
      )

    return data
  }
}

export default AdminAccountDeletionService