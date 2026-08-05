import type { ServiceRequestItem } from "../../../types/partner";

export function PartnerLatestRequests({ requests }: { requests: ServiceRequestItem[] }) {
  return (
    <div className="bg-[#161A1F] rounded-2xl border border-white/5 shadow-xl overflow-hidden text-gray-100">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-base font-bold text-white">Últimas Solicitações</h3>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Data</th>
              <th className="py-3 px-4 font-semibold">Cliente</th>
              <th className="py-3 px-4 font-semibold">Serviço / Produto</th>
              <th className="py-3 px-4 font-semibold text-right">Valor</th>
              <th className="py-3 px-4 font-semibold text-right">Lucro</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="py-4 px-4 text-gray-200 font-medium">{req.customerName || req.customerReference || "Consumidor Final"}</td>
                <td className="py-4 px-4 text-gray-300">{req.Service?.name || req.serviceName || "Serviço"}</td>
                <td className="py-4 px-4 font-semibold text-white text-right">{formatMoney(req.amount)}</td>
                <td className="py-4 px-4 font-semibold text-emerald-400 text-right">{formatMoney(req.profit)}</td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium border inline-flex items-center gap-1.5 ${
                    req.status === "COMPLETED" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">Nenhum pedido recente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
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