import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"
import { AdminNotificationsService } from "../../services/admin.notifications.service"

export default function Topbar() {

  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  async function loadUnread() {
    try {
      const res = await AdminNotificationsService.unreadCount()
      setUnread(res?.unread ?? 0)
    } catch {
      setUnread(0)
    }
  }

  useEffect(() => {

    loadUnread()

    const token = localStorage.getItem("token")
    if (!token) return

  


  }, [])

  return (
    <header className="h-16 bg-[#0B0E11] border-b border-[#1E2329] flex items-center justify-between px-8">

      {/* SEARCH */}
      <div>
        <input
          placeholder="Pesquisar..."
          className="w-72 bg-[#14171A] border border-[#1E2329] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#2A2F36] transition"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-8">

        {/* NOTIFICATIONS */}
        <div
          onClick={() => navigate("/admin/notifications")}
          className="relative cursor-pointer group"
        >
          <Bell className="text-gray-400 group-hover:text-white transition" size={20} />

          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#F6465D] text-white text-[10px] font-semibold px-2 py-[2px] rounded-full shadow">
              {unread}
            </span>
          )}
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 cursor-default">
          <div className="w-8 h-8 rounded-full bg-[#1A1F24] flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <span className="text-sm text-gray-300">
            Admin
          </span>
        </div>

      </div>

    </header>
  )
}