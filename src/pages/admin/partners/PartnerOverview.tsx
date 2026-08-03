import type { Partner } from "../../../types/partner";

export function PartnerOverview({ partner, overview }: { partner: Partner; overview: any }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a2234] p-4 rounded-xl border border-gray-800 shadow-xl">
          <p className="text-xs text-gray-400 font-medium">Receita Total</p>
          <p className="text-xl font-bold text-white mt-1">${overview.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a2234] p-4 rounded-xl border border-gray-800 shadow-xl">
          <p className="text-xs text-gray-400 font-medium">Custo Total</p>
          <p className="text-xl font-bold text-white mt-1">${overview.totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a2234] p-4 rounded-xl border border-gray-800 shadow-xl">
          <p className="text-xs text-gray-400 font-medium">Lucro Total</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">${overview.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a2234] p-4 rounded-xl border border-gray-800 shadow-xl">
          <p className="text-xs text-gray-400 font-medium">Total de Pedidos</p>
          <p className="text-xl font-bold text-white mt-1">{overview.requestsCount}</p>
        </div>
      </div>

      <div className="bg-[#1a2234] p-6 rounded-xl border border-gray-800 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-white">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400">Tipo:</span> <span className="font-medium text-gray-200">{partner.type}</span></div>
          <div><span className="text-gray-400">Status:</span> <span className={`font-medium ${partner.isActive ? "text-emerald-400" : "text-red-400"}`}>{partner.isActive ? "Online" : "Offline"}</span></div>
          <div><span className="text-gray-400">Ambiente:</span> <span className="font-medium text-gray-200">{partner.isSandbox ? "Sandbox" : "Produção"}</span></div>
          <div><span className="text-gray-400">Contato:</span> <span className="font-medium text-gray-200">{partner.contactName || "N/A"} ({partner.contactEmail || "N/A"})</span></div>
          <div><span className="text-gray-400">Criado em:</span> <span className="font-medium text-gray-200">{new Date(partner.createdAt).toLocaleDateString()}</span></div>
          <div><span className="text-gray-400">Última Sincronização:</span> <span className="font-medium text-gray-200">{partner.lastSyncAt ? new Date(partner.lastSyncAt).toLocaleString() : "Nunca"}</span></div>
        </div>
      </div>
    </div>
  );
}