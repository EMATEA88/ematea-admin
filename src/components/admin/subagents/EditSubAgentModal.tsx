import { useEffect, useState, useRef } from "react"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"

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
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Sincroniza os dados do Sub-Agente selecionado com o formulário
  useEffect(() => {
    if (!subAgent) return

    setForm({
      fullName: subAgent.user?.fullName || "",
      email: subAgent.user?.email || "",
      phone: subAgent.user?.phone || "",
      workstation: subAgent.workstation || "",
      position: subAgent.position || "",
      department: subAgent.department || "",
      address: subAgent.address || "",
      supervisorId: subAgent.supervisor?.id?.toString() || ""
    })
  }, [subAgent])

  // Carrega a listagem de agentes supervisores
  useEffect(() => {
    async function loadAgents() {
      try {
        setLoadingAgents(true)
        const data = await AdminAgentService.getAll()
        setAgents(data || [])
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

  // Fecha a janela ao clicar fora do quadro interno
  useEffect(() => {
    if (!open) return

    function handleOutsideClick(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open])

  if (!open || !subAgent) return null

  function update(field: string, value: string) {
    setForm(old => ({
      ...old,
      [field]: value
    }))
  }

  async function save() {
    if (!form.fullName || !form.phone) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }

    try {
      setLoading(true)

      const payload = {
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null
      }

      if (!subAgent?.id) return;
      await AdminSubAgentService.update(subAgent.id, payload)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-[#EAECEF]">
      
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-[#161A1E] rounded-[2rem] border border-white/[0.04] p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-wider text-white uppercase font-mono">
              Editar Sub-Agente
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Modifique as credenciais e vínculos do operador no ecossistema
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <FormInput
            label="Nome completo"
            placeholder="Nome"
            value={form.fullName}
            onChange={val => update("fullName", val)}
          />

          <FormInput
            label="Telefone"
            placeholder="Telefone"
            value={form.phone}
            onChange={val => update("phone", val)}
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={val => update("email", val)}
          />

          <FormInput
            label="Cargo / Função"
            placeholder="Cargo"
            value={form.position}
            onChange={val => update("position", val)}
          />

          <FormInput
            label="Posto de Trabalho"
            placeholder="Posto"
            value={form.workstation}
            onChange={val => update("workstation", val)}
          />

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
              Agente Supervisor
            </label>
            <select
              value={form.supervisorId}
              onChange={e => update("supervisorId", e.target.value)}
              disabled={loadingAgents}
              className="w-full h-11 bg-[#0B0E11]/60 text-white border border-white/[0.05] rounded-xl px-4 text-xs font-medium focus:outline-none focus:border-cyan-500/40 focus:bg-[#0B0E11] transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="" className="bg-[#161A1E] text-gray-400">
                {loadingAgents ? "A carregar..." : "EMATEA - Empresa (Sede)"}
              </option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-[#161A1E] text-white">
                  {agent.user?.fullName ? agent.user.fullName.toUpperCase() : `Agente ID #${agent.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <FormInput
              label="Endereço / Morada"
              placeholder="Morada"
              value={form.address}
              onChange={val => update("address", val)}
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-gray-400 hover:text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={save}
            className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-[0.98]"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange(v: string): void
  placeholder?: string
  type?: string
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0B0E11]/60 text-white placeholder:text-gray-600 border border-white/[0.05] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-cyan-500/40 focus:bg-[#0B0E11] transition-all duration-200"
      />
    </div>
  )
}