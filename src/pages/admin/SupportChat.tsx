import { useEffect, useState, useRef } from "react"
import { Send } from "lucide-react"
import { AdminService } from "../../services/admin.service"

interface Message {
  id: number
  content: string
  isAdmin: boolean
  createdAt: string
  type: string
}

interface Conversation {
  id: number
  user: {
    phone: string
  }
  messages: Message[]
  unreadUser: number
  unreadAdmin: number
}

export default function AdminSupport() {

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [message, setMessage] = useState("")
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!chatRef.current) return
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [active])

  async function load() {
    const data = await AdminService.supportList()
    setConversations(data)
  }

  async function send() {
    if (!active || !message.trim()) return

    await AdminService.supportAdminSend({
      conversationId: active.id,
      message
    })

    setMessage("")
    load()
  }

  return (
    <div className="flex h-[88vh] bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* ================= LEFT SIDEBAR ================= */}
      <div className="w-80 border-r bg-[#F8FAFC] flex flex-col">

        <div className="p-5 border-b font-semibold text-sm">
          Conversas
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActive(c)}
              className={`p-4 border-b cursor-pointer transition
                ${active?.id === c.id
                  ? "bg-white"
                  : "hover:bg-gray-100"
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                  {c.user.phone}
                </span>

                {c.unreadAdmin > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {c.unreadAdmin}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= RIGHT CHAT ================= */}
      <div className="flex-1 flex flex-col bg-white">

        {active ? (
          <>
            {/* HEADER */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  {active.user.phone}
                </h3>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9FAFB]"
            >
              {active.messages.map((m) => (
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
                    {m.content}

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
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Digite uma mensagem..."
              />
              <button
                onClick={send}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Selecione uma conversa
          </div>
        )}

      </div>
    </div>
  )
}