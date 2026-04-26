import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { 
  Send, 
  Loader2, 
  CheckCircle2,  
  ChevronLeft, 
  User, 
  Wallet, 
  ShieldCheck,
  Circle,
  ArrowUpRight,
  MessageSquare
} from "lucide-react"
import { AdminService } from "../../services/admin.service"
import {
  connectAdminSocket,
  disconnectAdminSocket
} from "../../services/socket"

export default function OtcOrdemDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = Number(id)

  const [order, setOrder] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [typing, setTyping] = useState(false)
  const [online, setOnline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)
  const typingTimeout = useRef<any>(null)

  const load = useCallback(async () => {
    try {
      const data = await AdminService.otcOrderDetail(orderId)
      setOrder(data)
    } catch {
      toast.error("Erro ao sincronizar dados da ordem")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) load()
  }, [load, orderId])

  /* LOGICA DE SOCKET COM CORREÇÃO DE PRESENÇA */
  useEffect(() => {
    if (!orderId) return
    const token = localStorage.getItem("token")
    if (!token) return

    const socket = connectAdminSocket(token)
    socketRef.current = socket
    
    socket.emit("admin:join-otc", orderId)
    // Força o servidor a enviar o status atual do cliente imediatamente
    socket.emit("otc:request-presence", orderId)

    // Listener de presença simplificado para evitar dessincronia de IDs
    socket.on("presence:update", (data: any) => {
      console.log("Presença atualizada:", data)
      if (data.isOnline !== undefined) {
        setOnline(data.isOnline)
      }
    })

    /* Substitua o bloco do socket.on("otc:new-message") por este: */

socket.on("otc:new-message", (msg: any) => {
  console.log("📩 Nova mensagem recebida via Socket:", msg); // Adicione para debug
  
  setOrder((currentOrder: any) => {
    // Se não houver ordem carregada ou a mensagem for de outra ordem, ignora
    if (!currentOrder || msg.orderId !== orderId) return currentOrder;

    const messages = currentOrder.conversation?.messages || [];
    
    // Evita duplicatas (importante para o envio otimista)
    const isDuplicate = messages.some((m: any) => 
      m.id === msg.id || (msg.tempId && m.tempId === msg.tempId)
    );

    if (isDuplicate) return currentOrder;

    return {
      ...currentOrder,
      conversation: {
        ...currentOrder.conversation,
        messages: [...messages, msg]
      }
    };
  });
});

    socket.on("otc:status-update", (data: any) => {
      if (data.orderId === orderId) {
        setOrder((prev: any) => ({ ...prev, status: data.status }))
        toast.success(`Status atualizado: ${data.status}`, { icon: '🔄' })
      }
    })

    socket.on("otc:typing", (data: any) => {
      if (data.role !== "ADMIN") setTyping(true)
    })

    socket.on("otc:stop-typing", () => setTyping(false))

    return () => {
      socket.off("presence:update")
      socket.off("otc:new-message")
      socket.off("otc:status-update")
      socket.off("otc:typing")
      socket.off("otc:stop-typing")
      disconnectAdminSocket()
    }
  }, [orderId]) // Removido order?.user?.id das dependências para evitar loops ou falhas de atribuição

  /* AUTO SCROLL */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [order?.conversation?.messages])

  function send() {
    if (!message.trim() || !socketRef.current || !order) return

    const messageText = message.trim()
    const tempId = Date.now()

    const newMessage = {
      id: tempId,
      tempId: tempId,
      content: messageText,
      isAdmin: true,
      type: "TEXT",
      createdAt: new Date().toISOString(),
    }

    setOrder((prev: any) => ({
      ...prev,
      conversation: {
        ...prev.conversation,
        messages: [...(prev.conversation?.messages || []), newMessage]
      }
    }))

    setMessage("")
    socketRef.current.emit("otc:admin-message", { 
  orderId: Number(orderId), 
  message: messageText,
  tempId 
});
  }

  async function handleAction(type: 'paid' | 'release') {
    if (processing) return
    setProcessing(true)
    const t = toast.loading(type === 'paid' ? "Processando confirmação..." : "Iniciando liberação de ativos...")
    
    try {
      if (type === 'paid') {
        await AdminService.markSellAsPaid(order.id)
      } else {
        await AdminService.releaseOtcOrder(order.id)
      }
      toast.success("Operação realizada com sucesso!", { id: t })
      await load()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro na operação"
      toast.error(errorMsg, { id: t })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0E11]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#FCD535]" size={48} />
        <span className="text-xs font-bold tracking-[0.2em] text-gray-500">CARREGANDO OTC...</span>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0B0E11] text-[#EAECEF] font-sans overflow-hidden">
      
      {/* PAINEL ESQUERDO */}
      <div className="w-[400px] bg-[#181A20] border-r border-[#2B3139] flex flex-col shadow-2xl z-20">
        <header className="p-8 border-b border-[#2B3139] bg-[#1E2329]/30">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-500 hover:text-[#FCD535] mb-8 transition-all group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Dashboard de Ordens</span>
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Identificador</p>
              <h1 className="text-3xl font-black tracking-tighter">#{order.id}</h1>
            </div>
            <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black border transition-all shadow-lg ${
              order.status === 'RELEASED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5' : 
              order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/5' : 
              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'
            }`}>
              {order.status}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Contraparte</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-md">
                <Circle size={6} fill={online ? "#02C076" : "#474D57"} className={online ? "animate-pulse text-[#02C076]" : "text-[#474D57]"} />
                <span className={`text-[9px] font-black ${online ? "text-[#02C076]" : "text-gray-400"}`}>
                  {online ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
            <div className="bg-[#1E2329] p-5 rounded-2xl border border-[#2B3139] hover:border-[#FCD535]/30 transition-colors">
              <span className="text-lg font-bold tracking-tight">{order.user?.phone}</span>
              <p className="text-[10px] text-gray-500 mt-1 font-medium italic">Usuário verificado via SMS</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Wallet size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Liquidação em AOA</span>
            </div>
            <div className="bg-gradient-to-br from-[#1E2329] to-[#181A20] p-6 rounded-2xl border border-[#2B3139] shadow-inner">
              <div className="flex justify-between items-start mb-2">
                <p className="text-4xl font-black text-[#FCD535] tracking-tighter">
                  {Number(order.totalAoa).toLocaleString('pt-AO')}
                </p>
                <span className="text-xs font-bold text-[#FCD535]/60 mt-2">Kz</span>
              </div>
              <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#FCD535] w-2/3 opacity-20" />
              </div>
            </div>
          </section>

          <div className="pt-6 border-t border-[#2B3139] space-y-4">
            {order.type === "SELL" && order.status === "PENDING" && (
              <button
                onClick={() => handleAction('paid')}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 py-5 rounded-2xl text-xs font-black transition-all active:scale-[0.97] shadow-xl"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : "CONFIRMAR RECEBIMENTO"}
                <ArrowUpRight size={16} />
              </button>
            )}

            {order.status === "PAID" && (
              <button
                onClick={() => handleAction('release')}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 bg-[#02C076] text-white hover:bg-[#02a062] py-5 rounded-2xl text-xs font-black transition-all shadow-[0_12px_24px_rgba(2,192,118,0.15)] active:scale-[0.97]"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : "LIBERAR ATIVOS (RELEASE)"}
                <CheckCircle2 size={16} />
              </button>
            )}
            
            <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
              <p className="text-[10px] text-blue-500/70 font-semibold leading-relaxed">
                Este canal está sob custódia inteligente. A liberação só deve ocorrer após verificação manual do extrato bancário.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DIREITO: CHAT */}
      <div className="flex-1 flex flex-col relative bg-[#080a0c]">
        <header className="h-24 border-b border-[#2B3139] flex items-center justify-between px-10 bg-[#181A20]/60 backdrop-blur-2xl z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FCD535]/10 rounded-xl text-[#FCD535]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight uppercase">Canal de Custódia OTC</h3>
              <div className="flex items-center gap-2 mt-1">
                {typing ? (
                  <span className="text-[10px] text-[#02C076] font-black animate-pulse flex items-center gap-1.5">
                    DIGITANDO...
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Canal Criptografado</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div ref={chatRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {order.conversation?.messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.isAdmin ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className="max-w-[65%] group">
                <div className={`px-6 py-4 rounded-[24px] text-[14px] leading-relaxed shadow-2xl transition-all ${
                  m.isAdmin 
                    ? "bg-[#FCD535] text-[#181A20] rounded-tr-none font-bold" 
                    : "bg-[#1E2329] border border-[#2B3139] text-[#EAECEF] rounded-tl-none"
                }`}>
                  {m.content}
                </div>
                <div className={`flex items-center gap-2 mt-2 px-1 ${m.isAdmin ? "justify-end" : "justify-start"}`}>
                  <p className="text-[9px] font-black text-gray-600 uppercase">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {m.isAdmin && <CheckCircle2 size={10} className="text-[#FCD535]/40" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="p-8 bg-[#181A20] border-t border-[#2B3139]">
          <div className="max-w-5xl mx-auto flex gap-4">
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                socketRef.current?.emit("otc:typing", orderId)
                clearTimeout(typingTimeout.current)
                typingTimeout.current = setTimeout(() => socketRef.current?.emit("otc:stop-typing", orderId), 2000)
              }}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 bg-[#0B0E11] border border-[#2B3139] focus:border-[#FCD535] rounded-[20px] px-8 py-5 text-sm outline-none transition-all"
              placeholder="Digite a mensagem oficial para o cliente..."
            />
            <button
              onClick={send}
              disabled={!message.trim()}
              className="bg-[#FCD535] hover:bg-[#efca2d] text-black w-[64px] h-[64px] flex items-center justify-center rounded-[20px] active:scale-90 disabled:opacity-20 transition-all"
            >
              <Send size={24} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}