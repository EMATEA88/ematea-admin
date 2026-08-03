import { api } from "./api";

export const AdminCommissionService = {

  async getDashboard() {
    const { data } = await api.get(
      "/admin/commissions/dashboard"
    );

    return data.data;
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