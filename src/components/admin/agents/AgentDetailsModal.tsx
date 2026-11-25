
import { useEffect, useState } from "react"
import {
  X,
  User,
  Mail,
  Phone,
  Users,
  History,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { toast } from "react-hot-toast"

import AdminAgentService, {
  type Agent,
  type SubAgentSalesResponse
} from "../../../services/adminAgent.service"

interface Props {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
}

export function AgentDetailsModal({ agent, isOpen, onClose }: Props) {
  const [selectedSubAgent, setSelectedSubAgent] = useState<{
    id: number
    employeeCode: string
    fullName: string
  } | null>(null)

  const [salesHistory, setSalesHistory] =
    useState<SubAgentSalesResponse | null>(null)

  const [historyPage, setHistoryPage] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Carregar histórico do sub-agente selecionado
  useEffect(() => {
    if (!isOpen || !agent || !selectedSubAgent) return

    let cancelled = false

    async function loadHistory() {
      try {
        setHistoryLoading(true)

        const result = await AdminAgentService.getSubAgentSales(
          agent!.id,
          selectedSubAgent!.id,
          historyPage,
          10
        )

        if (!cancelled) {
          setSalesHistory(result)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar histórico:", error)
          toast.error("Não foi possível carregar o histórico de vendas.")
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [isOpen, agent, selectedSubAgent, historyPage])

  // Limpar seleção ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedSubAgent(null)
      setSalesHistory(null)
      setHistoryPage(1)
    }
  }, [isOpen])

  function openSubAgentHistory(sub: {
    id: number
    employeeCode: string
    user: {
      fullName: string
      email: string
      phone: string
    }
  }) {
    setSalesHistory(null)
    setHistoryPage(1)

    setSelectedSubAgent({
      id: sub.id,
      employeeCode: sub.employeeCode,
      fullName: sub.user?.fullName || "Sub-agente"
    })
  }

  function closeSubAgentHistory() {
    setSelectedSubAgent(null)
    setSalesHistory(null)
    setHistoryPage(1)
  }

  function formatKz(value: number) {
    return `${value.toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} Kz`
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString("pt-PT")
  }

  function getStatusStyle(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400"

      case "REJECTED":
        return "bg-red-500/10 text-red-400"

      case "PROVIDER_TIMEOUT":
        return "bg-orange-500/10 text-orange-400"

      default:
        return "bg-amber-500/10 text-amber-400"
    }
  }

  if (!isOpen || !agent) return null

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121214] border border-white/5 shadow-2xl">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <User size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Perfil do Agente
              </h2>
              <p className="text-sm font-mono text-gray-400">
                {agent.agentCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* ================= MÉTRICAS PRINCIPAIS ================= */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Nome Completo
              </label>

              <p className="text-white font-medium text-sm capitalize">
                {agent.user.fullName?.toLowerCase()}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Mail size={16} className="text-gray-500" />
              <p className="text-gray-300">
                {agent.user.email || "Sem e-mail"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-gray-500" />
              <p className="text-gray-300">
                {agent.user.phone || "-"}
              </p>
            </div>
          </div>

          
<div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono">
    Dados Financeiros
  </h3>

  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Saldo Atual:</span>
    <span className="text-green-400 font-bold">
      {(agent.user.balance || 0).toLocaleString("pt-PT", {
        minimumFractionDigits: 2
      })} Kz
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Comissões Acumuladas:</span>
    <span className="text-cyan-400 font-bold">
      {(agent.totalCommission ?? 0).toLocaleString("pt-PT", {
        minimumFractionDigits: 2
      })} Kz
    </span>
  </div>

  <div className="flex justify-between text-sm">
    <span className="text-gray-400">Comissão Disponível:</span>
    <span className="text-emerald-400 font-bold">
      {(agent.commissionBalance ?? 0).toLocaleString("pt-PT", {
        minimumFractionDigits: 2
      })} Kz
    </span>
  </div>
</div>
        </div>

        {/* ================= SUB-AGENTES ASSOCIADOS ================= */}
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
            <div className="max-h-56 overflow-auto rounded-xl border border-white/[0.04] bg-[#161A1E]/40">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#111418] text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/[0.03]">
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3 font-mono">Código</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3 text-right">Vendas</th>
                  </tr>
                </thead>

                <tbody className="text-[11px] font-medium divide-y divide-white/[0.02]">
                  {agent.subAgents.map(sub => (
                    <tr
                      key={sub.id}
                      className={`text-gray-300 transition-colors ${
                        selectedSubAgent?.id === sub.id
                          ? "bg-cyan-500/[0.06]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-4 py-3 font-bold text-white capitalize">
                        {sub.user?.fullName?.toLowerCase()}
                      </td>

                      <td className="px-4 py-3 font-mono text-gray-400 text-[10px]">
                        {sub.employeeCode || "SEM CÓDIGO"}
                      </td>

                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {sub.user?.phone || "-"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openSubAgentHistory(sub)}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold text-cyan-400 transition-colors hover:bg-cyan-500/20"
                        >
                          <History size={13} />
                          Ver histórico
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= HISTÓRICO DE VENDAS ================= */}
        {selectedSubAgent && (
          <div className="mx-6 mb-6 overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0B0E11]/70">

            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <History size={16} className="text-cyan-400" />
                  Histórico de vendas
                </h3>

                <p className="mt-1 text-[10px] text-gray-400">
                  {selectedSubAgent.fullName} · {selectedSubAgent.employeeCode}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSubAgentHistory}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {historyLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                A carregar histórico de vendas...
              </div>
            ) : salesHistory ? (
              <>
                {/* RESUMO FINANCEIRO */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-white/5 p-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500">
                      Operações
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {salesHistory.summary.totalOperations}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-500">
                      Vendas concluídas
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-400">
                      {salesHistory.summary.completedSales}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[9px] uppercase tracking-wider text-gray-500">
                      Total vendido
                    </p>
                    <p className="mt-1 text-sm font-bold text-cyan-400">
                      {formatKz(salesHistory.summary.totalSales)}
                    </p>
                  </div>
                </div>

                {/* LISTA DE VENDAS */}
                {salesHistory.sales.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    Este sub-agente ainda não possui vendas registadas.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-[#161A1E]">
                        <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-gray-500">
                          <th className="px-4 py-3">Operação</th>
                          <th className="px-4 py-3">Referência</th>
                          <th className="px-4 py-3">Data</th>
                          <th className="px-4 py-3 text-right">Valor</th>
                          <th className="px-4 py-3">Estado</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {salesHistory.sales.map(sale => (
                          <tr
                            key={sale.id}
                            className="text-[10px] text-gray-300 transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-white">
                                {sale.serviceName || sale.planName || "Serviço"}
                              </p>

                              <p className="mt-1 text-gray-500">
                                {sale.providerName || sale.serviceGroupName || "-"}
                              </p>
                            </td>

                            <td className="px-4 py-3 font-mono">
                              {sale.customerReference || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                              {formatDate(sale.createdAt)}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-white">
                              {formatKz(sale.amount)}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-bold ${getStatusStyle(sale.status)}`}
                              >
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* PAGINAÇÃO */}
                <div className="flex items-center justify-between border-t border-white/5 p-3">
                  <p className="text-[10px] text-gray-500">
                    Página {salesHistory.pagination.page} de{" "}
                    {Math.max(1, salesHistory.pagination.totalPages)}
                    {" · "}
                    {salesHistory.pagination.total} operações
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={historyPage <= 1 || historyLoading}
                      onClick={() => setHistoryPage(page => page - 1)}
                      className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        historyPage >= salesHistory.pagination.totalPages ||
                        historyLoading
                      }
                      onClick={() => setHistoryPage(page => page + 1)}
                      className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : !historyLoading ? (
              <div className="p-6 text-center text-xs text-gray-500">
                Não foi possível apresentar o histórico.
              </div>
            ) : null}
          </div>
        )}

        {/* ================= FOOTER ================= */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/5 text-white text-xs font-black tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            FECHAR
          </button>
        </div>

      </div>
    </div>
  )
}
