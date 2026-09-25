import { useCallback, useEffect, useState } from "react"
import {
  MagnifyingGlass,
  ArrowClockwise,
  ShieldCheck,
  UserCircle,
  Building
} from "@phosphor-icons/react"
import { toast } from "react-hot-toast"
import { AdminCommissionService } from "../../../services/admin-commission.service"

interface SubAgentReportItem {
  id: number
  subAgentName: string
  subAgentEmail: string
  supervisorName: string
  supervisorEmail: string
  metrics: {
    today: { sales: number; profit: number }
    yesterday: { sales: number; profit: number }
    week: { sales: number; profit: number }
    month: { sales: number; profit: number }
    year: { sales: number; profit: number }
    totalProfit: number
  }
}

export default function CommissionSubAgentsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubAgentReportItem[]>([])
  const [search, setSearch] = useState("")

  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      const response = await AdminCommissionService.getSubAgentsReport()

      setData(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar relatório de sub-agentes.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredData = data.filter(item =>
    item.subAgentName.toLowerCase().includes(search.toLowerCase()) ||
    item.supervisorName.toLowerCase().includes(search.toLowerCase()) ||
    item.subAgentEmail.toLowerCase().includes(search.toLowerCase())
  )

  const isEmatea = (item: SubAgentReportItem) =>
    item.supervisorName.toUpperCase().includes("EMATEA") ||
    !item.supervisorName

  const emateaData = filteredData.filter(isEmatea)

  const agentData = filteredData.filter(item => !isEmatea(item))

  const totals = filteredData.reduce(
    (acc, item) => {
      acc.todaySales += item.metrics.today.sales
      acc.monthSales += item.metrics.month.sales
      acc.totalProfit += item.metrics.totalProfit

      return acc
    },
    {
      todaySales: 0,
      monthSales: 0,
      totalProfit: 0
    }
  )

  const renderTable = (
    items: SubAgentReportItem[],
    type: "ematea" | "agent"
  ) => {
    const isEmateaSection = type === "ematea"

    return (
      <div
        className={
          isEmateaSection
            ? "bg-[#0E1B3D] rounded-[2rem] border border-blue-500/30 overflow-hidden shadow-xl"
            : "bg-[#161A1F] rounded-[2rem] border border-white/5 overflow-hidden shadow-xl"
        }
      >
        {/* Cabeçalho da seção */}
        <div
          className={
            isEmateaSection
              ? "px-6 py-5 bg-[#10234F] border-b border-blue-500/20"
              : "px-6 py-5 bg-[#181C21] border-b border-white/5"
          }
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                {isEmateaSection ? (
                  <Building
                    size={20}
                    weight="fill"
                    className="text-blue-400"
                  />
                ) : (
                  <ShieldCheck
                    size={20}
                    weight="fill"
                    className="text-gray-400"
                  />
                )}

                <h2 className="text-sm font-black uppercase tracking-wide text-white">
                  {isEmateaSection
                    ? "Sub-agentes da EMATEA"
                    : "Sub-agentes dos Agentes"}
                </h2>
              </div>

              <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 ml-8">
                {isEmateaSection
                  ? "Sub-agentes criados diretamente pela EMATEA"
                  : "Sub-agentes pertencentes à rede de agentes"}
              </p>
            </div>

            <div
              className={
                isEmateaSection
                  ? "px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black"
                  : "px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black"
              }
            >
              {items.length}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={
                  isEmateaSection
                    ? "border-b border-blue-500/20 text-blue-300/70 text-[10px] uppercase font-black tracking-widest"
                    : "border-b border-white/10 text-gray-500 text-[10px] uppercase font-black tracking-widest"
                }
              >
                <th className="py-4 px-4">Sub-agente</th>
                <th className="py-4 px-4">Supervisor (Hierarquia)</th>
                <th className="py-4 px-4 text-right">Hoje (V / L)</th>
                <th className="py-4 px-4 text-right">Ontem (V / L)</th>
                <th className="py-4 px-4 text-right">Semana (V / L)</th>
                <th className="py-4 px-4 text-right">Mês (V / L)</th>
                <th className="py-4 px-4 text-right">Ano (V / L)</th>
                <th className="py-4 px-4 text-right">Lucro Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-gray-500"
                  >
                    {isEmateaSection
                      ? "Nenhum sub-agente da EMATEA localizado."
                      : "Nenhum sub-agente de agente localizado."}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const itemIsEmatea = isEmatea(item)

                  return (
                    <tr
                      key={item.id}
                      className={
                        isEmateaSection
                          ? "hover:bg-blue-500/[0.04] transition"
                          : "hover:bg-white/[0.02] transition"
                      }
                    >
                      {/* Sub-agente */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <UserCircle size={20} weight="fill" />
                          </div>

                          <div>
                            <p className="font-bold text-white">
                              {item.subAgentName}
                            </p>

                            <p className="text-[11px] text-gray-500">
                              {item.subAgentEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Supervisor */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {itemIsEmatea ? (
                            <div
                              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"
                              title="Matriz EMATEA"
                            >
                              <Building size={20} weight="fill" />
                            </div>
                          ) : (
                            <div
                              className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400"
                              title="Agente Parceiro"
                            >
                              <ShieldCheck size={20} weight="fill" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-200">
                                {item.supervisorName || "EMATEA"}
                              </p>

                              {itemIsEmatea ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                  EMATEA
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  AGENTE
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500">
                              {item.supervisorEmail || "suporte@ematea.com"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Hoje */}
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-white">
                          {formatMoney(item.metrics.today.sales)}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-400">
                          +{formatMoney(item.metrics.today.profit)}
                        </p>
                      </td>

                      {/* Ontem */}
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-white">
                          {formatMoney(item.metrics.yesterday.sales)}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-400">
                          +{formatMoney(item.metrics.yesterday.profit)}
                        </p>
                      </td>

                      {/* Semana */}
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-white">
                          {formatMoney(item.metrics.week.sales)}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-400">
                          +{formatMoney(item.metrics.week.profit)}
                        </p>
                      </td>

                      {/* Mês */}
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-white">
                          {formatMoney(item.metrics.month.sales)}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-400">
                          +{formatMoney(item.metrics.month.profit)}
                        </p>
                      </td>

                      {/* Ano */}
                      <td className="py-4 px-4 text-right">
                        <p className="font-bold text-white">
                          {formatMoney(item.metrics.year.sales)}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-400">
                          +{formatMoney(item.metrics.year.profit)}
                        </p>
                      </td>

                      {/* Lucro Total */}
                      <td className="py-4 px-4 text-right font-black text-emerald-400 text-sm">
                        {formatMoney(item.metrics.totalProfit)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-8 max-w-[1600px] mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Sub-agentes & Supervisores
          </h1>

          <p className="text-gray-400 text-sm">
            Métricas completas de desempenho, vendas e lucros por período com
            distinção hierárquica.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          <ArrowClockwise
            size={16}
            className={`text-blue-400 ${loading ? "animate-spin" : ""}`}
          />

          Atualizar Dados
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161A1F] rounded-[2rem] p-6 border border-white/5 shadow-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
            Total de Sub-agentes
          </p>

          <h3 className="text-3xl font-black mt-2 text-blue-400">
            {filteredData.length}
          </h3>
        </div>

        <div className="bg-[#161A1F] rounded-[2rem] p-6 border border-white/5 shadow-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
            Vendas de Hoje (Geral)
          </p>

          <h3 className="text-3xl font-black mt-2 text-yellow-400">
            {formatMoney(totals.todaySales)}
          </h3>
        </div>

        <div className="bg-[#161A1F] rounded-[2rem] p-6 border border-white/5 shadow-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">
            Lucro Acumulado (Geral)
          </p>

          <h3 className="text-3xl font-black mt-2 text-green-400">
            {formatMoney(totals.totalProfit)}
          </h3>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-[#161A1F] p-4 rounded-2xl border border-white/5 flex items-center gap-3 shadow-xl">
        <MagnifyingGlass size={18} className="text-gray-400 ml-2" />

        <input
          type="text"
          placeholder="Pesquisar por sub-agente, e-mail ou supervisor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500 text-xs"
        />
      </div>

      {/* ========================= */}
      {/* SUB-AGENTES DA EMATEA */}
      {/* ========================= */}
      {renderTable(emateaData, "ematea")}

      {/* ========================= */}
      {/* SUB-AGENTES DOS AGENTES */}
      {/* ========================= */}
      {renderTable(agentData, "agent")}
    </div>
  )
}

function formatMoney(value: number | undefined | null) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(Number(value ?? 0))
}