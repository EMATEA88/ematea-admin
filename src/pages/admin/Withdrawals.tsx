import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"
import { Money, MagnifyingGlass, ArrowClockwise, FilePdf } from "@phosphor-icons/react"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Withdrawal {
  id: number
  userPhone: string
  iban: string
  amount: number
  fee: number
  liquid?: number
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export default function Withdrawals() {
  const [items, setItems] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.withdrawals()

      const list = Array.isArray(res)
        ? res
        : res?.items ?? []

      setItems(list)

    } catch {
      toast.error("Erro ao carregar saques")
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: number) {
    try {
      setProcessingId(id)
      await AdminService.approveWithdrawal(id)
      toast.success("Saque aprovado")
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao aprovar")
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(id: number) {
    try {
      setProcessingId(id)
      await AdminService.rejectWithdrawal(id)
      toast.success("Saque rejeitado")
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao rejeitar")
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = items.filter((i) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(i.id).includes(s) ||
      String(i.userPhone || "").toLowerCase().includes(s) ||
      String(i.iban || "").toLowerCase().includes(s)
    )
  })

  async function exportPDF() {
    try {
      const pending = items.filter(i => i.status === "PENDING")

      if (pending.length === 0) {
        toast.error("Nenhum saque pendente")
        return
      }

      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text("Lista de Saques Pendentes", 14, 15)

      const rows = pending.map((w) => {
        const amount = Number(w.amount || 0)
        const fee = Number(w.fee || 0)
        const liquid =
          w.liquid !== undefined
            ? Number(w.liquid)
            : amount - fee

        return [
          w.userPhone || "-",
          w.iban || "-",
          formatMoney(amount),
          formatMoney(fee),
          formatMoney(liquid),
        ]
      })

      autoTable(doc, {
        head: [["Utilizador", "IBAN", "Valor", "Taxa", "Líquido"]],
        body: rows,
        startY: 20,
      })

      doc.save("withdrawals-pendentes.pdf")
      toast.success("PDF exportado com sucesso")

    } catch {
      toast.error("Erro ao exportar PDF")
    }
  }

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Módulo Financeiro
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Gestão de Saques</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Saques
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Money size={16} className="text-blue-400" />
            Controlo e aprovação de pedidos de levantamento via IBAN dos utilizadores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
          >
            <ArrowClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xl cursor-pointer"
          >
            <FilePdf size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Pesquisar por ID, Telefone ou IBAN..."
            className="w-full bg-[#161A1F] border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={[
              {
                key: "id",
                label: "ID",
                render: (r: Withdrawal) => (
                  <span className="text-blue-400 text-xs font-mono font-bold">
                    #{r.id}
                  </span>
                )
              },

              {
                key: "userPhone",
                label: "Utilizador",
                render: (r: Withdrawal) =>
                  <span className="font-semibold text-gray-200">
                    {r.userPhone}
                  </span>
              },

              { 
                key: "iban", 
                label: "IBAN",
                render: (r: Withdrawal) => (
                  <span className="font-mono text-xs text-gray-400">
                    {r.iban || "-"}
                  </span>
                )
              },

              {
                key: "amount",
                label: "Valor",
                render: (r: Withdrawal) =>
                  <span className="text-amber-400 font-bold font-mono">
                    {formatMoney(r.amount)}
                  </span>
              },

              {
                key: "fee",
                label: "Taxa",
                render: (r: Withdrawal) =>
                  <span className="text-red-400 font-bold font-mono text-xs">
                    {formatMoney(r.fee)}
                  </span>
              },

              {
                key: "liquid",
                label: "Líquido",
                render: (r: Withdrawal) =>
                  <span className="text-emerald-400 font-black font-mono">
                    {formatMoney(
                      r.liquid !== undefined
                        ? r.liquid
                        : r.amount - r.fee
                    )}
                  </span>
              },

              {
                key: "status",
                label: "Estado",
                render: (r: Withdrawal) =>
                  <StatusBadge status={r.status} />
              },

              {
                key: "actions",
                label: "Ações",
                render: (r: Withdrawal) =>
                  r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        disabled={processingId === r.id}
                        onClick={() => approve(r.id)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                      >
                        {processingId === r.id ? "..." : "Aprovar"}
                      </button>

                      <button
                        disabled={processingId === r.id}
                        onClick={() => reject(r.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                      >
                        {processingId === r.id ? "..." : "Rejeitar"}
                      </button>
                    </div>
                  )
              },
            ]}
          />
        )}
      </div>

    </div>
  )
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border border-red-500/20",
  }

  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado"
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {labels[status] || status}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value ?? 0)
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse py-4 border-b border-white/5 last:border-none">
      <div className="w-12 h-4 bg-white/5 rounded" />
      <div className="w-28 h-4 bg-white/5 rounded" />
      <div className="w-40 h-4 bg-white/5 rounded" />
      <div className="w-24 h-4 bg-white/5 rounded" />
      <div className="w-20 h-4 bg-white/5 rounded" />
      <div className="w-24 h-4 bg-white/5 rounded" />
      <div className="w-24 h-6 bg-white/5 rounded-full" />
      <div className="w-28 h-8 bg-white/5 rounded-xl" />
    </div>
  )
}