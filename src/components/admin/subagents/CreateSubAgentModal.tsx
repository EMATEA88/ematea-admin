import { X } from "lucide-react"
// 1. Imports atualizados com os novos hooks e o serviço de agentes
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import AdminAgentService, {
  type Agent
} from "../../../services/adminAgent.service"
import AdminSubAgentService from "../../../services/adminSubAgent.service"

interface Props {
  open: boolean
  onClose(): void
  onSuccess(): void
}

export default function CreateSubAgentModal({
  open,
  onClose,
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false)
  
  // 2. Novos estados para agentes supervisores
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)

  // 3. supervisorId acrescentado ao estado inicial do formulário
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    pin: "",
    workstation: "",
    position: "",
    address: "",
    department: "",
    supervisorId: ""
  })

  // 4. Carregamento dos supervisores via useEffect ao montar o modal
  useEffect(() => {
    async function loadAgents() {
      try {
        setLoadingAgents(true)
        const data = await AdminAgentService.getAll()
        setAgents(data)
      } catch {
        toast.error("Erro ao carregar os supervisores.")
      } finally {
        setLoadingAgents(false)
      }
    }

    if (open) {
      loadAgents()
    }
  }, [open])

  if (!open) return null

  function update(field: string, value: string) {
    setForm(old => ({
      ...old,
      [field]: value
    }))
  }

  async function submit() {
    try {
      setLoading(true)

      // 6. Tratamento do supervisorId na criação enviada para a API
      const payload = {
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null
      }

      await AdminSubAgentService.create(payload)
      toast.success("Sub-Agente criado.")
      onSuccess()
      onClose()
    } catch {
      toast.error("Não foi possível criar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Novo Sub-Agente</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Nome"
            value={form.fullName}
            onChange={e => update("fullName", e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Telefone"
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            placeholder="PIN"
            value={form.pin}
            onChange={e => update("pin", e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Posto"
            value={form.workstation}
            onChange={e => update("workstation", e.target.value)}
            className="rounded-lg border p-3"
          />

          <input
            placeholder="Cargo"
            value={form.position}
            onChange={e => update("position", e.target.value)}
            className="rounded-lg border p-3"
          />

          {/* 5. Substituição do campo "Departamento" pelo select estilizado */}
          <select
            value={form.supervisorId}
            onChange={(e) =>
              setForm({
                ...form,
                supervisorId: e.target.value
              })
            }
            className="rounded-lg border border-gray-200 bg-white p-3 text-sm"
            disabled={loadingAgents}
          >
            <option value="">
              {loadingAgents ? "A carregar supervisores..." : "Sem supervisor"}
            </option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.user?.fullName || "Agente sem nome"}
              </option>
            ))}
          </select>

          <input
            placeholder="Morada"
            value={form.address}
            onChange={e => update("address", e.target.value)}
            className="rounded-lg border p-3"
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-3"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  )
}