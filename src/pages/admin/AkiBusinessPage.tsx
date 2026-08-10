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
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(!data);

  // Garante a sincronização imediata sempre que a prop 'data' mudar no componente pai
  useEffect(() => {
    if (data) {
      setDashboard(data);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [dashboardRes, reportsRes] = await Promise.all([
          data ? Promise.resolve({ data }) : adminAkiService.getDashboard(),
          adminAkiService.getPurchaseReport()
        ]);
        
        setDashboard(dashboardRes.data);
        setReports(reportsRes.data?.Reports ?? []);
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

      {/* RELATÓRIO OFICIAL AKI */}
      <div className="bg-[#12161C] border border-[#1E2329] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-white">Relatório Oficial AKI</h2>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {reports.length} registos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-[11px] font-black uppercase tracking-widest text-gray-400 bg-[#161a1f]/50">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs uppercase font-medium">
                    Nenhum relatório oficial encontrado.
                  </td>
                </tr>
              ) : (
                reports.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-gray-300">
                      {item.OrderId || item.orderId || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-300">
                      {item.ProductName || item.productName || item.PlanName || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {item.Destination || item.destination || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-emerald-400 font-bold">
                      {Number(item.Amount ?? item.amount ?? 0).toLocaleString()} Kz
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.Status || item.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {item.Date || item.date || item.CreatedAt || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}