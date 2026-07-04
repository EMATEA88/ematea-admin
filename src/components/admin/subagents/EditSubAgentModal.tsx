import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"

// 1. Novo import de serviço adicionado
import AdminAgentService, {
  type Agent
} from "../../../services/adminAgent.service"
import AdminSubAgentService, {
  type SubAgent
} from "../../../services/adminSubAgent.service"

interface Props {
  open: boolean
  subAgent: SubAgent | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditSubAgentModal({
  open,
  subAgent,
  onClose,
  onSuccess
}: Props) {

  const [loading, setLoading] = useState(false)

  // 2. Novos estados criados para os supervisores
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)

  // 3. Adicionado supervisorId com valor inicial vazio no form
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    workstation: "",
    position: "",
    department: "",
    address: "",
    supervisorId: ""
  })

  // 4. useEffect atualizado: adicionada a inicialização do supervisorId vindo do subAgent
  useEffect(() => {
    if (!subAgent) return

    setForm({
      fullName: subAgent.user.fullName || "",
      email: subAgent.user.email || "",
      phone: subAgent.user.phone || "",
      workstation: subAgent.workstation || "",
      position: subAgent.position || "",
      department: subAgent.department || "",
      address: subAgent.address || "",
      supervisorId: subAgent.supervisor?.id?.toString() || ""
    })
  }, [subAgent])

  // 5. Novo useEffect adicionado para buscar todos os agentes da API
  useEffect(() => {
    async function loadAgents() {
      try {
        setLoadingAgents(true)
        const data = await AdminAgentService.getAll()
        setAgents(data)
      } catch {
        toast.error("Erro ao carregar supervisores.")
      } finally {
        setLoadingAgents(false)
      }
    }

    if (open) {
      loadAgents()
    }
  }, [open])

  if (!open || !subAgent)
    return null

  // 7. Método save() atualizado para processar e enviar o supervisorId tratado
  async function save() {
    try {
      setLoading(true)

      const payload = {
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null
      }

      await AdminSubAgentService.update(
        subAgent!.id,
        payload
      )

      toast.success("Sub-Agente atualizado.")
      onSuccess()
      onClose()
    } catch {
      toast.error("Erro ao atualizar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-3xl bg-[#111827] p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Editar Sub-Agente
          </h2>

          <button onClick={onClose}>
            <X
              size={26}
              className="text-gray-400"
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <input
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Nome"
            value={form.fullName}
            onChange={(e) =>
              setForm({
                ...form,
                fullName: e.target.value
              })
            }
          />

          <input
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value
              })
            }
          />

          <input
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
          />

          <input
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Cargo"
            value={form.position}
            onChange={(e) =>
              setForm({
                ...form,
                position: e.target.value
              })
            }
          />

          <input
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Posto"
            value={form.workstation}
            onChange={(e) =>
              setForm({
                ...form,
                workstation: e.target.value
              })
            }
          />

          {/* 6. Campo "Departamento" substituído pelo select com mapeamento dinâmico de supervisores */}
          <select
            value={form.supervisorId}
            onChange={(e) =>
              setForm({
                ...form,
                supervisorId: e.target.value
              })
            }
            className="rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            disabled={loadingAgents}
          >
            <option value="">
              {loadingAgents ? "A carregar..." : "Sem Supervisor"}
            </option>
            {agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.user?.fullName || "Agente sem nome"}
              </option>
            ))}
          </select>

          <input
            className="col-span-2 rounded-xl border border-gray-700 bg-[#1F2937] p-4 text-white"
            placeholder="Morada"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value
              })
            }
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-700 px-6 py-3 text-white transition-all hover:bg-gray-600"
          >
            Cancelar
          </button>

          <button
            disabled={loading}
            onClick={save}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}