import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  CreditCard,
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
  Folder
} from "lucide-react"

const sectionTitle =
  "px-6 pt-6 pb-2 text-[11px] uppercase text-gray-500 tracking-wider"

const linkBase =
  "flex items-center gap-3 px-6 py-2.5 text-sm rounded-lg transition-all duration-200"

export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-[#0B0E11] border-r border-[#1E2329] flex flex-col">

      {/* LOGO FIXO */}
      <div className="h-16 flex items-center px-6 text-lg font-semibold border-b border-[#1E2329] tracking-wide flex-shrink-0">
        EMATEA
      </div>

      {/* NAV COM SCROLL REAL */}
      <nav className="flex-1 overflow-y-auto py-4 pr-2 scrollbar-thin scrollbar-thumb-[#2B3139] hover:scrollbar-thumb-[#3A4149]">

        {/* CORE */}
        <div className={sectionTitle}>Core</div>

        <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />}>
          Dashboard
        </SidebarLink>

        <SidebarLink to="/admin/users" icon={<Users size={18} />}>
          Utilizadores
        </SidebarLink>

        <SidebarLink to="/admin/logs" icon={<FileText size={18} />}>
          Logs
        </SidebarLink>

        <SidebarLink to="/admin/notifications" icon={<Bell size={18} />}>
          Notificações
        </SidebarLink>

        {/* FINANCEIRO */}
        <div className={sectionTitle}>Financeiro</div>

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
          Comissões
        </SidebarLink>

        <SidebarLink to="/admin/applications" icon={<LineChart size={18} />}>
          Investimentos
        </SidebarLink>

        <SidebarLink to="/admin/settlements" icon={<Folder size={18} />}>
          Partner Settlements
        </SidebarLink>

        <SidebarLink to="/admin/revenue" icon={<DollarSign size={18} />}>
          Revenue Control
        </SidebarLink>

        <SidebarLink to="/admin/finance" icon={<BarChart3 size={18} />}>
          Finance Dashboard
        </SidebarLink>

        {/* SERVIÇOS */}
        <div className={sectionTitle}>Serviços</div>

        <SidebarLink to="/admin/services">
          Service Requests
        </SidebarLink>

        {/* KIXIKILA */}
        <div className={sectionTitle}>Kixikila</div>

        <SidebarLink to="/admin/kyc" icon={<ShieldCheck size={18} />}>
          KYC Verification
        </SidebarLink>

        <SidebarLink to="/admin/service-refunds">
          Service Refunds
        </SidebarLink>

        <SidebarLink to="/admin/partners">
          Partners
        </SidebarLink>

        {/* ADMIN */}
        <div className={sectionTitle}>Admin</div>

        <SidebarLink to="/admin/tasks" icon={<FileText size={18} />}>
          Tarefas
        </SidebarLink>

        <SidebarLink to="/admin/stats" icon={<BarChart3 size={18} />}>
          Estatísticas
        </SidebarLink>

        <SidebarLink to="/admin/kixikila" icon={<Users size={18} />}>
          Kixikila Admin
        </SidebarLink>

        {/* OTC */}
        <div className={sectionTitle}>OTC</div>

        <SidebarLink to="/admin/otc" icon={<BarChart3 size={18} />}>
          OTC Dashboard
        </SidebarLink>

        <SidebarLink to="/admin/otc/orders">
          OTC Orders
        </SidebarLink>

        <SidebarLink to="/admin/otc/assets">
          OTC Assets
        </SidebarLink>

        <SidebarLink to="/admin/otc/stats">
          OTC Stats
        </SidebarLink>

        <SidebarLink to="/admin/otc/audit" icon={<Activity size={18} />}>
          OTC Auditoria
        </SidebarLink>

        <SidebarLink to="/admin/otc/price-history" icon={<LineChart size={18} />}>
          Histórico Preços
        </SidebarLink>

        {/* OUTROS */}
        <div className={sectionTitle}>Outros</div>

        <SidebarLink to="/admin/gift" icon={<Gift size={18} />}>
          Gift
        </SidebarLink>

      </nav>
    </aside>
  )
}

/* ================= LINK ================= */

function SidebarLink({ to, icon, children }: any) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        ${linkBase}
        ${isActive
          ? "bg-[#1A1F24] text-white"
          : "text-gray-400 hover:text-white hover:bg-[#14171A]"
        }
      `
      }
    >
      {icon && icon}
      <span className="truncate">{children}</span>
    </NavLink>
  )
}