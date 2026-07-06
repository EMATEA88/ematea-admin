import { useState } from "react"
import { Key } from "lucide-react"
import AdminAgentService, { type Agent } from "../../../services/adminAgent.service"
import { toast } from "react-hot-toast"

interface Props {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
}

export function ResetAgentPinModal({ agent, isOpen, onClose }: Props) {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!agent || pin.length < 6) {
      return toast.error("O PIN deve ter 6 dígitos.")
    }
    setLoading(true)
    try {
      await AdminAgentService.resetPin(agent.id, pin)
      toast.success("PIN redefinido com sucesso!")
      setPin("")
      onClose()
    } catch (error) {
      toast.error("Erro ao resetar PIN")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#121214] border border-white/5">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Resetar PIN</h2>
          <p className="text-sm text-gray-400 mb-6 italic">
            Agente: <span className="text-white font-bold">{agent?.user.fullName}</span>
          </p>

          <input 
            type="password"
            maxLength={6}
            placeholder="Novo PIN de 6 dígitos"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-center text-2xl tracking-[10px] focus:border-primary outline-none mb-6"
          />

          <div className="flex flex-col gap-2">
            <button 
              disabled={loading}
              onClick={handleReset}
              className="w-full h-12 bg-primary text-black font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "A PROCESSAR..." : "CONFIRMAR NOVO PIN"}
            </button>
            <button onClick={onClose} className="w-full h-12 text-gray-400 font-bold hover:text-white transition-all">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}