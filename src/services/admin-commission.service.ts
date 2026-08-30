import { api } from "./api";

export const AdminCommissionService = {

  /* =====================================================
     DASHBOARD
  ===================================================== */

  async getDashboard() {
    const { data } = await api.get(
      "/admin/commissions/dashboard"
    );

    return data.data;
  },

  /* =====================================================
     CALENDÁRIO — RESUMO MENSAL
  ===================================================== */

  async getCalendar(
    year: number,
    month: number,
    subAgentId?: number
  ) {
    const params: Record<string, number> = {
      year,
      month,
    };

    if (subAgentId !== undefined) {
      params.subAgentId = subAgentId;
    }

    const { data } = await api.get(
      "/admin/commissions/calendar",
      {
        params,
      }
    );

    return data.data;
  },

  /* =====================================================
     CALENDÁRIO — VENDAS DO DIA
  ===================================================== */

  async getSubAgentDailySales(
    subAgentId: number,
    date: string
  ) {
    const { data } = await api.get(
      "/admin/commissions/calendar/daily",
      {
        params: {
          subAgentId,
          date,
        },
      }
    );

    return data.data;
  },

  /* =====================================================
     RELATÓRIO DE SUB-AGENTES
  ===================================================== */

  async getSubAgentsReport() {
    const { data } = await api.get(
      "/admin/commissions/sub-agents-report"
    );

    return data.data;
  },

  /* =====================================================
     RELATÓRIO DE AGENTES
  ===================================================== */

  async getAgentsReport() {
    const { data } = await api.get(
      "/admin/commissions/agents-report"
    );

    return data.data;
  },

  /* =====================================================
     RELATÓRIO DE CLIENTES
  ===================================================== */

  async getClients() {
    const response = await api.get(
      "/admin/commissions/clients"
    );

    const result = response.data;

    if (Array.isArray(result)) {
      return result;
    }

    return result?.data || [];
  },

  /* =====================================================
     TOP CLIENTES
  ===================================================== */

  async getTopClients(limit: number = 5) {
    try {
      const response = await api.get(
        `/admin/commissions/top-clients?limit=${limit}`
      );

      const result = response.data;

      return Array.isArray(result)
        ? result
        : result?.data || [];

    } catch (error) {
      console.error(
        "Erro ao buscar top clientes:",
        error
      );

      return [];
    }
  },

  /* =====================================================
     HISTÓRICO
  ===================================================== */

  async getHistory() {
    const { data } = await api.get(
      "/admin/commissions/history"
    );

    return data.data;
  },

  /* =====================================================
     TOP AGENTES
  ===================================================== */

  async getTopAgents() {
    const { data } = await api.get(
      "/admin/commissions/top-agents"
    );

    return data.data;
  },

  /* =====================================================
     TOP SUB-AGENTES
  ===================================================== */

  async getTopSubAgents() {
    const { data } = await api.get(
      "/admin/commissions/top-subagents"
    );

    return data.data;
  },

  /* =====================================================
     GRÁFICOS
  ===================================================== */

  async getCharts() {
    const { data } = await api.get(
      "/admin/commissions/charts"
    );

    return data.data;
  },

};