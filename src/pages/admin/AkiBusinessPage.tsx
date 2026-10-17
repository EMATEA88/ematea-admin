import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';

const Card = ({
  title,
  value,
  color = 'text-white',
}: {
  title: string;
  value: string | number;
  color?: string;
}) => (
  <div className="bg-[#12161C] border border-[#1E2329] rounded-xl p-5 hover:border-gray-700 transition">
    <span className="text-xs uppercase text-gray-500 tracking-wider">
      {title}
    </span>
    <p className={`text-2xl font-bold mt-2 break-words ${color}`}>
      {value}
    </p>
  </div>
);

function extractPurchases(response: any): any[] {
  // Compatível com a resposta direta do serviço e com respostas
  // encapsuladas em data, sem alterar o conteúdo dos registos.
  const candidates = [
    response?.Purchases,
    response?.data?.Purchases,
    response?.data?.data?.Purchases,
    response?.data?.data?.data?.Purchases,
  ];

  const purchases = candidates.find(Array.isArray);
  return purchases ?? [];
}

function getPurchaseStatus(item: any): string {
  const status =
    item?.Transaction_Status ??
    item?.Purchase_Status ??
    item?.Transaction_State ??
    item?.Status ??
    item?.status ??
    item?.State;

  if (status === null || status === undefined || status === '') {
    return 'Não informado';
  }

  return String(status);
}

function getStatusStyle(status: string): string {
  const normalized = status.toLowerCase();

  if (
    normalized.includes('success') ||
    normalized.includes('completed') ||
    normalized.includes('successful') ||
    normalized.includes('sucesso') ||
    normalized.includes('conclu')
  ) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('pendente') ||
    normalized.includes('process')
  ) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  if (
    normalized.includes('fail') ||
    normalized.includes('reject') ||
    normalized.includes('error') ||
    normalized.includes('cancel') ||
    normalized.includes('erro') ||
    normalized.includes('rejeit')
  ) {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
}

