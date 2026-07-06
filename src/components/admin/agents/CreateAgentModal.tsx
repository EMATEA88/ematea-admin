import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"
import AdminAgentService from "../../../services/adminAgent.service"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateAgentModal({
  open,
  onClose,
  onSuccess
}: Props) {
  const [loading, setLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    workstation: "",
    position: "Agente", // Valor padrão conforme a regra de negócio
    department: "",
    address: "",
    pin: "" // PIN inicial de acesso para o agente
  })

  // Limpa o formulário sempre que o modal for aberto
  useEffect(() => {
    if (open) {
      setForm({
        fullName: "",
        email: "",
        phone: "",
        workstation: "",
        position: "Agente",
        department: "",
        address: "",
        pin: ""
      })
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

  if (!open) return null

  function update(field: string, value: string) {
    setForm(old => ({
      ...old,
      [field]: value
    }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    // Validação de campos obrigatórios conforme o padrão do sistema
    if (!form.fullName || !form.phone || !form.pin) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    try {
      setLoading(true)

      // Envia o payload estruturado para a API de Agentes
      await AdminAgentService.create(form)

      toast.success("Agente criado com sucesso.")
      onSuccess()
      onClose()
    } catch {
      toast.error("Não foi possível criar o Agente.")
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
              Registar Novo Agente
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Insira as credenciais do novo operador master para o ecossistema EMATEA
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
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          <FormInput
            label="Nome completo *"
            placeholder="Nome do Agente"
            value={form.fullName}
            onChange={val => update("fullName", val)}
          />

          <FormInput
            label="Telefone (Telemóvel) *"
            placeholder="+244XXXXXXXXX"
            value={form.phone}
            onChange={val => update("phone", val)}
          />

          <FormInput
            label="Email Institucional"
            type="email"
            placeholder="exemplo@ematea.com"
            value={form.email}
            onChange={val => update("email", val)}
          />

          <FormInput
            label="PIN de Acesso Primário *"
            type="password"
            placeholder="Defina 4 ou 6 dígitos"
            value={form.pin}
            onChange={val => update("pin", val)}
          />

          <FormInput
            label="Cargo / Função"
            placeholder="Agente"
            value={form.position}
            onChange={val => update("position", val)}
          />

          <FormInput
            label="Posto de Trabalho / Região"
            placeholder="Ex: Sede, Benguela, Campo"
            value={form.workstation}
            onChange={val => update("workstation", val)}
          />

          <div className="sm:col-span-2">
            <FormInput
              label="Endereço / Morada Principal"
              placeholder="Província, Município, Bairro"
              value={form.address}
              onChange={val => update("address", val)}
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="sm:col-span-2 mt-4 pt-4 border-t border-white/[0.03] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-gray-400 hover:text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] active:scale-[0.98]"
            >
              {loading ? "A Gravar..." : "Gravar Agente"}
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