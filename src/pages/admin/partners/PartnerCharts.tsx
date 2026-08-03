import { type PartnerChartsData } from "../../../types/partner";

export function PartnerCharts({ charts }: { charts: PartnerChartsData }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="bg-[#1a2234] p-6 rounded-xl border border-gray-800 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4">
          Evolução de Vendas e Lucro (Últimos 30 Dias)
        </h3>
        
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {charts.sales.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 border-b border-gray-800/60 hover:bg-[#121824]/50 rounded-lg transition-colors text-sm"
            >
              <span className="text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              
              <div className="flex gap-6">
                <span className="text-gray-200 font-semibold">
                  Valor: <span className="text-white">${item.amount.toFixed(2)}</span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  Lucro: ${item.profit.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          {charts.sales.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhum dado de venda recente registrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}