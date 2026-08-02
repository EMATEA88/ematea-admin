import { api } from './api'; // Importa a tua instância configurada do Axios

export const adminAkiService = {
  /**
   * Consulta isolada das informações da conta (mantido para compatibilidade)
   */
  async getAccountInfo() {
    const response = await api.get('/admin/aki/account/info');
    return response.data;
  },

  /**
   * Consulta todos os dados consolidados para o Dashboard AKI do Admin
   * Endpoint: GET /admin/aki/dashboard
   */
  async getDashboard() {
    const response = await api.get('/admin/aki/dashboard');
    return response.data;
  }
};