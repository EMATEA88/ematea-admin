import type { PartnerHealth as HealthType, Partner } from "../../../types/partner";
import { ChartLine, Key, Cpu } from "@phosphor-icons/react";

export function PartnerHealth({ health }: { health: HealthType; partner: Partner }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500 font-medium">Estado Operacional</p>
            <p className="text-base font-bold text-white flex items-center gap-2 mt-1">
              {health.online ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Offline
                </>
              )}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-emerald-400">
            <ChartLine size={22} />
          </div>
        </div>

        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500 font-medium">Ambiente de Execução</p>
            <p className="text-base font-bold text-white mt-1">
              {health.sandbox ? "Sandbox" : "Produção"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-blue-400">
            <Cpu size={22} />
          </div>
        </div>

        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500 font-medium">Validade do Token</p>
            <p className="text-base font-bold text-white mt-1">
              {health.tokenExpiresAt ? new Date(health.tokenExpiresAt).toLocaleDateString() : "Não expira / N/A"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-yellow-400">
            <Key size={22} />
          </div>
        </div>
      </div>

      <div className="bg-[#161A1F] p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Métricas de Catálogo Sincronizado</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-5 bg-[#0B0E11] rounded-xl border border-white/5">
            <p className="text-2xl font-bold text-emerald-400">{health.totalProviders}</p>
            <p className="text-xs uppercase text-gray-500 mt-1 font-medium">Operadoras</p>
          </div>
          <div className="p-5 bg-[#0B0E11] rounded-xl border border-white/5">
            <p className="text-2xl font-bold text-emerald-400">{health.totalServices}</p>
            <p className="text-xs uppercase text-gray-500 mt-1 font-medium">Serviços</p>
          </div>
          <div className="p-5 bg-[#0B0E11] rounded-xl border border-white/5">
            <p className="text-2xl font-bold text-emerald-400">{health.totalPlans}</p>
            <p className="text-xs uppercase text-gray-500 mt-1 font-medium">Planos</p>
          </div>
        </div>
      </div>
    </div>
  );
}