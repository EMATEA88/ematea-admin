import type { ServiceRequestItem } from "../../../types/partner";

export function PartnerLatestRequests({ requests }: { requests: ServiceRequestItem[] }) {
  return (
    <div className="bg-[#1a2234] rounded-xl border border-gray-800 shadow-xl overflow-hidden text-gray-100">
      <div className="p-5 border-b border-gray-800">
        <h3 className="text-base font-semibold text-white">Últimas Solicitações</h3>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#161d2c] text-gray-400 border-b border-gray-800">
            <tr>
              <th className="p-3 font-medium">Data</th>
              <th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Serviço / Produto</th>
              <th className="p-3 font-medium">Valor</th>
              <th className="p-3 font-medium">Lucro</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-[#121824]/40 transition-colors">
                <td className="p-3 text-gray-400">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="p-3 text-gray-200">{req.customerName || req.customerReference || "Consumidor Final"}</td>
                <td className="p-3 text-gray-200">{req.Service?.name || req.serviceName || "Serviço"}</td>
                <td className="p-3 font-semibold text-white">${req.amount.toFixed(2)}</td>
                <td className="p-3 font-semibold text-emerald-400">${req.profit.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
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