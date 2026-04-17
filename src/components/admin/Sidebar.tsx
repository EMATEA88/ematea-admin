import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  ArrowDownUp,
  Repeat,
  Gift,
  Bell,
  BarChart3,
  FileText,
  Activity,
  LineChart,
  DollarSign,
  Building2,
  ShieldCheck,
  Folder,
  Briefcase,
  UserCheck,
  Wallet
} from "lucide-react"

// Estilos padronizados
const sectionTitle =
  "px-6 pt-8 pb-2 text-[10px] font-black uppercase text-gray-600 tracking-[0.2em]"

const linkBase =
  "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 border-l-4"

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col sticky top-0 overflow-hidden">
      
      {/* LOGO FIXO - HEADER */}
      <div className="h-20 flex items-center px-8 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-black text-black italic">
            E
          </div>
          <span className="text-lg font-black tracking-tighter italic text-white uppercase">
            Ematea <span className="text-green-500 text-[10px] align-top">Admin</span>
          </span>
        </div>
      </div>

      {/* NAV COM SCROLL INTELIGENTE */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 no-scrollbar scroll-smooth">
        
        <div className={sectionTitle}>Core System</div>
        <SidebarLink to="/admin" icon={<LayoutDashboard size={20} />}>Dashboard</SidebarLink>
        <SidebarLink to="/admin/users" icon={<Users size={20} />}>Utilizadores</SidebarLink>
        <SidebarLink to="/admin/logs" icon={<FileText size={20} />}>Audit Logs</SidebarLink>
        <SidebarLink to="/admin/notifications" icon={<Bell size={20} />}>Notificações</SidebarLink>

        <div className={sectionTitle}>Financeiro</div>
        <SidebarLink to="/admin/banks" icon={<Building2 size={20} />}>Gestão de Bancos</SidebarLink>
        <SidebarLink to="/admin/recharges" icon={<Wallet size={20} />}>Depósitos</SidebarLink>
        <SidebarLink to="/admin/withdrawals" icon={<ArrowDownUp size={20} />}>Levantamentos</SidebarLink>
        <SidebarLink to="/admin/transactions" icon={<Repeat size={20} />}>Transações</SidebarLink>
        <SidebarLink to="/admin/commissions" icon={<DollarSign size={20} />}>Comissões</SidebarLink>
        <SidebarLink to="/admin/applications" icon={<LineChart size={20} />}>Investimentos</SidebarLink>

        <div className={sectionTitle}>Control Center</div>
        <SidebarLink to="/admin/revenue" icon={<Activity size={20} />}>Revenue Control</SidebarLink>
        <SidebarLink to="/admin/finance" icon={<BarChart3 size={20} />}>Finance Analytics</SidebarLink>
        <SidebarLink to="/admin/task-manager" icon={<Briefcase size={20} />}>Gestão de Tarefas</SidebarLink>

        <div className={sectionTitle}>Kixikila & KYC</div>
        <SidebarLink to="/admin/kyc" icon={<UserCheck size={20} />}>Verificações KYC</SidebarLink>
        <SidebarLink to="/admin/partners" icon={<Folder size={20} />}>Parceiros</SidebarLink>
        <SidebarLink to="/admin/kixikila" icon={<Repeat size={20} />}>Kixikila Admin</SidebarLink>
        <SidebarLink to="/admin/gift" icon={<Gift size={20} />}>Sistema de Gifts</SidebarLink>

        <div className={sectionTitle}>Mercado OTC</div>
        <SidebarLink to="/admin/otc" icon={<BarChart3 size={20} />}>OTC Dashboard</SidebarLink>
        <SidebarLink to="/admin/otc/orders" icon={<Repeat size={20} />}>Ordens OTC</SidebarLink>
        <SidebarLink to="/admin/otc/assets" icon={<Briefcase size={20} />}>Ativos Disponíveis</SidebarLink>
        <SidebarLink to="/admin/otc/audit" icon={<ShieldCheck size={20} />}>Auditoria OTC</SidebarLink>

        {/* ESPAÇO FINAL PARA NÃO CORTAR NO MOBILE */}
        <div className="h-20" />
      </nav>

      {/* FOOTER DA SIDEBAR */}
      <div className="p-4 border-t border-white/5 bg-[#0d0d0d]">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sistema Online</span>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ to, icon, children }: any) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        ${linkBase}
        ${isActive
          ? "bg-green-500/5 text-green-500 border-green-500 shadow-[inset_4px_0_15px_rgba(34,197,94,0.05)]"
          : "text-gray-500 border-transparent hover:text-white hover:bg-white/5"
        }
      `}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-[13px] tracking-tight">{children}</span>
    </NavLink>
  )
}