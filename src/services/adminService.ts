import { api } from './api'

/* ========================= */
/* PENDING TASKS */
/* ========================= */
export async function getPendingTasks() {
  const { data } = await api.get('/admin/pending')
  return data.data
}

/* ========================= */
/* REVIEW TASK */
/* ========================= */
export async function reviewTask(
  id: number,
  action: 'APPROVE' | 'REJECT'
) {
  const { data } = await api.post('/admin/review', {
    id,
    action
  })

  return data
}

/* ========================= */
/* STATS */
/* ========================= */
export async function getAdminStats() {
  const { data } = await api.get('/admin/stats')
  return data.data
}