import { api } from "./api";

export interface AkiReportParams {
  DateStart?: string;
  DateEnd?: string | null;
  Page?: number | null;
  PageItems?: number | null;
}

export interface AkiHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}

export interface AkiPurchaseOrderQueryParams {
  Order_ID: string;
  Transaction_ID?: string;
}

export interface AkiProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "";
  serviceGroupId?: number;
}

export interface CreateAkiProductData {
  name: string;
  externalId: string;
  serviceGroupId: number;
  price: number;
  providerCommission: number;
}

export const adminAkiService = {
  async getAccountInfo() {
    const response = await api.get("/admin/aki/account/info");
    return response.data;
  },

  async getDashboard() {
    const response = await api.get("/admin/aki/dashboard");
    return response.data;
  },

  async syncProducts() {
    const response = await api.post("/admin/aki/sync");
    return response.data;
  },

  async getTransactionHistory(params?: AkiHistoryParams) {
    const response = await api.get("/admin/aki/history/transactions", { params });
    return response.data;
  },

  async getServiceRequestHistory(params?: AkiHistoryParams) {
    const response = await api.get("/admin/aki/history/requests", { params });
    return response.data;
  },

  async getAuditSummary() {
    const response = await api.get("/admin/aki/audit/summary");
    return response.data;
  },

  async getAuditPending() {
    const response = await api.get("/admin/aki/audit/pending");
    return response.data;
  },

  async getAuditInconsistencies() {
    const response = await api.get("/admin/aki/audit/inconsistencies");
    return response.data;
  },

  async getPurchaseReport(data?: AkiReportParams) {
    const response = await api.post("/admin/aki/reports/purchases", data ?? {});
    return response.data;
  },

  async getDepositReport(data?: AkiReportParams) {
    const response = await api.post("/admin/aki/reports/deposits", data ?? {});
    return response.data;
  },

  async getTransferReport(data?: AkiReportParams) {
    const response = await api.post("/admin/aki/reports/transfers", data ?? {});
    return response.data;
  },

  async getPaymentReport(data?: AkiReportParams) {
    const response = await api.post("/admin/aki/reports/payments", data ?? {});
    return response.data;
  },

  async queryPurchaseOrder(data: AkiPurchaseOrderQueryParams) {
    const response = await api.post("/admin/aki/order-query", data);
    return response.data;
  },

  async runAudit() {
    const response = await api.post("/admin/aki/audit/run");
    return response.data;
  },

  async getProducts(params?: AkiProductsParams) {
    const response = await api.get("/admin/aki/products", { params });
    return response.data;
  },

  async updateProductStatus(id: number, active: boolean) {
    const response = await api.patch(`/admin/aki/products/${id}/status`, { active });
    return response.data;
  },

  async updateProductGroup(id: number, serviceGroupId: number) {
    const response = await api.patch(`/admin/aki/products/${id}/group`, {
      serviceGroupId,
    });
    return response.data;
  },

  async getProductOptions() {
    const response = await api.get("/admin/aki/products/options");
    return response.data;
  },

  async createProduct(data: CreateAkiProductData) {
    const response = await api.post("/admin/aki/products", data);
    return response.data;
  },
};
