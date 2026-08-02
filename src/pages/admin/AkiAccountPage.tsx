import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';
import AkiOverviewPage from './AkiOverviewPage';
import AkiBusinessPage from './AkiBusinessPage';
import AkiLogsPage from './AkiLogsPage';

export default function AkiParentDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'logs'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Função centralizada para buscar dados atualizados
  const fetchDashboardData = async () => {
    try {
      const res = await adminAkiService.getDashboard();
      setDashboardData(res.data);
    } catch (error) {
      console.error('Erro ao atualizar dados globais da AKI:', error);
    }
  };

  // Executa ao carregar a página e sempre que mudar de aba (garante dados frescos)
  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  return (
    <div>
      {/* Navegação entre abas */}
      <div className="flex gap-4 border-b border-gray-800 pb-2 mb-6">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`pb-2 font-medium ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Visão Geral & API
        </button>
        <button 
          onClick={() => setActiveTab('business')} 
          className={`pb-2 font-medium ${activeTab === 'business' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Negócio & Finanças
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`pb-2 font-medium ${activeTab === 'logs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          Auditoria & Histórico
        </button>
      </div>

      {/* Renderização condicional passando os dados frescos e a função de refresh */}
      {activeTab === 'overview' && (
        <AkiOverviewPage data={dashboardData} onRefresh={fetchDashboardData} />
      )}
      {activeTab === 'business' && (
        <AkiBusinessPage data={dashboardData} />
      )}
      {activeTab === 'logs' && (
        <AkiLogsPage data={dashboardData} />
      )}
    </div>
  );
}