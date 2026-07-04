import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Pencil,
  ShieldCheck,
  ShieldX,
  KeyRound,
  Building2,
  UserCircle2,
  Phone,
  Mail
} from "lucide-react"
import CreateSubAgentModal from "../../components/admin/subagents/CreateSubAgentModal"
import SubAgentDetailsModal from "../../components/admin/subagents/SubAgentDetailsModal"
import EditSubAgentModal from "../../components/admin/subagents/EditSubAgentModal"
import ResetPinModal from "../../components/admin/subagents/ResetPinModal"

import AdminSubAgentService, {
  type SubAgent
} from "../../services/adminSubAgent.service"

export default function SubAgentsManager() {
  // ================= STATES =================
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [subAgents, setSubAgents] = useState<SubAgent[]>([])
  const [selected, setSelected] = useState<SubAgent | null>(null)
  
  const [showCreate, setShowCreate] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showResetPin, setShowResetPin] = useState(false)

  // ================= LOAD DATA =================
  async function load() {
    try {
      setLoading(true)
      const data = await AdminSubAgentService.getAll()
      setSubAgents(data)
    } catch {
      toast.error("Erro ao carregar Sub-Agentes.")
    } finally {
      setLoading(false)
    }
  }

  async function openDetails(
  id: number
) {

  try {

    const data =
      await AdminSubAgentService.getById(id)

    setSelected(data)

    setShowDetails(true)

  }

  catch {

    toast.error(
      "Erro ao carregar detalhes."
    )

  }

}

async function openEdit(id: number) {
  try {
    const data = await AdminSubAgentService.getById(id)

    setSelected(data)

    setShowEdit(true)
  } catch {
    toast.error("Não foi possível carregar o Sub-Agente.")
  }
}

