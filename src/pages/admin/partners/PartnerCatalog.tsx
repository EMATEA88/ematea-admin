export function PartnerCatalog({ catalog }: { catalog: { providers: any[]; services: any[]; plans: any[] } }) {
  return (
    <div className="space-y-6 text-gray-100">
      {/* Operadoras */}
      <div className="bg-[#1a2234] p-6 rounded-xl border border-gray-800 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4">
          Operadoras ({catalog.providers.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {catalog.providers.map(p => (
            <div 
              key={p.id} 
              className="p-3 border border-gray-800 rounded-lg bg-[#121824] text-sm font-medium text-gray-200"
            >
              {p.name}
            </div>
          ))}
          {catalog.providers.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full">Nenhuma operadora registada.</p>
          )}
        </div>
      </div>

      {/* Serviços */}
      <div className="bg-[#1a2234] p-6 rounded-xl border border-gray-800 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4">
          Serviços ({catalog.services.length})
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {catalog.services.map(s => (
            <div 
              key={s.id} 
              className="p-3 border border-gray-800 rounded-lg bg-[#121824] flex justify-between items-center text-sm"
            >
              <span className="font-medium text-gray-200">{s.name}</span>
              <span className="text-gray-400 text-xs bg-[#1a2234] px-2 py-0.5 rounded border border-gray-800">
                ID: {s.id}
              </span>
            </div>
          ))}
          {catalog.services.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum serviço registado.</p>
          )}
        </div>
      </div>
    </div>
  );
}