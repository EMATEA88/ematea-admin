
import { api } from "./api";

export interface SupportSettings {
  whatsappNumber: string;
  whatsappGroupUrl: string;
  updatedAt: string;
}

export interface SupportSettingsResponse {
  success: boolean;
  settings: SupportSettings;
}

export interface UpdateSupportSettingsPayload {
  whatsappNumber: string;
  whatsappGroupUrl: string;
}

export const adminSupportSettingsService = {
  async getSettings(): Promise<SupportSettingsResponse> {
    const response = await api.get("/admin/support-settings");
    return response.data;
  },

  async updateSettings(
    data: UpdateSupportSettingsPayload
  ): Promise<{
    success: boolean;
    message: string;
    settings: SupportSettings;
  }> {
    const response = await api.put(
      "/admin/support-settings",
      data
    );

    return response.data;
  },
};
