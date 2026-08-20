import { api } from "./api"

export interface ServiceRequestUser {
  id: number
  phone: string
  name?: string | null
  email?: string | null
}

export interface ServiceRequestPartner {
  id: number
  name: string
}

export interface ServiceRequestProvider {
  id: number
  name: string
}

export interface ServiceRequestPlan {
  id: number
  name: string
  price: number
  code?: string | null

  partner?: ServiceRequestPartner | null
  provider?: ServiceRequestProvider | null
}

export interface ServiceRequest {
  /* ================= IDENTIFICAÇÃO ================= */

  id: number

  transactionId?: number | null

  serviceId?: number | null

  serviceGroupId?: number | null

  providerId?: number | null

  partnerId?: number | null

  planId?: number | null

  /* ================= FINANCEIRO ================= */

  amount: number

  cost?: number | null

  profit?: number | null

  /* ================= STATUS ================= */

  status: string

  /* ================= CLIENTE ================= */

  customerReference?: string | null

  customerName?: string | null

  user: ServiceRequestUser

  /* ================= SERVIÇO ================= */

  serviceName?: string | null

  serviceGroupName?: string | null

  planName?: string | null

  providerName?: string | null

  partnerName?: string | null

  /* ================= PLANO ================= */

  plan?: ServiceRequestPlan | null

  /* ================= REFERÊNCIAS EXTERNAS ================= */

  externalProviderRef?: string | null

  externalTransactionId?: string | null

  /* ================= PROVIDER ================= */

  providerResponse?: Record<string, unknown> | string | null

  providerFinalBalance?: number | null

  providerConfirmedAt?: string | null

  providerReconciledAt?: string | null

  providerOperationStatus?: string | null

  providerOperationCode?: number | null

  /* ================= DATAS ================= */

  completedAt?: string | null

  createdAt: string

  updatedAt?: string
}

export interface AdminServiceRequestsResponse {
  items?: ServiceRequest[]

  data?: ServiceRequest[]

  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export const adminServiceRequestsService = {

  /* =====================================================
     LISTAR SOLICITAÇÕES
     ===================================================== */

  getRequests: async (
    page = 1,
    limit = 20,
    status?: string
  ): Promise<
    ServiceRequest[] | AdminServiceRequestsResponse
  > => {

    const params: Record<string, string | number> = {
      page,
      limit
    }

    if (status) {
      params.status = status
    }

    const { data } =
      await api.get<
        ServiceRequest[] |
        AdminServiceRequestsResponse
      >(
        "/admin/service-requests",
        { params }
      )

    return data
  },

  /* =====================================================
     CONCLUIR SERVIÇO
     ===================================================== */

  completeService: async (
    id: number
  ) => {

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("INVALID_SERVICE_REQUEST_ID")
    }

    const { data } =
      await api.patch(
        `/admin/service-requests/${id}/complete`
      )

    return data
  }

}