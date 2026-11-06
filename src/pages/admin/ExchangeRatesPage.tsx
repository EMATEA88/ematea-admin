
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

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

    if (!confirmed) return

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
    <div className="min-h-screen bg-[#0B0E11] text-white px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <div className="flex items-center justify-between border-b border-[#252A30] pb-5">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Taxas de Câmbio
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Gestão da conversão de USDT para Kz.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRate}
            disabled={loading}
            className="rounded-lg border border-[#30363D] bg-[#161A1F] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#20262D] disabled:opacity-50"
          >
            {loading ? "A carregar..." : "Atualizar"}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <section className="rounded-xl border border-[#252A30] bg-[#161A1F] p-5">
            <p className="text-sm text-gray-400">
              Taxa atual
            </p>

            <div className="mt-3">
              {loading ? (
                <p className="text-sm text-gray-500">A carregar...</p>
              ) : (
                <p className="text-3xl font-semibold text-white">
                  {exchangeRate?.rate ?? "—"}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    Kz
                  </span>
                </p>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-400">
              1 USDT = {exchangeRate?.rate ?? "—"} Kz
            </p>

            {!loading && (
              <p className={`mt-4 text-sm font-medium ${
                exchangeRate?.isActive
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}>
                {exchangeRate?.isActive ? "Ativa" : "Inativa"}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-[#252A30] bg-[#161A1F] p-5">
            <h2 className="text-sm font-semibold text-white">
              Alterar taxa
            </h2>

            <label
              htmlFor="exchange-rate"
              className="mt-5 mb-2 block text-sm text-gray-400"
            >
              Novo valor de conversão
            </label>

            <div className="relative">
              <input
                id="exchange-rate"
                type="text"
                inputMode="decimal"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="Ex.: 1135"
                disabled={loading || saving || deactivating || !exchangeRate?.isActive}
                className="w-full rounded-lg border border-[#30363D] bg-[#0B0E11] px-4 py-3 pr-14 text-sm text-white outline-none transition focus:border-emerald-500 disabled:opacity-50"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                Kz
              </span>
            </div>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading || saving || deactivating || !exchangeRate?.isActive}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "A guardar..." : "Guardar alterações"}
            </button>
          </section>
        </div>

        {!loading && exchangeRate?.isActive && (
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#252A30] bg-[#161A1F] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Desativar taxa de câmbio
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Impede a utilização desta taxa nas novas conversões.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDeactivate}
              disabled={deactivating || saving}
              className="rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {deactivating ? "A desativar..." : "Desativar taxa"}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
