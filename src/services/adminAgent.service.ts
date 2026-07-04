import { api } from "./api"

export interface Agent {

  id: number

  employeeCode: string

  status: string

  user: {

    id: number

    publicId: string

    fullName: string

    email: string

    phone: string

  }

}

class AdminAgentService {

  async getAll() {

    const { data } = await api.get(
      "/admin/agents"
    )

    return data as Agent[]

  }

  async getById(
    id: number
  ) {

    const { data } = await api.get(
      `/admin/agents/${id}`
    )

    return data

  }

}

export default new AdminAgentService()