import { useEffect, useState, useCallback } from "react"
import { AdminCommissionService } from "../../services/admin-commission.service"
import { 
  Users, 
  ShoppingBag, 
  ArrowsClockwise, 
  MagnifyingGlass,
  ShieldCheck,
  Gift,
  Trophy,
} from "@phosphor-icons/react"

interface ClientCommissionItem {
  id: number
  name: string
  phone: string
  totalPurchases: number
  totalSpent: string
  commissionEarned: string
  status: string
}

interface TopClientItem {
  id: number
  name: string
  phone: string
  email: string
  totalPurchases: number
  totalSpentNumber: number
  totalSpentText: string
  totalProfitText: string
}

export default function ClientCommissionsPage() {
  const [clients, setClients] = useState<ClientCommissionItem[]>([])
  const [topClients, setTopClients] = useState<TopClientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Carrega os clientes e o top de clientes em paralelo
      const [clientsData, topClientsData] = await Promise.all([
        AdminCommissionService.getClients(),
        AdminCommissionService.getTopClients(3) // Top 3 clientes para recompensa
      ])

      const clientsArray = Array.isArray(clientsData) ? clientsData : (clientsData?.data || [])
      setClients(clientsArray)

      const topArray = Array.isArray(topClientsData) ? topClientsData : (topClientsData?.data || [])
      setTopClients(topArray)

    } catch (err) {
      console.error("Erro ao carregar comissões de clientes:", err)
      setClients([])
      setTopClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredClients = clients.filter(c => 
    (c.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (c.phone || "").includes(search)
  )

  // Cálculo dinâmico do volume total geral de compras
  const totalGeneralSpent = clients.reduce((acc, client) => {
    const cleanValue = client.totalSpent ? client.totalSpent.toString() : "0"
    const num = parseFloat(cleanValue.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0
    return acc + num
  }, 0).toLocaleString("pt-PT", { minimumFractionDigits: 2 })

  // Cálculo dinâmico do total de comissões/lucro gerado pelos clientes para a Ematea
  const totalCommissionsPaid = clients.reduce((acc, client) => {
    const cleanValue = client.commissionEarned ? client.commissionEarned.toString() : "0"
    const num = parseFloat(cleanValue.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0
    return acc + num
  }, 0).toLocaleString("pt-PT", { minimumFractionDigits: 2 })

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Módulo de Retenção & Comissões
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Comissões e Atividade de Clientes
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-500" />
            Controlo de consumo, volume de compras e receita gerada por clientes na plataforma.
          </p>
        </div>

        <button 
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 transition-all shadow-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <ArrowsClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total de Clientes Ativos" 
          value={loading ? "..." : clients.length.toString()} 
          icon={<Users size={20} className="text-blue-400" />} 
          loading={loading}
        />
        <MetricCard 
          title="Volume de Compras Geral" 
          value={loading ? "..." : `${totalGeneralSpent} Kz`} 
          icon={<ShoppingBag size={20} className="text-emerald-400" />} 
          loading={loading}
        />
        <MetricCard 
          title="Comissão Gerada (Ematea 100%)" 
          value={loading ? "..." : `${totalCommissionsPaid} Kz`} 
          icon={<Gift size={20} className="text-amber-400" />} 
          loading={loading}
        />
      </div>

      {/* SECÇÃO: TOP CLIENTES (PROGRAMA DE RECOMPENSA) */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy size={20} weight="fill" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Top Clientes (Em Destaque para Recompensa)</h3>
              <p className="text-xs text-gray-500">Clientes com maior volume de compras e valor gerado na plataforma</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            VIP Ranking
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
              <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
            </>
          ) : topClients.length === 0 ? (
            <div className="col-span-3 py-6 text-center text-xs text-gray-500">
              Nenhum dado de top clientes disponível de momento.
            </div>
          ) : (
            topClients.map((client, index) => {
              const medals = ["text-amber-400 bg-amber-500/10 border-amber-500/20", "text-slate-300 bg-slate-500/10 border-slate-500/20", "text-amber-600 bg-amber-700/10 border-amber-700/20"]
              return (
                <div key={client.id} className="bg-[#0B0E11] border border-white/5 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${medals[index] || "text-blue-400 bg-blue-500/10 border-blue-500/20"}`}>
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-xs text-white truncate max-w-[140px]">{client.name}</h4>
                    </div>
                    <p className="text-[11px] font-mono text-gray-500">{client.phone}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{client.totalPurchases} operações efetuadas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Total Gasto</span>
                    <span className="text-sm font-black text-emerald-400">{client.totalSpentText}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* TABELA DE CLIENTES */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-white">Base de Clientes & Performance</h3>
            <p className="text-xs text-gray-500">Histórico detalhado de consumo e receita gerada</p>
          </div>

          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou telemóvel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0E11] border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500">
                <th className="py-4 px-6">ID / Cliente</th>
                <th className="py-4 px-6">Telemóvel</th>
                <th className="py-4 px-6">Total de Compras</th>
                <th className="py-4 px-6">Montante Gasto</th>
                <th className="py-4 px-6">Comissão Gerada</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#12161B] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">#{client.id} - {client.name}</td>
                    <td className="py-4 px-6 font-mono text-gray-400">{client.phone}</td>
                    <td className="py-4 px-6 text-gray-300">{client.totalPurchases} operações</td>
                    <td className="py-4 px-6 font-bold text-emerald-400">{client.totalSpent}</td>
                    <td className="py-4 px-6 font-bold text-amber-400">{client.commissionEarned}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25">
                        {client.status || "ATIVO"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, loading }: { title: string; value: string; icon: React.ReactNode; loading?: boolean }) {
  return (
    <div className="bg-[#161A1F] border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global</span>
      </div>
      <div>
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{title}</p>
        {loading ? (
          <div className="h-8 w-28 bg-white/5 rounded-lg animate-pulse mt-1" />
        ) : (
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">{value}</h2>
        )}
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-36" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-28" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-20" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-24" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-20" /></td>
      <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-full w-16" /></td>
    </tr>
  )
}