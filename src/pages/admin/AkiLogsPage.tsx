import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';

export default function AkiLogsPage({ data }: { data?: any }) {
  const [dashboard, setDashboard] = useState<any>(data || null);
  const [loading, setLoading] = useState(!data);

  // Sincroniza sempre que a propriedade 'data' sofrer alteração do pai
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
        console.error('Erro ao carregar registos de histórico', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [data]);

  // Função auxiliar para estilizar os estados das transações
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return {
          label: "PAID",
          className:
            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        };

      case "PENDING":
        return {
          label: "PENDING",
          className:
            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        };

      case "REJECTED":
        return {
          label: "REJECTED",
          className:
            "bg-red-500/10 text-red-400 border border-red-500/20"
        };

      case "FAILED":
        return {
          label: "FAILED",
          className:
            "bg-red-500/10 text-red-400 border border-red-500/20"
        };

      case "UNSUCCESS":
        return {
          label: "UNSUCCESS",
          className:
            "bg-red-500/10 text-red-400 border border-red-500/20"
        };

      default:
        return {
          label: status || "UNKNOWN",
          className:
            "bg-gray-500/10 text-gray-400 border border-gray-500/20"
        };
    }
  };

  if (loading && !dashboard) {
    return <div className="p-8 text-white">A carregar auditoria e históricos...</div>;
  }

  return (
    <div className="p-8 text-gray-100 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-gray-300">AKI - Auditoria & Histórico</h1>
      </div>

      {/* TABELA DE HISTÓRICO CRUZADO (TRANSACTIONS) */}
      <div className="bg-[#12161C] rounded-xl border border-[#1E2329] overflow-hidden">
        <div className="p-4 border-b border-[#1E2329] font-semibold text-sm text-gray-300">
          Histórico e Cruzamento de Transações Financeiras (EMATEA vs 5Linhas)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1E2329] text-gray-400 bg-[#0B0E11]">
                <th className="p-3">Data</th>
                <th className="p-3">MerchantTransactionId (EMATEA)</th>
                <th className="p-3">Transaction_ID (5Linhas)</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.transactions?.length > 0 ? (
                dashboard.transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-[#1E2329]/50 hover:bg-[#1A1F24]">
                    <td className="p-3 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-mono text-xs text-blue-400">{tx.merchantTransactionId}</td>
                    <td className="p-3 font-mono text-xs text-gray-300">{tx.providerTransactionId}</td>
                    <td className="p-3 font-semibold">{Number(tx.amount).toLocaleString()} Kz</td>
                    <td className="p-3">
                      {(() => {
                        const status = getStatusStyle(tx.status);

                        return (
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Nenhuma transação registada recentemente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABELA DE HISTÓRICO OPERACIONAL (LATEST REQUESTS) */}
      <div className="bg-[#12161C] rounded-xl border border-[#1E2329] overflow-hidden">
        <div className="p-4 border-b border-[#1E2329] font-semibold text-sm text-gray-300">
          Histórico Operacional — Últimas Solicitações de Serviço (ServiceRequests)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1E2329] text-gray-400 bg-[#0B0E11]">
                <th className="p-3">Data</th>
                <th className="p-3">Utilizador</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.latestRequests?.length > 0 ? (
                dashboard.latestRequests.map((req: any) => (
                  <tr key={req.id} className="border-b border-[#1E2329]/50 hover:bg-[#1A1F24]">
                    <td className="p-3 text-gray-400">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-medium text-gray-200">{req.user?.fullName || 'N/D'}</td>
                    <td className="p-3 font-mono text-xs text-gray-400">{req.user?.phone || 'N/D'}</td>
                    <td className="p-3 text-cyan-400">{req.plan?.name || 'N/D'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded font-medium border ${
                        req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Nenhuma solicitação de serviço recente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}