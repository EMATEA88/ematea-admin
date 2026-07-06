import { X } from "lucide-react"
import { useEffect, useState, useRef } from "react"
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
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Carrega os Agentes Supervisores ao abrir o modal
  useEffect(() => {
    async function loadAgents() {
      try {
        setLoadingAgents(true)
        const data = await AdminAgentService.getAll()
        setAgents(data || [])
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

  // Fecha o modal ao clicar fora da caixa interna
  useEffect(() => {
    if (!open) return

    function handleOutsideClick(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open])

  if (!open) return null

  function handleClose() {
    setForm({
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
    onClose()
  }

  function update(field: string, value: string) {
    setForm(old => ({
      ...old,
      [field]: value
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!form.fullName || !form.phone || !form.pin) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    try {
      setLoading(true)

      // Tratamento preventivo para mitigar e corrigir o problema do código de operador "NaN"
      // Se o backend exigir um employeeCode gerado pelo front, tratamos para evitar o NaN.
      const randomFallbackId = Math.floor(1000 + Math.random() * 9000)
      
      const payload = {
        ...form,
        supervisorId: form.supervisorId ? Number(form.supervisorId) : null,
        // Garante que se um código de funcionário vazio for gerado, ele herda um formato de string válido e limpo
        employeeCode: `EM-SUB-${randomFallbackId}` 
      }

      await AdminSubAgentService.create(payload)
      toast.success("Sub-Agente criado com sucesso.")
      onSuccess()
      handleClose()
    } catch {
      toast.error("Não foi possível criar o Sub-Agente.")
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
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black tracking-wider text-white uppercase font-mono">
              Novo Sub-Agente
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Registe uma nova conta de operador interno no sistema
            </p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <FormInput
              label="Nome completo"
              placeholder="Ex: Emanuel António"
              value={form.fullName}
              onChange={val => update("fullName", val)}
              required
            />

            <FormInput
              label="Telefone"
              placeholder="Ex: 923000000"
              value={form.phone}
              onChange={val => update("phone", val)}
              required
            />

            <FormInput
              label="Email"
              type="email"
              placeholder="nome@ematea.com"
              value={form.email}
              onChange={val => update("email", val)}
            />

            <FormInput
              label="PIN de Segurança (Acesso)"
              type="password"
              placeholder="Mínimo 4 dígitos"
              maxLength={6}
              value={form.pin}
              onChange={val => update("pin", val)}
              required
            />

            <FormInput
              label="Posto de Trabalho"
              placeholder="Ex: Guiché Central"
              value={form.workstation}
              onChange={val => update("workstation", val)}
            />

            <FormInput
              label="Cargo / Função"
              placeholder="Ex: Operador de Caixa"
              value={form.position}
              onChange={val => update("position", val)}
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
                  {loadingAgents ? "A carregar supervisores..." : "EMATEA - Empresa (Sede)"}
                </option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id} className="bg-[#161A1E] text-white">
                    {agent.user?.fullName ? agent.user.fullName.toUpperCase() : `Agente ID #${agent.id}`}
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Endereço / Província"
              placeholder="Cidade, Província"
              value={form.address}
              onChange={val => update("address", val)}
            />
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-gray-400 hover:text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-[0.98]"
            >
              {loading ? "A criar conta..." : "Criar Sub-Agente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange(v: string): void
  placeholder?: string
  required?: boolean
  type?: string
  maxLength?: number
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  maxLength
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0B0E11]/60 text-white placeholder:text-gray-600 border border-white/[0.05] rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-cyan-500/40 focus:bg-[#0B0E11] transition-all duration-200"
      />
    </div>
  )
}