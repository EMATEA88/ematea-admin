import { useEffect, useState } from "react";
import { AdminPartnerService } from "../../services/admin.partner.service";
import type { Partner } from "../../types/partner";
import { PartnerDetailsModal } from "./partners/PartnerDetailsModal";

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);

  const fetchPartners = () => {
    setLoading(true);
    AdminPartnerService.list()
      .then(setPartners)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-gray-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Gestão de Integrações</h1>
          <p className="text-sm text-gray-400">Monitorize o estado operacional e financeiro de todos os parceiros da EMATEA.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">A carregar parceiros...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map(partner => (
            <div 
              key={partner.id} 
              className="bg-[#1a2234] rounded-xl border border-gray-800 shadow-xl p-6 flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">{partner.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    partner.isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {partner.isActive ? "🟢 Online" : "🔴 Offline"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Tipo: <span className="text-gray-200">{partner.type}</span> | Ambiente: <span className="text-gray-200">{partner.isSandbox ? "Sandbox" : "Produção"}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center bg-[#121824] p-3 rounded-lg border border-gray-800/60">
                  <div>
                    <p className="text-xs text-gray-400">Operadoras</p>
                    <p className="text-sm font-bold text-white">{partner.statistics.providers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Serviços</p>
                    <p className="text-sm font-bold text-white">{partner.statistics.services}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Planos</p>
                    <p className="text-sm font-bold text-white">{partner.statistics.plans}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Receita:</span> 
                    <span className="font-bold text-white">${partner.statistics.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Custo:</span> 
                    <span className="font-bold text-white">${partner.statistics.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Lucro:</span> 
                    <span className="font-bold text-emerald-400">${partner.statistics.totalProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartnerId(partner.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-lg shadow-emerald-950/30"
              >
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Drawer Individual */}
      <PartnerDetailsModal
        partnerId={selectedPartnerId}
        onClose={() => setSelectedPartnerId(null)}
        onStatusChange={fetchPartners}
      />
    </div>
  );
}

// Exportação padrão para satisfazer o App.tsx
export default AdminPartners;