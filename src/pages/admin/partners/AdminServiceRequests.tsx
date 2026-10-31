
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  adminServiceRequestsService,
  type ServiceRequest,
  type ServiceRequestsStats,
} from "../../../services/adminServiceRequests.service";
import toast from "react-hot-toast";
import {
  RefreshCw,
  ClipboardList,
  Building2,
  Search,
  Filter,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Calendar,
  CreditCard,
  Activity,
  ExternalLink,
} from "lucide-react";

const PAGE_SIZE = 20;

const INITIAL_STATS: ServiceRequestsStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  rejected: 0,
  providerTimeout: 0,
};

export default function AdminServiceRequests() {
  const [data, setData] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceRequestsStats>(INITIAL_STATS);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  // ================= PESQUISA COM DEBOUNCE =================

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search]);

  // ================= CARREGAR SOLICITAÇÕES =================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await adminServiceRequestsService.getRequests(
        page,
        PAGE_SIZE,
        statusFilter === "ALL" ? undefined : statusFilter,
        appliedSearch
      );

      setData(response.items ?? []);
      setStats(response.stats ?? INITIAL_STATS);

      setTotal(response.pagination?.total ?? 0);
      setTotalPages(response.pagination?.totalPages ?? 0);
    } catch (error) {
      console.error(
        "Erro ao carregar solicitações de serviço:",
        error
      );

      toast.error("Erro ao carregar solicitações de serviço");
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= ABRIR DETALHES =================

  async function handleOpenDetails(id: number) {
    try {
      setDetailsLoading(true);
      setSelectedRequest(null);

      const request =
        await adminServiceRequestsService.getRequestById(id);

      setSelectedRequest(request);
    } catch (error) {
      console.error("Erro ao consultar solicitação:", error);
      toast.error("Não foi possível carregar os detalhes");
    } finally {
      setDetailsLoading(false);
    }
  }

  // ================= CONCLUIR SERVIÇO =================

  async function handleComplete(id: number) {
    const confirmed = window.confirm(
      `Confirmar a conclusão da solicitação #${id}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await adminServiceRequestsService.completeService(id);

      toast.success("Serviço concluído com sucesso");

      if (selectedRequest?.id === id) {
        setSelectedRequest((previous) =>
          previous
            ? {
                ...previous,
                status: "COMPLETED",
                completedAt: new Date().toISOString(),
              }
            : null
        );
      }

      await fetchData();
    } catch (error) {
      console.error("Erro ao concluir serviço:", error);
      toast.error("Falha ao concluir serviço");
    } finally {
      setActionLoading(null);
    }
  }

  // ================= ALTERAR FILTRO =================

  function handleStatusChange(value: string) {
    setPage(1);
    setStatusFilter(value);
  }

  function clearFilters() {
    setSearch("");
    setAppliedSearch("");
    setStatusFilter("ALL");
    setPage(1);
  }

  const firstRecord =
    total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const lastRecord = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="p-5 xl:p-10 bg-[#0B0E11] min-h-screen text-white space-y-8 max-w-[1800px] mx-auto font-sans">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Gestão de Operações
            </span>

            <span className="text-gray-500 text-xs">•</span>

            <span className="text-gray-400 text-xs font-mono">
              Service Requests
            </span>
          </div>

          <h1 className="text-2xl xl:text-3xl font-black tracking-tight uppercase">
            Solicitações de Serviço
          </h1>

          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-400" />
            Gestão global de solicitações, operações externas e serviços processados.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            size={16}
            className={`text-blue-400 ${loading ? "animate-spin" : ""}`}
          />

          {loading ? "Carregando..." : "Atualizar Dados"}
        </button>
      </div>

      {/* ================= ESTATÍSTICAS ================= */}

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          description="Todas as solicitações"
        />

        <StatCard
          label="Pendentes"
          value={stats.pending}
          description="Aguardando processamento"
        />

        <StatCard
          label="Em processamento"
          value={stats.inProgress}
          description="Operações em andamento"
        />

        <StatCard
          label="Concluídas"
          value={stats.completed}
          description="Operações concluídas"
        />

        <StatCard
          label="Rejeitadas / Timeout"
          value={stats.rejected + stats.providerTimeout}
          description="Rejeições e timeouts"
        />
      </div>

      {/* ================= FILTROS ================= */}

      <div className="bg-[#161A1F] border border-white/5 rounded-[1.5rem] p-5 shadow-xl">
        <div className="flex flex-col xl:flex-row gap-4">

          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por ID, telefone, cliente, plano, parceiro ou referência..."
              className="w-full bg-[#0B0E11] border border-white/5 pl-11 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-all"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                title="Limpar pesquisa"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative min-w-[220px]">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />

            <select
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="w-full appearance-none bg-[#0B0E11] border border-white/5 pl-11 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >
              <option value="ALL">Todos os estados</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em processamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="REJECTED">Rejeitado</option>
              <option value="PROVIDER_TIMEOUT">Timeout do provider</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-500">
            Exibindo{" "}
            <strong className="text-gray-300">{firstRecord}</strong>
            {" - "}
            <strong className="text-gray-300">{lastRecord}</strong>
            {" de "}
            <strong className="text-gray-300">{total}</strong>
            {" solicitações"}
          </span>

          {(search || statusFilter !== "ALL") && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* ================= TABELA ================= */}

      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-[#0B0E11] text-gray-400 border-b border-white/5 text-xs uppercase tracking-wider font-black">
              <tr>
                <Th>ID</Th>
                <Th>Utilizador</Th>
                <Th>Parceiro</Th>
                <Th>Serviço</Th>
                <Th>Plano</Th>
                <Th>Referência</Th>
                <Th>Valor</Th>
                <Th>Estado</Th>
                <Th>Data</Th>
                <Th>Ações</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading && data.length === 0 ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ClipboardList size={36} className="text-gray-600" />

                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Nenhum registo encontrado
                      </p>

                      <p className="text-xs text-gray-600">
                        Altera os filtros ou tenta outra pesquisa.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((request) => {
                  const partnerName =
                    request.partnerName ??
                    request.partner?.name ??
                    request.plan?.partner?.name ??
                    "-";

                  const serviceName =
                    request.serviceName ??
                    request.serviceGroupName ??
                    "-";

                  const planName =
                    request.planName ??
                    request.plan?.name ??
                    "-";

                  const reference =
                    request.customerReference ??
                    request.externalTransactionId ??
                    request.externalProviderRef ??
                    "-";

                  return (
                    <tr
                      key={request.id}
                      className="hover:bg-white/[0.025] transition"
                    >
                      <Td className="text-blue-400 font-mono font-bold whitespace-nowrap">
                        #{request.id}
                      </Td>

                      <Td>
                        <div className="space-y-1">
                          <div className="text-gray-200 font-semibold whitespace-nowrap">
                            {request.user?.phone ?? "-"}
                          </div>

                          <div className="text-[11px] text-gray-500">
                            {request.user?.fullName ??
                              request.user?.name ??
                              request.customerName ??
                              "-"}
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <Building2
                            size={14}
                            className="text-gray-500 shrink-0"
                          />

                          <span className="text-gray-200 font-semibold whitespace-nowrap">
                            {partnerName}
                          </span>
                        </div>
                      </Td>

                      <Td>
                        <span className="text-gray-300 whitespace-nowrap">
                          {serviceName}
                        </span>
                      </Td>

                      <Td className="font-bold text-white">
                        <span className="whitespace-nowrap">
                          {planName}
                        </span>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                          {reference}
                        </span>
                      </Td>

                      <Td className="text-gray-200 font-bold font-mono whitespace-nowrap">
                        {formatMoney(request.amount)}
                      </Td>

                      <Td>
                        <StatusBadge status={request.status} />
                      </Td>

                      <Td>
                        <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
                          {formatDate(request.createdAt)}
                        </span>
                      </Td>

                      <Td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDetails(request.id)}
                            title="Ver detalhes"
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border border-white/5 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>

                          {request.status === "IN_PROGRESS" && (
                            <button
                              disabled={actionLoading === request.id}
                              onClick={() => handleComplete(request.id)}
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                            >
                              {actionLoading === request.id
                                ? "Aguarde..."
                                : "Concluir"}
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINAÇÃO ================= */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-5 border-t border-white/5">
          <span className="text-xs text-gray-500">
            Página{" "}
            <strong className="text-white">{page}</strong>
            {" de "}
            <strong className="text-white">
              {Math.max(totalPages, 1)}
            </strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0E11] border border-white/5 text-xs font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(Math.max(totalPages, 1), current + 1)
                )
              }
              disabled={page >= totalPages || loading || totalPages === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B0E11] border border-white/5 text-xs font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL DE DETALHES ================= */}

      {(detailsLoading || selectedRequest) && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !detailsLoading) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#11161D] border border-white/10 rounded-2xl shadow-2xl">
            {detailsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-blue-400" size={32} />
                <p className="text-sm text-gray-400">
                  A carregar detalhes da solicitação...
                </p>
              </div>
            ) : selectedRequest ? (
              <RequestDetails
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onComplete={handleComplete}
                actionLoading={actionLoading}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= DETALHES DA SOLICITAÇÃO =================

function RequestDetails({
  request,
  onClose,
  onComplete,
  actionLoading,
}: {
  request: ServiceRequest;
  onClose: () => void;
  onComplete: (id: number) => void;
  actionLoading: number | null;
}) {
  const provider =
    request.providerName ??
    request.serviceGroup?.provider?.name ??
    request.plan?.serviceGroup?.provider?.name ??
    "-";

  const partner =
    request.partnerName ??
    request.partner?.name ??
    request.plan?.partner?.name ??
    "-";

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 bg-[#11161D] border-b border-white/10">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-black text-blue-400">
            Detalhes da operação
          </p>

          <h2 className="text-xl font-black text-white mt-1">
            Solicitação #{request.id}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          title="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">

        {/* ESTADO E VALOR */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DetailCard
            label="Estado"
            value={<StatusBadge status={request.status} />}
          />

          <DetailCard
            label="Valor da operação"
            value={formatMoney(request.amount)}
          />

          <DetailCard
            label="Data de criação"
            value={formatDate(request.createdAt)}
          />
        </div>

        {/* CLIENTE */}

        <DetailSection title="Informações do cliente" icon={<User size={17} />}>
          <DetailRow
            label="Nome"
            value={
              request.user?.fullName ??
              request.user?.name ??
              request.customerName
            }
          />

          <DetailRow label="Telefone" value={request.user?.phone} />
          <DetailRow label="Email" value={request.user?.email} />
          <DetailRow label="ID do utilizador" value={request.user?.id} />
          <DetailRow label="Referência do cliente" value={request.customerReference} />
          <DetailRow label="Nome do destinatário" value={request.customerName} />
        </DetailSection>

        {/* SERVIÇO */}

        <DetailSection title="Informações do serviço" icon={<ClipboardList size={17} />}>
          <DetailRow label="Serviço" value={request.serviceName} />
          <DetailRow label="Grupo" value={request.serviceGroupName} />
          <DetailRow label="Plano" value={request.planName ?? request.plan?.name} />
          <DetailRow label="Provider" value={provider} />
          <DetailRow label="Parceiro" value={partner} />
          <DetailRow label="ID do serviço" value={request.serviceId} />
          <DetailRow label="ID do grupo" value={request.serviceGroupId} />
          <DetailRow label="ID do plano" value={request.planId} />
        </DetailSection>

        {/* DADOS FINANCEIROS */}

        <DetailSection title="Informações financeiras" icon={<CreditCard size={17} />}>
          <DetailRow label="Valor cobrado" value={formatMoney(request.amount)} />
          <DetailRow label="Custo" value={formatMoney(request.cost)} />
          <DetailRow label="Lucro" value={formatMoney(request.profit)} />
          <DetailRow
            label="Saldo final do provider"
            value={formatMoney(request.providerFinalBalance)}
          />
        </DetailSection>

        {/* REFERÊNCIAS */}

        <DetailSection title="Referências e integração" icon={<ExternalLink size={17} />}>
          <DetailRow label="ID da transação interna" value={request.transactionId} />
          <DetailRow label="ID da cobrança" value={request.chargeId} />
          <DetailRow label="Referência externa do provider" value={request.externalProviderRef} />
          <DetailRow label="ID externo da transação" value={request.externalTransactionId} />
          <DetailRow label="Estado da operação no provider" value={request.providerOperationStatus} />
          <DetailRow label="Código da operação" value={request.providerOperationCode} />
          <DetailRow label="Último estado do provider" value={request.lastProviderStatus} />
          <DetailRow label="Último código do provider" value={request.lastProviderCode} />
          <DetailRow label="Mensagem do provider" value={request.lastProviderMessage} />
          <DetailRow label="Tentativas de monitorização" value={request.monitorAttempts} />
        </DetailSection>

        {/* DATAS */}

        <DetailSection title="Histórico de datas" icon={<Calendar size={17} />}>
          <DetailRow label="Criado em" value={formatDate(request.createdAt)} />
          <DetailRow label="Atualizado em" value={formatDate(request.updatedAt)} />
          <DetailRow label="Concluído em" value={formatDate(request.completedAt)} />
          <DetailRow label="Confirmado pelo provider" value={formatDate(request.providerConfirmedAt)} />
          <DetailRow label="Reconciliado pelo provider" value={formatDate(request.providerReconciledAt)} />
          <DetailRow label="Última verificação" value={formatDate(request.lastMonitorCheck)} />
        </DetailSection>

        {/* TRANSAÇÃO */}

        {request.transaction && (
          <DetailSection title="Transação associada" icon={<Activity size={17} />}>
            <DetailRow label="ID" value={request.transaction.id} />
            <DetailRow label="Tipo" value={request.transaction.type} />
            <DetailRow label="Valor" value={formatMoney(request.transaction.amount)} />
            <DetailRow label="Estado" value={request.transaction.status} />
            <DetailRow label="Referência" value={request.transaction.reference} />
            <DetailRow label="ID externo" value={request.transaction.externalId} />
            <DetailRow label="Gateway" value={request.transaction.gatewayProvider} />
            <DetailRow label="Estado do gateway" value={request.transaction.gatewayStatus} />
            <DetailRow label="Provider Order SN" value={request.transaction.providerOrderSn} />
          </DetailSection>
        )}

        {/* COBRANÇA */}

        {request.charge && (
          <DetailSection title="Cobrança associada" icon={<CreditCard size={17} />}>
            <DetailRow label="ID" value={request.charge.id} />
            <DetailRow label="Provider" value={request.charge.provider} />
            <DetailRow label="Referência do comerciante" value={request.charge.merchantTransactionId} />
            <DetailRow label="ID externo" value={request.charge.externalChargeId} />
            <DetailRow label="Referência externa" value={request.charge.externalReference} />
            <DetailRow label="Valor" value={formatMoney(request.charge.amount)} />
            <DetailRow label="Moeda" value={request.charge.currency} />
            <DetailRow label="Estado" value={request.charge.status} />
            <DetailRow label="Motivo da falha" value={request.charge.failureReason} />
            <DetailRow label="Pago em" value={formatDate(request.charge.paidAt)} />
          </DetailSection>
        )}

        {/* RESPOSTA DO PROVIDER */}

        {request.providerResponse != null && (
          <DetailSection title="Resposta técnica do provider" icon={<Activity size={17} />}>
            <pre className="text-xs text-gray-300 bg-[#080B0F] border border-white/5 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all max-h-96">
              {formatJson(request.providerResponse)}
            </pre>
          </DetailSection>
        )}

        {/* AÇÕES */}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
          {request.status === "IN_PROGRESS" && (
            <button
              onClick={() => onComplete(request.id)}
              disabled={actionLoading === request.id}
              className="px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 transition"
            >
              {actionLoading === request.id
                ? "A processar..."
                : "Concluir serviço"}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider transition"
          >
            Fechar detalhes
          </button>
        </div>
      </div>
    </>
  );
}

// ================= CARTÕES =================

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="bg-[#161A1F] border border-white/5 rounded-2xl p-5 shadow-xl">
      <div className="text-[10px] uppercase tracking-widest font-black text-gray-500">
        {label}
      </div>

      <div className="text-2xl font-black text-white mt-2">
        {value.toLocaleString("pt-AO")}
      </div>

      <div className="text-[11px] text-gray-600 mt-1">
        {description}
      </div>
    </div>
  );
}

// ================= ESTADO =================

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    PROVIDER_TIMEOUT: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
        map[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em processamento",
    COMPLETED: "Concluído",
    REJECTED: "Rejeitado",
    PROVIDER_TIMEOUT: "Timeout do provider",
  };

  return labels[status] ?? status;
}

// ================= SECÇÕES DO MODAL =================

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-[#161A1F] border border-white/5 rounded-2xl p-5 space-y-4">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300">
        <span className="text-blue-400">{icon}</span>
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: ReactNode;
}) {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "";

  if (isEmpty) return null;

  return (
    <div className="flex flex-col gap-1 py-3 border-b border-white/[0.04] min-w-0">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
        {label}
      </span>

      <span className="text-sm text-gray-200 break-words">
        {value}
      </span>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="bg-[#161A1F] border border-white/5 rounded-xl p-4 space-y-2">
      <p className="text-[10px] uppercase tracking-wider font-black text-gray-500">
        {label}
      </p>

      <div className="text-sm font-bold text-white">
        {value}
      </div>
    </div>
  );
}

// ================= TABELA =================

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-6 py-4 text-left font-black whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
}

// ================= FORMATAÇÃO =================

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value);
}

function formatDate(date?: string | null) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("pt-AO");
}

function formatJson(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// ================= SKELETON =================

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 10 }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="w-24 h-4 bg-white/5 rounded" />
        </td>
      ))}
    </tr>
  );
}
