import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowDownUp,
  Repeat,
  Gift,
  Bell,
  FileText,
  Building2,
  ShieldCheck,
  UserCheck,
  Percent,
  Server,
  Wallet,
  DollarSign,
  BarChart3
} from "lucide-react"

const sectionTitle =
  "px-6 pt-6 pb-2 text-[10px] uppercase text-gray-500 font-extrabold tracking-widest"

const linkBase =
  "flex items-center gap-3 px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative"

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#0B0E11] border-r border-[#1E2329] flex flex-col flex-shrink-0 select-none">

      {/* LOGO FIXO INSTITUCIONAL */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#1E2329] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <span className="text-emerald-400 font-black text-sm tracking-wider">E</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white tracking-widest text-sm">EMATEA</span>
            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Admin Control</span>
          </div>
        </div>
      </div>

      {/* NAV COM SCROLL LARGO E FACILITADO */}
      <div className="flex-1 overflow-hidden">
        <nav className="h-full overflow-y-auto py-4 px-3 space-y-1 [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-[#0B0E11] [&::-webkit-scrollbar-thumb]:bg-[#2B3139] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A4149]">

          {/* CORE */}
          <div className={sectionTitle}>Core</div>

          <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </SidebarLink>

          <SidebarLink to="/admin/users" icon={<Users size={18} />}>
            Utilizadores
          </SidebarLink>

          <SidebarLink to="/admin/agents" icon={<UserCheck size={18} />}>
            Agentes
          </SidebarLink>

          <SidebarLink to="/admin/subagents" icon={<Users size={18} />}>
            Sub-Agentes
          </SidebarLink>

          <SidebarLink to="/admin/logs" icon={<FileText size={18} />}>
            Logs
          </SidebarLink>

          <SidebarLink to="/admin/notifications" icon={<Bell size={18} />}>
            Notificações
          </SidebarLink>

          {/* FINANCEIRO */}
          <div className={sectionTitle}>Financeiro</div>

          {/* ✨ NOVA WALLET DA EMATEA EM DESTAQUE */}
          <SidebarLink to="/admin/wallet" icon={<Wallet size={18} className="text-emerald-400" />}>
            Wallet Ematea
          </SidebarLink>

          {/* ✨ NOVO RELATÓRIO DE VENDAS E COMISSÕES ADICIONADO */}
          <SidebarLink to="/admin/reports/sales-commissions" icon={<BarChart3 size={18} className="text-blue-400" />}>
            Vendas & Comissões
          </SidebarLink>

          <SidebarLink to="/admin/banks" icon={<Building2 size={18} />}>
            Bancos
          </SidebarLink>

          <SidebarLink to="/admin/recharges" icon={<CreditCard size={18} />}>
            Depósitos
          </SidebarLink>

          <SidebarLink to="/admin/withdrawals" icon={<ArrowDownUp size={18} />}>
            Levantamentos
          </SidebarLink>

          <SidebarLink to="/admin/transactions" icon={<Repeat size={18} />}>
            Transações
          </SidebarLink>

          <SidebarLink to="/admin/commissions" icon={<Repeat size={18} />}>
            Comissões Gerais
          </SidebarLink>

          <SidebarLink to="/admin/commissions/agents" icon={<Percent size={18} />}>
            Comissões Agentes
          </SidebarLink>
          
          <SidebarLink to="/admin/commissions/sub-agents" icon={<Percent size={18} />}>
            Comissões Sub-Agentes
          </SidebarLink>

          <SidebarLink to="/admin/commissions/clients" icon={<Percent size={18} />}>
            Comissões Clientes
          </SidebarLink>

          {/* ✨ SALÁRIOS & BÓNUS */}
          <SidebarLink to="/admin/sub-agents/salaries" icon={<DollarSign size={18} className="text-cyan-400" />}>
            Salários & Bónus
          </SidebarLink>

          {/* SERVIÇOS */}
          <div className={sectionTitle}>Serviços</div>

          <SidebarLink to="/admin/services">
            Solicitações
          </SidebarLink>

          <SidebarLink to="/admin/partners">
            Parceiros
          </SidebarLink>

          {/* CONTA 5LINHAS */}
          <SidebarLink to="/admin/aki" icon={<Server size={18} />}>
            Conta 5Linhas
          </SidebarLink>

          {/* REDOTPAY */}
          <SidebarLink to="/admin/redotpay" icon={<Wallet size={18} className="text-blue-400" />}>
            RedotPay
          </SidebarLink>

          {/* COMPLIANCE */}
          <div className={sectionTitle}>Compliance</div>

          <SidebarLink to="/admin/kyc" icon={<ShieldCheck size={18} />}>
            KYC
          </SidebarLink>

          <SidebarLink to="/admin/gift" icon={<Gift size={18} />}>
            Gift
          </SidebarLink>

          {/* ESPAÇO EXTRA PARA SCROLL */}
          <div className="h-24" />
        </nav>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon, children }: any) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `
        ${linkBase}
        ${isActive
          ? "bg-[#161A1F] text-white font-bold border border-white/5 shadow-inner"
          : "text-gray-400 hover:text-white hover:bg-[#12161B]"
        }
      `
      }
    >
      {({ isActive }) => (
        <>
          {/* Indicador lateral ativo */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
          )}
          <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"} transition-colors`}>
            {icon}
          </span>
          <span className="truncate">{children}</span>
        </>
      )}
    </NavLink>
  )
}