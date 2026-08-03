import { api } from "../services/api";

export const AdminPartnerService = {

  async list() {
    const { data } = await api.get(
      "/admin/partners"
    );

    return data.data;
  },

  async get(id: number) {
    const { data } = await api.get(
      `/admin/partners/${id}`
    );

    return data.data;
  },

  async getDashboard(id: number) {
    const { data } = await api.get(
      `/admin/partners/${id}/dashboard`
    );

    return data.data;
  },

  async getHealth(id: number) {
    const { data } = await api.get(
      `/admin/partners/${id}/health`
    );

    return data.data;
  },

  async getCharts(id: number) {
    const { data } = await api.get(
      `/admin/partners/${id}/charts`
    );

    return data.data;
  },

  async getLatestRequests(id: number) {
    const { data } = await api.get(
      `/admin/partners/${id}/latest-requests`
    );

    return data.data;
  },

  async activate(id: number) {
    const { data } = await api.patch(
      `/admin/partners/${id}/activate`
    );

    return data.data;
  },

  async deactivate(id: number) {
    const { data } = await api.patch(
      `/admin/partners/${id}/deactivate`
    );

    return data.data;
  }

};