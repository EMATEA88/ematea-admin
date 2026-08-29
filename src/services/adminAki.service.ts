import { api } from "./api";

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
   * =========================================================
   * AUDITORIA AKI
   * =========================================================
   */

  /**
   * Resumo da auditoria
   *
   * Retorna:
   * {
   *   total,
   *   consistent,
   *   inconsistent
   * }
   */
  async getAuditSummary() {
    const response = await api.get("/admin/aki/audit/summary");
    return response.data;
  },

  /**
   * Compras atualmente pendentes
   *
   * Importante:
   * Este endpoint consulta somente PENDING / IN_PROGRESS.
   */
  async getAuditPending() {
    const response = await api.get("/admin/aki/audit/pending");
    return response.data;
  },

  /**
   * Compras com inconsistências
   */
  async getAuditInconsistencies() {
    const response = await api.get(
      "/admin/aki/audit/inconsistencies"
    );

    return response.data;
  },

  /**
   * Relatório de Compras
   */
  async getPurchaseReport(data?: {
    DateStart?: string;
    DateEnd?: string | null;
    Page?: number | null;
    PageItems?: number | null;
  }) {
    const response = await api.post(
      "/admin/aki/reports/purchases",
      data
    );

    return response.data;
  },

  /**
   * Relatório de Depósitos
   */
  async getDepositReport(data?: {
    DateStart?: string;
    DateEnd?: string | null;
    Page?: number | null;
    PageItems?: number | null;
  }) {
    const response = await api.post(
      "/admin/aki/reports/deposits",
      data
    );

    return response.data;
  },

  /**
   * Relatório de Transferências
   */
  async getTransferReport(data?: {
    DateStart?: string;
    DateEnd?: string | null;
    Page?: number | null;
    PageItems?: number | null;
  }) {
    const response = await api.post(
      "/admin/aki/reports/transfers",
      data
    );

    return response.data;
  },

  /**
   * Relatório de Pagamentos
   */
  async getPaymentReport(data?: {
    DateStart?: string;
    DateEnd?: string | null;
    Page?: number | null;
    PageItems?: number | null;
  }) {
    const response = await api.post(
      "/admin/aki/reports/payments",
      data
    );

    return response.data;
  }

};