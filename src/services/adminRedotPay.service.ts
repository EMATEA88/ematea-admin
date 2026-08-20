import { api } from "./api"

export interface RedotPayDashboard {

  api: {
    status: string
    environment: string
    keyVersion: number
    webhookStatus: string
  }

  merchant: {
    merchantId: number | string | null
  }

  balance: {
    currency: string
    total: number
    available: number
    frozen: number
    usdt: number
    usd: number
  }

  today: {
    deposits: number
    successful: number
    pending: number
    failed: number
    gross: number
    fees: number
    net: number
  }

  totals: {
    deposits: number
    successful: number
    failed: number
    volume: number
    netVolume: number
  }

}

export interface RedotPayAccountInfo {

  merchantId: number | string | null

  currency: string

  totalBalance: number

  availableBalance: number

  frozenBalance: number

}

export interface RedotPayTransactionResponse {

  transactions: any[]

  pagination: {
    page: number
    limit: number
    total: number
  }

}

export interface RedotPayRefundResponse {

  refunds: any[]

  pagination: {
    page: number
    limit: number
    total: number
  }

}

export interface RedotPayAuditResponse {

  logs: any[]

  pagination: {
    page: number
    limit: number
    total: number
  }

}

export interface RedotPayBusinessReport {

  currency: string

  grossVolume: string

  fees: string

  netVolume: string

  totalPayments: number

  averageTicket: string

  usdtReceived: string

  usdtNet: string

  redotPayFees: string

  aoaCredited: string

}

export const adminRedotPayService = {

  /* =====================================================
     DASHBOARD
  ===================================================== */

  getDashboard: async () => {

    return api.get<{
      success: boolean
      data: RedotPayDashboard
    }>(
      "/admin/redotpay/dashboard"
    )

  },


  /* =====================================================
     ACCOUNT
  ===================================================== */

  getAccountInfo: async () => {

    return api.get<{
      success: boolean
      data: RedotPayAccountInfo
    }>(
      "/admin/redotpay/account/info"
    )

  },


  /* =====================================================
     TRANSACTIONS
  ===================================================== */

  getTransactions: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayTransactionResponse
    }>(
      "/admin/redotpay/transactions",
      {
        params
      }
    )

  },


  /* =====================================================
     PAYMENTS
  ===================================================== */

  getPayments: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayTransactionResponse
    }>(
      "/admin/redotpay/payments",
      {
        params
      }
    )

  },


  /* =====================================================
     REFUNDS
  ===================================================== */

  getRefunds: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayRefundResponse
    }>(
      "/admin/redotpay/refunds",
      {
        params
      }
    )

  },


  /* =====================================================
     WEBHOOKS / ASSET LOG
  ===================================================== */

  getWebhooks: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayAuditResponse
    }>(
      "/admin/redotpay/webhooks",
      {
        params
      }
    )

  },


  /* =====================================================
     BUSINESS REPORT
  ===================================================== */

  getBusinessReport: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayBusinessReport
    }>(
      "/admin/redotpay/reports/business",
      {
        params
      }
    )

  },


  /* =====================================================
     AUDIT
  ===================================================== */

  getAudit: async (
    params?: Record<string, any>
  ) => {

    return api.get<{
      success: boolean
      data: RedotPayAuditResponse
    }>(
      "/admin/redotpay/audit",
      {
        params
      }
    )

  }

}