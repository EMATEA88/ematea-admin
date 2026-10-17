
import { api } from "./api";

export interface AkiReportParams {
  DateStart?: string;
  DateEnd?: string | null;
  Page?: number | null;
  PageItems?: number | null;
}

/** Parâmetros dos históricos AKI */
export interface AkiHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}

export const adminAkiService = {
  /**
   * Informações da conta AKI
   */
  async getAccountInfo() {
    const response = await api.get("/admin/aki/account/info");
    return response.data;
  },

  /**
   * Dashboard completo
   */
  async getDashboard() {
    const response = await api.get("/admin/aki/dashboard");
    return response.data;
  },

  /**
   * Sincronização do catálogo de produtos AKI
   */
  async syncProducts() {
    const response = await api.post("/admin/aki/sync");
    return response.data;
  },

  /**
   * Histórico de transações financeiras EMATEA
   */
  async getTransactionHistory(params?: AkiHistoryParams) {
    const response = await api.get(
      "/admin/aki/history/transactions",
      { params }
    );
    return response.data;
  },

  /**
   * Histórico de solicitações de serviço
   */
  async getServiceRequestHistory(params?: AkiHistoryParams) {
    const response = await api.get(
      "/admin/aki/history/requests",
      { params }
    );
    return response.data;
  },

  /**
   * AUDITORIA AKI
   */
  async getAuditSummary() {
    const response = await api.get("/admin/aki/audit/summary");
    return response.data;
  },

  async getAuditPending() {
    const response = await api.get("/admin/aki/audit/pending");
    return response.data;
  },

  async getAuditInconsistencies() {
    const response = await api.get(
      "/admin/aki/audit/inconsistencies"
    );
    return response.data;
  },

  /**
   * Relatórios
   */
  async getPurchaseReport(data?: AkiReportParams) {
    const response = await api.post(
      "/admin/aki/reports/purchases",
      data ?? {}
    );
    return response.data;
  },

  async getDepositReport(data?: AkiReportParams) {
    const response = await api.post(
      "/admin/aki/reports/deposits",
      data ?? {}
    );
    return response.data;
  },

  async getTransferReport(data?: AkiReportParams) {
    const response = await api.post(
      "/admin/aki/reports/transfers",
      data ?? {}
    );
    return response.data;
  },

  async getPaymentReport(data?: AkiReportParams) {
    const response = await api.post(
      "/admin/aki/reports/payments",
      data ?? {}
    );
    return response.data;
  },
};
