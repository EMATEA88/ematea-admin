import { useState } from "react"
import { toast } from "react-hot-toast"

import AdminSubAgentService, {
  type SubAgent
} from "../../../services/adminSubAgent.service"

interface Props {
  open: boolean
  subAgent: SubAgent | null
  onClose: () => void
  onSuccess: () => void
}

export default function ResetPinModal({
  open,
  subAgent,
  onClose,
  onSuccess
}: Props) {

  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open || !subAgent) return null

  async function submit() {

    if (!pin.trim()) {
      toast.error("Informe o novo PIN.")
      return
    }

    if (pin.length < 4) {
      toast.error("PIN inválido.")
      return
    }

    if (pin !== confirmPin) {
      toast.error("Os PINs não coincidem.")
      return
    }

    try {

      setLoading(true)

      await AdminSubAgentService.resetPin(
    subAgent!.id,
    pin
)

      toast.success("PIN alterado com sucesso.")

      setPin("")
      setConfirmPin("")

      onSuccess()

    } catch {

      toast.error("Não foi possível alterar o PIN.")

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8">

        <h2 className="mb-6 text-3xl font-bold text-white">
          Resetar PIN
        </h2>

        <p className="mb-6 text-slate-400">
          {subAgent.user.fullName}
        </p>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Novo PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Confirmar PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
          />

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-6 py-3 text-white"
          >
            Cancelar
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white"
          >
            {loading ? "A guardar..." : "Alterar PIN"}
          </button>

        </div>

      </div>

    </div>

  )

}