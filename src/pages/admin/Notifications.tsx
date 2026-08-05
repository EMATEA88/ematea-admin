import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { AdminNotificationsService } from "../../services/admin.notifications.service"
import { Bell, PaperPlaneTilt, Trash, ArrowClockwise, CaretLeft, CaretRight } from "@phosphor-icons/react"

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

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans relative">

      {/* TOAST VISUAL FIXO */}
      {toastData && (
        <div
          onClick={() => {
            if (toastData.orderId) {
              navigate(`/admin/otc/${toastData.orderId}`)
            }
            setToastData(null)
          }}
          className="fixed top-6 right-6 z-[9999] bg-[#161A1F] border border-blue-500/30 shadow-2xl rounded-2xl p-4 w-80 cursor-pointer hover:scale-[1.02] transition"
        >
          <p className="font-bold text-sm text-white">
            {toastData.title}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {toastData.message}
          </p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Sistema de Comunicação
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Gestão de Alertas</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Notificações
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Bell size={16} className="text-blue-400" />
            Envie broadcasts globais e acompanhe o histórico de mensagens enviadas aos utilizadores.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >
          <ArrowClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* BROADCAST CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <PaperPlaneTilt size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Enviar Broadcast Global</h2>
            <p className="text-xs text-gray-400">Esta mensagem será disparada instantaneamente para todos os utilizadores registados.</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            className="w-full bg-[#0B0E11] border border-white/5 px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
            placeholder="Título da notificação..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <textarea
            className="w-full bg-[#0B0E11] border border-white/5 px-4 py-3 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl h-32 resize-none"
            placeholder="Escreva aqui o conteúdo detalhado da mensagem de broadcast..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          <div className="flex justify-end">
            <button
              disabled={sending}
              onClick={sendBroadcast}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              <PaperPlaneTilt size={16} />
              {sending ? "A enviar..." : "Enviar Broadcast"}
            </button>
          </div>
        </div>
      </div>

      {/* LIST CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-16 space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="bg-[#0B0E11] text-gray-400 border-b border-white/5 text-xs uppercase tracking-wider font-black">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Título</th>
                  <th className="px-6 py-4 text-left">Mensagem</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-left">Data</th>
                  <th className="px-6 py-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Bell size={32} className="text-gray-600" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nenhuma notificação encontrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map(n => (
                    <tr
                      key={n.id}
                      onClick={() => handleClickNotification(n)}
                      className="hover:bg-white/[0.02] transition cursor-pointer"
                    >
                      <td className="px-6 py-4 text-blue-400 text-xs font-mono font-bold">
                        #{n.id}
                      </td>

                      <td className="px-6 py-4 font-bold text-white">
                        {n.title}
                      </td>

                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                        {n.message}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {n.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                        {new Date(n.createdAt).toLocaleString("pt-AO")}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          disabled={deletingId === n.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(n.id)
                          }}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                        >
                          <Trash size={14} />
                          {deletingId === n.id ? "A eliminar..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-6 bg-[#0B0E11] border-t border-white/5 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161A1F] hover:bg-[#1C2128] text-white border border-white/5 disabled:opacity-30 transition cursor-pointer text-xs font-bold uppercase tracking-wider"
          >
            <CaretLeft size={16} />
            Anterior
          </button>

          <span className="text-gray-400 text-xs font-mono">
            Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161A1F] hover:bg-[#1C2128] text-white border border-white/5 disabled:opacity-30 transition cursor-pointer text-xs font-bold uppercase tracking-wider"
          >
            Próxima
            <CaretRight size={16} />
          </button>
        </div>

      </div>

    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse py-4 border-b border-white/5 last:border-none">
      <div className="w-12 h-4 bg-white/5 rounded" />
      <div className="w-32 h-4 bg-white/5 rounded" />
      <div className="w-64 h-4 bg-white/5 rounded" />
      <div className="w-20 h-6 bg-white/5 rounded-full" />
      <div className="w-36 h-4 bg-white/5 rounded" />
      <div className="w-24 h-8 bg-white/5 rounded-xl" />
    </div>
  )
}