
import { useCallback, useEffect, useState } from "react";
import {
  MessageCircle,
  Users,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  Phone,
  CalendarClock,
} from "lucide-react";

import {
  adminSupportSettingsService,
  type SupportSettings,
} from "../../services/adminSupportSettings.service";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const EMPTY_SETTINGS: SupportSettings = {
  whatsappNumber: "",
  whatsappGroupUrl: "",
  updatedAt: "",
};

export default function SupportSettingsPage() {
  const [settings, setSettings] = useState<SupportSettings>(EMPTY_SETTINGS);
  const [originalSettings, setOriginalSettings] =
    useState<SupportSettings>(EMPTY_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setFeedback(null);

      const response =
        await adminSupportSettingsService.getSettings();

      if (!response.success || !response.settings) {
        throw new Error("Não foi possível carregar as configurações.");
      }

      setSettings(response.settings);
      setOriginalSettings(response.settings);
      setEditing(false);
    } catch (error: any) {
      console.error("SUPPORT_SETTINGS_LOAD_ERROR:", error);

      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Erro ao carregar as configurações de suporte.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function handleChange(
    field: "whatsappNumber" | "whatsappGroupUrl",
    value: string
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFeedback(null);
  }

  function handleEdit() {
    setSettings(originalSettings);
    setFeedback(null);
    setEditing(true);
  }

  function handleCancel() {
    setSettings(originalSettings);
    setFeedback(null);
    setEditing(false);
  }

  function validateSettings() {
    const number = settings.whatsappNumber.trim();
    const groupUrl = settings.whatsappGroupUrl.trim();

    if (!/^\d{8,15}$/.test(number)) {
      return "O número deve conter entre 8 e 15 dígitos, incluindo o indicativo internacional.";
    }

    try {
      const parsedUrl = new URL(groupUrl);

      if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "chat.whatsapp.com"
      ) {
        return "Introduza um convite válido do grupo WhatsApp.";
      }
    } catch {
      return "O endereço do grupo WhatsApp não é válido.";
    }

    return null;
  }

  async function handleSave() {
    const validationError = validateSettings();

    if (validationError) {
      setFeedback({
        type: "error",
        message: validationError,
      });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const response =
        await adminSupportSettingsService.updateSettings({
          whatsappNumber: settings.whatsappNumber.trim(),
          whatsappGroupUrl: settings.whatsappGroupUrl.trim(),
        });

      if (!response.success || !response.settings) {
        throw new Error("Não foi possível guardar as configurações.");
      }

      setSettings(response.settings);
      setOriginalSettings(response.settings);
      setEditing(false);

      setFeedback({
        type: "success",
        message: "Configurações de suporte atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("SUPPORT_SETTINGS_UPDATE_ERROR:", error);

      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Erro ao guardar as configurações.",
      });
    } finally {
      setSaving(false);
    }
  }

  const whatsappNumber = settings.whatsappNumber.trim();

  const whatsappPreview = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  const groupUrl = settings.whatsappGroupUrl.trim();

  const formattedDate = settings.updatedAt
    ? new Date(settings.updatedAt).toLocaleString("pt-PT")
    : "Sem informação disponível";

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Configurações de suporte
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Gerencie os contactos oficiais de atendimento e a comunidade EMATEA.
            </p>
          </div>

          {!loading && (
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
                  <button
                    type="button"
                    onClick={fetchSettings}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#303943] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-[#151A20] disabled:opacity-50"
                  >
                    <RefreshCw size={16} />
                    Atualizar
                  </button>

                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#303943] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-[#151A20] disabled:opacity-50"
                >
                  <X size={16} />
                  Cancelar edição
                </button>
              )}
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        {feedback && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={19} className="shrink-0" />
            ) : (
              <AlertCircle size={19} className="shrink-0" />
            )}

            <p className="text-sm">{feedback.message}</p>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-3" />
            A carregar configurações...
          </div>
        ) : (
          <>
            {/* CONTACT INFORMATION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* WHATSAPP SUPPORT */}
              <section className="rounded-xl border border-[#252B32] bg-[#12171C] overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-[#252B32]">
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                    <MessageCircle size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Atendimento WhatsApp
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Contacto oficial do suporte EMATEA.
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {editing ? (
                    <>
                      <div className="space-y-2">
                        <label
                          htmlFor="whatsappNumber"
                          className="text-sm font-medium text-gray-300"
                        >
                          Número de WhatsApp
                        </label>

                        <input
                          id="whatsappNumber"
                          type="tel"
                          inputMode="numeric"
                          value={settings.whatsappNumber}
                          onChange={(event) =>
                            handleChange(
                              "whatsappNumber",
                              event.target.value
                            )
                          }
                          placeholder="244928270636"
                          maxLength={15}
                          className="w-full rounded-lg border border-[#303943] bg-[#0B0E11] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                        />

                        <p className="text-xs text-gray-500">
                          Inclua o indicativo internacional. Utilize apenas dígitos.
                        </p>
                      </div>

                      {whatsappPreview && (
                        <a
                          href={whatsappPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          Testar contacto
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          NÚMERO CONFIGURADO
                        </p>

                        <div className="flex items-center gap-3">
                          <Phone size={17} className="text-emerald-400" />

                          <span className="text-lg font-semibold text-white tracking-wide">
                            {settings.whatsappNumber || "Não configurado"}
                          </span>
                        </div>
                      </div>

                      {whatsappPreview && (
                        <a
                          href={whatsappPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                        >
                          Abrir conversa
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* WHATSAPP COMMUNITY */}
              <section className="rounded-xl border border-[#252B32] bg-[#12171C] overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-[#252B32]">
                  <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                    <Users size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Comunidade EMATEA
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Grupo oficial da comunidade WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {editing ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="whatsappGroupUrl"
                        className="text-sm font-medium text-gray-300"
                      >
                        Link de convite
                      </label>

                      <input
                        id="whatsappGroupUrl"
                        type="url"
                        value={settings.whatsappGroupUrl}
                        onChange={(event) =>
                          handleChange(
                            "whatsappGroupUrl",
                            event.target.value
                          )
                        }
                        placeholder="https://chat.whatsapp.com/..."
                        className="w-full rounded-lg border border-[#303943] bg-[#0B0E11] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        LINK DE CONVITE
                      </p>

                      <p className="text-sm text-gray-200 break-all">
                        {settings.whatsappGroupUrl || "Não configurado"}
                      </p>
                    </div>
                  )}

                  {groupUrl && (
                    <a
                      href={groupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Abrir comunidade
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </section>
            </div>

            {/* EDIT ACTIONS */}
            {editing && (
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-[#252B32] pt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#303943] px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#151A20] disabled:opacity-50"
                >
                  <X size={16} />
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            )}

            {/* LAST UPDATE */}
            <div className="flex items-center justify-end gap-2 border-t border-[#1E2329] pt-4 text-xs text-gray-500">
              <CalendarClock size={14} />
              <span>
                Última atualização: {formattedDate}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
