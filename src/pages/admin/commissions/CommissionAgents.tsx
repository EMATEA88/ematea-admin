import { useCallback, useEffect, useState } from "react"
import { MagnifyingGlass, ArrowClockwise, ShieldCheck } from "@phosphor-icons/react"
import { toast } from "react-hot-toast"
import { AdminCommissionService } from "../../../services/admin-commission.service"

interface AgentReportItem {
  id: number
  agentName: string
  agentEmail: string
  metrics: {
    today: { sales: number; profit: number }
    yesterday: { sales: number; profit: number }
    week: { sales: number; profit: number }
    month: { sales: number; profit: number }
    year: { sales: number; profit: number }
    totalProfit: number
  }
}

export default function CommissionAgentsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AgentReportItem[]>([])
  const [search, setSearch] = useState("")

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await AdminCommissionService.getAgentsReport()
      setData(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar relatório de agentes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredData = data.filter(item =>
    item.agentName.toLowerCase().includes(search.toLowerCase()) ||
    item.agentEmail.toLowerCase().includes(search.toLowerCase())
  )

  const totals = filteredData.reduce(
    (acc, item) => {
      acc.todaySales += item.metrics.today.sales
      acc.monthSales += item.metrics.month.sales
      acc.totalProfit += item.metrics.totalProfit
      return acc
    },
    { todaySales: 0, monthSales: 0, totalProfit: 0 }
  )

  return (
    <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comissões de Agentes</h1>
          <p className="text-gray-500">Métricas completas de desempenho, vendas e lucros dos agentes por período.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          <ArrowClockwise size={18} className={loading ? "animate-spin" : ""} />
          Atualizar Dados
        </button>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">
          <p className="text-xs uppercase text-gray-500">Total de Agentes</p>
          <h3 className="text-3xl font-bold mt-2 text-blue-400">{filteredData.length}</h3>
        </div>
        <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">
          <p className="text-xs uppercase text-gray-500">Vendas de Hoje (Geral)</p>
          <h3 className="text-3xl font-bold mt-2 text-yellow-400">{formatMoney(totals.todaySales)}</h3>
        </div>
        <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">
          <p className="text-xs uppercase text-gray-500">Lucro Acumulado (Geral)</p>
          <h3 className="text-3xl font-bold mt-2 text-green-400">{formatMoney(totals.totalProfit)}</h3>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-[#161A1F] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
        <MagnifyingGlass size={20} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Pesquisar por agente ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500 text-sm"
        />
      </div>

      {/* Tabela de Dados */}
      <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Agente</th>
                <th className="py-3 px-4 text-right">Hoje (V / L)</th>
                <th className="py-3 px-4 text-right">Ontem (V / L)</th>
                <th className="py-3 px-4 text-right">Semana (V / L)</th>
                <th className="py-3 px-4 text-right">Mês (V / L)</th>
                <th className="py-3 px-4 text-right">Ano (V / L)</th>
                <th className="py-3 px-4 text-right">Lucro Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Nenhum agente encontrado.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={32} className="text-blue-400" />
                        <div>
                          <p className="font-medium text-white">{item.agentName}</p>
                          <p className="text-xs text-gray-500">{item.agentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatMoney(item.metrics.today.sales)}</p>
                      <p className="text-xs text-green-400">+{formatMoney(item.metrics.today.profit)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatMoney(item.metrics.yesterday.sales)}</p>
                      <p className="text-xs text-green-400">+{formatMoney(item.metrics.yesterday.profit)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatMoney(item.metrics.week.sales)}</p>
                      <p className="text-xs text-green-400">+{formatMoney(item.metrics.week.profit)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatMoney(item.metrics.month.sales)}</p>
                      <p className="text-xs text-green-400">+{formatMoney(item.metrics.month.profit)}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-white">{formatMoney(item.metrics.year.sales)}</p>
                      <p className="text-xs text-green-400">+{formatMoney(item.metrics.year.profit)}</p>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-400">
                      {formatMoney(item.metrics.totalProfit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function formatMoney(value: number | undefined | null) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(Number(value ?? 0))
}