import { api } from './api'

/* =========================
   TASKS LIST (READ)
========================= */
export async function getTasks() {
  const { data } = await api.get('/admin/tasks')
  return data.data
}

/* =========================
   CREATE TASK
========================= */
export async function createTask(payload: {
  title: string
  description: string
  reward: string
  url?: string
  minSeconds: string
}) {

  const body = {
    title: payload.title,
    description: payload.description,

    // ✅ ADICIONAR
    instructions: payload.description,

    // ✅ CONVERTER TIPOS
    reward: Number(payload.reward),
    minSeconds: Number(payload.minSeconds),

    url: payload.url || null
  }

  const { data } = await api.post('/admin/tasks/create', body)

  return data
}

/* =========================
   UPDATE TASK
========================= */
export async function updateTask(id: number, payload: any) {
  const { data } = await api.put(`/admin/tasks/${id}`, payload)
  return data
}

/* =========================
   DELETE TASK
========================= */
export async function deleteTask(id: number) {
  const { data } = await api.delete(`/admin/tasks/${id}`)
  return data
}

/* =========================
   TOGGLE ACTIVE (ON/OFF)
========================= */
export async function toggleTask(id: number) {
  const { data } = await api.patch(`/admin/tasks/${id}/toggle`)
  return data
}

/* =========================
   PENDING TASKS
========================= */
export async function getPendingTasks() {
  const { data } = await api.get('/admin/tasks/pending')
  return data.data
}

/* =========================
   REVIEW TASK
========================= */
export async function reviewTask(id: number, action: 'APPROVE' | 'REJECT') {
  const { data } = await api.post('/admin/tasks/review', {
    id,
    action
  })
  return data
}

/* =========================
   STATS
========================= */
export async function getAdminStats() {
  const { data } = await api.get('/admin/tasks/stats')
  return data.data
}