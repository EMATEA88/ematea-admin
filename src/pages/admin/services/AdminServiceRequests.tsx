import { useEffect, useState } from "react"
import { adminServiceRequestsService, type ServiceRequest } from "../../../services/adminServiceRequests.service"
import toast from "react-hot-toast"
import { RefreshCw } from "lucide-react"

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
    <div className="p-10 space-y-6 max-w-7xl mx-auto text-gray-100">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Service Requests
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestão institucional de pedidos de serviço isolados
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#1A1F24] hover:bg-[#222831] text-gray-300 px-4 py-2 rounded-xl border border-[#1E2329] text-sm transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-yellow-400" : ""} />
          Atualizar
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-sm text-gray-300">
          <thead className="bg-[#1A1F24] text-gray-400 border-b border-[#1E2329]">
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
          <tbody>
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}

            {data.map((r) => (
              <tr
                key={r.id}
                className="border-t border-[#1E2329] hover:bg-[#181C21] transition"
              >
                <Td className="text-[#FCD535] font-semibold">
                  #{r.id}
                </Td>
                <Td>{r.user?.phone ?? "-"}</Td>
                <Td>{r.plan?.partner?.name ?? "-"}</Td>
                <Td className="font-medium text-white">
                  {r.plan?.name ?? "-"}
                </Td>
                <Td className="text-gray-200 font-medium">
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
                      className="bg-[#FCD535] text-black px-4 py-1.5 rounded-lg text-xs font-semibold hover:scale-105 transition disabled:opacity-50 shadow-md"
                    >
                      {actionLoading === r.id ? "Processando..." : "Concluir"}
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && data.length === 0 && (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Carregando solicitações...
          </div>
        )}
      </div>
    </div>
  )
}

/* ========================= */

function StatusBadge({ status }: { status: "IN_PROGRESS" | "COMPLETED" | "REJECTED" }) {
  const map: Record<string, string> = {
    IN_PROGRESS: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/30",
    COMPLETED: "bg-green-900/40 text-green-400 border border-green-700/30",
    REJECTED: "bg-red-900/40 text-red-400 border border-red-700/30",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-800 text-gray-300"}`}>
      {status}
    </span>
  )
}

function Th({ children }: any) {
  return <th className="px-6 py-4 text-left font-medium">{children}</th>
}

function Td({ children, className = "" }: any) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(value ?? 0)
}