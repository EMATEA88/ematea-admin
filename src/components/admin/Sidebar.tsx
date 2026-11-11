
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Repeat,
  Bell,
  FileText,
  Server,
  Wallet,
  CalendarDays,
  LogOut,
  ClipboardList,
  Landmark,
  Handshake,
  Settings2,
  Package,
} from "lucide-react"

const sectionTitle =
  "px-4 pt-7 pb-3 text-[10px] uppercase text-gray-400 font-extrabold tracking-[0.16em]"

const linkBase =
  "flex items-center gap-3 px-4 py-3 text-[13px] font-medium rounded-xl transition-all duration-200 group relative"

export default function Sidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
  }

  return (
    <aside className="w-64 h-screen bg-[#0B0E11] border-r border-[#1E2329] flex flex-col flex-shrink-0 select-none">

      {/* IDENTIDADE EMATEA */}
<div className="h-20 flex items-center px-5 border-b border-[#1E2329] flex-shrink-0">
  <div className="flex items-center gap-3">

    {/* LOGOTIPO CIRCULAR */}
    <div className="w-11 h-11 min-w-11 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-[#101820] shadow-lg shadow-emerald-500/10">
      <img
        src="/logo-ematea.png"
        alt="Logotipo EMATEA"
        className="block w-full h-full object-cover scale-[1.15]"
      />
    </div>

    <div className="flex flex-col">
      <span className="font-black text-white tracking-[0.15em] text-sm">
        EMATEA
      </span>

      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.16em]">
        Admin Control
      </span>
    </div>

  </div>
</div>

      {/* NAVEGAÇÃO */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <nav className="h-full overflow-y-auto py-2 px-3 space-y-1
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-[#0B0E11]
          [&::-webkit-scrollbar-thumb]:bg-[#2B3139]
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-[#3A4149]">

          {/* PAINEL */}
          <div className={sectionTitle}>Painel</div>

          <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />}>
            Dashboard
          </SidebarLink>

          {/* GESTÃO */}
          <div className={sectionTitle}>Gestão</div>

          <SidebarLink to="/admin/users" icon={<Users size={18} />}>
            Utilizadores
          </SidebarLink>

          <SidebarLink
            to="/admin/finances"
            icon={<Landmark size={18} />}
          >
            Finanças
          </SidebarLink>

          <SidebarLink to="/admin/commissions" icon={<Repeat size={18} />}>
            Comissões Gerais
          </SidebarLink>

          <SidebarLink
            to="/admin/commissions/calendar"
            icon={<CalendarDays size={18} />}
          >
            Calendário Geral
          </SidebarLink>

          {/* CONFIGURAÇÕES */}
          <div className={sectionTitle}>Configurações</div>

          <SidebarLink
            to="/admin/settings"
            icon={<Settings2 size={18} />}
          >
            Definições
          </SidebarLink>

          {/* INTEGRAÇÕES */}
          <div className={sectionTitle}>Integrações</div>

          <SidebarLink
            to="/admin/partners"
            icon={<Handshake size={18} />}
          >
            Parceiros
          </SidebarLink>

          <SidebarLink
            to="/admin/5linhas"
            icon={<Server size={18} />}
          >
            5 Linhas
          </SidebarLink>

          <SidebarLink to="/admin/aki/products" icon={<Package size={18} />}>
            Produtos AKI
          </SidebarLink>

          <SidebarLink
            to="/admin/redotpay"
            icon={<Wallet size={18} />}
          >
            RedotPay
          </SidebarLink>

          {/* SISTEMA */}
          <div className={sectionTitle}>Sistema</div>

          <SidebarLink to="/admin/logs" icon={<FileText size={18} />}>
            Logs
          </SidebarLink>

          <SidebarLink to="/admin/notifications" icon={<Bell size={18} />}>
            Notificações
          </SidebarLink>

          <SidebarLink
            to="/admin/operations"
            icon={<ClipboardList size={18} />}
          >
            Operações Administrativas
          </SidebarLink>

          <div className="h-5" />
        </nav>
      </div>

      {/* TERMINAR SESSÃO */}
      <div className="flex-shrink-0 border-t border-[#1E2329] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-sm font-semibold"
        >
          <LogOut size={18} />
          <span>Terminar sessão</span>
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({
  to,
  icon,
  children,
}: {
  to: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `${linkBase} ${
          isActive
            ? "bg-emerald-500/10 text-white font-bold border border-emerald-500/20 shadow-inner"
            : "text-gray-400 hover:text-white hover:bg-[#151A20]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
          )}

          <span
            className={`${
              isActive
                ? "text-emerald-400"
                : "text-gray-500 group-hover:text-gray-200"
            } transition-colors`}
          >
            {icon}
          </span>

          <span className="truncate">{children}</span>
        </>
      )}
    </NavLink>
  )
}
