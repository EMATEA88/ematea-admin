import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';

export default function AkiOverviewPage({ data, onRefresh }: { data?: any; onRefresh?: () => Promise<void> }) {
  const [dashboard, setDashboard] = useState<any>(data || null);
  const [loading, setLoading] = useState(!data);
  const [timeAgo, setTimeAgo] = useState('agora mesmo');

  // Sincroniza sempre que a propriedade 'data' sofrer alteração do pai
  useEffect(() => {
    if (data) {
      setDashboard(data);
      setLoading(false);
    }
  }, [data]);

  const fetchDashboard = async () => {
    if (onRefresh) {
      await onRefresh();
      return;
    }
    try {
      setLoading(true);
      const res = await adminAkiService.getDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.error('Erro ao carregar visão geral da AKI', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dashboard?.api?.lastSync) return;
    const interval = setInterval(() => {
      const diffSecs = Math.floor((new Date().getTime() - new Date(dashboard.api.lastSync).getTime()) / 1000);
      if (diffSecs < 60) setTimeAgo(`há ${diffSecs} segundos`);
      else setTimeAgo(`há ${Math.floor(diffSecs / 60)} minutos`);
    }, 1000);
    return () => clearInterval(interval);
  }, [dashboard]);

  if (loading && !dashboard) {
    return <div className="p-8 text-white">A carregar visão geral da AKI...</div>;
  }

  const balance = dashboard?.account?.balance || 0;
  const isSandbox = dashboard?.api?.environment === 'Sandbox';

  return (
    <div className="p-8 text-gray-100 max-w-7xl mx-auto space-y-6">
      {/* TOPO COM INDICADOR TEMPORAL */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-gray-300">AKI - Visão Geral & API</h1>
        <span className="text-xs text-gray-400 bg-[#12161C] px-3 py-1.5 rounded-full border border-gray-800">
          Última atualização: <strong className="text-gray-200">{timeAgo}</strong>
        </span>
      </div>

      {/* DETALHES DA API E AMBIENTE */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm bg-[#12161C] p-4 rounded-xl border border-[#1E2329]">
        <div>
          <span className="text-gray-500 block">Estado da API</span>
          <span className="text-green-500 font-semibold flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> 
            {dashboard?.api?.status}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Ambiente</span>
          <span className={`font-semibold mt-1 inline-block px-2 py-0.5 text-xs rounded ${isSandbox ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
            {dashboard?.api?.environment}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block">Conta AKI</span>
          <span className="font-medium mt-1 block truncate text-gray-200">{dashboard?.account?.name}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Identificação / App ID</span>
          <span className="font-mono mt-1 block text-gray-300">{dashboard?.account?.identification}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Token</span>
          <span className="font-mono mt-1 block text-gray-500">***************8730</span>
        </div>
      </div>

      {/* ALERTAS DINÂMICOS DE SALDO */}
      {balance === 0 ? (
        <div className="bg-red-950/40 border border-red-600 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🔴</span>
          <div>
            <h4 className="font-bold">Saldo: 0,00 {dashboard?.account?.currency}</h4>
            <p className="text-sm">Conta sem saldo. As compras estão interrompidas.</p>
          </div>
        </div>
      ) : balance < 100000 ? (
        <div className="bg-amber-950/40 border border-amber-600 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🟠</span>
          <div>
            <h4 className="font-bold">Saldo AKI: {Number(balance).toLocaleString()} {dashboard?.account?.currency}</h4>
            <p className="text-sm">⚠ Recomenda-se reforçar a conta.</p>
          </div>
        </div>
      ) : null}

      {/* CARTÕES DE MÉTRICAS DA AKI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">Saldo AKI</span>
          <p className="text-2xl font-extrabold text-green-400 mt-2">
            {Number(balance).toLocaleString()} {dashboard?.account?.currency}
          </p>
        </div>
        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">Compras Hoje</span>
          <p className="text-2xl font-extrabold text-blue-400 mt-2">
            {dashboard?.today?.purchases ?? 0}
          </p>
        </div>
        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">Valor Comprado Hoje</span>
          <p className="text-2xl font-extrabold text-purple-400 mt-2">
            {Number(dashboard?.today?.amount || 0).toLocaleString()} {dashboard?.account?.currency}
          </p>
        </div>
        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">Estado da API</span>
          <p className="text-lg font-bold text-green-500 mt-2 flex items-center gap-2">
            🟢 Operacional
          </p>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO REFORÇADOS */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button 
          onClick={fetchDashboard}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20"
        >
          Sincronizar AKI
        </button>
        <button 
          onClick={fetchDashboard}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          Consultar Conta
        </button>
        <button 
          onClick={() => alert('Atualizando catálogo de produtos da AKI...')}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          Atualizar Produtos
        </button>
        <button 
          onClick={() => alert('A gerar relatório de auditoria...')}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          Relatório
        </button>
      </div>
    </div>
  );
}