async function openResetPin(id: number) {

  try {

    const data =
      await AdminSubAgentService.getById(id)

    setSelected(data)

    setShowResetPin(true)

  } catch {

    toast.error(
      "Não foi possível carregar o Sub-Agente."
    )

  }

}

  // ================= EFFECT =================
  useEffect(() => {
    load()
  }, [])

  // ================= PESQUISA (MEMO) =================
  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return subAgents.filter(item =>
      item.user.fullName.toLowerCase().includes(term) ||
      item.user.phone.includes(term) ||
      item.user.email.toLowerCase().includes(term) ||
      item.employeeCode.toLowerCase().includes(term) ||
      (item.workstation ?? "").toLowerCase().includes(term)
    )
  }, [search, subAgents])

  // ================= CARDS STATS =================
  const total = subAgents.length
  const active = subAgents.filter(i => i.isActive).length
  const inactive = total - active
  const workstations = new Set(
    subAgents.map(i => i.workstation).filter(Boolean)
  ).size

  // ================= ACTIONS =================
  async function activate(id: number) {
    try {
      await AdminSubAgentService.activate(id)
      toast.success("Sub-Agente ativado.")
      load()
    } catch {
      toast.error("Erro ao ativar sub-agente.")
    }
  }

  async function deactivate(id: number) {
    try {
      await AdminSubAgentService.deactivate(id)
      toast.success("Sub-Agente desativado.")
      load()
    } catch {
      toast.error("Erro ao desativar sub-agente.")
    }
  }

  // ================= STRUCTURE JSX =================
  return (

<div className="space-y-6">

    <CreateSubAgentModal

  open={showCreate}

  onClose={() => setShowCreate(false)}

  onSuccess={load}

/>

  {/* =====================================================
      HEADER
  ===================================================== */}

  <div className="flex items-center justify-between">

    <div>

      <h1 className="text-3xl font-bold">
        Sub-Agentes
      </h1>

      <p className="text-gray-500 mt-1">
        Gestão dos vendedores internos da EMATEA.
      </p>

    </div>

    <button
      onClick={() => setShowCreate(true)}
      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
    >

      <UserPlus size={18} />

      Novo Sub-Agente

    </button>

  </div>

       <SubAgentDetailsModal

  open={showDetails}

  subAgent={selected}

  onClose={() => {

    setShowDetails(false)

    setSelected(null)

  }}

/>

<EditSubAgentModal
  open={showEdit}
  subAgent={selected}
  onClose={() => {
    setShowEdit(false)
    setSelected(null)
  }}
  onSuccess={() => {
    load()
    setShowEdit(false)
    setSelected(null)
  }}
/>

<ResetPinModal
  open={showResetPin}
  subAgent={selected}
  onClose={() => {

    setShowResetPin(false)

    setSelected(null)

  }}
  onSuccess={() => {

    setShowResetPin(false)

    setSelected(null)

    load()

  }}
/>

  {/* =====================================================
      STATISTICS
  ===================================================== */}

  <div className="grid grid-cols-4 gap-5">

    <StatCard
      title="Total"
      value={total}
      icon={<Users size={22} />}
    />

    <StatCard
      title="Ativos"
      value={active}
      icon={<ShieldCheck size={22} />}
    />

    <StatCard
      title="Desativados"
      value={inactive}
      icon={<ShieldX size={22} />}
    />

    <StatCard
      title="Postos"
      value={workstations}
      icon={<Building2 size={22} />}
    />

  </div>

  {/* =====================================================
      SEARCH
  ===================================================== */}

  <div className="flex justify-between items-center">

    <div className="relative w-[420px]">

      <Search
        size={18}
        className="absolute left-3 top-3 text-gray-400"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar por nome, telefone, email ou código..."
        className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 outline-none focus:border-blue-500"
      />

    </div>

  </div>

  {/* =====================================================
      TABLE
  ===================================================== */}

  <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

    <table className="w-full">

      <thead className="bg-slate-50">

        <tr className="text-left">

          <th className="px-5 py-4">
            Funcionário
          </th>

          <th>
            Código
          </th>

          <th>
            Contacto
          </th>

          <th>
            Posto
          </th>

          <th>
            Cargo
          </th>

          <th>
            Supervisor
          </th>

          <th>
            Estado
          </th>

          <th className="text-center">
            Ações
          </th>

        </tr>

      </thead>

      <tbody>

        {loading && (

          <tr>

            <td
              colSpan={8}
              className="p-12 text-center text-gray-500"
            >

              Carregando...

            </td>

          </tr>

        )}

        {!loading && filtered.length === 0 && (

          <tr>

            <td
              colSpan={8}
              className="p-12 text-center text-gray-400"
            >

              Nenhum Sub-Agente encontrado.

            </td>

          </tr>

        )}

        {!loading &&
          filtered.map(sub => (

          <tr
            key={sub.id}
            className="border-t hover:bg-gray-50"
          >

            <td className="px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="rounded-full bg-slate-100 p-2">

                  <UserCircle2 size={20} />

                </div>

                <div>

                  <div className="font-semibold">

                    {sub.user.fullName}

                  </div>

                  <div className="text-xs text-gray-500">

                    ID #{sub.user.publicId}

                  </div>

                </div>

              </div>

            </td>

            <td>

              {sub.employeeCode}

            </td>

            <td>

              <div className="space-y-1">

                <div className="flex items-center gap-2">

                  <Phone size={14} />

                  {sub.user.phone}

                </div>

                <div className="flex items-center gap-2">

                  <Mail size={14} />

                  {sub.user.email}

                </div>

              </div>

            </td>

            <td>

              {sub.workstation ?? "-"}

            </td>

            <td>

              {sub.position ?? "-"}

            </td>

            <td>

              {sub.supervisor?.fullName ?? "-"}

            </td>

            <td>

              {sub.isActive ? (

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                  Ativo

                </span>

              ) : (

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">

                  Desativado

                </span>

              )}

            </td>

            <td>

              <div className="flex justify-center gap-2">

                <button
                  onClick={() => openDetails(sub.id)}
                  className="rounded-lg bg-slate-700 p-2 text-white hover:bg-slate-800"
                >
                  <Eye size={17} />
               </button>

                <button
  onClick={() => openEdit(sub.id)}
  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
>
  <Pencil size={17} />
</button>

                {sub.isActive ? (

                  <button
                    onClick={()=>deactivate(sub.id)}
                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                  >
                    <ShieldX size={17}/>
                  </button>

                ) : (

                  <button
                    onClick={()=>activate(sub.id)}
                    className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700"
                  >
                    <ShieldCheck size={17}/>
                  </button>

                )}

                <button
  onClick={() => openResetPin(sub.id)}
  className="rounded-lg bg-amber-500 p-2 text-white hover:bg-amber-600"
>
  <KeyRound size={17} />
</button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

)

function StatCard({
  title,
  value,
  icon
}: any) {

  return (

    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">

          {icon}

        </div>

      </div>

    </div>

  )

}
}