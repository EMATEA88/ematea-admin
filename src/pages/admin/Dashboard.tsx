import { useEffect, useState, useCallback } from "react"
import { adminDashboardService } from "../../services/adminDashboard.service"
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ChartLineUp, 
  ShieldCheck,
  Circle,
  ShoppingCart,
  Stack,
  TrendUp
} from "@phosphor-icons/react"

type DashboardData = {
  totalUsers: number
  totalBalance: number
  totalRecharges: number
  totalWithdrawals: number
  totalInvested?: number
  totalFrozenBalance?: number
  pendingWithdrawals?: number
  netFlow?: number
  
  purchases?: {
    total: number
    pending: number
    completed: number
    rejected: number
    today: number
    month: number
  }
  services?: {
    services: number
    providers: number
    groups: number
    plans: number
  }
  commissions?: {
    pending: number
    paid: number
    cancelled: number
    totalAmount: any
  }
  companyWallet?: {
    address: string
    bnb: string
    usdt: string
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminDashboardService.getOverview() 
      setData((res as any)?.data ?? res)
    } catch (err) {
      console.error("Dashboard error", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">
      
      {/* HEADER INSTITUCIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Ambiente Seguro Admin
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">EMATEA Core v2.4</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Financial Intelligence & Dashboard
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Painel unificado de monitoramento de ativos, utilizadores e operações em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#161A1F] px-4 py-2.5 rounded-2xl border border-white/5 shadow-xl">
          <Circle size={8} weight="fill" className="text-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Node Status</span>
            <span className="text-xs font-black text-emerald-400 tracking-tight">ONLINE / SINCRONIZADO</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: KPIS PRINCIPAIS (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* DESTAQUES PRINCIPAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard
              title="Total de Clientes"
              value={data?.totalUsers || 0}
              icon={<Users size={24} />}
              trend="Ativos na plataforma"
              color="blue"
            />
            <KpiCard
              title="Capital sob Custódia"
              value={data?.totalBalance || 0}
              icon={<ChartLineUp size={24} />}
              money
              color="emerald"
            />
          </div>

          {/* FLUXOS OPERACIONAIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox 
              label="Fluxo de Depósitos" 
              value={data?.totalRecharges || 0} 
              icon={<ArrowUpRight className="text-emerald-400" size={18} />}
              borderColor="border-emerald-500/20"
            />
            <StatBox 
              label="Fluxo de Saídas" 
              value={data?.totalWithdrawals || 0} 
              icon={<ArrowDownLeft className="text-red-400" size={18} />}
              borderColor="border-red-500/20"
            />
            <StatBox 
              label="Serviços em Curso" 
              value={data?.totalInvested || 0} 
              icon={<Wallet className="text-purple-400" size={18} />}
              borderColor="border-purple-500/20"
            />
          </div>

          {/* SEÇÃO EXTRA: COMPRAS E TRANSAÇÕES */}
          {data?.purchases && (
            <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <ShoppingCart size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">Resumo de Transações e Compras</h3>
                    <p className="text-xs text-gray-500">Métricas analíticas do volume comercial</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0B0E11] p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total de Compras</p>
                  <p className="text-2xl font-black text-white">{data.purchases.total}</p>
                </div>
                <div className="bg-[#0B0E11] p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-amber-400 uppercase font-black tracking-widest">Pendentes</p>
                  <p className="text-2xl font-black text-amber-400">{data.purchases.pending}</p>
                </div>
                <div className="bg-[#0B0E11] p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Concluídas</p>
                  <p className="text-2xl font-black text-emerald-400">{data.purchases.completed}</p>
                </div>
                <div className="bg-[#0B0E11] p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Hoje</p>
                  <p className="text-2xl font-black text-blue-400">{data.purchases.today}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: WALLET DA EMPRESA & INFRAESTRUTURA (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* HOT WALLET CORPORATIVA */}
          {data?.companyWallet && (
            <div className="bg-gradient-to-br from-[#161A1F] via-[#12161B] to-[#0B0E11] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                <Wallet size={160} weight="fill" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                      <Wallet size={22} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider text-white">Hot Wallet Empresa</h3>
                      <p className="text-xs text-gray-500">Gestão de liquidez corporativa</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0B0E11]/80 p-4 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Endereço da Carteira (ID: 1)</p>
                  <p className="text-xs font-mono text-gray-300 break-all leading-relaxed">
                    {data.companyWallet.address}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <span className="text-[10px] font-black text-amber-400">BAL</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">Saldo Disponível</span>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Conta Corrente</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-amber-400">{data.companyWallet.bnb}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-[10px] font-black text-emerald-400">REV</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">Receita Total</span>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Acumulado Geral</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-400">{data.companyWallet.usdt}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATÁLOGO & INFRAESTRUTURA */}
          {data?.services && (
            <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <Stack size={22} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">Catálogo & Infraestrutura</h3>
                  <p className="text-xs text-gray-500">Recursos ativos do ecossistema</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0B0E11] p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Serviços</span>
                  <span className="text-xl font-black text-white">{data.services.services}</span>
                </div>
                <div className="bg-[#0B0E11] p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Planos</span>
                  <span className="text-xl font-black text-white">{data.services.plans}</span>
                </div>
                <div className="bg-[#0B0E11] p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Parceiros</span>
                  <span className="text-xl font-black text-white">{data.services.providers}</span>
                </div>
                <div className="bg-[#0B0E11] p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Grupos</span>
                  <span className="text-xl font-black text-white">{data.services.groups}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTES DE SUPORTE ================= */

function KpiCard({ title, value, money, icon, color, trend }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  }

  return (
    <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] hover:border-white/15 transition-all group shadow-xl">
      <div className="flex justify-between items-start">
        <div className={`p-3.5 rounded-2xl border ${colors[color]}`}>{icon}</div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <TrendUp size={12} weight="bold" />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-6 space-y-1">
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{title}</p>
        <h2 className="text-4xl font-black text-white tracking-tight">
          {money ? formatMoney(value) : (value?.toLocaleString() || 0)}
        </h2>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon, borderColor }: any) {
  return (
    <div className={`bg-[#161A1F] border ${borderColor} p-6 rounded-2xl shadow-lg hover:bg-[#1C2128] transition-all space-y-3`}>
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          {icon}
        </div>
        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-white tracking-tight">{formatMoney(value)}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen space-y-10 max-w-[1600px] mx-auto animate-pulse">
      <div className="h-28 bg-white/5 rounded-[2rem] w-full max-w-md" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="h-44 bg-white/5 rounded-[2rem]" />
            <div className="h-44 bg-white/5 rounded-[2rem]" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-28 bg-white/5 rounded-2xl" />
            <div className="h-28 bg-white/5 rounded-2xl" />
            <div className="h-28 bg-white/5 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="h-72 bg-white/5 rounded-[2rem]" />
        </div>
      </div>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value || 0)
}