import { X } from "lucide-react"
import { useRef, useEffect } from "react"
import type { SubAgent } from "../../../services/adminSubAgent.service"

interface Props {
  open: boolean
  subAgent: SubAgent | null
  onClose(): void
}

function formatDate(date?: string) {
  if (!date) return "-"
  return new Date(date).toLocaleString("pt-PT")
}

// Componente de Linha adaptado para o Tema Dark Premium da EMATEA
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
  onClose
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Monitora o clique fora do quadro interno para fechar a tela
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
  }, [open, onClose])

  if (!open || !subAgent) {
    return null
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

          {/* SESSÃO DE AUDITORIA */}
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
        <div className="flex justify-end gap-3 border-t border-white/[0.05] px-8 py-4 bg-[#0B0E11]/20 rounded-b-2xl">
          <button
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