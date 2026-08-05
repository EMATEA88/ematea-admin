import { useEffect, useState } from "react";
import { AdminPartnerService } from "../../../services/admin.partner.service";
import { type PartnerDashboardData } from "../../../types/partner";
import { PartnerOverview } from "./PartnerOverview";
import { PartnerHealth } from "./PartnerHealth";
import { PartnerCatalog } from "./PartnerCatalog";
import { PartnerCharts } from "./PartnerCharts";
import { PartnerLatestRequests } from "./PartnerLatestRequests";
import { X } from "@phosphor-icons/react";

interface Props {
  partnerId: number | null;
  onClose: () => void;
  onStatusChange: () => void;
}

export function PartnerDetailsModal({ partnerId, onClose, onStatusChange }: Props) {
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "health" | "catalog" | "charts" | "requests">("overview");

  useEffect(() => {
    if (!partnerId) return;
    setLoading(true);
    AdminPartnerService.getDashboard(partnerId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [partnerId]);

  if (!partnerId) return null;

  const handleToggleStatus = async () => {
    if (!data) return;
    try {
      if (data.partner.isActive) {
        await AdminPartnerService.deactivate(partnerId);
      } else {
        await AdminPartnerService.activate(partnerId);
      }
      const updated = await AdminPartnerService.getDashboard(partnerId);
      setData(updated);
      onStatusChange();
    } catch (error) {
      console.error("Erro ao alterar status do parceiro", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#0B0E11] text-gray-100 h-full shadow-2xl flex flex-col overflow-hidden border-l border-white/10 animate-slide-left">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#161A1F]">
          <div>
            <h2 className="text-xl font-bold text-white">
              {data?.partner.name || "A carregar..."}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Centro de Gestão e Monitorização da Integração
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <button
                onClick={handleToggleStatus}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors border ${
                  data.partner.isActive
                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                {data.partner.isActive ? "Desativar Parceiro" : "Ativar Parceiro"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-white/5 px-6 bg-[#161A1F] gap-6 overflow-x-auto custom-scrollbar">
          {(["overview", "health", "catalog", "charts", "requests"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "overview" && "Visão Geral"}
              {tab === "health" && "Saúde & Status"}
              {tab === "catalog" && "Catálogo Sincronizado"}
              {tab === "charts" && "Gráficos (30d)"}
              {tab === "requests" && "Últimos Pedidos"}
            </button>
          ))}
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0E11]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
              A carregar dados do parceiro...
            </div>
          ) : data ? (
            <>
              {activeTab === "overview" && <PartnerOverview partner={data.partner} overview={data.overview} />}
              {activeTab === "health" && <PartnerHealth health={data.health} partner={data.partner} />}
              {activeTab === "catalog" && <PartnerCatalog catalog={data.catalog} />}
              {activeTab === "charts" && <PartnerCharts charts={data.charts} />}
              {activeTab === "requests" && <PartnerLatestRequests requests={data.latestRequests} />}
            </>
          ) : (
            <div className="text-center text-red-400 py-12 text-sm">Falha ao carregar informações.</div>
          )}
        </div>
      </div>
    </div>
  );
}