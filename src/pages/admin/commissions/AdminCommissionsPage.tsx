import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  CurrencyCircleDollar,
  TrendUp,
  CalendarBlank,
  Coins,
  Users,
  ArrowClockwise
} from "@phosphor-icons/react"
import { toast } from "react-hot-toast"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

import { AdminCommissionService } from "../../../services/admin-commission.service"

/* =======================================================
   TIPOS E INTERFACES
======================================================= */

type PeriodStats = {
  sales: number
  profit: number
  commission: number
  requests?: number
  averageTicket?: number
}

type DashboardResponse = {
  overview: {
    totalSales: number
    totalProfit: number
    totalCommission: number
    averageProfit: number
  }
  today: PeriodStats
  week: PeriodStats
  month: PeriodStats
  year: PeriodStats
  commissions: {
    pending: number
    paid: number
    cancelled: number
  }
}

interface CommissionHistory {
  id: number
  createdAt: string
  amount: number
  profit: number
  status: string
  agent?: {
    user?: {
      fullName: string
    }
  }
  subAgent?: {
    user?: {
      fullName: string
    }
  }
  serviceRequest?: {
    serviceName: string
    providerName?: string
    amount: number
    profit: number
  }
}

interface TopAgent {
  agent?: {
    user?: {
      fullName: string
    }
  }
  sales: number
  profit: number
  commission: number
  requests: number
}

interface TopSubAgent {
  user?: {
    fullName: string
  }
  sales: number
  profit: number
  commission?: number
  requests: number
}

interface Charts {
  sales: any[]
  commissions: any[]
}

