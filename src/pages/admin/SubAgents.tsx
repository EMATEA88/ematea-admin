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
  Mail,
  SlidersHorizontal
} from "lucide-react"
import CreateSubAgentModal from "../../components/admin/subagents/CreateSubAgentModal"
import SubAgentDetailsModal from "../../components/admin/subagents/SubAgentDetailsModal"
import EditSubAgentModal from "../../components/admin/subagents/EditSubAgentModal"
import ResetPinModal from "../../components/admin/subagents/ResetPinModal"

import AdminSubAgentService, {
  type SubAgent
} from "../../services/adminSubAgent.service"

type SubAgentType = "ALL" | "INTERNAL" | "AGENT_FIELD"

export default function SubAgentsManager() {
  // ================= STATES =================
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeType, setActiveType] = useState<SubAgentType>("ALL")
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
      setSubAgents(data || [])
    } catch {
      toast.error("Erro ao carregar Sub-Agentes.")
    } finally {
      setLoading(false)
    }
  }

  async function openDetails(id: number) {
    try {
      const data = await AdminSubAgentService.getById(id)
      setSelected(data)
      setShowDetails(true)
    } catch {
      toast.error("Erro ao carregar detalhes.")
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
      const data = await AdminSubAgentService.getById(id)
      setSelected(data)
      setShowResetPin(true)
    } catch {
      toast.error("Não foi possível carregar o Sub-Agente.")
    }
  }

  // ================= EFFECT =================
  useEffect(() => {
    load()
  }, [])

  // ================= PESQUISA E FILTRAGEM (MEMO) =================
  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    
    // 1. Filtrar primeiro por Texto de Pesquisa
    let result = subAgents.filter(item =>
      item.user.fullName.toLowerCase().includes(term) ||
      item.user.phone.includes(term) ||
      item.user.email.toLowerCase().includes(term) ||
      item.employeeCode.toLowerCase().includes(term) ||
      (item.workstation ?? "").toLowerCase().includes(term)
    )

    // 2. Filtrar pelo Tipo selecionado nas Abas
    if (activeType === "INTERNAL") {
      // Sem supervisor ou agente associado = Interno da Sede/Posto
      result = result.filter(sub => !sub.supervisor && !(sub as any).agentId && !(sub as any).supervisorId)
    } else if (activeType === "AGENT_FIELD") {
      // Com supervisor ou agente associado = Rede de Campo
      result = result.filter(sub => sub.supervisor || (sub as any).agentId || (sub as any).supervisorId)
    }

    return result
  }, [search, subAgents, activeType])

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
      toast.success("Sub-Agente ativado com sucesso.")
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans antialiased text-[#EAECEF]">
      
      {/* MODALS */}
      <CreateSubAgentModal open={showCreate} onClose={() => setShowCreate(false)} onSuccess={load} />
      <SubAgentDetailsModal open={showDetails} subAgent={selected} onClose={() => { setShowDetails(false); setSelected(null); }} />
      <EditSubAgentModal open={showEdit} subAgent={selected} onClose={() => { setShowEdit(false); setSelected(null); }} onSuccess={() => { load(); setShowEdit(false); setSelected(null); }} />
      <ResetPinModal open={showResetPin} subAgent={selected} onClose={() => { setShowResetPin(false); setSelected(null); }} onSuccess={() => { setShowResetPin(false); setSelected(null); load(); }} />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-wider text-white uppercase font-mono">
            Sub-Agentes
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
            Gestão global dos vendedores e operadores internos da EMATEA.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)] active:scale-[0.98]"
        >
          <UserPlus size={15} />
          Novo Sub-Agente
        </button>
      </div>

      {/* ================= STATISTICS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registados" value={total} icon={<Users size={18} />} />
        <StatCard title="Operadores Ativos" value={active} icon={<ShieldCheck size={18} />} status="active" />
        <StatCard title="Contas Bloqueadas" value={inactive} icon={<ShieldX size={18} />} status="inactive" />
        <StatCard title="Postos Ativos" value={workstations} icon={<Building2 size={18} />} />
      </div>

      {/* ================= FILTERS & CONTROLS ================= */}
      <div className="flex flex-col gap-4">
        
        {/* ABAS SEPARADORAS DE TIPO (TABS) */}
        <div className="flex gap-1.5 bg-[#111418]/60 p-1 rounded-xl border border-white/[0.03] self-start">
          <button
            onClick={() => setActiveType("ALL")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeType === "ALL"
                ? "bg-white/5 text-white border border-white/5 shadow-md"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Todos os Operadores ({subAgents.length})
          </button>
          
          <button
            onClick={() => setActiveType("INTERNAL")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeType === "INTERNAL"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 shadow-md"
                : "text-gray-500 hover:text-cyan-400/70"
            }`}
          >
            Internos EMATEA ({subAgents.filter(s => !s.supervisor).length})
          </button>
          
          <button
            onClick={() => setActiveType("AGENT_FIELD")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeType === "AGENT_FIELD"
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/10 shadow-md"
                : "text-gray-500 hover:text-blue-400/70"
            }`}
          >
            Sub-Agentes de Campo ({subAgents.filter(s => s.supervisor).length})
          </button>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome, telefone, e-mail ou código do operador..."
              className="h-10 w-full rounded-xl bg-[#161A1E]/80 border border-white/[0.04] pl-10 pr-4 text-xs font-medium text-white placeholder:text-gray-600 outline-none focus:border-cyan-500/40 focus:bg-[#161A1E] transition-all"
            />
          </div>
          <div className="h-10 w-10 bg-[#161A1E] border border-white/[0.04] rounded-xl flex items-center justify-center text-gray-500 flex-shrink-0">
            <SlidersHorizontal size={14} />
          </div>
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
                <th className="px-4 py-4.5">Posto</th>
                <th className="px-4 py-4.5">Cargo</th>
                <th className="px-4 py-4.5">Supervisor</th>
                <th className="px-4 py-4.5 text-center">Estado</th>
                <th className="px-6 py-4.5 text-center">Ações de Conta</th>
              </tr>
            </thead>
            
            <tbody className="text-xs font-medium divide-y divide-white/[0.02]">
              {loading && (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-gray-500 font-mono text-[11px] uppercase tracking-wider">
                    Carregando base de dados dos operadores...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-gray-600 font-mono text-[11px] uppercase tracking-wider">
                    Nenhum operador localizado para este filtro.
                  </td>
                </tr>
              )}

              {!loading && filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors group">
                  
                  {/* COMPONENTE NOME */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-500/20 transition-all">
                        <UserCircle2 size={18} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white block capitalize truncate">
                          {sub.user.fullName?.toLowerCase()}
                        </span>
                        <span className="text-[9px] font-mono text-gray-600 block">
                          REF #{sub.user.publicId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CÓDIGO */}
                  <td className="px-4 py-4 font-mono text-gray-400 text-[11px]">
                    {sub.employeeCode}
                  </td>

                  {/* CONTACTOS */}
                  <td className="px-4 py-4">
                    <div className="space-y-0.5 text-gray-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-gray-600" />
                        {sub.user.phone}
                      </div>
                      {sub.user.email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Mail size={11} className="text-gray-600" />
                          {sub.user.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* POSTO */}
                  <td className="px-4 py-4 text-gray-300">
                    {sub.workstation || <span className="text-gray-600">-</span>}
                  </td>

                  {/* CARGO */}
                  <td className="px-4 py-4 text-gray-300">
                    {sub.position || <span className="text-gray-600">-</span>}
                  </td>

                  {/* SUPERVISOR */}
                  <td className="px-4 py-4 text-gray-400 capitalize">
                    {sub.supervisor?.fullName?.toLowerCase() || (
                      <span className="text-[10px] text-cyan-500/70 font-mono font-bold uppercase tracking-wider">
                        Sede Central
                      </span>
                    )}
                  </td>

                  {/* ESTADO */}
                  <td className="px-4 py-4 text-center">
                    {sub.isActive ? (
                      <span className="inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Inativo
                      </span>
                    )}
                  </td>

                  {/* AÇÕES DE CONTA */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openDetails(sub.id)}
                        title="Visualizar Detalhes"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        onClick={() => openEdit(sub.id)}
                        title="Editar Sub-agente"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                      >
                        <Pencil size={13} />
                      </button>

                      {sub.isActive ? (
                        <button
                          onClick={() => deactivate(sub.id)}
                          title="Desativar Conta"
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
                        >
                          <ShieldX size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => activate(sub.id)}
                          title="Ativar Conta"
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
                        >
                          <ShieldCheck size={13} />
                        </button>
                      )}

                      <button
                        onClick={() => openResetPin(sub.id)}
                        title="Redefinir PIN de Segurança"
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-400 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                      >
                        <KeyRound size={13} />
                      </button>
                    </div>
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

// ================= STAT CARD AUXILIAR =================
function StatCard({ title, value, icon, status }: any) {
  const getColors = () => {
    if (status === "active") return "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
    if (status === "inactive") return "text-rose-400 bg-rose-500/5 border-rose-500/10"
    return "text-cyan-400 bg-cyan-500/5 border-cyan-500/10"
  }

  return (
    <div className="bg-[#161A1E] rounded-2xl border border-white/[0.04] p-5 flex items-center justify-between shadow-lg hover:border-white/[0.07] transition-all">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <h2 className="text-2xl font-black text-white font-mono leading-none">
          {value}
        </h2>
      </div>
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${getColors()}`}>
        {icon}
      </div>
    </div>
  )
}