import type { PartnerChartsData } from "../../../types/partner";

export function PartnerCharts({ charts }: { charts: PartnerChartsData }) {
  return (
    <div className="space-y-6 text-gray-100">
      <div className="bg-[#161A1F] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">
          Evolução de Vendas e Lucro (Últimos 30 Dias)
        </h3>
        
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {charts.sales.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3.5 border-b border-white/5 hover:bg-white/[0.02] rounded-xl transition-colors text-sm"
            >
              <span className="text-gray-400 text-xs font-medium">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
              
              <div className="flex gap-6">
                <span className="text-gray-400 text-xs">
                  Valor: <span className="text-white font-semibold">{formatMoney(item.amount)}</span>
                </span>
                <span className="text-emerald-400 text-xs font-semibold">
                  Lucro: {formatMoney(item.profit)}
                </span>
              </div>
            </div>
          ))}

          {charts.sales.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-12">
              Nenhum dado de venda recente registrado.
            </p>
          )}
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