
import { X, EyeOff, Eye, Loader2 } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import type { SubAgent } from "../../../services/adminSubAgent.service"
import AdminSubAgentService from "../../../services/adminSubAgent.service"

interface Props {
  open: boolean
  subAgent: SubAgent | null
  onClose(): void
  onSuccess?: () => void
}

function formatDate(date?: string) {
  if (!date) return "-"
  return new Date(date).toLocaleString("pt-PT")
}

function Row({
  label,
  value
}: {
  label: string
  value?: any
}) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-white/[0.05] py-3.5 px-4 hover:bg-white/[0.01] transition-colors">
      <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 flex items-center">
        {label}
      </span>

      <span className="col-span-2 text-xs font-medium text-gray-200 break-all">
        {value || "-"}
      </span>
    </div>
  )
}

export default function SubAgentDetailsModal({
  open,
  subAgent,
  onClose,
  onSuccess
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!open) return

    function handleOutsideClick(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open, onClose])

  if (!open || !subAgent) return null

  const isDirectEmateaOperator = !subAgent.supervisor

  async function toggleVisibility() {
    if (!subAgent) return

    const action = subAgent.isActive ? "ocultar" : "reativar"

    const confirmed = window.confirm(
      subAgent.isActive
        ? "Pretende ocultar este operador das listas de desempenho? O histórico será preservado."
        : "Pretende reativar este operador?"
    )

    if (!confirmed) return

    try {
      setUpdatingStatus(true)

      if (subAgent.isActive) {
        await AdminSubAgentService.deactivate(subAgent.id)
        toast.success("Operador ocultado das listas.")
      } else {
        await AdminSubAgentService.activate(subAgent.id)
        toast.success("Operador reativado com sucesso.")
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error(`Erro ao ${action} operador:`, error)

      toast.error(
        error?.response?.data?.message ||
        `Não foi possível ${action} o operador.`
      )
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 overflow-y-auto">
      <div
        ref={modalRef}
        className="w-full max-w-4xl rounded-2xl bg-[#161A1E] border border-white/[0.05] shadow-2xl flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-8 py-5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Detalhes do Sub-Agente
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              REGISTO E INFORMAÇÕES COMPLETAS DO OPERADOR INTERNO NO SISTEMA
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-6 p-8 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">

          {/* DADOS PESSOAIS */}
          <section>
            <h3 className="mb-3 text-xs font-bold text-cyan-400 uppercase tracking-widest pl-1">
              Dados Pessoais
            </h3>

            <div className="rounded-xl border border-white/[0.05] bg-[#0B0E11]/40 overflow-hidden">
              <Row label="Nome Completo" value={subAgent.user?.fullName} />
              <Row label="ID Público" value={subAgent.user?.publicId} />
              <Row label="Código de Operador" value={subAgent.employeeCode} />
              <Row label="Email" value={subAgent.user?.email} />
              <Row label="Telefone" value={subAgent.user?.phone} />
            </div>
          </section>

          {/* DADOS PROFISSIONAIS */}
          <section>
            <h3 className="mb-3 text-xs font-bold text-cyan-400 uppercase tracking-widest pl-1">
              Dados Profissionais
            </h3>

            <div className="rounded-xl border border-white/[0.05] bg-[#0B0E11]/40 overflow-hidden">
              <Row label="Cargo / Função" value={subAgent.position} />
              <Row label="Departamento" value={subAgent.department} />
              <Row label="Posto de Trabalho" value={subAgent.workstation} />

              <Row
                label="Agente Supervisor"
                value={subAgent.supervisor?.fullName || "EMATEA (Direto)"}
              />

              <Row
                label="Estado"
                value={
                  subAgent.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Desativado
                    </span>
                  )
                }
              />

              <Row label="Contratado em" value={formatDate(subAgent.hiredAt)} />
            </div>
          </section>

          {/* AUDITORIA */}
          <section>
            <h3 className="mb-3 text-xs font-bold text-cyan-400 uppercase tracking-widest pl-1">
              Auditoria do Sistema
            </h3>

            <div className="rounded-xl border border-white/[0.05] bg-[#0B0E11]/40 overflow-hidden">
              <Row label="Endereço / Província" value={subAgent.address} />
              <Row label="Perfil Criado em" value={formatDate(subAgent.createdAt)} />
              <Row label="Conta Base criada em" value={formatDate(subAgent.user?.createdAt)} />
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/[0.05] px-8 py-4 bg-[#0B0E11]/20 rounded-b-2xl">

          <div>
            {isDirectEmateaOperator && (
              <button
                type="button"
                disabled={updatingStatus}
                onClick={toggleVisibility}
                className={`h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 ${
                  subAgent.isActive
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                {updatingStatus ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : subAgent.isActive ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}

                {updatingStatus
                  ? "A atualizar..."
                  : subAgent.isActive
                    ? "Ocultar das listas"
                    : "Reativar operador"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl bg-white/[0.05] text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/[0.1] transition-all"
          >
            Fechar Janela
          </button>

        </div>
      </div>
    </div>
  )
}
