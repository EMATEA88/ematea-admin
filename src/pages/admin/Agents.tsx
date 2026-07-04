import { useEffect, useState } from "react"
import {
  CheckCircle,
  Clock3,
  Search,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react"

// 1. Novos imports adicionados
import toast from "react-hot-toast"
import {
  Check,
  Eye,
  Ban,
  PlayCircle,
  X
} from "lucide-react"

import { AdminService } from "../../services/admin.service"

type Status =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED"

interface Agent {

  id: number

  userId: number

  companyName?: string | null

  agentCode: string

  commissionBalance: number

  totalSales: number

  totalCommission: number

  status: Status

  isActive: boolean

  createdAt: string

  user: {

    id: number

    publicId: string

    fullName: string

    email: string

    phone: string

    balance: number

    isBlocked: boolean

    isAgentApproved: boolean

  }

}

export default function Agents() {

  const [loading, setLoading] = useState(true)

  const [status, setStatus] =
    useState<Status | undefined>()

  const [search, setSearch] =
    useState("")

  const [agents, setAgents] =
    useState<Agent[]>([])

  async function loadAgents() {

    try {

      setLoading(true)

      const response =
        await AdminService.agents({
          status,
          search
        })

      setAgents(
        response.data ??
        response ??
        []
      )

    } finally {

      setLoading(false)

    }

  }

  // 2. Novas funções adicionadas para ações de alteração de estado do agente
  async function approve(id: number) {
    try {
      await AdminService.approveAgent(id)
      toast.success("Agente aprovado.")
      loadAgents()
    } catch {
      toast.error("Erro ao aprovar.")
    }
  }

  async function reject(id: number) {
    const reason = window.prompt("Motivo da rejeição:")
    if (!reason) return

    try {
      await AdminService.rejectAgent(id, reason)
      toast.success("Agente rejeitado.")
      loadAgents()
    } catch {
      toast.error("Erro.")
    }
  }

  async function suspend(id: number) {
    const reason = window.prompt("Motivo da suspensão:")
    if (!reason) return

    try {
      await AdminService.suspendAgent(id, reason)
      toast.success("Agente suspenso.")
      loadAgents()
    } catch {
      toast.error("Erro.")
    }
  }

  async function activate(id: number) {
    try {
      await AdminService.activateAgent(id)
      toast.success("Agente reativado.")
      loadAgents()
    } catch {
      toast.error("Erro.")
    }
  }

  useEffect(() => {

    loadAgents()

  }, [status])

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Gestão de Agentes
          </h1>

          <p className="text-gray-500 text-sm">
            Aprovação e gestão dos agentes EMATEA
          </p>

        </div>

      </div>

      <div className="flex gap-3">

        <div className="relative w-80">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="pl-10 h-11 w-full rounded-xl border"
          />

        </div>

      </div>

      <div className="flex gap-2 flex-wrap">

        <FilterButton
          active={!status}
          onClick={()=>setStatus(undefined)}
          icon={<Users size={17}/>}
        >
          Todos
        </FilterButton>

        <FilterButton
          active={status==="PENDING"}
          onClick={()=>setStatus("PENDING")}
          icon={<Clock3 size={17}/>}
        >
          Pendentes
        </FilterButton>

        <FilterButton
          active={status==="APPROVED"}
          onClick={()=>setStatus("APPROVED")}
          icon={<CheckCircle size={17}/>}
        >
          Aprovados
        </FilterButton>

        <FilterButton
          active={status==="REJECTED"}
          onClick={()=>setStatus("REJECTED")}
          icon={<XCircle size={17}/>}
        >
          Rejeitados
        </FilterButton>

        <FilterButton
          active={status==="SUSPENDED"}
          onClick={()=>setStatus("SUSPENDED")}
          icon={<ShieldAlert size={17}/>}
        >
          Suspensos
        </FilterButton>

      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr className="text-left text-sm">

              <th className="p-4">
                Agente
              </th>

              <th>
                Código
              </th>

              <th>
                Empresa
              </th>

              <th>
                Comissão
              </th>

              <th>
                Status
              </th>

              <th>
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={6}
                  className="p-10 text-center"
                >
                  Carregando...
                </td>

              </tr>

            )}

            {!loading &&
              agents.map(agent=>(

              <tr
                key={agent.id}
                className="border-t"
              >

                <td className="p-4">

                  <div>

                    <div className="font-semibold">

                      {agent.user.fullName}

                    </div>

                    <div className="text-sm text-gray-500">

                      {agent.user.email}

                    </div>

                  </div>

                </td>

                <td>

                  {agent.agentCode}

                </td>

                <td>

                  {agent.companyName ?? "-"}

                </td>

                <td>

                  {agent.commissionBalance.toLocaleString()} Kz

                </td>

                <td>

                  <StatusBadge
                    status={agent.status}
                  />

                </td>

                <td>

                  {/* 3. Coluna de Ações substituída pelo novo painel de botões */}
                  <div className="flex gap-2">

                    <button
                      className="rounded-lg bg-slate-700 p-2 text-white"
                    >
                      <Eye size={17}/>
                    </button>

                    {agent.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => approve(agent.id)}
                          className="rounded-lg bg-green-600 p-2 text-white"
                        >
                          <Check size={17}/>
                        </button>

                        <button
                          onClick={() => reject(agent.id)}
                          className="rounded-lg bg-red-600 p-2 text-white"
                        >
                          <X size={17}/>
                        </button>
                      </>
                    )}

                    {agent.status === "APPROVED" && (
                      <button
                        onClick={() => suspend(agent.id)}
                        className="rounded-lg bg-yellow-500 p-2 text-white"
                      >
                        <Ban size={17}/>
                      </button>
                    )}

                    {agent.status === "SUSPENDED" && (
                      <button
                        onClick={() => activate(agent.id)}
                        className="rounded-lg bg-blue-600 p-2 text-white"
                      >
                        <PlayCircle size={17}/>
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

function FilterButton({
  active,
  children,
  icon,
  onClick
}:any){

  return(

    <button

      onClick={onClick}

      className={`flex items-center gap-2 rounded-xl px-4 py-2 border transition

      ${active
      ?"bg-blue-600 text-white border-blue-600"
      :"bg-white hover:bg-gray-100"
      }`}

    >

      {icon}

      {children}

    </button>

  )

}

function StatusBadge({
  status
}:{
  status:Status
}){

  const map={

    PENDING:"bg-yellow-100 text-yellow-700",

    APPROVED:"bg-green-100 text-green-700",

    REJECTED:"bg-red-100 text-red-700",

    SUSPENDED:"bg-gray-200 text-gray-700"

  }

  return(

    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >

      {status}

    </span>

  )

}