import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"
import toast from "react-hot-toast"
import { AdminNotificationsService } from "../../services/admin.notifications.service"
import { connectAdminSocket } from "../../services/socket"

export default function Topbar() {

  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  /* ================= LOAD COUNT ================= */

  async function loadUnread() {
    try {
      const res = await AdminNotificationsService.unreadCount()
      setUnread(res?.unread ?? 0)
    } catch {
      setUnread(0)
    }
  }

  /* ================= SOCKET ================= */

  useEffect(() => {

    loadUnread()

    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectAdminSocket(token)

    socket.on("notification:new", () => {
      loadUnread()
      toast("Nova notificação", { icon: "🔔" })
    })

    return () => {
      socket.off("notification:new")
    }

  }, [])

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      <input
        placeholder="Pesquisar..."
        className="border rounded px-3 py-1 text-sm w-64"
      />

      <div className="flex items-center gap-6">

        <div
          onClick={() => navigate("/admin/notifications")}
          className="relative cursor-pointer hover:scale-105 transition"
        >
          <Bell className="text-gray-600" />

          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>

        <div className="text-sm font-medium">
          Admin
        </div>

      </div>

    </header>
  )
}