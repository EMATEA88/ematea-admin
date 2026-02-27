import { useEffect, useState, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Send } from "lucide-react"
import { AdminService } from "../../services/admin.service"
import {
  connectAdminSocket,
  disconnectAdminSocket
} from "../../services/socket"

export default function OtcOrdemDetalhe() {

  const { id } = useParams()
  const orderId = Number(id)

  const [order, setOrder] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [typing, setTyping] = useState(false)
  const [online, setOnline] = useState(false)
  const [loading, setLoading] = useState(true)

  const chatRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<any>(null)

  /* ================= LOAD ================= */

  const load = useCallback(async () => {
    try {
      const data = await AdminService.otcOrderDetail(orderId)
      setOrder(data)
    } catch {
      toast.error("Erro ao carregar ordem")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!orderId) return
    load()
  }, [load, orderId])

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!orderId) return

    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectAdminSocket(token)

    socket.emit("admin:join-otc", orderId)

    socket.on("otc:new-message", (msg: any) => {
      setOrder((prev: any) => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          messages: [...prev.conversation.messages, msg]
        }
      }))

      socket.emit("otc:mark-read", orderId)
    })

    socket.on("otc:status-update", (data: any) => {
      if (data.orderId === orderId) {
        setOrder((prev: any) => ({
          ...prev,
          status: data.status
        }))
      }
    })

    socket.on("otc:typing", (data: any) => {
      if (!data?.role || data.role === "ADMIN") return
      setTyping(true)
    })

    socket.on("otc:stop-typing", () => {
      setTyping(false)
    })

    socket.on("presence:update", (data: any) => {
      if (data.userId === order?.user?.id) {
        setOnline(data.isOnline)
      }
    })

    return () => {
      disconnectAdminSocket()
    }

  }, [orderId, order?.user?.id])

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [order?.conversation?.messages])

  /* ================= SEND ================= */

  function send() {
    if (!message.trim()) return

    const socket = connectAdminSocket(
      localStorage.getItem("token") as string
    )

    socket.emit("otc:message", {
      orderId,
      message: message.trim()
    })

    setMessage("")
  }

  function handleTyping(value: string) {
    setMessage(value)

    const socket = connectAdminSocket(
      localStorage.getItem("token") as string
    )

    socket.emit("otc:typing", orderId)

    clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      socket.emit("otc:stop-typing", orderId)
    }, 1200)
  }

  async function handleRelease() {
    try {
      await AdminService.releaseOtcOrder(order.id)
      toast.success("Fundos liberados")
      load()
    } catch {
      toast.error("Erro ao liberar ordem")
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-700"
      case "PAID":
        return "bg-yellow-100 text-yellow-700"
      case "RELEASED":
        return "bg-emerald-100 text-emerald-700"
      case "CANCELLED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (!order) return null

  return (
    <div className="flex h-screen bg-[#F5F7FA]">

      {/* LEFT PANEL */}
      <div className="w-96 bg-white border-r flex flex-col">

        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Ordem #{order.id}
          </h2>

          <div className="mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm">

          <div>
            <p className="text-gray-500">Utilizador</p>
            <p className="font-medium flex items-center gap-2">
              {order.user?.phone}
              <span className={`text-xs ${online ? "text-emerald-500" : "text-gray-400"}`}>
                {online ? "Online" : "Offline"}
              </span>
            </p>
          </div>

          <div>
            <p className="text-gray-500">Asset</p>
            <p className="font-medium">{order.asset?.symbol}</p>
          </div>

          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-semibold text-lg">
              {order.totalAoa} Kz
            </p>
          </div>

        </div>

        {order.status === "PAID" && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm font-medium text-emerald-700">
              Pagamento confirmado pelo cliente
            </p>

            <button
              onClick={handleRelease}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              Liberar Fundos
            </button>
          </div>
        )}

      </div>

      {/* RIGHT PANEL - CHAT */}
      <div className="flex-1 flex flex-col bg-white">

        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-sm">
              Chat da negociação
            </h3>
            {typing && (
              <p className="text-xs text-gray-400 mt-1">
                Cliente está digitando...
              </p>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB]"
        >
          {order.conversation?.messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-2xl text-sm shadow-sm
                  ${m.isAdmin
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-200 rounded-bl-sm"
                  }`}
              >
                {m.type === "IMAGE"
                  ? <img src={m.content} className="rounded-xl max-w-full" />
                  : m.content}

                <div className="text-[10px] opacity-60 mt-2 text-right">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FIXED INPUT */}
        <div className="p-4 border-t bg-white flex gap-3">
          <input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Digite uma mensagem..."
          />
          <button
            onClick={send}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition"
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}