import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { AdminNotificationsService }
  from "../../services/admin.notifications.service"

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

  async function handleClickNotification(n: NotificationItem) {
    if (n.orderId) {
      navigate(`/admin/otc/${n.orderId}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-gray-400">
        Carregando notificações...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 relative text-white">

      {/* TOAST VISUAL FIXO */}
      {toastData && (
        <div
          onClick={() => {
            if (toastData.orderId) {
              navigate(`/admin/otc/${toastData.orderId}`)
            }
            setToastData(null)
          }}
          className="
            fixed top-6 right-6 z-[9999]
            bg-gray-950
            border border-emerald-500/30
            shadow-2xl
            rounded-2xl
            p-4 w-80
            cursor-pointer
            hover:scale-[1.02]
            transition
          "
        >
          <p className="font-semibold text-sm">
            {toastData.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {toastData.message}
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight">
        Notificações
      </h1>

      {/* BROADCAST CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        p-6 space-y-4
      ">
        <h2 className="text-lg font-semibold">
          Enviar Broadcast Global
        </h2>

        <input
          className="
            bg-gray-900
            border border-gray-700
            px-4 py-2
            rounded-lg
            w-full
            focus:outline-none
            focus:border-emerald-500
          "
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="
            bg-gray-900
            border border-gray-700
            px-4 py-2
            rounded-lg
            w-full h-24
            focus:outline-none
            focus:border-emerald-500
          "
          placeholder="Mensagem"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <button
          disabled={sending}
          onClick={sendBroadcast}
          className="
            bg-emerald-600
            hover:bg-emerald-700
            disabled:opacity-50
            text-white
            px-5 py-2
            rounded-lg
            transition
          "
        >
          {sending ? "A enviar..." : "Enviar Broadcast"}
        </button>
      </div>

      {/* LIST CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">
        <table className="w-full text-sm">

          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Título</th>
              <th className="p-4 text-left">Mensagem</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-left">Data</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>

            {items.map(n => (
              <tr
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className="
                  border-t border-gray-800
                  cursor-pointer
                  hover:bg-gray-800/40
                  transition duration-200
                "
              >
                <td className="p-4 text-gray-400 text-xs">
                  #{n.id}
                </td>

                <td className="p-4 font-semibold">
                  {n.title}
                </td>

                <td className="p-4 text-gray-400">
                  {n.message}
                </td>

                <td className="p-4">
                  <span className="
                    px-3 py-1 rounded-full
                    text-xs font-semibold
                    bg-indigo-600/20 text-indigo-400
                  ">
                    {n.type}
                  </span>
                </td>

                <td className="p-4 text-gray-500 text-xs">
                  {new Date(n.createdAt).toLocaleString("pt-AO")}
                </td>

                <td className="p-4">
                  <button
                    disabled={deletingId === n.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(n.id)
                    }}
                    className="
                      bg-red-600
                      hover:bg-red-700
                      disabled:opacity-50
                      text-white
                      px-3 py-1
                      rounded-lg
                      text-xs
                      transition
                    "
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
        <div className="
          flex justify-between items-center
          p-4
          bg-gray-900
          border-t border-gray-800
          text-sm
        ">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-gray-800
              hover:bg-gray-700
              disabled:opacity-40
              transition
            "
          >
            Anterior
          </button>

          <span className="text-gray-400">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-gray-800
              hover:bg-gray-700
              disabled:opacity-40
              transition
            "
          >
            Próxima
          </button>

        </div>

      </div>

    </div>
  )
}