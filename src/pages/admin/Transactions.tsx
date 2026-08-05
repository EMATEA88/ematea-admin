import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"
import { ArrowsLeftRight, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react"

interface Transaction {
  id: number
  type: string
  amount: number
  createdAt: string
  user?: {
    phone?: string
  }
}

export default function AdminTransactions() {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.transactions()

      const list = Array.isArray(res)
        ? res
        : res?.items ?? []

      setItems(list)

    } catch {
      toast.error("Erro ao carregar transações")
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((t) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(t.id).includes(s) ||
      String(t.user?.phone || "").toLowerCase().includes(s) ||
      String(t.type).toLowerCase().includes(s)
    )
  })

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
            <span className="text-gray-400 text-xs font-mono">Ledger & Transações</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Transações
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ArrowsLeftRight size={16} className="text-blue-400" />
            Registo global de todas as movimentações e operações financeiras da plataforma.
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

      {/* SEARCH BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Pesquisar por ID, telefone ou tipo..."
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
                render: (r: Transaction) => (
                  <span className="text-blue-400 text-xs font-mono font-bold">
                    #{r.id}
                  </span>
                )
              },

              {
                key: "user",
                label: "Telefone",
                render: (r: Transaction) =>
                  <span className="font-semibold text-gray-200">
                    {r.user?.phone || "-"}
                  </span>
              },

              {
                key: "type",
                label: "Tipo",
                render: (r: Transaction) =>
                  <TypeBadge type={r.type} />
              },

              {
                key: "amount",
                label: "Valor",
                render: (r: Transaction) =>
                  <Amount value={r.amount} type={r.type} />
              },

              {
                key: "createdAt",
                label: "Data",
                render: (r: Transaction) =>
                  <span className="text-gray-400 text-xs font-mono">
                    {formatDate(r.createdAt)}
                  </span>
              },
            ]}
          />
        )}
      </div>

    </div>
  )
}

/* ================= AMOUNT ================= */

function Amount({ value, type }: { value: number; type: string }) {
  const creditTypes = ["RECHARGE", "SELL_CREDIT", "COMMISSION", "GIFT"]
  const isCredit = creditTypes.includes(type)

  return (
    <span className={`font-black font-mono ${
      isCredit ? "text-emerald-400" : "text-red-400"
    }`}>
      {isCredit ? "+" : "-"} {formatMoney(value)}
    </span>
  )
}

/* ================= BADGES ================= */

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    RECHARGE: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    WITHDRAW: "bg-red-500/10 text-red-400 border border-red-500/20",
    BUY_DEBIT: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    SELL_CREDIT: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    SERVICE_DEBIT: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    COMMISSION: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    GIFT: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[type] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
      {type}
    </span>
  )
}

/* ================= UTILS ================= */

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value ?? 0)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-AO")
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse py-4 border-b border-white/5 last:border-none">
      <div className="w-12 h-4 bg-white/5 rounded" />
      <div className="w-32 h-4 bg-white/5 rounded" />
      <div className="w-24 h-6 bg-white/5 rounded-full" />
      <div className="w-28 h-4 bg-white/5 rounded" />
      <div className="w-36 h-4 bg-white/5 rounded" />
    </div>
  )
}