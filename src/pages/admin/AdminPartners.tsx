import { useEffect, useState } from "react";
import { AdminPartnerService } from "../../services/admin.partner.service";
import type { Partner } from "../../types/partner";
import { PartnerDetailsModal } from "./partners/PartnerDetailsModal";
import { ArrowClockwise, Buildings } from "@phosphor-icons/react";

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
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Gestão de Integrações
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">EMATEA Partners</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Centro de Gestão de Integrações
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Buildings size={16} className="text-blue-400" />
            Monitorize o estado operacional e financeiro de todos os parceiros da EMATEA.
          </p>
        </div>

        <button
          onClick={fetchPartners}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] border border-white/5 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer text-white"
        >
          <ArrowClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonPartnerCard />
          <SkeletonPartnerCard />
          <SkeletonPartnerCard />
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-12 text-center text-gray-500 space-y-2 shadow-xl">
          <Buildings className="mx-auto text-gray-600" size={32} />
          <p className="text-sm font-semibold">Nenhum parceiro registado encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map(partner => (
            <div 
              key={partner.id} 
              className="bg-[#161A1F] rounded-[2rem] border border-white/5 p-8 flex flex-col justify-between space-y-6 hover:border-white/15 transition-all shadow-xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Buildings size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{partner.name}</h3>
                      <p className="text-xs text-gray-400">
                        Tipo: <span className="text-gray-200 font-medium">{partner.type}</span> • Ambiente: <span className="text-gray-200 font-medium">{partner.isSandbox ? "Sandbox" : "Produção"}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                    partner.isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {partner.isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Offline
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-[#0B0E11] p-4 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Operadoras</p>
                    <p className="text-sm font-black text-white mt-0.5">{partner.statistics.providers}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Serviços</p>
                    <p className="text-sm font-black text-white mt-0.5">{partner.statistics.services}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Planos</p>
                    <p className="text-sm font-black text-white mt-0.5">{partner.statistics.plans}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-sm pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs">Receita:</span> 
                    <span className="font-bold text-white">{formatMoney(partner.statistics.totalSales)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs">Custo:</span> 
                    <span className="font-bold text-white">{formatMoney(partner.statistics.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span className="text-xs">Lucro:</span> 
                    <span className="font-black text-emerald-400">{formatMoney(partner.statistics.totalProfit)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartnerId(partner.id)}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
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

function formatMoney(value: number | undefined | null) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(Number(value ?? 0));
}

function SkeletonPartnerCard() {
  return (
    <div className="bg-[#161A1F] rounded-[2rem] border border-white/5 p-8 flex flex-col justify-between space-y-6 animate-pulse shadow-xl">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-2xl" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-white/5 rounded" />
              <div className="w-44 h-3 bg-white/5 rounded" />
            </div>
          </div>
          <div className="w-16 h-6 bg-white/5 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#0B0E11] p-4 rounded-2xl border border-white/5">
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-2 bg-white/5 rounded" />
            <div className="w-8 h-4 bg-white/5 rounded" />
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-2 bg-white/5 rounded" />
            <div className="w-8 h-4 bg-white/5 rounded" />
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-12 h-2 bg-white/5 rounded" />
            <div className="w-8 h-4 bg-white/5 rounded" />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex justify-between">
            <div className="w-16 h-3 bg-white/5 rounded" />
            <div className="w-24 h-3 bg-white/5 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="w-16 h-3 bg-white/5 rounded" />
            <div className="w-24 h-3 bg-white/5 rounded" />
          </div>
          <div className="flex justify-between">
            <div className="w-16 h-3 bg-white/5 rounded" />
            <div className="w-24 h-3 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      <div className="w-full h-11 bg-white/5 rounded-2xl" />
    </div>
  );
}

// Exportação padrão para satisfazer o App.tsx
export default AdminPartners;