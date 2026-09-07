import { api } from "./api"

export interface ExchangeRate {
  id: number
  pair: string
  rate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExchangeRateResponse {
  success: boolean
  data: ExchangeRate
}

export interface ExchangeRatesResponse {
  success: boolean
  data: ExchangeRate[]
}

export class ExchangeRateService {
  /**
   * Lista todas as taxas ativas
   */
  static async list(): Promise<ExchangeRate[]> {
    const { data } = await api.get<ExchangeRatesResponse>(
      "/admin/exchange-rates"
    )

    return data.data
  }

  /**
   * Busca uma taxa específica
   */
  static async get(pair: string): Promise<ExchangeRate> {
    const { data } = await api.get<ExchangeRateResponse>(
      `/admin/exchange-rates/${pair}`
    )

    return data.data
  }

  /**
   * Atualiza a taxa
   */
  static async update(
    pair: string,
    rate: number | string
  ): Promise<ExchangeRate> {
    const { data } = await api.patch<ExchangeRateResponse>(
      `/admin/exchange-rates/${pair}`,
      {
        rate: String(rate)
      }
    )

    return data.data
  }

  /**
   * Desativa uma taxa
   */
  static async deactivate(pair: string): Promise<ExchangeRate> {
    const { data } = await api.patch<ExchangeRateResponse>(
      `/admin/exchange-rates/${pair}/deactivate`
    )

    return data.data
  }
}