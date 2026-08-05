import { useEffect, useState, type ReactNode } from "react"
import { adminServiceRequestsService, type ServiceRequest } from "../../../services/adminServiceRequests.service"
import toast from "react-hot-toast"
import { RefreshCw, ClipboardList, Building2 } from "lucide-react"

export default function AdminServiceRequests() {
  const [data, setData] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await adminServiceRequestsService.getRequests(1, 20)
      const items = Array.isArray(res) ? res : (res?.items ?? res?.data ?? [])
      setData(items)
    } catch (error) {
      console.error("Erro ao carregar solicitações de serviço:", error)
      toast.error("Erro ao carregar serviços")
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(id: number) {
    if (!window.confirm("Confirmar conclusão do serviço?")) return

    try {
      setActionLoading(id)
      await adminServiceRequestsService.completeService(id)
      toast.success("Serviço concluído com sucesso")
      await fetchData()
    } catch (error) {
      console.error("Erro ao concluir serviço:", error)
      toast.error("Falha ao concluir serviço")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Gestão de Operações
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Service Requests</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Solicitações de Serviço
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-400" />
            Gestão institucional de pedidos de serviço isolados e rastreio de parceiros.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-[#0B0E11] text-gray-400 border-b border-white/5 text-xs uppercase tracking-wider font-black">
              <tr>
                <Th>ID</Th>
                <Th>Utilizador</Th>
                <Th>Parceiro</Th>
                <Th>Plano</Th>
                <Th>Valor</Th>
                <Th>Estado</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && data.length === 0 ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ClipboardList size={32} className="text-gray-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nenhum registro encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((r) => {
                  // Resolve o parceiro com segurança sem gerar erros de tipagem do TS
                  const planObj = r.plan as any;
                  const partnerName = 
                    planObj?.partner?.name ?? 
                    planObj?.provider?.name ?? 
                    (r as any).partner?.name ?? 
                    (r as any).provider?.name ?? 
                    "-";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <Td className="text-blue-400 font-mono font-bold">
                        #{r.id}
                      </Td>
                      <Td>
                        <span className="text-gray-200 font-medium">{r.user?.phone ?? "-"}</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-gray-500 shrink-0" />
                          <span className="text-gray-200 font-semibold">{partnerName}</span>
                        </div>
                      </Td>
                      <Td className="font-bold text-white">
                        {planObj?.name ?? "-"}
                      </Td>
                      <Td className="text-gray-200 font-bold font-mono">
                        {formatMoney(r.amount)}
                      </Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                      <Td>
                        {r.status === "IN_PROGRESS" && (
                          <button
                            disabled={actionLoading === r.id}
                            onClick={() => handleComplete(r.id)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg cursor-pointer"
                          >
                            {actionLoading === r.id ? "Processando..." : "Concluir"}
                          </button>
                        )}
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========================= */

function StatusBadge({ status }: { status: "IN_PROGRESS" | "COMPLETED" | "REJECTED" }) {
  const map: Record<string, string> = {
    IN_PROGRESS: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
  }

  const labels: Record<string, string> = {
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluído",
    REJECTED: "Rejeitado"
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${map[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {labels[status] || status}
    </span>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-6 py-4 text-left font-black">{children}</th>
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(value ?? 0)
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="w-10 h-4 bg-white/5 rounded" /></td>
      <td className="px-6 py-4"><div className="w-28 h-4 bg-white/5 rounded" /></td>
      <td className="px-6 py-4"><div className="w-32 h-4 bg-white/5 rounded" /></td>
      <td className="px-6 py-4"><div className="w-24 h-4 bg-white/5 rounded" /></td>
      <td className="px-6 py-4"><div className="w-20 h-4 bg-white/5 rounded" /></td>
      <td className="px-6 py-4"><div className="w-24 h-6 bg-white/5 rounded-full" /></td>
      <td className="px-6 py-4"><div className="w-20 h-8 bg-white/5 rounded-xl" /></td>
    </tr>
  )
}