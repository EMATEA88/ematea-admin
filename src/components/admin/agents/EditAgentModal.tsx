import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import AdminAgentService, { type Agent } from "../../../services/adminAgent.service"
import { toast } from "react-hot-toast"

interface Props {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditAgentModal({ agent, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: ""
  })

  useEffect(() => {
    if (agent) {
      setFormData({
        fullName: agent.user.fullName,
        email: agent.user.email || "",
        // Usa type casting temporário ou fallback seguro para evitar queixas do compilador
        address: (agent.user as any).address || ""
      })
    }
  }, [agent])

  const handleUpdate = async () => {
    if (!agent) return
    setLoading(true)
    try {
      await AdminAgentService.update(agent.id, formData)
      toast.success("Dados do agente atualizados!")
      onSuccess()
      onClose()
    } catch (error) {
      toast.error("Erro ao atualizar agente")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#121214] border border-white/5">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Editar Agente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
            <input 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">E-mail Institucional</label>
            <input 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-400 font-bold hover:text-white">CANCELAR</button>
          <button 
            disabled={loading}
            onClick={handleUpdate}
            className="px-6 py-2 bg-primary rounded-xl text-black font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "A GRAVAR..." : <><Save size={18}/> GRAVAR ALTERAÇÕES</>}
          </button>
        </div>
      </div>
    </div>
  )
}