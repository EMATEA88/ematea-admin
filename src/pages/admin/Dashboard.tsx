import { useEffect, useState, useCallback } from "react"
import { AdminService } from "../../services/admin.service"
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ChartLineUp, 
  ShieldCheck,
  Circle
} from "@phosphor-icons/react"

type DashboardData = {
  totalUsers: number
  totalRecharges: number
  totalWithdrawals: number
  totalBalance: number
  totalInvested?: number
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
      const res = await AdminService.dashboard()
      setData(res)
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
    <div className="p-8 bg-[#0B0E11] min-h-screen text-white space-y-10">
      
      {/* HEADER INSTITUCIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Monitoramento em tempo real dos ativos da plataforma
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#161A1F] px-4 py-2 rounded-xl border border-white/5 shadow-sm">
          <Circle size={8} weight="fill" className="text-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Node Status: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: KPIs PRINCIPAIS (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard
              title="Total de Clientes"
              value={data?.totalUsers || 0}
              icon={<Users size={24} />}
              trend="+12% este mês"
              color="blue"
            />
            <KpiCard
              title="Capital sob Custódia"
              value={data?.totalBalance || 0}
              icon={<ChartLineUp size={24} />}
              money
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox 
              label="Fluxo de Depósitos" 
              value={data?.totalRecharges || 0} 
              icon={<ArrowUpRight className="text-emerald-500" />}
            />
            <StatBox 
              label="Fluxo de Saídas" 
              value={data?.totalWithdrawals || 0} 
              icon={<ArrowDownLeft className="text-red-500" />}
            />
            <StatBox 
              label="Volume Investido" 
              value={data?.totalInvested || 0} 
              icon={<Wallet className="text-purple-500" />}
            />
          </div>
        </div>

        {/* COLUNA DIREITA: WALLET DA EMPRESA (4/12) - SEM IMAGENS QUEBRADAS */}
        <div className="lg:col-span-4">
          {data?.companyWallet && (
            <div className="bg-gradient-to-br from-[#161A1F] to-[#0B0E11] p-6 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              {/* Background Decorativo */}
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={120} weight="fill" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Wallet size={20} className="text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Hot Wallet Empresa</h3>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Endereço BSC (BEP20)</p>
                  <p className="text-[11px] font-mono text-gray-300 break-all leading-relaxed">
                    {data.companyWallet.address}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* BNB Card Estilizado */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                        <span className="text-[10px] font-black text-yellow-500">BNB</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">BNB (Gas)</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Taxas de Rede</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-yellow-500">{data.companyWallet.bnb}</span>
                  </div>

                  {/* USDT Card Estilizado */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-[10px] font-black text-emerald-500">USDT</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">USDT Liquidez</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Fundo Estável</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{data.companyWallet.usdt}</span>
                  </div>
                </div>

                <p className="mt-8 text-[10px] text-gray-600 text-center uppercase font-bold tracking-[0.2em] leading-relaxed opacity-60">
                  Monitore o saldo de BNB para <br /> evitar falhas em transações
                </p>
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
    blue: "text-blue-400 bg-blue-400/10",
    yellow: "text-[#FCD535] bg-[#FCD535]/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
  }

  return (
    <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{trend}</span>
      </div>
      <div className="mt-6">
        <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">{title}</p>
        <h2 className="text-4xl font-bold mt-2 tracking-tight">
          {money ? formatMoney(value) : value.toLocaleString()}
        </h2>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-[#161A1F]/40 border border-white/5 p-6 rounded-2xl hover:bg-[#161A1F]/60 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-bold">{formatMoney(value)}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-8 bg-[#0B0E11] min-h-screen space-y-8 animate-pulse">
      <div className="h-20 bg-white/5 rounded-2xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-48 bg-white/5 rounded-[2rem]" />
        <div className="h-48 bg-white/5 rounded-[2rem]" />
        <div className="h-48 bg-white/5 rounded-[2rem]" />
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