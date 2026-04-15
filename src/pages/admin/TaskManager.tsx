import { useEffect, useState } from 'react'
import * as adminService from '../../services/adminService'

interface Task {
  id: number
  title: string
  description: string
  reward: number
  url?: string
  minSeconds: number
  isActive: boolean
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState<Task | null>(null)

  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    reward: '',
    url: '',
    minSeconds: '10'
  })

  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      const data = await adminService.getTasks()
      setTasks(data || [])
    } catch {
      alert('Erro ao carregar tasks')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Eliminar tarefa?')) return

    await adminService.deleteTask(id)
    loadTasks()
  }

  async function handleToggle(id: number) {
    await adminService.toggleTask(id)
    loadTasks()
  }

  function openEdit(task: Task) {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description,
      reward: task.reward,
      url: task.url,
      minSeconds: task.minSeconds
    })
  }

  async function saveEdit() {
    if (!editing) return

    await adminService.updateTask(editing.id, form)

    setEditing(null)
    loadTasks()
  }

  if (loading) return <div className="p-6 text-white">Carregando...</div>

  return (
    <div className="p-6 text-white bg-[#0B0E11] min-h-screen">

      <h1 className="text-2xl font-bold mb-6 text-[#FCD535]">
        Gestão de Tarefas
      </h1>

      {/* EMPTY */}
      {tasks.length === 0 && (
        <div className="text-center text-gray-400">
          Nenhuma tarefa cadastrada
        </div>
      )}

      {/* TABLE */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id}
            className="bg-[#1E2329] p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4"
          >

            {/* INFO */}
            <div>
              <h2 className="font-bold">{task.title}</h2>
              <p className="text-sm text-gray-400">{task.description}</p>
              <p className="text-yellow-400 font-bold">
                {task.reward} Kz
              </p>

              <span className={`text-xs px-2 py-1 rounded ${
                task.isActive ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {task.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button
                onClick={() => openEdit(task)}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => handleToggle(task.id)}
                className="bg-yellow-500 px-3 py-1 rounded"
              >
                {task.isActive ? 'Desativar' : 'Ativar'}
              </button>

              <button
                onClick={() => handleDelete(task.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                Apagar
              </button>

            </div>

          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">

          <div className="bg-[#1E2329] p-6 rounded-xl w-full max-w-md">

            <h2 className="mb-4 font-bold">Editar Tarefa</h2>

            <input
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <input
              value={form.reward}
              onChange={e => setForm({...form, reward: e.target.value})}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <input
              value={form.url}
              onChange={e => setForm({...form, url: e.target.value})}
              className="w-full p-2 mb-2 bg-[#0B0E11]"
            />

            <input
              value={form.minSeconds}
              onChange={e => setForm({...form, minSeconds: e.target.value})}
              className="w-full p-2 mb-4 bg-[#0B0E11]"
            />

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="bg-[#FCD535] text-black w-full py-2 rounded"
              >
                Salvar
              </button>

              <button
                onClick={() => setEditing(null)}
                className="bg-gray-600 w-full py-2 rounded"
              >
                Cancelar
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}