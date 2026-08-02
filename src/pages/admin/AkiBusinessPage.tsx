import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';

const Card = ({ title, value, color = "text-white" }: any) => (
  <div className="bg-[#12161C] border border-[#1E2329] rounded-xl p-5 hover:border-gray-700 transition">
    <span className="text-xs uppercase text-gray-500 tracking-wider">{title}</span>
    <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

export default function AkiBusinessPage({ data }: { data?: any }) {
  const [dashboard, setDashboard] = useState<any>(data || null);
  const [loading, setLoading] = useState(!data);

  // Garante a sincronização imediata sempre que a prop 'data' mudar no componente pai
  useEffect(() => {
    if (data) {
      setDashboard(data);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data) return; // Se já temos dados via props, não precisamos fazer fetch manual

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await adminAkiService.getDashboard();
        setDashboard(res.data);
      } catch (error) {
        console.error('Erro ao carregar dados de negócio', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [data]);

  if (loading && !dashboard) {
    return <div className="p-8 text-white">A carregar métricas de negócio...</div>;
  }

  return (
    <div className="p-8 text-gray-100 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-gray-300">AKI - Negócio & Finanças</h1>
      </div>

      {/* FINANCEIRO EMATEA */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Financeiro EMATEA</h2>
          <span className="text-xs text-gray-500">Company Wallet</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card title="Saldo Empresa" value={`${Number(dashboard?.financial?.companyWalletBalance ?? 0).toLocaleString()} Kz`} color="text-emerald-400" />
          <Card title="Receita" value={`${Number(dashboard?.financial?.revenue ?? 0).toLocaleString()} Kz`} color="text-cyan-400" />
          <Card title="Custos" value={`${Number(dashboard?.financial?.cost ?? 0).toLocaleString()} Kz`} color="text-orange-400" />
          <Card title="Lucro" value={`${Number(dashboard?.financial?.profit ?? 0).toLocaleString()} Kz`} color="text-green-400" />
          <Card title="Comissão EMATEA" value={`${Number(dashboard?.financial?.companyCommission ?? 0).toLocaleString()} Kz`} color="text-purple-400" />
        </div>
      </div>

      {/* UTILIZADORES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Utilizadores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Clientes" value={dashboard?.users?.clients ?? 0} color="text-cyan-400" />
          <Card title="Agentes" value={dashboard?.users?.agents ?? 0} color="text-green-400" />
          <Card title="Sub-Agentes" value={dashboard?.users?.subAgents ?? 0} color="text-orange-400" />
          <Card title="Admins" value={dashboard?.users?.admins ?? 0} color="text-purple-400" />
        </div>
      </div>

      {/* VENDAS E COMPRAS */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Vendas e Compras</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card title="Total" value={dashboard?.sales?.total ?? 0} />
          <Card title="Hoje" value={dashboard?.sales?.today ?? 0} />
          <Card title="Mês" value={dashboard?.sales?.month ?? 0} />
          <Card title="Pendentes" value={dashboard?.sales?.pending ?? 0} color="text-amber-400" />
          <Card title="Concluídas" value={dashboard?.sales?.completed ?? 0} color="text-emerald-400" />
          <Card title="Rejeitadas" value={dashboard?.sales?.rejected ?? 0} color="text-red-400" />
        </div>
      </div>

      {/* COMISSÕES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Comissões de Agentes</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card title="Total" value={dashboard?.commissions?.total ?? 0} />
          <Card title="Pagas" value={dashboard?.commissions?.paid ?? 0} color="text-emerald-400" />
          <Card title="Pendentes" value={dashboard?.commissions?.pending ?? 0} color="text-amber-400" />
          <Card title="Canceladas" value={dashboard?.commissions?.cancelled ?? 0} color="text-red-400" />
          <Card title="Valor" value={`${Number(dashboard?.commissions?.amount ?? 0).toLocaleString()} Kz`} color="text-purple-400" />
        </div>
      </div>

      {/* CATÁLOGO E CARTEIRAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Catálogo do Sistema</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card title="Serviços" value={dashboard?.catalog?.services ?? 0} />
            <Card title="Operadoras" value={dashboard?.catalog?.providers ?? 0} />
            <Card title="Grupos" value={dashboard?.catalog?.groups ?? 0} />
            <Card title="Planos" value={dashboard?.catalog?.plans ?? 0} />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Balanço das Carteiras</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card title="Empresa" value={`${Number(dashboard?.wallets?.company ?? 0).toLocaleString()} Kz`} color="text-emerald-400" />
            <Card title="Clientes" value={`${Number(dashboard?.wallets?.clients ?? 0).toLocaleString()} Kz`} color="text-cyan-400" />
            <Card title="Agentes" value={`${Number(dashboard?.wallets?.agents ?? 0).toLocaleString()} Kz`} color="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}