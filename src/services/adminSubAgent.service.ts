import { api } from "./api"

export interface CreateSubAgentDTO {

  fullName: string

  phone: string

  email: string

  pin: string

  address?: string

  workstation?: string

  position?: string

  department?: string

}

export interface UpdateSubAgentDTO {

  fullName?: string

  phone?: string

  email?: string

  address?: string

  workstation?: string

  position?: string

  department?: string

  supervisorId?: number | null

}

export interface SubAgent {

  id: number

  employeeCode: string

  workstation?: string

  position?: string

  department?: string

  address?: string

  hiredAt?: string

  isActive: boolean

  createdAt: string

  user: {

    id: number

    publicId: string

    fullName: string

    phone: string

    email: string

    isBlocked: boolean

    createdAt: string

  }

  supervisor?: {

    id: number

    fullName: string

  }

}

class AdminSubAgentService {

  async getAll() {

    const { data } =
      await api.get(
        "/admin/subagents"
      )

    return data

  }

  async getById(
    id: number
  ) {

    const { data } =
      await api.get(
        `/admin/subagents/${id}`
      )

    return data

  }

  async create(
    payload: CreateSubAgentDTO
  ) {

    const { data } =
      await api.post(
        "/admin/subagents",
        payload
      )

    return data

  }

  async update(
    id: number,
    payload: UpdateSubAgentDTO
  ) {

    const { data } =
      await api.put(
        `/admin/subagents/${id}`,
        payload
      )

    return data

  }

  async activate(
    id: number
  ) {

    const { data } =
      await api.patch(
        `/admin/subagents/${id}/activate`
      )

    return data

  }

  async deactivate(
    id: number
  ) {

    const { data } =
      await api.patch(
        `/admin/subagents/${id}/deactivate`
      )

    return data

  }

  async resetPin(
    id: number,
    pin: string
  ) {

    const { data } =
      await api.patch(
        `/admin/subagents/${id}/reset-pin`,
        {
          pin
        }
      )

    return data

  }

}

export default new AdminSubAgentService()