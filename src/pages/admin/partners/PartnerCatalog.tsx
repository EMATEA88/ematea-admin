export function PartnerCatalog({ catalog }: { catalog: { providers: any[]; services: any[]; plans: any[] } }) {
  return (
    <div className="space-y-6 text-gray-100">
      {/* Operadoras */}
      <div className="bg-[#161A1F] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">
          Operadoras ({catalog.providers.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {catalog.providers.map(p => (
            <div 
              key={p.id} 
              className="p-3.5 border border-white/5 rounded-xl bg-[#0B0E11] text-sm font-semibold text-gray-200 shadow-inner"
            >
              {p.name}
            </div>
          ))}
          {catalog.providers.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full py-4 text-center">Nenhuma operadora registada.</p>
          )}
        </div>
      </div>

      {/* Serviços */}
      <div className="bg-[#161A1F] p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">
          Serviços ({catalog.services.length})
        </h3>
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {catalog.services.map(s => (
            <div 
              key={s.id} 
              className="p-3.5 border border-white/5 rounded-xl bg-[#0B0E11] flex justify-between items-center text-sm"
            >
              <span className="font-semibold text-gray-200">{s.name}</span>
              <span className="text-gray-400 text-xs bg-[#161A1F] px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                ID: {s.id}
              </span>
            </div>
          ))}
          {catalog.services.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">Nenhum serviço registado.</p>
          )}
        </div>
      </div>
    </div>
  );
}