const STATUS: Record<string, { label: string; icon: string }> = {
  PAID: { label: "Pago", icon: "🟢" },
  PENDING: { label: "Pendente", icon: "🟡" },
  CANCELLED: { label: "Cancelada", icon: "🔴" }
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function AdminCommissionsPage() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [history, setHistory] = useState<CommissionHistory[]>([])
  const [topAgents, setTopAgents] = useState<TopAgent[]>([])
  const [topSubAgents, setTopSubAgents] = useState<TopSubAgent[]>([])
  const [charts, setCharts] = useState<Charts | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)

      const [
        dashboardData,
        historyData,
        topAgentsData,
        topSubAgentsData,
        chartsData
      ] = await Promise.all([
        AdminCommissionService.getDashboard(),
        AdminCommissionService.getHistory(),
        AdminCommissionService.getTopAgents(),
        AdminCommissionService.getTopSubAgents(),
        AdminCommissionService.getCharts()
      ])

      setDashboard(dashboardData)
      setHistory(historyData)
      setTopAgents(topAgentsData)
      setTopSubAgents(topSubAgentsData)
      setCharts(chartsData)
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar dados do dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        load()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [load])

  const handleRefresh = async () => {
    await load()
    toast.success("Dados atualizados.")
  }

  const commissionChart =
    charts?.commissions?.map(item => ({
      name: item.status,
      value: item._sum.amount
    })) ?? [];

  if (loading && !dashboard) {
    return (
      <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-8 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-white/5 rounded w-1/6 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="h-32 bg-[#161A1F] rounded-2xl"></div>
          <div className="h-32 bg-[#161A1F] rounded-2xl"></div>
          <div className="h-32 bg-[#161A1F] rounded-2xl"></div>
          <div className="h-32 bg-[#161A1F] rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comissões</h1>
          <p className="text-gray-500">Dashboard Administrativo</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center gap-2 bg-[#161A1F] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <ArrowClockwise size={18} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Faixa de Resumo Geral */}
      <div className="bg-gradient-to-r from-blue-900/40 via-[#161A1F] to-[#161A1F] border border-blue-500/20 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <p className="text-xs uppercase text-gray-400">Total de Vendas</p>
          <h3 className="text-2xl font-bold mt-1">
            {formatMoney(dashboard?.overview.totalSales)}
          </h3>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Lucro Total</p>
          <h3 className="text-2xl font-bold mt-1 text-green-400">
            {formatMoney(dashboard?.overview.totalProfit)}
          </h3>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Comissão EMATEA</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-400">
            {formatMoney((dashboard?.overview.totalProfit ?? 0) - (dashboard?.overview.totalCommission ?? 0))}
          </h3>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400">Comissão Agentes</p>
          <h3 className="text-2xl font-bold mt-1 text-yellow-400">
            {formatMoney(dashboard?.overview.totalCommission)}
          </h3>
        </div>
      </div>

      {/* Cards de Período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <PeriodCard
          title="Hoje"
          icon={<CalendarBlank size={24} />}
          stat={dashboard?.today}
        />
        <PeriodCard
          title="Semana"
          icon={<TrendUp size={24} />}
          stat={dashboard?.week}
        />
        <PeriodCard
          title="Mês"
          icon={<Coins size={24} />}
          stat={dashboard?.month}
        />
        <PeriodCard
          title="Ano"
          icon={<CurrencyCircleDollar size={24} />}
          stat={dashboard?.year}
        />
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatusCard
          title="Pendentes"
          value={dashboard?.commissions.pending ?? 0}
        />
        <StatusCard
          title="Pagas"
          value={dashboard?.commissions.paid ?? 0}
        />
        <StatusCard
          title="Canceladas"
          value={dashboard?.commissions.cancelled ?? 0}
        />
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <h2 className="font-bold mb-4">Evolução Diária de Vendas (30 dias)</h2>
          <div className="w-full h-[220px] min-h-[220px]">
            {charts?.sales && charts.sales.length > 0 ? (
             <ResponsiveContainer
  width="100%"
  height={220}
>
                <LineChart data={charts.sales}>
                  <XAxis
                    dataKey="createdAt"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("pt-AO", {
                        day: "2-digit",
                        month: "2-digit"
                      })
                    }
                  />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#161A1F", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    formatter={(value: any) => [formatMoney(Number(value)), "Valor vendido"]}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400 flex items-center justify-center h-full bg-white/[0.02] rounded-xl border border-white/5">
                Sem dados para o período
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
          <h2 className="font-bold mb-4">Distribuição de Comissões</h2>
          <div className="h-48 w-full flex items-center justify-center">
            {commissionChart && commissionChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commissionChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {commissionChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#161A1F", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400 flex items-center justify-center w-full h-full bg-white/[0.02] rounded-xl border border-white/5">
                Sem dados de comissões
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Agentes & Sub-agentes */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-[#161A1F] rounded-2xl p-6">
          <h2 className="font-bold mb-5">Top Agentes</h2>
          <div className="space-y-3">
            {topAgents.map((agent, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-white/5 pb-3"
              >
                <div>
                  <p className="font-medium">{agent.agent?.user?.fullName ?? "Desconhecido"}</p>
                  <p className="text-xs text-gray-500">{agent.requests} vendas</p>
                  <p className="text-xs text-gray-500">
                    Lucro: {formatMoney(agent.profit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">
                    {formatMoney(agent.sales)}
                  </p>
                  <p className="text-xs text-blue-400">
                    Comissão: {formatMoney(agent.commission)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161A1F] rounded-2xl p-6">
          <h2 className="font-bold mb-5">Top Sub-agentes</h2>
          <div className="space-y-3">
            {topSubAgents.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-white/5 pb-3"
              >
                <div>
                  <p className="font-medium">{item.user?.fullName ?? "Desconhecido"}</p>
                  <p className="text-xs text-gray-500">{item.requests} solicitações</p>
                  <p className="text-xs text-gray-500">
                    Lucro: {formatMoney(item.profit)}
                  </p>
                </div>
                <span className="font-semibold text-green-400">
                  {formatMoney(item.sales)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Histórico de Comissões */}
      <div className="bg-[#161A1F] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users size={22} />
          <h2 className="text-lg font-bold">Histórico de Comissões</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400 text-sm">
                <th className="py-3">Data</th>
                <th>Agente</th>
                <th>Serviço</th>
                <th>Operadora</th>
                <th className="text-right">Venda</th>
                <th className="text-right">Lucro</th>
                <th className="text-right">Comissão</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    Nenhuma comissão encontrada.
                  </td>
                </tr>
              )}
              {history.map((item) => {
                const statusInfo = STATUS[item.status] || { label: item.status, icon: "⚪" }
                return (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 hover:bg-white/5 transition text-sm"
                  >
                    <td className="py-4 text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString("pt-AO")}
                    </td>
                    <td className="font-medium">
                      {item.agent?.user?.fullName ?? item.subAgent?.user?.fullName ?? "-"}
                    </td>
                    <td className="text-gray-300">
                      {item.serviceRequest?.serviceName ?? "-"}
                    </td>
                    <td className="text-gray-300">
                      {item.serviceRequest?.providerName ?? "-"}
                    </td>
                    <td className="text-right text-gray-300">
                      {formatMoney(item.serviceRequest?.amount ?? 0)}
                    </td>
                    <td className="text-right text-gray-300">
                      {formatMoney(item.serviceRequest?.profit ?? 0)}
                    </td>
                    <td className="text-right font-semibold text-green-400">
                      {formatMoney(item.amount)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                          item.status === "PAID"
                            ? "bg-green-500/20 text-green-400"
                            : item.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* =======================================================
   COMPONENTES AUXILIARES
======================================================= */

interface PeriodCardProps {
  title: string
  stat?: PeriodStats
  icon: ReactNode
}

function PeriodCard({ title, stat, icon }: PeriodCardProps) {
  return (
    <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs uppercase text-gray-500">{title}</p>
          <h2 className="text-2xl font-bold mt-3">{formatMoney(stat?.commission ?? 0)}</h2>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-white/5 flex justify-between">
        <span>Lucro: {formatMoney(stat?.profit ?? 0)}</span>
        <span className="text-gray-400">{stat?.requests ?? 0} vendas</span>
      </p>
    </div>
  )
}

interface StatusCardProps {
  title: string
  value: number
}

function StatusCard({ title, value }: StatusCardProps) {
  return (
    <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">
      <p className="text-gray-500 text-xs uppercase">{title}</p>
      <h2 className="text-4xl font-bold mt-4">{value}</h2>
    </div>
  )
}

function formatMoney(value: number | undefined | null) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(Number(value ?? 0))
}