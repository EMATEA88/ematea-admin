import { api } from "./api"

export interface ServiceRequest {
  id: number
  amount: number
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
  createdAt: string
  user: {
    id: number
    phone: string
  }
  plan: {
    id: number
    name: string
    price: number
    partner: {
      id: number
      name: string
    }
  }
}

export const adminServiceRequestsService = {
  getRequests: async (
    page = 1,
    limit = 20,
    status?: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
  ) => {
    const params: any = { page, limit }
    if (status) {
      params.status = status
    }

    const { data } = await api.get("/admin/service-requests", { params })
    return data
  },

  completeService: async (id: number) => {
    const { data } = await api.patch(`/admin/service-requests/${id}/complete`)
    return data
  },
}