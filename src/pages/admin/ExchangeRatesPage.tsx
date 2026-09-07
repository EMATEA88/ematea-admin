import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {  
  ArrowsClockwise,  
  CurrencyCircleDollar,  
  FloppyDisk,  
  ShieldWarning,
  TrendUp
} from "@phosphor-icons/react"

import {
  ExchangeRateService,
  type ExchangeRate,
} from "../../services/ExchangeRateService"

export default function ExchangeRatesPage() {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null)
  const [rate, setRate] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const loadRate = async () => {
    try {
      setLoading(true)

      const data = await ExchangeRateService.get("USDT_AOA")

      setExchangeRate(data)
      setRate(data.rate)
    } catch (error) {
      console.error("EXCHANGE_RATE_LOAD_ERROR:", error)

      toast.error("Não foi possível carregar a taxa de câmbio.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRate()
  }, [])

  const handleUpdate = async () => {
    const normalizedRate = rate.replace(",", ".").trim()

    if (!normalizedRate) {
      toast.error("Informe uma taxa.")
      return
    }

    const numericRate = Number(normalizedRate)

    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      toast.error("Informe uma taxa válida maior que zero.")
      return
    }

    try {
      setSaving(true)

      const updated = await ExchangeRateService.update(
        "USDT_AOA",
        normalizedRate
      )

      setExchangeRate(updated)
      setRate(updated.rate)

      toast.success("Taxa de câmbio atualizada com sucesso.")
    } catch (error) {
      console.error("EXCHANGE_RATE_UPDATE_ERROR:", error)

      toast.error("Não foi possível atualizar a taxa.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja desativar a taxa USDT → AOA?"
    )

    if (!confirmed) {
      return
    }

    try {
      setDeactivating(true)

      await ExchangeRateService.deactivate("USDT_AOA")

      setExchangeRate((current) =>
        current
          ? {
              ...current,
              isActive: false,
            }
          : current
      )

      toast.success("Taxa de câmbio desativada.")
    } catch (error) {
      console.error("EXCHANGE_RATE_DEACTIVATE_ERROR:", error)

      toast.error("Não foi possível desativar a taxa.")
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-white p-4 md:p-8">
      <div className="mx-auto max-w-[1200px] space-y-6">

        {/* =================================================
            HEADER FINTECH STYLE
        ================================================= */}
        <div className="bg-[#11151B] border border-white/[0.08] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <CurrencyCircleDollar
                size={24}
                weight="duotone"
                className="text-blue-400"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Taxas de Câmbio
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                Controle das taxas utilizadas nas conversões financeiras da EMATEA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-7 w-28 bg-white/5 rounded-full animate-pulse border border-white/10" />
            ) : (
              <span
                className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide border ${
                  exchangeRate?.isActive
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {exchangeRate?.isActive ? "• SISTEMA ATIVO" : "• SISTEMA INATIVO"}
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            CURRENT RATE & UPDATE SECTION
        ================================================= */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* TAXA ATUAL */}
          <div className="bg-[#11151B] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Taxa Atual de Referência
                  </p>
                  {loading ? (
                    <div className="h-10 w-36 bg-white/5 rounded-xl animate-pulse mt-2" />
                  ) : (
                    <h2 className="mt-2 text-3xl md:text-4xl font-black text-white tracking-tight">
                      {exchangeRate?.rate ?? "-"}
                    </h2>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    AOA por 1 USDT
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <TrendUp size={22} weight="bold" className="text-blue-400" />
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.06] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Par de Câmbio</span>
                  <span className="rounded-lg bg-[#161B22] border border-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                    USDT / AOA
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Estado Operacional</span>
                  {loading ? (
                    <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className={`text-xs font-bold ${exchangeRate?.isActive ? "text-emerald-400" : "text-red-400"}`}>
                      {exchangeRate?.isActive ? "Ativo" : "Inativo"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/5 text-[11px] text-gray-500">
              Atualização automática sincronizada com o motor financeiro.
            </div>
          </div>

          {/* ALTERAR TAXA */}
          <div className="bg-[#11151B] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#161B22] border border-white/10">
                  <ArrowsClockwise
                    size={20}
                    weight="bold"
                    className="text-gray-300"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm md:text-base">
                    Alterar Taxa
                  </h2>
                  <p className="text-xs text-gray-400">
                    Defina o novo valor de conversão em tempo real.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="exchange-rate"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400"
                >
                  1 USDT Equivale a:
                </label>

                {loading ? (
                  <div className="w-full h-12 bg-[#161B22] border border-white/10 rounded-xl animate-pulse" />
                ) : (
                  <div className="relative">
                    <input
                      id="exchange-rate"
                      type="text"
                      inputMode="decimal"
                      value={rate}
                      onChange={(event) => setRate(event.target.value)}
                      placeholder="1130"
                      disabled={saving || deactivating}
                      className="w-full rounded-xl border border-white/10 bg-[#161B22] px-4 py-3.5 pr-16 text-lg font-bold text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      AOA
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading || saving || deactivating || !exchangeRate?.isActive}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-xs md:text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                <FloppyDisk size={18} weight="bold" />
                {saving ? "Atualizando..." : "Atualizar taxa"}
              </button>

              {!loading && !exchangeRate?.isActive && (
                <p className="mt-3 text-center text-xs text-red-400 font-medium">
                  Esta taxa está inativa e não pode ser alterada.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* =================================================
            INFORMATION & SIMULATION BOX
        ================================================= */}
        <div className="bg-[#11151B] border border-blue-500/20 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Como esta taxa funciona
          </h3>

          <p className="mt-2 text-xs md:text-sm leading-relaxed text-gray-300">
            A taxa definida aqui será utilizada pelo sistema nas conversões de
            USDT para AOA. O usuário verá automaticamente a nova cotação no
            depósito, sem necessidade de atualizar o aplicativo.
          </p>

          {loading ? (
            <div className="mt-4 w-full h-16 bg-[#161B22] border border-white/5 rounded-xl animate-pulse" />
          ) : (
            exchangeRate && (
              <div className="mt-4 rounded-xl bg-[#161B22] border border-white/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">
                    Simulação dinâmica com a taxa atual:
                  </p>
                  <p className="mt-1 text-base md:text-lg font-bold text-emerald-400">
                    5 USDT ={" "}
                    {(Number(exchangeRate.rate) * 5).toLocaleString("pt-AO", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    AOA
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                    Cálculo Instantâneo
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* =================================================
            DANGER ZONE
        ================================================= */}
        {!loading && exchangeRate?.isActive && (
          <div className="bg-[#11151B] border border-red-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <ShieldWarning size={22} className="text-red-400" />
              <h3 className="font-bold text-red-400 text-sm md:text-base">
                Zona de segurança
              </h3>
            </div>

            <p className="text-xs md:text-sm text-gray-400">
              Desativar esta taxa impedirá o sistema de utilizá-la nas novas
              conversões USDT → AOA de forma imediata.
            </p>

            <button
              type="button"
              onClick={handleDeactivate}
              disabled={deactivating || saving}
              className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 text-xs md:text-sm font-semibold text-red-400 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deactivating ? "Desativando..." : "Desativar taxa"}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}