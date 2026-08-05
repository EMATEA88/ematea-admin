import { useEffect, useState } from "react"
import { KYCService } from "../../../services/kyc"
import toast from "react-hot-toast"
import { Eye, X, CheckCircle2, XCircle, ShieldAlert } from "lucide-react"

interface Verification {
  user: {
    id: number
    phone: string
    email?: string
    fullName?: string
  }
  fullName?: string
  frontImage: string
  backImage: string
  selfieImage: string
  status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED"
  rejectionReason?: string
  submittedAt?: string
}

export default function AdminKYCPage() {
  const [data, setData] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  
  const [selectedImage, setSelectedImage] = useState<{ src: string; label: string } | null>(null)

  async function load() {
    try {
      const res = await KYCService.list()
      setData(res.data.items ?? [])
    } catch {
      toast.error("Erro ao carregar verificações")
    } finally {
      setLoading(false)
    }
  }

  async function approve(userId: number) {
    try {
      setActionLoading(userId)
      await KYCService.approve(userId)
      toast.success("KYC aprovado com sucesso!")
      load()
    } catch {
      toast.error("Erro ao aprovar verificação")
    } finally {
      setActionLoading(null)
    }
  }

  async function reject(userId: number) {
    const reason = prompt("Indique o motivo da rejeição:")
    if (!reason) return

    try {
      setActionLoading(userId)
      await KYCService.reject(userId, reason)
      toast.success("KYC rejeitado.")
      load()
    } catch {
      toast.error("Erro ao rejeitar verificação")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Conformidade & Compliance
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Verificações KYC & Compliance
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldAlert size={16} className="text-emerald-500" />
            Auditoria de identidade institucional, validação de documentos e conformidade regulatória.
          </p>
        </div>
      </div>

      {/* LISTA / SKELETON */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : data.length === 0 ? (
        <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-12 text-center text-gray-500 space-y-2 shadow-xl">
          <ShieldAlert className="mx-auto text-gray-600" size={32} />
          <p className="text-sm font-semibold">Nenhuma verificação pendente ou registada encontrada.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((item) => {
            const displayName = item.fullName || item.user.fullName || "Nome não informado"
            
            return (
              <div
                key={item.user.id}
                className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl hover:border-white/10 transition-all"
              >
                {/* TOP INFO & STATUS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0E11] p-5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Utilizador / Cliente
                    </span>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-black text-white">{displayName}</h2>
                      <span className="text-xs text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                        ID: {item.user.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Telemóvel: <span className="text-gray-200 font-medium">{item.user.phone}</span> {item.user.email ? `• Email: ${item.user.email}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-start md:self-auto">
                    <StatusBadge status={item.status} />
                    
                    {item.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading === item.user.id}
                          onClick={() => approve(item.user.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-lg cursor-pointer uppercase tracking-wider"
                        >
                          <CheckCircle2 size={16} />
                          {actionLoading === item.user.id ? "A processar..." : "Aprovar"}
                        </button>

                        <button
                          disabled={actionLoading === item.user.id}
                          onClick={() => reject(item.user.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                        >
                          <XCircle size={16} />
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* IMAGENS DO DOCUMENTO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <KycImageCard 
                    src={item.frontImage} 
                    label="Documento (Frente)" 
                    onZoom={(src) => setSelectedImage({ src, label: "Documento - Frente" })} 
                  />
                  <KycImageCard 
                    src={item.backImage} 
                    label="Documento (Verso)" 
                    onZoom={(src) => setSelectedImage({ src, label: "Documento - Verso" })} 
                  />
                  <KycImageCard 
                    src={item.selfieImage} 
                    label="Selfie Biométrica" 
                    onZoom={(src) => setSelectedImage({ src, label: "Selfie Biométrica" })} 
                  />
                </div>

                {/* MOTIVO DA REJEIÇÃO */}
                {item.rejectionReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-xs flex items-start gap-3">
                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold uppercase tracking-wider block mb-0.5">Motivo da Rejeição:</strong>
                      {item.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ================= MODAL DE ZOOM DE IMAGEM ================= */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-[#161A1F] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedImage.label}
              </h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-center bg-[#0B0E11] rounded-xl overflow-hidden border border-white/5 p-4 max-h-[75vh]">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.label} 
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ================= BADGE DE STATUS ================= */
function StatusBadge({ status }: { status: "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" }) {
  const map: Record<string, { label: string; style: string }> = {
    PENDING: { label: "Pendente", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    IN_REVIEW: { label: "Em Revisão", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    VERIFIED: { label: "Verificado", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    REJECTED: { label: "Rejeitado", style: "bg-red-500/10 text-red-400 border-red-500/20" },
  }

  const current = map[status] || { label: status, style: "bg-gray-500/10 text-gray-400 border-gray-500/20" }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.style}`}>
      {current.label}
    </span>
  )
}

/* ================= COMPONENTE DE CARTÃO DE IMAGEM ================= */
function KycImageCard({ src, label, onZoom }: { src: string; label: string; onZoom: (src: string) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>

      <div 
        onClick={() => onZoom(src)}
        className="group relative bg-[#0B0E11] border border-white/5 rounded-xl overflow-hidden h-44 cursor-pointer flex items-center justify-center transition-all hover:border-white/20 shadow-inner"
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs">
          <Eye size={18} />
          <span>Ver Imagem Completa</span>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTE SKELETON ================= */
function SkeletonCard() {
  return (
    <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl animate-pulse">
      <div className="bg-[#0B0E11] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-24 h-3 bg-white/5 rounded" />
          <div className="w-48 h-5 bg-white/5 rounded" />
          <div className="w-64 h-3 bg-white/5 rounded" />
        </div>
        <div className="w-20 h-6 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <div className="w-32 h-3 bg-white/5 rounded" />
          <div className="h-44 bg-white/5 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="w-32 h-3 bg-white/5 rounded" />
          <div className="h-44 bg-white/5 rounded-xl" />
        </div>
        <div className="space-y-2">
          <div className="w-32 h-3 bg-white/5 rounded" />
          <div className="h-44 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  )
}