import { useState } from "react"
import { api } from "../../services/api"
import { Gift, Copy, Check, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminGift() {
  const [amount, setAmount] = useState(100)
  const [days, setDays] = useState(7)
  const [quantity, setQuantity] = useState(1)

  const [codes, setCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  async function generate() {
    if (amount <= 0 || days <= 0 || quantity <= 0) {
      toast.error("Valores inválidos")
      return
    }

    try {
      setLoading(true)

      const res = await api.post("/gift/generate", {
        amount,
        expiresInDays: days,
        quantity
      })

      const list =
        res.data?.gifts?.map((g: any) => g.code) ||
        res.data?.map((g: any) => g.code) ||
        []

      setCodes(list)

      if (list.length > 0) {
        toast.success("Códigos gerados com sucesso")
      }

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Erro ao gerar códigos"
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyOne(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join("\n"))
    setCopied("ALL")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">

      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Marketing & Promoções
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Gift System</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Gestão de Gift Codes
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Criação controlada e automatizada de códigos promocionais para os utilizadores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA DO FORMULÁRIO (5/12) */}
        <div className="lg:col-span-5 bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Gerador de Códigos
              </h2>
              <p className="text-xs text-gray-500">Defina os parâmetros do bônus promocional</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <Gift size={20} className="text-amber-400" />
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Valor (AOA)"
              value={amount}
              onChange={v => setAmount(v)}
            />

            <Input
              label="Validade (Dias)"
              value={days}
              onChange={v => setDays(v)}
            />

            <Input
              label="Quantidade de Códigos"
              value={quantity}
              onChange={v => setQuantity(v)}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all duration-200 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Gerando Códigos...
              </>
            ) : (
              <>
                <Gift size={16} />
                Gerar Códigos
              </>
            )}
          </button>
        </div>

        {/* COLUNA DOS RESULTADOS (7/12) */}
        <div className="lg:col-span-7">
          {codes.length > 0 ? (
            <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">
                    Códigos Gerados
                  </h3>
                  <p className="text-xs text-gray-500">{codes.length} código(s) criado(s) com sucesso</p>
                </div>

                <button
                  onClick={copyAll}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl transition"
                >
                  {copied === "ALL" ? <Check size={16} /> : <Copy size={16} />}
                  Copiar todos
                </button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {codes.map(code => (
                  <div
                    key={code}
                    className="flex justify-between items-center bg-[#0B0E11] border border-white/5 px-5 py-3.5 rounded-xl hover:border-white/10 transition"
                  >
                    <span className="font-mono text-xs tracking-wider text-gray-200 font-bold">
                      {code}
                    </span>

                    <button
                      onClick={() => copyOne(code)}
                      className="text-gray-400 hover:text-amber-400 transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                      title="Copiar código"
                    >
                      {copied === code ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-12 text-center space-y-4 shadow-xl flex flex-col items-center justify-center min-h-[360px]">
              <div className="p-4 rounded-full bg-white/5 text-gray-600 border border-white/5">
                <Gift size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm uppercase tracking-wider text-gray-400">Nenhum código gerado ainda</h3>
                <p className="text-xs text-gray-600 max-w-sm">Preencha os campos ao lado e clique em "Gerar Códigos" para criar lotes promocionais.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

/* =========================
   INPUT COMPONENT DARK MODERN
========================= */

function Input({
  label,
  value,
  onChange
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </label>

      <input
        type="text"
        inputMode="numeric"
        className="w-full bg-[#0B0E11] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition font-mono font-bold"
        value={value}
        onChange={e =>
          onChange(
            Number(e.target.value.replace(/\D/g, "")) || 0
          )
        }
      />
    </div>
  )
}