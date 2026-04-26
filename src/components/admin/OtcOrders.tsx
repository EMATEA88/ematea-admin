import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Eye, XCircle, RefreshCw, Smartphone } from "lucide-react" // Ícones modernos
import { AdminService } from "../../services/admin.service"

type AdminOtcOrder = {
  id: number
  type: "BUY" | "SELL"
  status: string
  totalAoa: number
  quantity: number
  createdAt: string
  user?: { phone?: string }
  asset?: { symbol?: string }
}

export default function OtcOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<AdminOtcOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await AdminService.otcOrders()
      setOrders(res.items || [])
    } catch (err) {
      toast.error("Erro ao carregar ordens")
    } finally {
      setLoading(false)
    }
  }, [])

  async function cancel(id: number) {
    if (!confirm("Deseja realmente cancelar esta ordem?")) return
    try {
      await AdminService.cancelOtcOrder(id)
      toast.success("Ordem cancelada com sucesso")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao cancelar")
    }
  }

  useEffect(() => {
    load()
  }, [load])

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-8 h-8 border-4 border-[#FCD535] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium animate-pulse">Sincronizando ordens institucionais...</p>
    </div>
  )

  return (
    <div className="p-10 space-y-8 bg-[#0B0E11] min-h-screen">
      
      {/* HEADER PROFISSIONAL */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ordens OTC</h1>
          <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            Monitoramento em tempo real de ativos e liquidez
          </p>
        </div>
        <button 
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E2329] hover:bg-[#2B3139] text-white rounded-lg transition-all border border-[#2B3139] text-sm font-medium"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="bg-[#1A1F24] text-gray-500 border-b border-[#1E2329]">
                <Th>ID</Th>
                <Th>Utilizador</Th>
                <Th>Asset</Th>
                <Th>Tipo</Th>
                <Th>Quantidade</Th>
                <Th>Total (Kz)</Th>
                <Th>Status</Th>
                <Th className="text-right">Ação</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1E2329]">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-[#181C21] transition-colors group">
                  <td className="px-6 py-5 font-mono text-gray-500 text-xs">
                    #{o.id}
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-gray-600" />
                      <span className="text-gray-300">{o.user?.phone || "-"}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-white font-bold">
                    {o.asset?.symbol}
                  </td>

                  <td className="px-6 py-5">
                    <span className={`font-bold ${o.type === "BUY" ? "text-green-400" : "text-red-400"}`}>
                      {o.type}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-400">
                    {o.quantity}
                  </td>

                  <td className="px-6 py-5 font-semibold text-white">
                    {o.totalAoa.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="px-6 py-5">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-3">
                      {/* BOTÃO DETALHES - Agora o ponto central de ação */}
                      <button
                        onClick={() => navigate(`/admin/otc/ordem/${o.id}`)}
                        className="flex items-center gap-2 bg-[#2B3139] hover:bg-[#323942] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-gray-600 shadow-lg"
                      >
                        <Eye size={14} />
                        Detalhes
                      </button>

                      {/* BOTÃO CANCELAR RÁPIDO */}
                      {o.status === "PENDING" && (
                        <button
                          onClick={() => cancel(o.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Cancelar Ordem"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="p-20 text-center text-gray-500 italic">
              Nenhuma ordem encontrada no registro.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Th({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest ${className}`}>
      {children}
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    PAID: "bg-blue-500/10 text-blue-400 border-blue-400/20",
    RELEASED: "bg-green-500/10 text-green-500 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    EXPIRED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    DISPUTED: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-tighter ${map[status] || "bg-gray-800 text-gray-300"}`}>
      {status}
    </span>
  )
}