export default function AkiBusinessPage({ data }: { data?: any }) {
  const [dashboard, setDashboard] = useState<any>(data || null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(!data);
  const [reportLoading, setReportLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reportError, setReportError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [dateEnd, setDateEnd] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [reportPage, setReportPage] = useState(1);
  const [pageItems, setPageItems] = useState(50);

  useEffect(() => {
    if (data) {
      setDashboard(data);
      setLoading(false);
    }
  }, [data]);

  // Carrega o dashboard sem o deixar dependente do sucesso do relatório.
  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      setLoading(!data);
      if (data) setDashboard(data);
      try {
        if (!data) {
          const response = await adminAkiService.getDashboard();
          if (active) {
            setDashboard(response?.data ?? response);
            setErrorMessage('');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar o dashboard AKI:', error);
        if (active) setErrorMessage('Não foi possível atualizar as métricas do painel.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { active = false; };
  }, [data]);

  // Consulta cada página à API da 5Linhas; filtros de data voltam a consultar o servidor.
  useEffect(() => {
    let active = true;

    async function fetchReport() {
      setReportLoading(true);
      setReportError('');
      try {
        const response = await adminAkiService.getPurchaseReport({
          DateStart: dateStart ? `${dateStart} 00:00` : undefined,
          DateEnd: dateEnd ? `${dateEnd} 23:59` : null,
          Page: reportPage,
          PageItems: pageItems,
        });
        if (!active) return;
        const purchases = extractPurchases(response);
        setReports(purchases);
        if (purchases.length === 0) {
          console.warn('A API AKI não devolveu compras para esta página:', response);
        }
      } catch (error) {
        console.error('Erro ao carregar o relatório oficial AKI:', error);
        if (active) {
          setReports([]);
          setReportError('Não foi possível carregar o relatório da 5Linhas. As restantes métricas continuam disponíveis.');
        }
      } finally {
        if (active) setReportLoading(false);
      }
    }

    fetchReport();
    return () => { active = false; };
  }, [dateStart, dateEnd, reportPage, pageItems]);

  const filteredReports = reports.filter((item: any) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchable = [
      item?.Order_ID, item?.OrderId, item?.Transaction_ProductDescription,
      item?.Transaction_ProductCode, item?.Transaction_Destination,
      item?.Transaction_Status, item?.Purchase_Status, item?.Status, item?.State,
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(term);
  });

  if (loading && !dashboard) {
    return (
      <div className="p-8 text-white">
        A carregar métricas de negócio...
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-100 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-gray-300">
          AKI - Negócio &amp; Finanças
        </h1>
        {errorMessage && (
          <p className="mt-3 text-sm text-amber-400">{errorMessage}</p>
        )}
      </div>

      {/* FINANCEIRO EMATEA */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Financeiro EMATEA</h2>
          <span className="text-xs text-gray-500">Company Wallet</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card
            title="Saldo Empresa"
            value={`${Number(dashboard?.financial?.companyWalletBalance ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-emerald-400"
          />
          <Card
            title="Receita"
            value={`${Number(dashboard?.financial?.revenue ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-cyan-400"
          />
          <Card
            title="Custos"
            value={`${Number(dashboard?.financial?.cost ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-orange-400"
          />
          <Card
            title="Lucro"
            value={`${Number(dashboard?.financial?.profit ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-green-400"
          />
          <Card
            title="Comissão EMATEA"
            value={`${Number(dashboard?.financial?.companyCommission ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-purple-400"
          />
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
          <Card
            title="Valor"
            value={`${Number(dashboard?.commissions?.amount ?? 0).toLocaleString('pt-PT')} Kz`}
            color="text-purple-400"
          />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              title="Empresa"
              value={`${Number(dashboard?.wallets?.company ?? 0).toLocaleString('pt-PT')} Kz`}
              color="text-emerald-400"
            />
            <Card
              title="Clientes"
              value={`${Number(dashboard?.wallets?.clients ?? 0).toLocaleString('pt-PT')} Kz`}
              color="text-cyan-400"
            />
            <Card
              title="Agentes"
              value={`${Number(dashboard?.wallets?.agents ?? 0).toLocaleString('pt-PT')} Kz`}
              color="text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* RELATÓRIO OFICIAL AKI */}
      <div className="bg-[#12161C] border border-[#1E2329] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Relatório Oficial AKI</h2>
            <p className="text-xs text-gray-500 mt-1">
              Compras devolvidas diretamente pela API da 5Linhas
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {reportLoading ? 'A carregar...' : `${filteredReports.length} nesta página`}
          </span>
        </div>

        {reportError && (
          <p className="text-sm text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            {reportError}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-xs text-gray-400 space-y-1">
            <span>Data inicial</span>
            <input type="date" value={dateStart} max={dateEnd || undefined}
              onChange={(event) => { setDateStart(event.target.value); setReportPage(1); }}
              className="w-full rounded-lg border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
          </label>
          <label className="text-xs text-gray-400 space-y-1">
            <span>Data final</span>
            <input type="date" value={dateEnd} min={dateStart || undefined}
              onChange={(event) => { setDateEnd(event.target.value); setReportPage(1); }}
              className="w-full rounded-lg border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
          </label>
          <label className="text-xs text-gray-400 space-y-1 md:col-span-2">
            <span>Pesquisar transação</span>
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Order ID, produto, destino ou estado..."
              className="w-full rounded-lg border border-gray-700 bg-[#0D1117] px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-500" />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            Registos por página
            <select value={pageItems} onChange={(event) => { setPageItems(Number(event.target.value)); setReportPage(1); }}
              className="rounded-lg border border-gray-700 bg-[#0D1117] px-2 py-2 text-white">
              <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" disabled={reportLoading || reportPage <= 1}
              onClick={() => setReportPage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
            <span className="text-xs text-gray-400">Página {reportPage}</span>
            <button type="button" disabled={reportLoading || reports.length < pageItems}
              onClick={() => setReportPage((page) => page + 1)}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40">Seguinte</button>
            <button type="button" disabled={reportLoading}
              onClick={() => { setReportPage(1); setSearchTerm(''); }}
              className="rounded-lg border border-cyan-700/60 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40">Atualizar</button>
          </div>
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
              {reportLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    A carregar compras da 5Linhas...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 text-xs uppercase font-medium">
                    {reportError
                      ? 'Não foi possível obter o relatório.'
                      : 'Nenhuma compra encontrada no período consultado.'}
                  </td>
                </tr>
              ) : (
                filteredReports.map((item: any, index: number) => {
                  const status = getPurchaseStatus(item);
                  const purchaseDate =
                    item?.Purchase_Date ??
                    item?.Transaction_Date ??
                    item?.Date ??
                    item?.date;

                  return (
                    <tr
                      key={item?.Order_ID ?? item?.OrderId ?? index}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-gray-300">
                        {item?.Order_ID ?? item?.OrderId ?? item?.Order_ID ?? 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-300">
                        {item?.Transaction_ProductDescription ??
                          item?.Transaction_ProductCode ??
                          'N/A'}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-gray-400">
                        {item?.Transaction_Destination ?? 'N/A'}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-emerald-400 font-bold whitespace-nowrap">
                        {Number(item?.Transaction_Value ?? 0).toLocaleString('pt-PT')}{' '}
                        {item?.Purchase_Currency_Code ?? 'AOA'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {purchaseDate
                          ? new Date(purchaseDate).toLocaleString('pt-PT')
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}