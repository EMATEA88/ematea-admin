import { useCallback, useEffect, useState } from "react"
import {
  CurrencyCircleDollar,
  TrendUp,
  CalendarBlank,
  Coins,
  Users,
  ChartBar
} from "@phosphor-icons/react"

import { AdminCommissionService } from "../../../services/admin-commission.service"

type DashboardResponse = {
  today: {
    sales: number
    profit: number
    commission: number
  }

  week: {
    sales: number
    profit: number
    commission: number
  }

  month: {
    sales: number
    profit: number
    commission: number
  }

  year: {
    sales: number
    profit: number
    commission: number
  }

  overview: {
    totalSales: number
    totalProfit: number
    totalCommission: number
  }

  commissions: {
    pending: number
    paid: number
    cancelled: number
  }
}

export default function AdminCommissionsPage() {

  const [loading, setLoading] =
    useState(true)

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null)

  const [history, setHistory] =
    useState<any[]>([])

  const [topAgents, setTopAgents] =
    useState<any[]>([])

  const [topSubAgents, setTopSubAgents] =
    useState<any[]>([])

  const load = useCallback(async () => {

    try {

      setLoading(true)

      const [

        dashboard,

        history,

        topAgents,

        topSubAgents

      ] = await Promise.all([

        AdminCommissionService.getDashboard(),

        AdminCommissionService.getHistory(),

        AdminCommissionService.getTopAgents(),

        AdminCommissionService.getTopSubAgents()

      ])

      setDashboard(dashboard)

      setHistory(history)

      setTopAgents(topAgents)

      setTopSubAgents(topSubAgents)

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)

    }

  }, [])

  useEffect(() => {

    load()

  }, [load])

  if (loading) {

    return (

      <div className="p-8">

        Carregando...

      </div>

    )

  }

  return (

    <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-8">

      <div>

        <h1 className="text-3xl font-bold">

          Comissões

        </h1>

        <p className="text-gray-500">

          Dashboard Administrativo

        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <Card
          title="Hoje"
          icon={<CalendarBlank size={24} />}
          value={dashboard?.today.commission}
        />

        <Card
          title="Semana"
          icon={<TrendUp size={24} />}
          value={dashboard?.week.commission}
        />

        <Card
          title="Mês"
          icon={<Coins size={24} />}
          value={dashboard?.month.commission}
        />

        <Card
          title="Ano"
          icon={<CurrencyCircleDollar size={24} />}
          value={dashboard?.year.commission}
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <Card
          title="Total Vendido"
          value={dashboard?.overview.totalSales}
          icon={<ChartBar size={24} />}
        />

        <Card
          title="Lucro"
          value={dashboard?.overview.totalProfit}
          icon={<TrendUp size={24} />}
        />

        <Card
          title="Comissões"
          value={dashboard?.overview.totalCommission}
          icon={<CurrencyCircleDollar size={24} />}
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <StatusCard
          title="Pendentes"
          value={dashboard?.commissions.pending}
        />

        <StatusCard
          title="Pagas"
          value={dashboard?.commissions.paid}
        />

        <StatusCard
          title="Canceladas"
          value={dashboard?.commissions.cancelled}
        />

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-[#161A1F] rounded-2xl p-6">

          <h2 className="font-bold mb-5">

            Top Agentes

          </h2>

          <div className="space-y-3">

            {topAgents.map((agent) => (

              <div
                key={agent.id}
                className="flex justify-between border-b border-white/5 pb-3"
              >

                <span>

                  {agent.user?.fullName}

                </span>

                <span>

                  {formatMoney(agent.totalSales)}

                </span>

              </div>

            ))}

          </div>

        </div>

        <div className="bg-[#161A1F] rounded-2xl p-6">

          <h2 className="font-bold mb-5">

            Top Sub-agentes

          </h2>

          <div className="space-y-3">

            {topSubAgents.map((item, index) => (

              <div
                key={index}
                className="flex justify-between border-b border-white/5 pb-3"
              >

                <span>

                  {item.user?.fullName}

                </span>

                <span>

                  {formatMoney(item.sales)}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

            <div className="bg-[#161A1F] rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <Users size={22} />

          <h2 className="text-lg font-bold">

            Histórico de Comissões

          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-white/10 text-left text-gray-400 text-sm">

                <th className="py-3">Data</th>

                <th>Agente</th>

                <th>Sub-agente</th>

                <th>Serviço</th>

                <th>Status</th>

                <th className="text-right">Comissão</th>

              </tr>

            </thead>

            <tbody>

              {history.map((item) => (

                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >

                  <td className="py-4">

                    {new Date(
                      item.createdAt
                    ).toLocaleDateString("pt-AO")}

                  </td>

                  <td>

                    {item.agent?.user?.fullName ?? "-"}

                  </td>

                  <td>

                    {item.subAgent?.user?.fullName ?? "-"}

                  </td>

                  <td>

                    {item.serviceRequest?.serviceName ?? "-"}

                  </td>

                  <td>

                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold

                      ${
                        item.status === "PAID"
                          ? "bg-green-500/20 text-green-400"

                        : item.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"

                        : "bg-red-500/20 text-red-400"

                      }`}
                    >

                      {item.status}

                    </span>

                  </td>

                  <td className="text-right font-semibold">

                    {formatMoney(item.amount)}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )

}

/* =======================================================
   COMPONENTES
======================================================= */

function Card({

  title,

  value,

  icon

}: any) {

  return (

    <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-xs uppercase text-gray-500">

            {title}

          </p>

          <h2 className="text-3xl font-bold mt-3">

            {formatMoney(value)}

          </h2>

        </div>

        <div>

          {icon}

        </div>

      </div>

    </div>

  )

}

function StatusCard({

  title,

  value

}: any) {

  return (

    <div className="bg-[#161A1F] rounded-2xl p-6 border border-white/5">

      <p className="text-gray-500 text-xs uppercase">

        {title}

      </p>

      <h2 className="text-4xl font-bold mt-4">

        {value}

      </h2>

    </div>

  )

}

function formatMoney(value: any) {

  return new Intl.NumberFormat(

    "pt-AO",

    {

      style: "currency",

      currency: "AOA"

    }

  ).format(Number(value ?? 0))

}