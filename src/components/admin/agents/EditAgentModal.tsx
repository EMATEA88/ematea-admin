
import { useEffect, useState } from "react";
import {
  X,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import AdminAgentService, {
  type Agent,
} from "../../../services/adminAgent.service";

interface Props {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

const INITIAL_FORM: FormData = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
};

export function EditAgentModal({
  agent,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  useEffect(() => {
    if (!agent) {
      setFormData(INITIAL_FORM);
      return;
    }

    setFormData({
      fullName: agent.user?.fullName || "",
      phone: agent.user?.phone || "",
      email: agent.user?.email || "",
      address: (agent.user as any)?.address || "",
    });
  }, [agent]);

  function updateField(field: keyof FormData, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateForm(): boolean {
    if (!formData.fullName.trim()) {
      toast.error("O nome completo é obrigatório.");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("O número de telefone é obrigatório.");
      return false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");

    if (
      phoneDigits.length < 7 ||
      phoneDigits.length > 15 ||
      !/^\+?[0-9\s()-]+$/.test(formData.phone.trim())
    ) {
      toast.error("Introduza um número de telefone válido.");
      return false;
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      toast.error("Introduza um endereço de e-mail válido.");
      return false;
    }

    return true;
  }

  async function handleUpdate() {
    if (!agent || loading) return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      await AdminAgentService.update(agent.id, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
      });

      toast.success("Dados do agente atualizados com sucesso.");

      onSuccess();
      onClose();
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.error;
      const message = error?.response?.data?.message;

      if (statusCode === 409 || errorMessage === "EMAIL_ALREADY_EXISTS") {
        toast.error("Este e-mail já está associado a outra conta.");
      } else if (
        errorMessage === "PHONE_ALREADY_EXISTS" ||
        message === "PHONE_ALREADY_EXISTS"
      ) {
        toast.error("Este número de telefone já está associado a outra conta.");
      } else if (statusCode === 404) {
        toast.error("Agente não encontrado.");
      } else {
        toast.error(
          message ||
            errorMessage ||
            "Não foi possível atualizar os dados do agente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !agent) return null;

  const statusStyles: Record<string, string> = {
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    SUSPENDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  const statusLabels: Record<string, string> = {
    APPROVED: "Aprovado",
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
    SUSPENDED: "Suspenso",
  };

  const status = agent.status || "PENDING";

  const inputClass =
    "w-full h-11 bg-[#1B1B1F] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition-all focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 disabled:opacity-50";

  return (
    <div
      className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121214] border border-white/[0.07] shadow-2xl">
        {/* CABEÇALHO */}
        <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <User size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Editar Agente
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Atualização dos dados cadastrais
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-40"
            aria-label="Fechar modal"
          >
            <X size={23} />
          </button>
        </div>

        {/* IDENTIFICAÇÃO DO AGENTE */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <InfoCard
              icon={<Hash size={14} />}
              label="Referência"
              value={`#${agent.id}`}
            />

            <InfoCard
              icon={<ShieldCheck size={14} />}
              label="Código EMATEA"
              value={agent.agentCode || "N/D"}
            />

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 col-span-2 sm:col-span-1">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">
                Estado
              </p>

              <span
                className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${
                  statusStyles[status] ||
                  "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}
              >
                {statusLabels[status] || status}
              </span>
            </div>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
              Dados pessoais e contactos
            </h3>

            <p className="text-[11px] text-gray-500">
              Atualize as informações associadas à conta do agente.
            </p>
          </div>

          {/* NOME */}
          <FormField
            label="Nome completo"
            icon={<User size={17} />}
            required
          >
            <input
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={(event) =>
                updateField("fullName", event.target.value)
              }
              placeholder="Nome completo do agente"
              maxLength={150}
              disabled={loading}
              className={inputClass}
            />
          </FormField>

          {/* TELEFONE */}
          <FormField
            label="Número de telefone"
            icon={<Phone size={17} />}
            required
            description="Inclua o indicativo internacional, quando aplicável."
          >
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(event) =>
                updateField("phone", event.target.value)
              }
              placeholder="+244 923 000 000"
              maxLength={20}
              disabled={loading}
              className={inputClass}
            />
          </FormField>

          {/* EMAIL */}
          <FormField
            label="E-mail institucional"
            icon={<Mail size={17} />}
          >
            <input
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                updateField("email", event.target.value)
              }
              placeholder="agente@email.com"
              maxLength={150}
              disabled={loading}
              className={inputClass}
            />
          </FormField>

          {/* ENDEREÇO */}
          <FormField
            label="Endereço"
            icon={<MapPin size={17} />}
            description="Morada ou localização do agente."
          >
            <input
              type="text"
              autoComplete="street-address"
              value={formData.address}
              onChange={(event) =>
                updateField("address", event.target.value)
              }
              placeholder="Província, município, bairro..."
              maxLength={250}
              disabled={loading}
              className={inputClass}
            />
          </FormField>

          <div className="rounded-lg border border-cyan-500/10 bg-cyan-500/[0.04] p-3">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <span className="text-cyan-400 font-semibold">
                Nota:
              </span>{" "}
              O código do agente, o estado da conta e os dados financeiros
              não são alterados neste formulário.
            </p>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-5 bg-white/[0.02] border-t border-white/[0.05] flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 text-gray-400 text-xs font-bold hover:text-white transition-colors disabled:opacity-40"
          >
            CANCELAR
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleUpdate}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                A GRAVAR...
              </>
            ) : (
              <>
                <Save size={16} />
                GRAVAR ALTERAÇÕES
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* CAMPO DO FORMULÁRIO */
function FormField({
  label,
  icon,
  required = false,
  description,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-2">
        {label}

        {required && (
          <span className="text-rose-400 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </div>

        {children}
      </div>

      {description && (
        <p className="text-[10px] text-gray-500 mt-1.5">
          {description}
        </p>
      )}
    </div>
  );
}

/* CARTÃO DE IDENTIFICAÇÃO */
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 min-w-0">
      <div className="flex items-center gap-1.5 text-cyan-400 mb-2">
        {icon}
        <span className="text-[9px] uppercase tracking-wider font-bold">
          {label}
        </span>
      </div>

      <p className="text-xs font-semibold text-white truncate">
        {value}
      </p>
    </div>
  );
}
