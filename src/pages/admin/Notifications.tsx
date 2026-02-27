import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { AdminNotificationsService }
  from "../../services/admin.notifications.service"
import {
  connectAdminSocket,
  disconnectAdminSocket
} from "../../services/socket"

interface NotificationItem {
  id: number
  title: string
  message: string
  type: string
  createdAt: string
  orderId?: number
}

interface NotificationResponse {
  items: NotificationItem[]
  total: number
  page: number
  totalPages: number
}

interface ToastData {
  title: string
  message: string
  orderId?: number
}

export default function AdminNotifications() {

  const navigate = useNavigate()

  const [items, setItems] = useState<NotificationItem[]>([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [toastData, setToastData] = useState<ToastData | null>(null)

  /* ================= LOAD ================= */

  useEffect(() => {
    load()
  }, [page])

  async function load() {
    try {
      setLoading(true)

      const res: NotificationResponse =
        await AdminNotificationsService.list(page, 10)

      setItems(res.items)
      setTotalPages(res.totalPages)

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Erro ao carregar notificações"
      )
    } finally {
      setLoading(false)
    }
  }

  /* ================= SOCKET ================= */

  useEffect(() => {

    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectAdminSocket(token)

    socket.on("notification:new", (data: ToastData) => {

      setToastData(data)

      load()

      toast("Nova notificação recebida", {
        icon: "🔔"
      })

      setTimeout(() => {
        setToastData(null)
      }, 4000)
    })

    return () => {
      socket.off("notification:new")
      disconnectAdminSocket()
    }

  }, [])

  /* ================= SEND ================= */

  async function sendBroadcast() {

    if (!title.trim() || !message.trim()) {
      toast.error("Título e mensagem são obrigatórios")
      return
    }

    try {
      setSending(true)

      await AdminNotificationsService.broadcast(
        title,
        message,
        "INFO"
      )

      toast.success("Broadcast enviado com sucesso")

      setTitle("")
      setMessage("")
      setPage(1)
      await load()

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Erro ao enviar notificação"
      )
    } finally {
      setSending(false)
    }
  }

  /* ================= DELETE ================= */

  async function deleteNotification(id: number) {
    try {
      setDeletingId(id)

      await AdminNotificationsService.delete(id)

      toast.success("Notificação eliminada")
      await load()

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Erro ao eliminar notificação"
      )
    } finally {
      setDeletingId(null)
    }
  }

  /* ================= CLICK ITEM ================= */

  async function handleClickNotification(n: NotificationItem) {

    if (n.orderId) {
      navigate(`/admin/otc/${n.orderId}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Carregando notificações...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 relative">

      {/* TOAST CLICÁVEL */}
      {toastData && (
        <div
          onClick={() => {
            if (toastData.orderId) {
              navigate(`/admin/otc/${toastData.orderId}`)
            }
            setToastData(null)
          }}
          className="fixed top-6 right-6 z-[9999] bg-gray-900 text-white border border-indigo-500/40 shadow-2xl rounded-xl p-4 w-80 cursor-pointer hover:scale-[1.02] transition"
        >
          <p className="font-semibold text-sm">
            {toastData.title}
          </p>
          <p className="text-xs text-gray-300 mt-1">
            {toastData.message}
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold">
        Notificações (Admin)
      </h1>

      {/* Broadcast */}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          Enviar Broadcast Global
        </h2>

        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="border px-3 py-2 rounded w-full h-24"
          placeholder="Mensagem"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <button
          disabled={sending}
          onClick={sendBroadcast}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {sending ? "A enviar..." : "Enviar Broadcast"}
        </button>

      </div>

      {/* LIST */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Título</th>
              <th className="p-3">Mensagem</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Data</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>

          <tbody>

            {items.map(n => (
              <tr
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="p-3">{n.id}</td>
                <td className="p-3 font-medium">{n.title}</td>
                <td className="p-3 text-gray-600">{n.message}</td>
                <td className="p-3 text-xs font-semibold">{n.type}</td>
                <td className="p-3">
                  {new Date(n.createdAt).toLocaleString("pt-AO")}
                </td>
                <td className="p-3">
                  <button
                    disabled={deletingId === n.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(n.id)
                    }}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1 rounded text-xs"
                  >
                    {deletingId === n.id
                      ? "A eliminar..."
                      : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

        {/* PAGINATION */}

        <div className="flex justify-between items-center p-4 bg-gray-50">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-sm">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Próxima
          </button>

        </div>

      </div>

    </div>
  )
}