import type { PartnerHealth as HealthType, Partner } from "../../../types/partner";

export function PartnerHealth({ health }: { health: HealthType; partner: Partner }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2234] p-5 rounded-xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-sm text-gray-400">Estado Operacional</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {health.online ? "🟢 Online" : "🔴 Offline"}
            </p>
          </div>
        </div>

        <div className="bg-[#1a2234] p-5 rounded-xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-sm text-gray-400">Ambiente de Execução</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {health.sandbox ? "Sandbox" : "Produção"}
            </p>
          </div>
        </div>

        <div className="bg-[#1a2234] p-5 rounded-xl border border-gray-800 flex items-center justify-between shadow-xl">
          <div>
            <p className="text-sm text-gray-400">Validade do Token</p>
            <p className="text-lg font-bold text-white mt-0.5">
              {health.tokenExpiresAt ? new Date(health.tokenExpiresAt).toLocaleDateString() : "Não expira / N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#1a2234] p-6 rounded-xl border border-gray-800 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-white">Métricas de Catálogo Sincronizado</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-[#121824] rounded-lg border border-gray-800/60">
            <p className="text-2xl font-bold text-emerald-400">{health.totalProviders}</p>
            <p className="text-xs text-gray-400 mt-1">Operadoras</p>
          </div>
          <div className="p-4 bg-[#121824] rounded-lg border border-gray-800/60">
            <p className="text-2xl font-bold text-emerald-400">{health.totalServices}</p>
            <p className="text-xs text-gray-400 mt-1">Serviços</p>
          </div>
          <div className="p-4 bg-[#121824] rounded-lg border border-gray-800/60">
            <p className="text-2xl font-bold text-emerald-400">{health.totalPlans}</p>
            <p className="text-xs text-gray-400 mt-1">Planos</p>
          </div>
        </div>
      </div>
    </div>
  );
}