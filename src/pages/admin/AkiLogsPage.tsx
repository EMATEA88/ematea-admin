
import { useCallback, useEffect, useState } from "react";
import {
  adminAkiService,
  type AkiHistoryParams,
} from "../../services/adminAki.service";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface HistoryResult<T> {
  data: T[];
  pagination: Pagination;
}

interface Transaction {
  id: string;
  createdAt?: string;
  date?: string;
  merchantTransactionId?: string;
  providerTransactionId?: string;
  amount?: number | string;
  status?: string;
  user?: { fullName?: string; phone?: string };
}

interface ServiceRequest {
  id: string;
  createdAt?: string;
  date?: string;
  status?: string;
  user?: { fullName?: string; phone?: string };
  plan?: { name?: string };
}

const emptyPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-AO");
}

function formatAmount(value?: number | string) {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  return `${amount.toLocaleString("pt-AO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} Kz`;
}

function statusStyle(status?: string) {
  const value = (status || "").toUpperCase();

  if (
    ["PAID", "COMPLETED", "SUCCESS", "SUCCESSFUL"].includes(value)
  ) {
    return "bg-green-500/15 text-green-400";
  }

  if (
    ["PENDING", "PROCESSING", "IN_PROGRESS"].includes(value)
  ) {
    return "bg-amber-500/15 text-amber-400";
  }

  if (
    ["REJECTED", "FAILED", "UNSUCCESSFUL", "CANCELLED", "ERROR"].includes(value)
  ) {
    return "bg-red-500/15 text-red-400";
  }

  return "bg-gray-500/15 text-gray-300";
}

function StatusBadge({ status }: { status?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyle(status)
      }`}
    >
      {status || "Desconhecido"}
    </span>
  );
}

function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, total, totalPages } = pagination;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4">
      <p className="text-sm text-gray-400">
        {total === 0
          ? "Nenhum registo"
          : `${(page - 1) * pagination.limit + 1}–${Math.min(
              page * pagination.limit,
              total
            )} de ${total} registos`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-300">
          Página {page} de {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={totalPages === 0 || page >= totalPages}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Seguinte
        </button>
      </div>
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  status,
  setStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
  onClear,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onApply();
        }}
        placeholder="Pesquisar..."
        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
      />

      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
      >
        <option value="">Todos os estados</option>
        <option value="PENDING">Pendente</option>
        <option value="PROCESSING">Em processamento</option>
        <option value="COMPLETED">Concluído</option>
        <option value="PAID">Pago</option>
        <option value="FAILED">Falhado</option>
        <option value="REJECTED">Rejeitado</option>
        <option value="CANCELLED">Cancelado</option>
      </select>

      <input
        type="date"
        aria-label="Data inicial"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
      />

      <input
        type="date"
        aria-label="Data final"
        value={endDate}
        min={startDate || undefined}
        onChange={(event) => setEndDate(event.target.value)}
        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApply}
          className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

export default function AkiLogsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [transactionPagination, setTransactionPagination] =
    useState<Pagination>(emptyPagination);
  const [requestPagination, setRequestPagination] =
    useState<Pagination>(emptyPagination);

  const [transactionPage, setTransactionPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [transactionLoading, setTransactionLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(true);
  const [transactionError, setTransactionError] = useState("");
  const [requestError, setRequestError] = useState("");

  const loadTransactions = useCallback(async () => {
    setTransactionLoading(true);
    setTransactionError("");

    try {
      const params: AkiHistoryParams = {
        page: transactionPage,
        limit: 20,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      };

      const response = await adminAkiService.getTransactionHistory(params);
      const result: HistoryResult<Transaction> =
        response?.data?.data !== undefined
          ? response.data
          : response;

      setTransactions(Array.isArray(result?.data) ? result.data : []);
      setTransactionPagination(result?.pagination || emptyPagination);
    } catch (error) {
      console.error("Erro ao carregar histórico de transações:", error);
      setTransactions([]);
      setTransactionError(
        "Não foi possível carregar o histórico de transações."
      );
    } finally {
      setTransactionLoading(false);
    }
  }, [transactionPage, filters]);

  const loadRequests = useCallback(async () => {
    setRequestLoading(true);
    setRequestError("");

    try {
      const params: AkiHistoryParams = {
        page: requestPage,
        limit: 20,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
      };

      const response = await adminAkiService.getServiceRequestHistory(params);
      const result: HistoryResult<ServiceRequest> =
        response?.data?.data !== undefined
          ? response.data
          : response;

      setRequests(Array.isArray(result?.data) ? result.data : []);
      setRequestPagination(result?.pagination || emptyPagination);
    } catch (error) {
      console.error("Erro ao carregar solicitações de serviço:", error);
      setRequests([]);
      setRequestError(
        "Não foi possível carregar o histórico de solicitações."
      );
    } finally {
      setRequestLoading(false);
    }
  }, [requestPage, filters]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  function applyFilters() {
    setTransactionPage(1);
    setRequestPage(1);
    setFilters({ search, status, startDate, endDate });
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setTransactionPage(1);
    setRequestPage(1);
    setFilters({
      search: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 text-gray-100 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            AKI — Auditoria e Histórico
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Consulta de transações financeiras e solicitações de serviço.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void loadTransactions();
            void loadRequests();
          }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Atualizar históricos
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-gray-950/50">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold">
            Histórico de Transações Financeiras
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Registos financeiros da EMATEA e respetivos identificadores de integração.
          </p>
        </div>

        <FilterBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {transactionError && (
          <div className="p-4 text-sm text-red-400">
            {transactionError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">ID EMATEA</th>
                <th className="px-4 py-3">ID do fornecedor</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactionLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    A carregar transações...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(transaction.createdAt || transaction.date)}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.merchantTransactionId || transaction.id || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.providerTransactionId || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={transaction.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          pagination={transactionPagination}
          onPageChange={setTransactionPage}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-gray-950/50">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold">
            Histórico Operacional — Solicitações de Serviço
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Pedidos de serviço, utilizadores, planos e estados de processamento.
          </p>
        </div>

        <FilterBar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {requestError && (
          <div className="p-4 text-sm text-red-400">
            {requestError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Utilizador</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Serviço / Plano</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requestLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    A carregar solicitações...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Nenhuma solicitação encontrada.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(request.createdAt || request.date)}
                    </td>
                    <td className="px-4 py-3">
                      {request.user?.fullName || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {request.user?.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {request.plan?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          pagination={requestPagination}
          onPageChange={setRequestPage}
        />
      </section>
    </div>
  );
}
