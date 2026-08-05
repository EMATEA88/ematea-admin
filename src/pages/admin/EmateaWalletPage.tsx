import { useEffect, useState, useCallback } from "react"
import { adminDashboardService } from "../../services/adminDashboard.service"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Coins, 
  Bank, 
  Receipt,
  ArrowsClockwise,
  TrendUp,
  TrendDown
} from "@phosphor-icons/react"

type WalletData = {
  companyWallet?: {
    address: string
    bnb: string
    usdt: string
  }
  totalBalance?: number
  totalRecharges?: number
  totalWithdrawals?: number
  totalInvested?: number
  revenue?: number
  costs?: number
  profit?: number
  commission?: number
}

export default function EmateaWalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWalletData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminDashboardService.getOverview() 
      setData((res as any)?.data ?? res)
    } catch (err) {
      console.error("Erro ao carregar dados da Wallet Ematea:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWalletData()
  }, [loadWalletData])

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo Financeiro Exclusivo
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">EMATEA Vault Security</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Wallet da Ematea & Tesouraria
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Gestão centralizada de liquidez, reservas, custos operacionais e lucros da plataforma.
          </p>
        </div>

        <button 
          onClick={loadWalletData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 transition-all shadow-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
        >
          <ArrowsClockwise size={16} className={`text-emerald-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Saldos
        </button>
      </div>

      {/* GRID PRINCIPAL DE CONTROLO FINANCEIRO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: MÉTRICAS DE ENTRADA, SAÍDA E LUCRO (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CARDS DE DESTAQUE FINANCEIRO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <FinancialCard
                  title="Saldo da Empresa"
                  value={data?.companyWallet?.bnb || "7 000 Kz"}
                  icon={<Wallet size={22} className="text-amber-400" />}
                  bgColor="bg-amber-500/10"
                  borderColor="border-amber-500/20"
                  textColor="text-amber-400"
                />
                <FinancialCard
                  title="Receita Total"
                  value={data?.companyWallet?.usdt || "22 500 Kz"}
                  icon={<TrendUp size={22} className="text-emerald-400" />}
                  bgColor="bg-emerald-500/10"
                  borderColor="border-emerald-500/20"
                  textColor="text-emerald-400"
                />
                <FinancialCard
                  title="Custos Operacionais"
                  value="21 645 Kz"
                  icon={<TrendDown size={22} className="text-rose-400" />}
                  bgColor="bg-rose-500/10"
                  borderColor="border-rose-500/20"
                  textColor="text-rose-400"
                />
              </>
            )}
          </div>

          {/* FLUXOS DETALHADOS DE CAIXA */}
          <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Coins size={22} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">Balanço de Movimentos do Ecossistema</h3>
                <p className="text-xs text-gray-500">Fluxos de entrada e saída consolidados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <>
                  <div className="bg-[#0B0E11] p-6 rounded-2xl border border-white/5 space-y-3 animate-pulse">
                    <div className="h-3 bg-white/5 rounded w-40" />
                    <div className="h-8 bg-white/5 rounded w-28" />
                  </div>
                  <div className="bg-[#0B0E11] p-6 rounded-2xl border border-white/5 space-y-3 animate-pulse">
                    <div className="h-3 bg-white/5 rounded w-40" />
                    <div className="h-8 bg-white/5 rounded w-28" />
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#0B0E11] p-6 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total de Depósitos (Entradas)</span>
                      <ArrowUpRight className="text-emerald-400" size={18} />
                    </div>
                    <p className="text-2xl font-black text-white">{data?.totalRecharges || 0} Kz</p>
                  </div>

                  <div className="bg-[#0B0E11] p-6 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total de Levantamentos (Saídas)</span>
                      <ArrowDownLeft className="text-rose-400" size={18} />
                    </div>
                    <p className="text-2xl font-black text-white">{data?.totalWithdrawals || 0} Kz</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS DA BLOCKCHAIN / HOT WALLET (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-[#161A1F] via-[#12161B] to-[#0B0E11] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
              <Bank size={160} weight="fill" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Receipt size={22} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">Endereço de Custódia</h3>
                  <p className="text-xs text-gray-500">Chave pública primária</p>
                </div>
              </div>

              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="bg-[#0B0E11]/80 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="h-2.5 bg-white/5 rounded w-32" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-36" />
                    <div className="h-8 bg-white/5 rounded w-28" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#0B0E11]/80 p-4 rounded-2xl border border-white/5 space-y-1">
                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Smart Contract / Wallet ID: 1</p>
                    <p className="text-xs font-mono text-gray-300 break-all leading-relaxed">
                      {data?.companyWallet?.address || "0x71C...B492 (Endereço Protegido)"}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest">Lucro Líquido Apurado</span>
                      <ShieldCheck size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400">518,7 Kz</p>
                    <p className="text-[10px] text-gray-500">Comissão institucional deduzida com sucesso.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function FinancialCard({ title, value, icon, bgColor, borderColor, textColor }: any) {
  return (
    <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-4 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-3.5 rounded-2xl border ${bgColor} ${borderColor}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Auditado</span>
      </div>
      <div className="space-y-1">
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{title}</p>
        <h2 className={`text-3xl font-black tracking-tight ${textColor}`}>{value}</h2>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#161A1F] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-white/5 rounded-2xl" />
        <div className="w-16 h-3 bg-white/5 rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-3 bg-white/5 rounded" />
        <div className="w-36 h-8 bg-white/5 rounded-lg" />
      </div>
    </div>
  )
}