
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminAkiService } from "../../services/adminAki.service";

type Purchase = Record<string, any>;

const PAGE_SIZE = 50;

function extractPurchases(response: any): Purchase[] {
  const candidates = [
    response?.data?.Purchases,
    response?.data?.purchases,
    response?.data?.Value,
    response?.Purchases,
    response?.purchases,
    response?.Value,
    response?.data?.data?.Purchases,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function formatDate(value: any): string {
  if (!value) return "N/D";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("pt-PT");
}

function formatAmount(value: any, currency: any): string {
  const amount = Number(value ?? 0);

  return `${amount.toLocaleString("pt-PT", {
    maximumFractionDigits: 2,
  })} ${currency || "AOA"}`;
}

function getStatus(item: Purchase): string {
  return String(
    item.Purchase_Status ??
      item.Purchase_StatusDescription ??
      item.Transaction_Status ??
      item.Status ??
      item.Purchase_State ??
      "N/D"
  );
}

function statusClass(status: string): string {
  const normalized = status.toUpperCase();

  if (
    normalized.includes("SUCCESS") ||
    normalized.includes("SUCESS") ||
    normalized.includes("COMPLET")
  ) {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  }

  if (
    normalized.includes("FAIL") ||
    normalized.includes("REJECT") ||
    normalized.includes("ERRO")
  ) {
    return "bg-red-500/10 text-red-400 border-red-500/30";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("PENDENTE")
  ) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  return "bg-gray-500/10 text-gray-300 border-gray-500/30";
}

export default function AkiReportsPage() {
  const [reports, setReports] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);

  const loadReports = useCallback(
    async (requestedPage = 1) => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const response = await adminAkiService.getPurchaseReport({
          DateStart: dateStart
            ? `${dateStart} 00:00`
            : undefined,
          DateEnd: dateEnd
            ? `${dateEnd} 23:59`
            : null,
          Page: requestedPage,
          PageItems: PAGE_SIZE,
        });

        if (response?.success === false) {
          throw new Error(
            response?.message || "A 5Linhas não conseguiu devolver o relatório."
          );
        }

        const items = extractPurchases(response);

        setReports(items);
        setPage(requestedPage);
        setHasMore(items.length >= PAGE_SIZE);
        setLoadedPages((previous) =>
          previous.includes(requestedPage)
            ? previous
            : [...previous, requestedPage]
        );

        if (items.length === 0) {
          setMessage(
            "Nenhuma transação encontrada para os critérios selecionados."
          );
        } else {
          setMessage(`${items.length} registos recebidos da API 5Linhas.`);
        }
      } catch (err: any) {
        setReports([]);
        setHasMore(false);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Não foi possível carregar o relatório."
        );
      } finally {
        setLoading(false);
      }
    },
    [dateStart, dateEnd]
  );

  useEffect(() => {
    void loadReports(1);
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reports.filter((item) => {
      const searchable = [
        item.Order_ID,
        item.Transaction_ProductDescription,
        item.Transaction_Destination,
        item.Transaction_Value,
        item.Purchase_Currency_Code,
        item.Purchase_Date,
        getStatus(item),
      ]
        .map((value) => String(value ?? ""))
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const status = getStatus(item).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" &&
          (status.includes("SUCCESS") ||
            status.includes("SUCESS") ||
            status.includes("COMPLET"))) ||
        (statusFilter === "FAILED" &&
          (status.includes("FAIL") ||
            status.includes("REJECT") ||
            status.includes("ERRO"))) ||
        (statusFilter === "PENDING" &&
          (status.includes("PENDING") ||
            status.includes("PENDENTE")));

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const successfulCount = reports.filter((item) => {
    const status = getStatus(item).toUpperCase();
    return (
      status.includes("SUCCESS") ||
      status.includes("SUCESS") ||
      status.includes("COMPLET")
    );
  }).length;

  const failedCount = reports.filter((item) => {
    const status = getStatus(item).toUpperCase();
    return (
      status.includes("FAIL") ||
      status.includes("REJECT") ||
      status.includes("ERRO")
    );
  }).length;

  const totalAmount = reports.reduce(
    (sum, item) => sum + Number(item.Transaction_Value ?? 0),
    0
  );

  function applyFilters() {
    setLoadedPages([]);
    void loadReports(1);
  }

  function changePage(nextPage: number) {
    if (nextPage < 1 || loading) return;
    void loadReports(nextPage);
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] p-4 md:p-8 text-gray-100 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">
            Integração oficial
          </p>
          <h1 className="text-2xl font-bold text-white">
            Relatórios 5Linhas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Compras e transações devolvidas pela API da 5Linhas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReports(page)}
          disabled={loading}
          className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {loading ? "A consultar..." : "Atualizar relatório"}
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Registos nesta página" value={reports.length} />
        <SummaryCard
          title="Sucessos nesta página"
          value={successfulCount}
          color="text-emerald-400"
        />
        <SummaryCard
          title="Falhas nesta página"
          value={failedCount}
          color="text-red-400"
        />
        <SummaryCard
          title="Valor nesta página"
          value={`${totalAmount.toLocaleString("pt-PT", {
            maximumFractionDigits: 2,
          })} AOA`}
          color="text-cyan-400"
        />
      </section>

      <section className="rounded-xl border border-[#1E2329] bg-[#12161C] p-4 md:p-5 space-y-4">
        <h2 className="font-semibold text-white">Filtros de pesquisa</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Data inicial
            </label>
            <input
              type="date"
              value={dateStart}
              max={dateEnd || undefined}
              onChange={(event) => setDateStart(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#0B0E11] px-3 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Data final
            </label>
            <input
              type="date"
              value={dateEnd}
              min={dateStart || undefined}
              onChange={(event) => setDateEnd(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#0B0E11] px-3 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Estado da transação
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-[#0B0E11] px-3 py-2.5 text-sm text-white"
            >
              <option value="ALL">Todos os estados</option>
              <option value="SUCCESS">Sucesso</option>
              <option value="FAILED">Falhadas / rejeitadas</option>
              <option value="PENDING">Pendentes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Pesquisar transação
            </label>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order ID, produto ou destino..."
              className="w-full rounded-lg border border-gray-700 bg-[#0B0E11] px-3 py-2.5 text-sm text-white placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {loading ? "A carregar..." : "Aplicar filtros"}
          </button>

          <button
            type="button"
            onClick={() => {
              setDateStart("");
              setDateEnd("");
              setSearch("");
              setStatusFilter("ALL");
              setLoadedPages([]);
            }}
            className="rounded-lg border border-gray-700 hover:bg-white/5 px-5 py-2.5 text-sm text-gray-300"
          >
            Limpar pesquisa
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && message && (
        <p className="text-xs text-gray-400">{message}</p>
      )}

      <section className="overflow-hidden rounded-xl border border-[#1E2329] bg-[#12161C]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 p-4">
          <div>
            <h2 className="font-semibold text-white">Transações oficiais</h2>
            <p className="text-xs text-gray-500 mt-1">
              Página {page} · {filteredReports.length} registos apresentados
            </p>
          </div>

          <span className="text-xs text-gray-400">
            Páginas consultadas nesta sessão:{" "}
            {loadedPages.length ? loadedPages.join(", ") : "nenhuma"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#161A1F] text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-4 py-4">Order ID</th>
                <th className="px-4 py-4">Produto</th>
                <th className="px-4 py-4">Destino</th>
                <th className="px-4 py-4">Valor</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Data</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800/70 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    A consultar os registos da 5Linhas...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">
                    Nenhuma transação corresponde à pesquisa.
                  </td>
                </tr>
              ) : (
                filteredReports.map((item, index) => {
                  const status = getStatus(item);

                  return (
                    <tr
                      key={`${item.Order_ID ?? "order"}-${index}`}
                      className="hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-4 font-mono text-gray-300">
                        {item.Order_ID ?? "N/D"}
                      </td>
                      <td className="px-4 py-4 text-gray-200">
                        {item.Transaction_ProductDescription ?? "N/D"}
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-400">
                        {item.Transaction_Destination ?? "N/D"}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-emerald-400">
                        {formatAmount(
                          item.Transaction_Value,
                          item.Purchase_Currency_Code
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold ${statusClass(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(item.Purchase_Date)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-800 p-4">
          <button
            type="button"
            onClick={() => changePage(page - 1)}
            disabled={loading || page <= 1}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-30"
          >
            ← Anterior
          </button>

          <span className="text-xs text-gray-500">Página {page}</span>

          <button
            type="button"
            onClick={() => changePage(page + 1)}
            disabled={loading || !hasMore}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-30"
          >
            Seguinte →
          </button>
        </div>
      </section>

      <p className="text-xs leading-5 text-gray-500">
        A pesquisa por texto e o resumo de estados aplicam-se aos registos da
        página carregada. A navegação depende da paginação suportada pela API
        5Linhas.
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = "text-white",
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E2329] bg-[#12161C] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500">{title}</p>
      <p className={`mt-2 break-words text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
