import { api } from "./api";

export interface SalesSettings {
  dailySalesLimit: string;
  updatedAt: string;
}

class SalesSettingsService {
  async getDailySalesLimit(): Promise<SalesSettings> {
    const { data } = await api.get(
      "/admin/sales-settings/daily-sales-limit"
    );

    return data;
  }

  async updateDailySalesLimit(
    dailySalesLimit: number
  ): Promise<SalesSettings> {
    const { data } = await api.patch(
      "/admin/sales-settings/daily-sales-limit",
      { dailySalesLimit }
    );

    return data;
  }
}

export default new SalesSettingsService();
