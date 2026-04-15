import { useEffect, useState } from 'react'
import * as adminService from '../services/adminService'

interface PendingTask {
  id: number
  proof: string
  proofType: 'IMAGE' | 'LINK'
  user: {
    id: number
    email?: string
    phone: string
  }
  task: {
    title: string
    reward: number
  }
}

interface Stats {
  totalUsers: number
  totalCompleted: number
}

export default function AdminDashboard() {
  const [pending, setPending] = useState<PendingTask[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  // MODAL
  const [showCreate, setShowCreate] = useState(false)

  // FORM
  const [form, setForm] = useState({
    title: '',
    description: '',
    reward: '',
    url: '',
    minSeconds: '10'
  })

  // IMAGE STATE
  const [image, setImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [tasks, statData] = await Promise.all([
        adminService.getPendingTasks(),
        adminService.getAdminStats()
      ])

      setPending(tasks || [])
      setStats(statData || null)
    } catch {
      alert('Erro ao carregar dados do Admin')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: number, action: 'APPROVE' | 'REJECT') {
    if (!confirm(`Deseja realmente ${action === 'APPROVE' ? 'APROVAR' : 'REJEITAR'} esta tarefa?`)) return

    try {
      await adminService.reviewTask(id, action)
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erro ao processar ação')
    }
  }

  async function createTask() {
    try {
      if (!form.title || !form.description || !form.reward) {
        return alert('Preencha todos os campos obrigatórios')
      }

      await adminService.createTask({
        ...form,
        imageUrl: image // 🔥 envio da imagem
      })

      // RESET
      setForm({
        title: '',
        description: '',
        reward: '',
        url: '',
        minSeconds: '10'
      })
      setImage(null)

      setShowCreate(false)
      loadData()

    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar tarefa')
    }
  }

  if (loading) {
    return <div className="p-10 text-white">Carregando Painel EMATEA...</div>
  }

  return (
    <div className="p-6 bg-[#0B0E11] min-h-screen text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#FCD535]">
          Painel Administrativo EMATEA
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#02C076] px-4 py-2 rounded font-bold hover:opacity-90"
        >
          + Nova Tarefa
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Usuários Totais</p>
          <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
        </div>

        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Tarefas Pendentes</p>
          <p className="text-2xl font-bold text-orange-400">{pending.length}</p>
        </div>

        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Conclusões</p>
          <p className="text-2xl font-bold text-green-400">{stats?.totalCompleted ?? 0}</p>
        </div>
      </div>

      {/* LISTA */}
      <h2 className="text-xl font-semibold mb-4 text-gray-300">
        Aprovações Pendentes
      </h2>

      <div className="space-y-4">
        {pending.length === 0 && (
          <div className="bg-[#1E2329] border border-[#2B3139] p-6 rounded-xl text-center">
            <p className="text-gray-400 mb-4">
              Nenhuma tarefa pendente
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#FCD535] text-black px-4 py-2 rounded font-bold"
            >
              Criar tarefa
            </button>
          </div>
        )}

        {pending.map((item) => (
          <div key={item.id} className="bg-[#1E2329] p-6 rounded-2xl flex flex-col md:flex-row gap-6">

            <div className="md:w-1/3">
  {item.proofType === 'IMAGE' && item.proof ? (
    <img
      src={item.proof}
      alt="Prova"
      className="w-full h-48 object-cover rounded-xl border border-[#2B3139] cursor-pointer hover:opacity-80 transition"
      onClick={() => setPreviewImage(item.proof)}
    />
  ) : item.proof ? (
    <a
      href={item.proof}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline break-all"
    >
      {item.proof}
    </a>
  ) : (
    <p className="text-gray-500 italic">Sem prova enviada</p>
  )}
</div>

            <div className="flex-1">
              <h3 className="font-bold">{item.task.title}</h3>
              <p className="text-sm text-gray-400">
                {item.user.email || item.user.phone}
              </p>

              <p className="text-[#FCD535] font-bold mt-2">
                {item.task.reward} Kz
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleReview(item.id, 'APPROVE')}
                  className="bg-[#02C076] px-4 py-2 rounded"
                >
                  Aprovar
                </button>

                <button
                  onClick={() => handleReview(item.id, 'REJECT')}
                  className="bg-red-600 px-4 py-2 rounded"
                >
                  Rejeitar
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">

          <div className="bg-[#1E2329] p-6 rounded-xl w-full max-w-md">

            <h2 className="mb-4 font-bold">Criar Nova Tarefa</h2>

            <input
              placeholder="Título"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <textarea
              placeholder="Descrição"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />
             
            <input
              placeholder="Recompensa"
              value={form.reward}
              onChange={e => setForm({ ...form, reward: e.target.value })}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <input
              placeholder="URL"
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <input
              placeholder="Tempo (segundos)"
              value={form.minSeconds}
              onChange={e => setForm({ ...form, minSeconds: e.target.value })}
              className="w-full p-2 mb-3 bg-[#0B0E11]"
            />

            {/* IMAGE UPLOAD */}
            <input
              type="file"
              accept="image/*"
              className="mb-3"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                const reader = new FileReader()
                reader.onloadend = () => {
                  setImage(reader.result as string)
                }
                reader.readAsDataURL(file)
              }}
            />

            {/* PREVIEW */}
            {image && (
              <img
                src={image}
                className="w-full h-32 object-cover rounded mb-3"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={createTask}
                className="bg-[#FCD535] text-black w-full py-2 rounded"
              >
                Criar
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="bg-gray-600 w-full py-2 rounded"
              >
                Cancelar
              </button>
            </div>

          </div>

        </div>
      )}

      {previewImage && (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
    />
  </div>
)}

    </div>
  )
}