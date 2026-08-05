import { api } from "./api";

export const AdminCommissionService = {

  async getDashboard() {
    const { data } = await api.get(
      "/admin/commissions/dashboard"
    );

    return data.data;
  },

  async getSubAgentsReport() {
    const { data } = await api.get("/admin/commissions/sub-agents-report");
    return data.data;
  },

  /* =====================================================
     BUSCAR RELATÓRIO DE COMISSÕES DE AGENTES
  ===================================================== */
  async getAgentsReport() {
    const { data } = await api.get("/admin/commissions/agents-report");
    return data.data;
  },

 /* =====================================================
     BUSCAR RELATÓRIO DE COMISSÕES DE CLIENTES
  ===================================================== */
  async getClients() {
    const response = await api.get("/admin/commissions/clients");
    
    // Se a API retorna { success: true, data: [...] }, usamos response.data.data
    // Se a API retorna diretamente o array [...] nos dados do axios, usamos response.data
    const result = response.data;
    
    if (Array.isArray(result)) {
      return result;
    }
    
    return result.data || [];
  },

  /* =====================================================
     BUSCAR TOP CLIENTES
  ===================================================== */
  async getTopClients(limit: number = 5) {
    try {
      const response = await api.get(`/admin/commissions/top-clients?limit=${limit}`);
      const result = response.data;
      return Array.isArray(result) ? result : (result?.data || []);
    } catch (error) {
      console.error("Erro ao buscar top clientes:", error);
      return [];
    }
  },

  async getHistory() {
    const { data } = await api.get(
      "/admin/commissions/history"
    );

    return data.data;
  },

  async getTopAgents() {
    const { data } = await api.get(
      "/admin/commissions/top-agents"
    );

    return data.data;
  },

  async getTopSubAgents() {
    const { data } = await api.get(
      "/admin/commissions/top-subagents"
    );

    return data.data;
  },

  async getCharts() {
    const { data } = await api.get(
      "/admin/commissions/charts"
    );

    return data.data;
  }

};