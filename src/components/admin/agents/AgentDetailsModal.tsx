import { type Agent } from "../../../services/adminAgent.service"
import { X, User, Mail, Phone, Users } from "lucide-react"

interface Props {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
}

export function AgentDetailsModal({ agent, isOpen, onClose }: Props) {
  if (!isOpen || !agent) return null

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#121214] border border-white/5 overflow-hidden shadow-2xl">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Perfil do Agente</h2>
              <p className="text-sm font-mono text-gray-400">{agent.agentCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* ================= METRICAS PRINCIPAIS ================= */}
        <div className="p-6 grid grid-cols-2 gap-6 pb-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Nome Completo</label>
              <p className="text-white font-medium text-sm capitalize">{agent.user.fullName?.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-500" />
              <p className="text-gray-300">{agent.user.email || "Sem e-mail"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-gray-500" />
              <p className="text-gray-300">{agent.user.phone}</p>
            </div>
          </div>

          <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono">Dados Financeiros</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Saldo Atual:</span>
              <span className="text-green-400 font-bold">{(agent.user.balance || 0).toLocaleString()} Kz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Comissão:</span>
              <span className="text-cyan-400 font-bold">{(agent.commissionBalance || 0).toLocaleString()} Kz</span>
            </div>
          </div>
        </div>

        {/* ================= LISTA DE SUB-AGENTES ASSOCIADOS ================= */}
        <div className="px-6 pb-6 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 font-mono">
              Sub-Agentes Associados ({agent.subAgents?.length || 0})
            </h3>
          </div>

          {!agent.subAgents || agent.subAgents.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#161A1E]/40 border border-white/[0.02] text-center">
              <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                Nenhum sub-agente associado a este agente principal.
              </p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-white/[0.04] bg-[#161A1E]/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111418]/80 text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/[0.03]">
                    <th className="px-4 py-2.5">Nome</th>
                    <th className="px-4 py-2.5 font-mono">Código</th>
                    <th className="px-4 py-2.5">Contacto</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium divide-y divide-white/[0.02]">
                  {agent.subAgents.map((sub: any) => (
                    <tr key={sub.id} className="text-gray-300 hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3 font-bold text-white capitalize">
                        {sub.user?.fullName?.toLowerCase()}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-400 text-[10px]">
                        {sub.employeeCode || "SEM CÓDIGO"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {sub.user?.phone || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 text-white text-xs font-black tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]">
            FECHAR
          </button>
        </div>

      </div>
    </div>
  )
}