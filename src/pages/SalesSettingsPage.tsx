import { useEffect, useState } from "react";
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
      setError(
        "Não foi possível carregar as configurações. Verifique a ligação ao servidor."
      );
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
      setError("Introduza um limite válido superior a zero.");
      return;
    }

    if (value > 9999999999999999) {
      setError("O valor introduzido é demasiado elevado.");
      return;
    }

    setSaving(true);

    try {
      const result = await salesSettingsService.updateDailySalesLimit(value);
      const updated = String(result.dailySalesLimit);

      setLimit(updated);
      setSavedLimit(updated);
      setMessage("O limite diário global foi atualizado com sucesso.");
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

  const formattedLimit = Number(savedLimit).toLocaleString("pt-PT", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-full bg-[#0a0a0a] px-6 py-10 text-neutral-100 selection:bg-neutral-700 selection:text-neutral-100">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
                Limite de Vendas
              </h1>
            </div>
            <p className="text-sm text-neutral-400 pl-12">
              Gestão de parâmetros de risco e tecto operacional para os subagentes EMATEA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSettings()}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-300 shadow-sm transition-all hover:bg-neutral-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-neutral-600 disabled:opacity-40"
          >
            <svg className={`h-4 w-4 ${loading ? "animate-spin text-neutral-400" : "text-neutral-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sincronizar
          </button>
        </div>

        {/* Card Principal de Visualização */}
        <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-xl backdrop-blur-md">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Tecto Máximo Ativo (Global)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight tabular-nums text-neutral-100">
                {loading ? (
                  <span className="inline-block h-8 w-36 animate-pulse rounded bg-neutral-800 align-middle" />
                ) : (
                  formattedLimit
                )}
              </span>
              <span className="text-lg font-medium text-neutral-400">Kz</span>
            </div>
            <p className="text-xs text-neutral-500 pt-1">
              Atualizado em tempo real com base nos registros do servidor central.
            </p>
          </div>
        </div>

        {/* Card de Configuração / Edição */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="text-base font-medium text-neutral-200">Alterar Limite Diário</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Defina o novo valor aplicável para transações diárias.</p>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center gap-3 text-neutral-400 text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent" />
              A carregar parâmetros de configuração...
            </div>
          ) : (
            <div className="space-y-5">
              <div className="max-w-xl space-y-2">
                <label
                  htmlFor="dailySalesLimit"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-400"
                >
                  Novo Limite Autorizado (Kz)
                </label>

                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-sm font-semibold text-neutral-500">Kz</span>
                  </div>
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
                    className="h-11 w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-12 pr-4 text-sm font-medium text-neutral-100 placeholder-neutral-600 shadow-inner outline-none transition-all focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Mensagens de Feedback Estilizadas (Neutras/Minimalistas) */}
              {message && (
                <div role="status" className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-200">
                  <svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div role="alert" className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300">
                  <svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Botão de Ação */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !hasChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                  )}
                  {saving ? "A processar..." : "Guardar alterações"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}