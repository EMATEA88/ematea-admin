import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  ArrowsClockwise, 
  MagnifyingGlass,
  Eye,
  Check,
  X
} from '@phosphor-icons/react'

interface Recharge {
  id: number
  amount: number | string
  currency?: string
  method?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  image: string | null
  user?: {
    phone: string
    fullName?: string
  }
}

type ProcessingState = {
  id: number
  action: 'approve' | 'reject'
} | null

export default function Recharges() {
  const [items, setItems] = useState<Recharge[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<ProcessingState>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const response = await AdminService.recharges()

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : []

      setItems(list)
    } catch {
      toast.error('Erro ao carregar recargas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function approve(id: number) {
    if (processing) return
    try {
      setProcessing({ id, action: 'approve' })
      await AdminService.approveRecharge(id)

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'APPROVED' } : item
        )
      )

      toast.success('Recarga aprovada com sucesso')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao aprovar recarga')
    } finally {
      setProcessing(null)
    }
  }

  async function reject(id: number) {
    if (processing) return
    try {
      setProcessing({ id, action: 'reject' })
      await AdminService.rejectRecharge(id)

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'REJECTED' } : item
        )
      )

      toast.success('Recarga rejeitada')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao rejeitar recarga')
    } finally {
      setProcessing(null)
    }
  }

  // Filtragem de dados
  const filteredItems = items.filter(item => {
    const matchesSearch = item.user?.phone?.includes(search) || String(item.id).includes(search)
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Métricas rápidas
  const totalPending = items.filter(i => i.status === 'PENDING').length
  const totalApproved = items.filter(i => i.status === 'APPROVED').length
  const sumApproved = items
    .filter(i => i.status === 'APPROVED')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gestão Financeira
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Depósitos & Recargas
          </h1>
          <p className="text-gray-400 text-sm">
            Monitorize e valide os comprovativos de depósito enviados pelos utilizadores.
          </p>
        </div>

        <button 
          onClick={load}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 transition-all shadow-xl font-bold text-xs uppercase tracking-wider"
        >
          <ArrowsClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Pendentes de Aprovação" 
          value={loading ? "..." : totalPending.toString()} 
          icon={<Clock size={20} className="text-amber-400" />} 
          loading={loading}
        />
        <MetricCard 
          title="Total Aprovados" 
          value={loading ? "..." : totalApproved.toString()} 
          icon={<CheckCircle size={20} className="text-emerald-400" />} 
          loading={loading}
        />
        <MetricCard 
          title="Volume Aprovado Global" 
          value={loading ? "..." : `${sumApproved.toLocaleString("pt-PT", { minimumFractionDigits: 2 })} Kz`} 
          icon={<Wallet size={20} className="text-blue-400" />} 
          loading={loading}
        />
      </div>

      {/* FILTROS E TABELA */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  statusFilter === st
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-[#0B0E11] text-gray-400 border-white/5 hover:border-white/10'
                }`}
              >
                {st === 'ALL' ? 'Todos' : st === 'PENDING' ? 'Pendentes' : st === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por ID ou telemóvel..."
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
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Usuário</th>
                <th className="py-4 px-6">Valor</th>
                <th className="py-4 px-6">Método</th>
                <th className="py-4 px-6">Comprovativo</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
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
                filteredItems.map((r) => {
                  const isApproving = processing?.id === r.id && processing.action === 'approve'
                  const isRejecting = processing?.id === r.id && processing.action === 'reject'

                  const currency = String(r.currency || 'AOA').toUpperCase().trim()
                  const method = String(r.method || 'BANK').toUpperCase()
                  const amount = Number(r.amount || 0)
                  const isUSDT = currency === 'USDT' || currency === 'USDC'

                  return (
                    <tr key={r.id} className="hover:bg-[#12161B] transition-colors">
                      <td className="py-4 px-6 text-gray-500 font-mono">#{r.id}</td>

                      <td className="py-4 px-6 font-bold text-white">
                        {r.user?.phone || '—'}
                      </td>

                      {/* VALOR */}
                      <td className={`py-4 px-6 font-bold ${isUSDT ? 'text-cyan-400' : 'text-emerald-400'}`}>
                        {isUSDT
                          ? `${amount.toFixed(2)} USDT`
                          : new Intl.NumberFormat("pt-AO", {
                              style: "currency",
                              currency: "AOA"
                            }).format(amount)}
                      </td>

                      {/* MÉTODO */}
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          method === 'CRYPTO'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {method}
                        </span>
                      </td>

                      {/* COMPROVATIVO */}
                      <td className="py-4 px-6">
                        {r.image ? (
                          <button
                            onClick={() => window.open(r.image!, '_blank')}
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 transition-colors"
                          >
                            <Eye size={14} />
                            Ver Imagem
                          </button>
                        ) : (
                          <span className="text-gray-600 font-medium">Sem Anexo</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6">
                        <StatusBadge status={r.status} />
                      </td>

                      {/* AÇÕES */}
                      <td className="py-4 px-6 text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={!!processing}
                              onClick={() => approve(r.id)}
                              className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                              <Check size={14} />
                              {isApproving ? 'A processar...' : 'Aprovar'}
                            </button>

                            <button
                              disabled={!!processing}
                              onClick={() => reject(r.id)}
                              className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                              <X size={14} />
                              {isRejecting ? 'A processar...' : 'Rejeitar'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-bold uppercase text-[10px]">Concluído</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    Nenhuma recarga encontrada com os filtros selecionados.
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    APPROVED: { label: 'Aprovado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    REJECTED: { label: 'Rejeitado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }

  const current = config[status] || { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }

  return (
    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${current.className}`}>
      {current.label}
    </span>
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
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-16" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-32" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-24" /></td>
      <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-full w-20" /></td>
      <td className="py-4 px-6"><div className="h-6 bg-white/5 rounded-lg w-24" /></td>
      <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-full w-20" /></td>
      <td className="py-4 px-6 text-right"><div className="h-8 bg-white/5 rounded-xl w-36 ml-auto" /></td>
    </tr>
  )
}