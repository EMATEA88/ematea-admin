import { useEffect, useState, useCallback } from 'react';
import { adminAkiService } from '../../services/adminAki.service';
import AkiOverviewPage from './AkiOverviewPage';
import AkiBusinessPage from './AkiBusinessPage';
import AkiLogsPage from './AkiLogsPage';
import AkiAuditPage from './AkiAuditPage';
import { Cpu, ShieldCheck } from "@phosphor-icons/react";

type Tab =
  | "overview"
  | "business"
  | "logs"
  | "audit";

export default function AkiParentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Função centralizada para buscar dados atualizados
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAkiService.getDashboard();
      setDashboardData(res.data);
    } catch (error) {
      console.error('Erro ao atualizar dados globais da AKI:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Executa ao carregar a página e sempre que mudar de aba (garante dados frescos)
  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, fetchDashboardData]);

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">
      
      {/* HEADER DO PAINEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Ecossistema AKI
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Integration Services</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Painel Geral & Controle AKI
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            Gestão unificada de APIs, métricas de negócio, transações e auditorias do sistema AKI.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS ESTILIZADA */}
        <div className="flex items-center gap-2 bg-[#161A1F] p-1.5 rounded-2xl border border-white/5 shadow-xl flex-wrap">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Visão Geral & API
          </button>
          <button 
            onClick={() => setActiveTab('business')} 
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'business' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Negócio & Finanças
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'logs' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Auditoria & Histórico
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Auditoria
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL COM SKELETON INTEGRADO */}
      {loading && !dashboardData ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 h-40" />
            <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 h-40" />
            <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 h-40" />
          </div>
          <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-12 h-96 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <Cpu className="animate-spin text-blue-400" size={24} />
              <span className="text-xs font-black uppercase tracking-widest">Sincronizando dados da AKI...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="transition-all duration-200">
          {activeTab === 'overview' && (
            <AkiOverviewPage data={dashboardData} onRefresh={fetchDashboardData} />
          )}
          {activeTab === 'business' && (
            <AkiBusinessPage data={dashboardData} />
          )}
          {activeTab === 'logs' && (
            <AkiLogsPage data={dashboardData} />
          )}
          {activeTab === 'audit' && (
            <AkiAuditPage />
          )}
        </div>
      )}
    </div>
  );
}