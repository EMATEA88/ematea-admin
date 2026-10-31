
import { api } from "./api";

// ================= UTILIZADORES =================

export interface ServiceRequestUser {
  id: number;
  phone: string;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string;
  createdAt?: string;
}

// ================= PARCEIROS =================

export interface ServiceRequestPartner {
  id: number;
  name: string;
  type?: string;
}

// ================= PROVIDERS =================

export interface ServiceRequestProvider {
  id: number;
  name: string;
  code?: string | null;
}

// ================= PLANO =================

export interface ServiceRequestPlan {
  id: number;
  name: string;
  price: number;
  cost?: number;
  providerCommission?: number;
  commissionPercent?: number | null;
  taxPercent?: number | null;
  valueVariable?: boolean;
  valueVariableMin?: number | null;
  valueVariableMax?: number | null;

  partner?: ServiceRequestPartner | null;

  serviceGroup?: {
    id: number;
    name: string;
    provider?: ServiceRequestProvider | null;
  } | null;
}

// ================= GRUPO DE SERVIÇO =================

export interface ServiceRequestGroup {
  id: number;
  name: string;
  provider?: ServiceRequestProvider | null;
}

// ================= TRANSAÇÃO =================

export interface ServiceRequestTransaction {
  id: number;
  type: string;
  amount: number;
  status?: string | null;
  externalId?: string | null;
  reference?: string | null;
  gatewayProvider?: string | null;
  gatewayStatus?: string | null;
  providerOrderSn?: string | null;
  createdAt: string;
}

// ================= COBRANÇA =================

export interface ServiceRequestCharge {
  id: number;
  provider: string;
  merchantTransactionId: string;
  externalChargeId?: string | null;
  externalReference?: string | null;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

// ================= SOLICITAÇÃO =================

export interface ServiceRequest {
  // Identificação
  id: number;
  userId?: number;
  sellerId?: number | null;
  sellerRole?: string | null;

  transactionId?: number | null;
  chargeId?: number | null;

  serviceId?: number | null;
  serviceGroupId?: number | null;
  providerId?: number | null;
  partnerId?: number | null;
  planId?: number | null;

  // Financeiro
  amount: number;
  cost?: number | null;
  profit?: number | null;
  providerFinalBalance?: number | null;

  // Estado
  status: string;
  completedAt?: string | null;

  // Cliente
  customerReference?: string | null;
  customerName?: string | null;
  user: ServiceRequestUser;

  // Serviço
  serviceName?: string | null;
  serviceGroupName?: string | null;
  planName?: string | null;
  providerName?: string | null;
  partnerName?: string | null;

  // Relações
  plan?: ServiceRequestPlan | null;
  partner?: ServiceRequestPartner | null;
  serviceGroup?: ServiceRequestGroup | null;
  transaction?: ServiceRequestTransaction | null;
  charge?: ServiceRequestCharge | null;

  // Referências externas
  externalProviderRef?: string | null;
  externalTransactionId?: string | null;

  // Monitorização do provider
  monitorAttempts?: number;
  lastMonitorCheck?: string | null;
  lastProviderStatus?: string | null;
  lastProviderCode?: number | null;
  lastProviderMessage?: string | null;

  providerResponse?: unknown;
  providerConfirmedAt?: string | null;
  providerReconciledAt?: string | null;
  providerOperationStatus?: string | null;
  providerOperationCode?: number | null;

  // Datas
  createdAt: string;
  updatedAt?: string;
}

// ================= PAGINAÇÃO =================

export interface ServiceRequestsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ================= ESTATÍSTICAS =================

export interface ServiceRequestsStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  rejected: number;
  providerTimeout: number;
}

// ================= RESPOSTA DA LISTAGEM =================

export interface AdminServiceRequestsResponse {
  items: ServiceRequest[];

  pagination: ServiceRequestsPagination;

  stats: ServiceRequestsStats;
}

// ================= RESPOSTA DOS DETALHES =================

interface ServiceRequestDetailsResponse {
  success: boolean;
  data: ServiceRequest;
}

// ================= SERVIÇO ADMIN =================

export const adminServiceRequestsService = {
  // ================= LISTAR SOLICITAÇÕES =================

  getRequests: async (
    page = 1,
    limit = 20,
    status?: string,
    search?: string
  ): Promise<AdminServiceRequestsResponse> => {
    const params: Record<string, string | number> = {
      page,
      limit,
    };

    if (status) {
      params.status = status;
    }

    if (search?.trim()) {
      params.search = search.trim();
    }

    const { data } = await api.get<AdminServiceRequestsResponse>(
      "/admin/service-requests",
      { params }
    );

    return data;
  },

  // ================= CONSULTAR DETALHES =================

  getRequestById: async (id: number): Promise<ServiceRequest> => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("INVALID_SERVICE_REQUEST_ID");
    }

    const { data } =
      await api.get<ServiceRequestDetailsResponse>(
        `/admin/service-requests/${id}`
      );

    if (!data.success || !data.data) {
      throw new Error("SERVICE_REQUEST_NOT_FOUND");
    }

    return data.data;
  },

  // ================= CONCLUIR SERVIÇO =================

  completeService: async (id: number): Promise<ServiceRequest> => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("INVALID_SERVICE_REQUEST_ID");
    }

    const { data } = await api.patch<{ 
      success: boolean;
      data: ServiceRequest;
    }>(
      `/admin/service-requests/${id}/complete`
    );

    return data.data;
  },
};
