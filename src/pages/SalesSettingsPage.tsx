
import { useEffect, useState } from "react";
import {
  Gauge,
  ShieldCheck,
  Clock3,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Coins,
  Users,
  Info,
} from "lucide-react";

import salesSettingsService from "../services/salesSettings.service";

export default function SalesSettingsPage() {
  const [limit, setLimit] = useState("200000");
  const [savedLimit, setSavedLimit] = useState("200000");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await salesSettingsService.getDailySalesLimit();
      const value = String(data.dailySalesLimit);

      setLimit(value);
      setSavedLimit(value);
    } catch {
      setError("Não foi possível carregar as configurações. Verifica a ligação ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function handleSave() {
    const value = Number(limit);

    setMessage("");
    setError("");

    if (!Number.isFinite(value) || value <= 0) {
      setError("Introduz um limite válido superior a zero.");
      return;
    }

    if (value > 9999999999999999) {
      setError("O valor introduzido é demasiado elevado.");
      return;
    }

    setSaving(true);

    try {
      const result =
        await salesSettingsService.updateDailySalesLimit(value);

      const updated = String(result.dailySalesLimit);

      setLimit(updated);
      setSavedLimit(updated);
      setMessage("O limite diário foi atualizado com sucesso.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.error ??
          "Não foi possível guardar as alterações."
      );
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = limit !== savedLimit;

  return (
    <div className="min-h-full space-y-6 p-4 text-gray-200 sm:p-6 lg:p-8">
      {/* CABEÇALHO */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E2329] pb-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <Gauge size={25} className="text-emerald-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Limite de Vendas
              </h1>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Configuração global
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              Gere o valor máximo de vendas permitido diariamente aos
              subagentes criados pela EMATEA.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadSettings()}
          disabled={loading || saving}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#2B3139] bg-[#12161B] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-[#414955] hover:bg-[#191E24] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Atualizar dados
        </button>
      </div>

      {/* INDICADORES */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#252B33] bg-[#11151A] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">
              Limite diário atual
            </span>

            <div className="rounded-xl bg-blue-500/10 p-2.5">
              <Coins size={20} className="text-blue-400" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {loading
                ? "—"
                : Number(savedLimit).toLocaleString("pt-PT", {
                    maximumFractionDigits: 2,
                  })}
            </span>

            <span className="text-sm font-semibold text-gray-500">Kz</span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Valor global guardado na base de dados.
          </p>
        </div>

        <div className="rounded-2xl border border-[#252B33] bg-[#11151A] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">
              Âmbito da configuração
            </span>

            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <Users size={20} className="text-emerald-400" />
            </div>
          </div>

          <p className="mt-4 text-xl font-bold text-white">
            Subagentes EMATEA
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Aplica-se globalmente, sem alterar os limites dos subagentes
            independentes dos agentes.
          </p>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="overflow-hidden rounded-2xl border border-[#252B33] bg-[#11151A]">
        <div className="border-b border-[#252B33] px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-white">
            Configurar limite diário
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Define o novo valor máximo permitido por subagente em cada dia.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-gray-400">
              <RefreshCw size={18} className="animate-spin text-emerald-400" />
              A carregar configurações...
            </div>
          ) : (
            <>
              <div className="max-w-xl">
                <label
                  htmlFor="dailySalesLimit"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Novo limite diário
                </label>

                <div className="relative">
                  <input
                    id="dailySalesLimit"
                    type="number"
                    min="0.01"
                    max="9999999999999999"
                    step="0.01"
                    value={limit}
                    onChange={(event) => {
                      setLimit(event.target.value);
                      setMessage("");
                      setError("");
                    }}
                    disabled={saving}
                    placeholder="Ex.: 200000"
                    className="w-full rounded-xl border border-[#343B45] bg-[#0B0E11] px-4 py-3 pr-16 text-base font-semibold text-white outline-none transition placeholder:font-normal placeholder:text-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-60"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                    Kz
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  O novo valor será aplicado globalmente após guardar.
                </p>
              </div>

              {message && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-sm text-emerald-400"
                >
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-400"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-[#252B33] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2 text-xs leading-5 text-gray-500">
                  <Info size={15} className="mt-0.5 shrink-0 text-blue-400" />
                  O limite é contabilizado diariamente e reinicia às 00h00,
                  no horário de Angola.
                </p>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !hasChanges}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#07110C] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {saving ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* REGRAS OPERACIONAIS */}
      <div className="rounded-2xl border border-[#252B33] bg-[#11151A] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5">
            <ShieldCheck size={20} className="text-amber-400" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Regras operacionais
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Condições aplicadas pelo backend.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-[#252B33] bg-[#0B0E11] p-4">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Reinício diário
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                O total diário é calculado de acordo com o dia atual em
                Angola.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#252B33] bg-[#0B0E11] p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Controlo centralizado
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                A validação é feita no servidor, não apenas no painel
                administrativo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
