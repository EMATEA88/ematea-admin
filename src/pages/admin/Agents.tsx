import { useEffect, useState } from "react"
import { 
  CheckCircle,
  Clock3,
  Search,
  ShieldAlert,
  Users,
  XCircle,
  Eye,
  Ban,
  Plus,
  Pencil,
  Key,
  RotateCw
} from "lucide-react"
import toast from "react-hot-toast"

import AdminAgentService, { type Agent } from "../../services/adminAgent.service"
import CreateAgentModal from "../../components/admin/agents/CreateAgentModal"
import { AgentDetailsModal } from "../../components/admin/agents/AgentDetailsModal"
import { EditAgentModal } from "../../components/admin/agents/EditAgentModal"
import { ResetAgentPinModal } from "../../components/admin/agents/ResetAgentPinModal"

type Status = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"

export default function Agents() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<Status | undefined>()
  const [search, setSearch] = useState("")
  
  const [allAgents, setAllAgents] = useState<Agent[]>([])      // <-- Guarda todos os dados crus da API
  const [agents, setAgents] = useState<Agent[]>([])             // <-- Dados filtrados para exibição
  
  // Estados de controlo dos Modais
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [openDetailsModal, setOpenDetailsModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openPinModal, setOpenPinModal] = useState(false)

  // 1. Carrega os dados brutos da API apenas uma vez ou ao atualizar
  async function loadAgents() {
    try {
      setLoading(true)
      const response = await AdminAgentService.getAll()
      const dataList = Array.isArray(response) ? response : []
      setAllAgents(dataList)
    } catch {
      toast.error("Erro ao carregar lista de agentes.")
    } finally {
      setLoading(false)
    }
  }

  // 2. Sempre que mudar o estado (abas), a pesquisa ou a lista bruta, filtramos localmente sem perder dados
  useEffect(() => {
    let filtered = [...allAgents]

    if (status) {
      filtered = filtered.filter(a => a.status === status)
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      filtered = filtered.filter(a => 
        a.user?.fullName?.toLowerCase().includes(query) ||
        a.agentCode?.toLowerCase().includes(query) ||
        a.user?.email?.toLowerCase().includes(query)
      )
    }

    setAgents(filtered)
  }, [status, search, allAgents])

  useEffect(() => {
    loadAgents()
  }, [])

  // Ação de Alternar Bloqueio
  async function handleToggleBlock(id: number) {
    try {
      await AdminAgentService.toggleBlock(id)
      toast.success("Estado de bloqueio atualizado!")
      loadAgents()
    } catch {
      toast.error("Erro ao alterar estado da conta.")
    }
  }

  // Ação de Aprovar Agente Pendente
  async function handleApprove(id: number) {
    try {
      await AdminAgentService.approveAgent(id)
      toast.success("Agente aprovado com sucesso!")
      loadAgents()
    } catch {
      toast.error("Erro ao aprovar agente.")
    }
  }

  // Ação de Rejeitar Agente Pendente
  async function handleReject(id: number) {
    try {
      await AdminAgentService.rejectAgent(id)
      toast.success("Agente rejeitado.")
      loadAgents()
    } catch {
      toast.error("Erro ao rejeitar agente.")
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans antialiased text-[#EAECEF]">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase font-mono">
            Gestão de Agentes
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            Controle, alteração, bloqueio e monitoramento dos agentes EMATEA
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* BOTÃO DE ATUALIZAR */}
          <button
            onClick={loadAgents}
            disabled={loading}
            title="Atualizar Lista"
            className="flex items-center justify-center bg-[#161A1E] hover:bg-white/[0.06] text-gray-300 border border-white/[0.04] p-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <RotateCw size={15} className={`transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setOpenCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={3} />
            Novo Agente
          </button>
        </div>
      </div>

      {/* ================= FILTERS & CONTROLS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, código ou email..."
            className="h-10 w-full rounded-xl bg-[#161A1E]/80 border border-white/[0.04] pl-10 pr-4 text-xs font-medium text-white placeholder:text-gray-600 outline-none focus:border-cyan-500/40 focus:bg-[#161A1E] transition-all"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap bg-[#161A1E] p-1 rounded-xl border border-white/[0.03]">
          <FilterButton active={!status} onClick={() => setStatus(undefined)} icon={<Users size={14} />}>
            Todos
          </FilterButton>
          <FilterButton active={status === "PENDING"} onClick={() => setStatus("PENDING")} icon={<Clock3 size={14} />}>
            Pendentes
          </FilterButton>
          <FilterButton active={status === "APPROVED"} onClick={() => setStatus("APPROVED")} icon={<CheckCircle size={14} />}>
            Aprovados
          </FilterButton>
          <FilterButton active={status === "REJECTED"} onClick={() => setStatus("REJECTED")} icon={<XCircle size={14} />}>
            Rejeitados
          </FilterButton>
          <FilterButton active={status === "SUSPENDED"} onClick={() => setStatus("SUSPENDED")} icon={<ShieldAlert size={14} />}>
            Suspensos
          </FilterButton>
        </div>
      </div>

      {/* ================= DATA GRID / TABLE ================= */}
      <div className="bg-[#161A1E] rounded-[2rem] border border-white/[0.04] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.03] bg-[#111418]/60 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4.5">Funcionário</th>
                <th className="px-4 py-4.5 font-mono">Código</th>
                <th className="px-4 py-4.5">Contactos</th>
                <th className="px-4 py-4.5">Saldo Principal</th>
                <th className="px-4 py-4.5 text-center">Estado</th>
                <th className="px-6 py-4.5 text-center">Ações de Conta</th>
              </tr>
            </thead>

            <tbody className="text-xs font-medium divide-y divide-white/[0.02]">
              {loading && allAgents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-500 font-mono text-[11px] uppercase tracking-wider">
                    Carregando registros de agentes...
                  </td>
                </tr>
              )}

              {!loading && agents.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-600 font-mono text-[11px] uppercase tracking-wider">
                    Nenhum agente localizado nesta categoria.
                  </td>
                </tr>
              )}

              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-white/[0.01] transition-colors group">
                  
                  {/* COMPONENTE NOME */}
                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <span className="font-bold text-white block capitalize truncate">
                        {agent.user?.fullName?.toLowerCase()}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 block">
                        REF #{agent.id}
                      </span>
                    </div>
                  </td>

                  {/* CÓDIGO DO AGENTE */}
                  <td className="px-4 py-4 font-mono text-gray-400 text-[11px]">
                    {agent.agentCode || "SEM CÓDIGO"}
                  </td>

                  {/* CONTACTOS */}
                  <td className="px-4 py-4 text-gray-300">
                    <div className="text-[11px]">{agent.user?.phone}</div>
                    <div className="text-[10px] text-gray-500">{agent.user?.email || "-"}</div>
                  </td>

                  {/* SALDO PRINCIPAL */}
                  <td className="px-4 py-4 font-mono text-white font-bold">
                    {(agent.user?.balance || 0).toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz
                  </td>

                  {/* BADGE DE ESTADO */}
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
                      agent.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      agent.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      agent.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {agent.status}
                    </span>
                  </td>

                  {/* GRID DE MICRO-AÇÕES */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {agent.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(agent.id)}
                            title="Aprovar Agente"
                            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            onClick={() => handleReject(agent.id)}
                            title="Rejeitar Agente"
                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black transition-all"
                          >
                            <XCircle size={13} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedAgent(agent)
                          setOpenDetailsModal(true)
                        }}
                        title="Visualizar Detalhes"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAgent(agent)
                          setOpenEditModal(true)
                        }}
                        title="Editar Agente"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                      >
                        <Pencil size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleBlock(agent.id)}
                        title={agent.user?.isBlocked ? "Desbloquear Conta" : "Bloquear Conta"}
                        className={`p-2 rounded-lg border transition-all ${
                          agent.user?.isBlocked
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black"
                        }`}
                      >
                        <Ban size={13} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAgent(agent)
                          setOpenPinModal(true)
                        }}
                        title="Redefinir PIN de Acesso"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                      >
                        <Key size={13} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAIS ================= */}
      <CreateAgentModal 
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={loadAgents}
      />

      <AgentDetailsModal 
        agent={selectedAgent}
        isOpen={openDetailsModal}
        onClose={() => {
          setOpenDetailsModal(false)
          setSelectedAgent(null)
        }}
      />

      <EditAgentModal 
        agent={selectedAgent}
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false)
          setSelectedAgent(null)
        }}
        onSuccess={loadAgents}
      />

      <ResetAgentPinModal 
        agent={selectedAgent}
        isOpen={openPinModal}
        onClose={() => {
          setOpenPinModal(false)
          setSelectedAgent(null)
        }}
      />

    </div>
  )
}

function FilterButton({ active, children, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-150
      ${active
        ? "bg-white/[0.06] text-white shadow-sm border border-white/[0.05]"
        : "text-gray-500 hover:text-gray-300 border border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}