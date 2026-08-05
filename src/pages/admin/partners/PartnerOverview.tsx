import type { Partner } from "../../../types/partner";

export function PartnerOverview({ partner, overview }: { partner: Partner; overview: any }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-xs text-gray-500 font-medium uppercase">Receita Total</p>
          <p className="text-2xl font-bold text-white mt-1.5">{formatMoney(overview.totalSales)}</p>
        </div>
        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-xs text-gray-500 font-medium uppercase">Custo Total</p>
          <p className="text-2xl font-bold text-white mt-1.5">{formatMoney(overview.totalCost)}</p>
        </div>
        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-xs text-gray-500 font-medium uppercase">Lucro Total</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1.5">{formatMoney(overview.totalProfit)}</p>
        </div>
        <div className="bg-[#161A1F] p-5 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-xs text-gray-500 font-medium uppercase">Total de Pedidos</p>
          <p className="text-2xl font-bold text-white mt-1.5">{overview.requestsCount}</p>
        </div>
      </div>

      <div className="bg-[#161A1F] p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Informações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2 border-t border-white/5">
          <div><span className="text-gray-500">Tipo:</span> <span className="font-medium text-gray-200">{partner.type}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className={`font-semibold ${partner.isActive ? "text-emerald-400" : "text-red-400"}`}>{partner.isActive ? "Online" : "Offline"}</span></div>
          <div><span className="text-gray-500">Ambiente:</span> <span className="font-medium text-gray-200">{partner.isSandbox ? "Sandbox" : "Produção"}</span></div>
          <div><span className="text-gray-500">Contato:</span> <span className="font-medium text-gray-200">{partner.contactName || "N/A"} ({partner.contactEmail || "N/A"})</span></div>
          <div><span className="text-gray-500">Criado em:</span> <span className="font-medium text-gray-200">{new Date(partner.createdAt).toLocaleDateString()}</span></div>
          <div><span className="text-gray-500">Última Sincronização:</span> <span className="font-medium text-gray-200">{partner.lastSyncAt ? new Date(partner.lastSyncAt).toLocaleString() : "Nunca"}</span></div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number | undefined | null) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(Number(value ?? 0));
}