import { api } from "../services/api"

export const AdminNotificationsService = {

  /* ============================
     LIST
  ============================ */
  async list(page = 1, limit = 20) {
    const { data } = await api.get("/admin/notifications", {
      params: { page, limit }
    })
    return data
  },

  /* ============================
     UNREAD COUNT
  ============================ */
  async unreadCount() {
    const { data } = await api.get(
      "/admin/notifications/unread-count"
    )
    return data
  },

  /* ============================
     CREATE (user específico)
  ============================ */
  async create(
    title: string,
    message: string,
    type: string,
    userId?: number
  ) {
    const { data } = await api.post("/admin/notifications", {
      title,
      message,
      type,
      userId
    })
    return data
  },

  /* ============================
     BROADCAST
  ============================ */
  async broadcast(
    title: string,
    message: string,
    type: string
  ) {
    const { data } = await api.post(
      "/admin/notifications/broadcast",
      { title, message, type }
    )
    return data
  },

  /* ============================
     MARK ONE AS READ
  ============================ */
  async markAsRead(id: number) {
    const { data } = await api.patch(
      `/admin/notifications/${id}/read`
    )
    return data
  },

  /* ============================
     MARK ALL AS READ
  ============================ */
  async markAllAsRead() {
    const { data } = await api.patch(
      "/admin/notifications/read-all"
    )
    return data
  },

  /* ============================
     DELETE
  ============================ */
  async delete(id: number) {
    const { data } = await api.delete(
      `/admin/notifications/${id}`
    )
    return data
  }
}