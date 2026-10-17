import { useEffect, useState } from 'react';
import { adminAkiService } from '../../services/adminAki.service';

type ActionType = 'sync' | 'account' | 'products' | 'report';

export default function AkiOverviewPage({
  data,
  onRefresh,
}: {
  data?: any;
  onRefresh?: () => Promise<void>;
}) {
  const [dashboard, setDashboard] = useState<any>(data || null);
  const [loading, setLoading] = useState(!data);
  const [timeAgo, setTimeAgo] = useState('agora mesmo');
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (data) {
      setDashboard(data);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!dashboard?.api?.lastSync) return;

    const updateTime = () => {
      const diffSecs = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(dashboard.api.lastSync).getTime()) / 1000
        )
      );

      if (diffSecs < 60) {
        setTimeAgo(`há ${diffSecs} segundos`);
      } else if (diffSecs < 3600) {
        setTimeAgo(`há ${Math.floor(diffSecs / 60)} minutos`);
      } else {
        setTimeAgo(`há ${Math.floor(diffSecs / 3600)} horas`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [dashboard?.api?.lastSync]);

  const runAction = async (action: ActionType) => {
    if (activeAction) return;

    setActiveAction(action);
    setResult(null);
    setErrorMessage('');

    try {
      let response: any;

      switch (action) {
        case 'sync': {
          if (onRefresh) {
            await onRefresh();
            setResult({
              message: 'Dados da visão geral atualizados.',
            });
          } else {
            response = await adminAkiService.getDashboard();
            const dashboardData = response?.data ?? response;
            setDashboard(dashboardData);
            setResult(dashboardData);
          }
          break;
        }

        case 'account': {
          response = await adminAkiService.getAccountInfo();

          if (response?.success === false) {
            throw new Error(response.message || 'Não foi possível consultar a conta.');
          }

          const accountData = response?.data ?? response;
          setResult(accountData);

          // Atualiza os dados da conta no painel sem substituir
          // o restante das métricas do dashboard.
          setDashboard((previous: any) => ({
            ...previous,
            account: {
              ...previous?.account,
              ...accountData,
            },
          }));
          break;
        }

        case 'products': {
          response = await adminAkiService.syncProducts();

          if (response?.success === false) {
            throw new Error(
              response.message || 'A sincronização dos produtos falhou.'
            );
          }

          setResult(response?.data ?? response);

          // Atualiza as métricas após a sincronização.
          if (onRefresh) {
            await onRefresh();
          }
          break;
        }

        case 'report': {
          const today = new Date();
          const dateStart = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0'),
          ].join('-');

          response = await adminAkiService.getPurchaseReport({
            DateStart: dateStart,
            DateEnd: dateStart,
            Page: 1,
            PageItems: 20,
          });

          if (response?.success === false) {
            throw new Error(
              response.message || 'Não foi possível gerar o relatório.'
            );
          }

          setResult(response?.data ?? response);
          break;
        }
      }
    } catch (error: any) {
      console.error(`Erro na ação AKI (${action}):`, error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Ocorreu um erro ao executar a operação.'
      );
    } finally {
      setActiveAction(null);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="p-8 text-white">
        A carregar visão geral da AKI...
      </div>
    );
  }

  const balance = Number(dashboard?.account?.balance ?? 0);
  const isSandbox = dashboard?.api?.environment === 'Sandbox';

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  return (
    <div className="p-8 text-gray-100 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wider text-gray-300">
          AKI - Visão Geral & API
        </h1>

        <span className="text-xs text-gray-400 bg-[#12161C] px-3 py-1.5 rounded-full border border-gray-800">
          Última atualização:{' '}
          <strong className="text-gray-200">{timeAgo}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm bg-[#12161C] p-4 rounded-xl border border-[#1E2329]">
        <div>
          <span className="text-gray-500 block">Estado da API</span>
          <span className="text-green-500 font-semibold flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            {dashboard?.api?.status ?? 'Desconhecido'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Ambiente</span>
          <span
            className={`font-semibold mt-1 inline-block px-2 py-0.5 text-xs rounded ${
              isSandbox
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {dashboard?.api?.environment ?? '—'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Conta AKI</span>
          <span className="font-medium mt-1 block truncate text-gray-200">
            {dashboard?.account?.name ?? '—'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Identificação / App ID</span>
          <span className="font-mono mt-1 block text-gray-300 break-all">
            {dashboard?.account?.identification ?? '—'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 block">Token</span>
          <span className="font-mono mt-1 block text-gray-500">
            ***************
          </span>
        </div>
      </div>

      {balance === 0 ? (
        <div className="bg-red-950/40 border border-red-600 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🔴</span>
          <div>
            <h4 className="font-bold">
              Saldo: 0,00 {dashboard?.account?.currency ?? ''}
            </h4>
            <p className="text-sm">
              Confirme o saldo real da conta antes de efetuar compras.
            </p>
          </div>
        </div>
      ) : balance < 100000 ? (
        <div className="bg-amber-950/40 border border-amber-600 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🟠</span>
          <div>
            <h4 className="font-bold">
              Saldo AKI: {balance.toLocaleString()}{' '}
              {dashboard?.account?.currency ?? ''}
            </h4>
            <p className="text-sm">
              Recomenda-se verificar se é necessário reforçar a conta.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">
            Saldo AKI
          </span>
          <p className="text-2xl font-extrabold text-green-400 mt-2">
            {balance.toLocaleString()}{' '}
            {dashboard?.account?.currency ?? ''}
          </p>
        </div>

        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">
            Compras Hoje
          </span>
          <p className="text-2xl font-extrabold text-blue-400 mt-2">
            {dashboard?.today?.purchases ?? 0}
          </p>
        </div>

        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">
            Valor Comprado Hoje
          </span>
          <p className="text-2xl font-extrabold text-purple-400 mt-2">
            {Number(dashboard?.today?.amount ?? 0).toLocaleString()}{' '}
            {dashboard?.account?.currency ?? ''}
          </p>
        </div>

        <div className="bg-[#12161C] p-5 rounded-xl border border-[#1E2329]">
          <span className="text-gray-500 text-xs uppercase tracking-wider block">
            Estado da API
          </span>
          <p className="text-lg font-bold text-green-500 mt-2">
            {dashboard?.api?.status ?? 'Não confirmado'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          onClick={() => runAction('sync')}
          disabled={activeAction !== null}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {activeAction === 'sync' ? 'A atualizar...' : 'Sincronizar AKI'}
        </button>

        <button
          onClick={() => runAction('account')}
          disabled={activeAction !== null}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          {activeAction === 'account' ? 'A consultar...' : 'Consultar Conta'}
        </button>

        <button
          onClick={() => runAction('products')}
          disabled={activeAction !== null}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          {activeAction === 'products'
            ? 'A atualizar produtos...'
            : 'Atualizar Produtos'}
        </button>

        <button
          onClick={() => runAction('report')}
          disabled={activeAction !== null}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition"
        >
          {activeAction === 'report' ? 'A gerar...' : 'Relatório'}
        </button>
      </div>

      {(result !== null || errorMessage) && (
        <section
          className={`rounded-xl border p-5 space-y-3 ${
            errorMessage
              ? 'bg-red-950/30 border-red-800'
              : 'bg-[#12161C] border-[#1E2329]'
          }`}
        >
          <div className="flex justify-between items-center gap-3">
            <h2 className="font-bold text-gray-100">
              {errorMessage ? 'Falha na operação' : 'Resultado da operação'}
            </h2>

            <button
              onClick={() => {
                setResult(null);
                setErrorMessage('');
              }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Fechar
            </button>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-300">{errorMessage}</p>
          ) : (
            <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words overflow-x-auto max-h-[500px] overflow-y-auto bg-black/20 rounded-lg p-4">
              {formatValue(result)}
            </pre>
          )}
        </section>
      )}
    </div>
  );
}