import { useEffect, useState, useCallback, useMemo } from "react";
import { adminAkiService } from "../../services/adminAki.service";
import {
  ShieldCheck, WarningCircle, ClockCounterClockwise, ArrowsClockwise,
  CheckCircle, XCircle, Cpu, ListMagnifyingGlass, Play, MagnifyingGlass, Funnel,
} from "@phosphor-icons/react";

interface Props { data?: any; }
interface AuditResult {
  serviceRequestId: number;
  orderId: string | null;
  transactionId?: string | null;
  localStatus: string;
  providerStatus: string | null;
  providerCode: number | null;
  providerMessage: string | null;
  consistent: boolean;
  providerResponse?: any;
}

const unwrap = (response: any) => response?.data ?? response;
const norm = (value: unknown) => String(value ?? "").trim().toUpperCase();
const isReconciliation = (item: AuditResult) =>
  norm(item.localStatus) === "PROVIDER_TIMEOUT" &&
  ["SUCCESS", "RUNNING"].includes(norm(item.providerStatus));
const isPending = (item: AuditResult) =>
  ["PENDING", "IN_PROGRESS", "RUNNING", "PROVIDER_TIMEOUT"].includes(norm(item.localStatus)) || isReconciliation(item);
const isUnverifiable = (item: AuditResult) => item.providerStatus == null || String(item.providerStatus).trim() === "";
const formatStatus = (value: unknown) => value == null || value === "" ? "Não confirmado" : String(value);
const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-PT");
};

function MetricCard({ title, value, description, icon, color }: {
  title: string; value: number | string; description: string; icon: React.ReactNode;
  color: "blue" | "green" | "red" | "yellow";
}) {
  const styles = {
    blue: "text-blue-400 border-white/5", green: "text-green-400 border-green-500/20",
    red: "text-red-400 border-red-500/20", yellow: "text-yellow-400 border-yellow-500/20",
  };
  return <div className={`rounded-[2rem] bg-[#161A1F] border ${styles[color].split(" ")[1]} p-7 relative overflow-hidden shadow-xl`}>
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><span className={styles[color].split(" ")[0]}>{icon}</span>{title}</div>
    <div className="text-4xl font-black text-white mt-3 tracking-tight">{value}</div>
    <p className="mt-2 text-[11px] text-gray-500 font-medium">{description}</p>
  </div>;
}

function Pagination({ page, totalPages, total, pageSize, setPage }: {
  page: number; totalPages: number; total: number; pageSize: number;
  setPage: (updater: (current: number) => number) => void;
}) {
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);
  return <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/5">
    <span className="text-xs text-gray-500">{total ? `A mostrar ${first}–${last} de ${total} registos` : "Nenhum registo"}</span>
    <div className="flex items-center gap-3"><span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
      <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/5 disabled:opacity-30">Anterior</button>
      <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-gray-300 hover:bg-white/5 disabled:opacity-30">Seguinte</button>
    </div>
  </div>;
}

export default function AkiAuditPage({ data }: Props) {
  const [summary, setSummary] = useState<any>(null);
  const [pending, setPending] = useState<AuditResult[]>([]);
  const [inconsistencies, setInconsistencies] = useState<AuditResult[]>([]);
  const [audits, setAudits] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [pendingPage, setPendingPage] = useState(1);
  const [inconsistencyPage, setInconsistencyPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const applyAuditData = useCallback((payload: any) => {
    const result = unwrap(payload);
    const audit = result?.audit ?? result?.data?.audit ?? result?.data ?? result;
    if (!audit || typeof audit !== "object") throw new Error("A resposta do servidor não contém dados de auditoria.");
    const history: AuditResult[] = Array.isArray(audit.history) ? audit.history : Array.isArray(audit.results) ? audit.results : [];
    const derivedPending = history.filter(isPending);
    const derivedInconsistencies = history.filter(item => !item.consistent && !isReconciliation(item) && !isUnverifiable(item));
    setSummary(audit.summary ?? null);
    setPending(Array.isArray(audit.pending) ? audit.pending : derivedPending);
    setInconsistencies(Array.isArray(audit.inconsistencies) ? audit.inconsistencies : derivedInconsistencies);
    setAudits(history);
    setPendingPage(1); setInconsistencyPage(1); setHistoryPage(1);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(""); setSuccessMessage("");
    try {
      const response = await adminAkiService.getDashboard();
      const result = unwrap(response);
      const dashboard = result?.data ?? result;
      // O dashboard pode desativar a auditoria automática. Não apagar os resultados existentes.
      if (dashboard?.audit?.history) applyAuditData(dashboard.audit);
    } catch (err: any) {
      console.error("Erro ao carregar auditoria AKI:", err);
      setError(err?.response?.data?.message ?? err?.message ?? "Não foi possível carregar os dados da auditoria.");
    } finally { setLoading(false); }
  }, [applyAuditData]);

  const runAudit = useCallback(async () => {
    setRunning(true); setError(""); setSuccessMessage("");
    try {
      const response = await adminAkiService.runAudit();
      const result = unwrap(response);
      applyAuditData(result?.data ?? result);
      setSuccessMessage("Auditoria executada. Os resultados foram atualizados.");
    } catch (err: any) {
      console.error("Erro ao executar auditoria AKI:", err);
      setError(err?.response?.data?.message ?? err?.message ?? "Não foi possível executar a auditoria.");
    } finally { setRunning(false); }
  }, [applyAuditData]);

  useEffect(() => {
    if (data?.audit?.history) { try { applyAuditData(data.audit); } catch (err) { console.error(err); } }
    load();
  }, [data, load, applyAuditData]);

  const matchesSearch = useCallback((item: AuditResult) => {
    const term = search.trim().toLowerCase();
    const textMatch = !term || [item.serviceRequestId, item.orderId, item.transactionId, item.localStatus, item.providerStatus, item.providerCode, item.providerMessage]
      .some(value => String(value ?? "").toLowerCase().includes(term));
    const stateMatch = statusFilter === "ALL" || norm(item.localStatus) === statusFilter || norm(item.providerStatus) === statusFilter;
    return textMatch && stateMatch;
  }, [search, statusFilter]);

  const filteredPending = useMemo(() => pending.filter(matchesSearch), [pending, matchesSearch]);
  const filteredInconsistencies = useMemo(() => inconsistencies.filter(matchesSearch), [inconsistencies, matchesSearch]);
  const filteredAudits = useMemo(() => audits.filter(matchesSearch), [audits, matchesSearch]);
  const makePage = useCallback((items: AuditResult[], currentPage: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), page, totalPages, total: items.length };
  }, [pageSize]);
  const pendingResult = makePage(filteredPending, pendingPage);
  const inconsistencyResult = makePage(filteredInconsistencies, inconsistencyPage);
  const historyResult = makePage(filteredAudits, historyPage);

  const total = Number(summary?.total ?? audits.length);
  const consistent = Number(summary?.consistent ?? audits.filter(item => item.consistent).length);
  const reconciliationCount = Number(summary?.reconciliation ?? pending.filter(isReconciliation).length);
  const inconsistent = Number(summary?.inconsistencies ?? summary?.inconsistent ?? inconsistencies.length);
  const unverifiable = Number(summary?.unverifiable ?? audits.filter(isUnverifiable).length);

  if (loading && audits.length === 0 && !summary && !running) return <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 my-12"><Cpu className="animate-spin text-blue-400" size={32}/><span className="text-xs font-black uppercase tracking-widest text-gray-400">A carregar dados da auditoria...</span></div>;

  const resetPages = () => { setPendingPage(1); setInconsistencyPage(1); setHistoryPage(1); };

  return <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div>
      <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2"><ListMagnifyingGlass size={22} className="text-blue-400"/>Auditoria & Integridade do Sistema</h2>
      <p className="text-xs text-gray-400 mt-1">Verificação das transações locais e dos estados comunicados pela operadora.</p>
      {summary?.lastRunAt && <p className="text-[11px] text-gray-500 mt-2">Última execução: {formatDate(summary.lastRunAt)}</p>}
    </div><div className="flex flex-wrap gap-3">
      <button type="button" onClick={load} disabled={loading || running} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"><ArrowsClockwise size={16} className={loading ? "animate-spin" : ""}/>Atualizar</button>
      <button type="button" onClick={runAudit} disabled={running || loading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50">{running ? <Cpu size={16} className="animate-spin"/> : <Play size={16} weight="fill"/>}{running ? "A executar auditoria..." : "Executar auditoria"}</button>
    </div></div>

    {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"><div className="font-bold flex items-center gap-2"><WarningCircle size={18}/>Erro na auditoria</div><p className="mt-1">{error}</p></div>}
    {successMessage && <div role="status" className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">{successMessage}</div>}

    <section className="rounded-2xl bg-[#161A1F] border border-white/5 p-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="relative md:col-span-2"><MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input type="search" value={search} onChange={e => {setSearch(e.target.value); resetPages();}} placeholder="Pesquisar ID, Order ID, transação ou mensagem..." className="w-full rounded-xl bg-black/20 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500"/></div>
      <div className="relative"><Funnel size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/><select value={statusFilter} onChange={e => {setStatusFilter(e.target.value); resetPages();}} className="w-full appearance-none rounded-xl bg-[#111418] border border-white/10 pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500">
        <option value="ALL">Todos os estados</option><option value="COMPLETED">Concluídas</option><option value="SUCCESS">Sucesso na operadora</option><option value="PENDING">Pendentes</option><option value="IN_PROGRESS">Em processamento</option><option value="RUNNING">Em execução</option><option value="PROVIDER_TIMEOUT">Timeout da operadora</option><option value="FAILED">Falhadas</option><option value="REJECTED">Rejeitadas</option>
      </select></div></div><div className="flex flex-wrap items-center justify-between gap-3 mt-3"><p className="text-xs text-gray-500">{filteredAudits.length} resultados no histórico{search.trim() ? ` para “${search.trim()}”` : ""}</p><div className="flex items-center gap-2 text-xs text-gray-400"><span>Registos por página</span><select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); resetPages();}} className="rounded-lg bg-[#111418] border border-white/10 px-2 py-2 text-white"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></div></div></section>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard title="Total analisado" value={total} description="Registos devolvidos pela auditoria" icon={<ListMagnifyingGlass size={18}/>} color="blue"/>
      <MetricCard title="Consistentes" value={consistent} description="Estados considerados consistentes" icon={<ShieldCheck size={18}/>} color="green"/>
      <MetricCard title="Inconsistências" value={inconsistent} description="Divergências fora da reconciliação" icon={<WarningCircle size={18}/>} color="red"/>
      <MetricCard title="Sem confirmação" value={unverifiable} description="Registos sem estado confirmado da operadora" icon={<ClockCounterClockwise size={18}/>} color="yellow"/>
    </div>

    <section className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl"><div className="px-6 md:px-8 py-6 border-b border-white/5 flex items-center justify-between gap-3"><div><h3 className="font-black text-sm uppercase tracking-wider text-white">Pendentes de Reconciliação</h3><p className="text-xs text-gray-400 mt-1">Compras que precisam de confirmação entre o estado local e a operadora.</p></div><span className="text-xs font-mono px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{filteredPending.length} registos{reconciliationCount > 0 ? ` · ${reconciliationCount} timeout(s)` : ""}</span></div>
      <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20"><th className="py-4 px-6">ID Requisição</th><th className="py-4 px-6">Order ID</th><th className="py-4 px-6">Estado local</th><th className="py-4 px-6">Estado operadora</th></tr></thead><tbody className="divide-y divide-white/5 text-sm">{pendingResult.items.length === 0 ? <tr><td colSpan={4} className="py-10 text-center text-gray-500 text-xs">Nenhuma compra pendente corresponde aos filtros selecionados.</td></tr> : pendingResult.items.map((item, index) => <tr key={`${item.serviceRequestId}-${index}`} className="hover:bg-white/[0.02]"><td className="py-4 px-6 font-mono text-xs text-gray-300">#{item.serviceRequestId}</td><td className="py-4 px-6 font-mono text-xs text-gray-400">{item.orderId || "—"}</td><td className="py-4 px-6 text-xs text-gray-300">{formatStatus(item.localStatus)}</td><td className="py-4 px-6"><span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{formatStatus(item.providerStatus)}</span></td></tr>)}</tbody></table></div>
      <Pagination page={pendingResult.page} totalPages={pendingResult.totalPages} total={pendingResult.total} pageSize={pageSize} setPage={setPendingPage}/>
    </section>

    <section className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl"><div className="px-6 md:px-8 py-6 border-b border-white/5 flex items-center justify-between gap-3"><div><h3 className="font-black text-sm uppercase tracking-wider text-white">Inconsistências Detectadas</h3><p className="text-xs text-gray-400 mt-1">Divergências entre o sistema local e a operadora, excluindo casos em reconciliação.</p></div><span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{filteredInconsistencies.length} alertas</span></div>
      <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20"><th className="py-4 px-6">ID Requisição</th><th className="py-4 px-6">Order ID</th><th className="py-4 px-6">Estado local</th><th className="py-4 px-6">Estado operadora</th><th className="py-4 px-6">Código</th><th className="py-4 px-6">Mensagem da operadora</th></tr></thead><tbody className="divide-y divide-white/5 text-sm">{inconsistencyResult.items.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-gray-500 text-xs">Nenhuma inconsistência corresponde aos filtros selecionados.</td></tr> : inconsistencyResult.items.map((item, index) => <tr key={`${item.serviceRequestId}-${index}`} className="hover:bg-white/[0.02]"><td className="py-4 px-6 font-mono text-xs text-gray-300">#{item.serviceRequestId}</td><td className="py-4 px-6 font-mono text-xs text-gray-400">{item.orderId || "—"}</td><td className="py-4 px-6 text-xs text-gray-300">{formatStatus(item.localStatus)}</td><td className="py-4 px-6"><span className="px-2.5 py-1 rounded-md text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20">{formatStatus(item.providerStatus)}</span></td><td className="py-4 px-6 font-mono text-xs text-gray-400">{item.providerCode ?? "—"}</td><td className="py-4 px-6 text-xs text-red-300 min-w-64">{item.providerMessage || "Sem mensagem fornecida"}</td></tr>)}</tbody></table></div>
      <Pagination page={inconsistencyResult.page} totalPages={inconsistencyResult.totalPages} total={inconsistencyResult.total} pageSize={pageSize} setPage={setInconsistencyPage}/>
    </section>

    <section className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl"><div className="px-6 md:px-8 py-6 border-b border-white/5 flex items-center justify-between gap-3"><div><h3 className="font-black text-sm uppercase tracking-wider text-white">Histórico de Auditoria</h3><p className="text-xs text-gray-400 mt-1">Resultados das verificações disponibilizados pelo servidor.</p></div><span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">{filteredAudits.length} registos</span></div>
      <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20"><th className="py-4 px-6">ID Requisição</th><th className="py-4 px-6">Order ID</th><th className="py-4 px-6">Estado local</th><th className="py-4 px-6">Estado operadora</th><th className="py-4 px-6">Código</th><th className="py-4 px-6">Consistente</th></tr></thead><tbody className="divide-y divide-white/5 text-sm">{historyResult.items.length === 0 ? <tr><td colSpan={6} className="py-10 text-center text-gray-500 text-xs">Nenhum resultado corresponde aos filtros selecionados.</td></tr> : historyResult.items.map((item, index) => <tr key={`${item.serviceRequestId}-${index}`} className="hover:bg-white/[0.02]"><td className="py-4 px-6 font-mono text-xs text-gray-300">#{item.serviceRequestId}</td><td className="py-4 px-6 font-mono text-xs text-gray-400">{item.orderId || "—"}</td><td className="py-4 px-6 text-xs text-gray-300">{formatStatus(item.localStatus)}</td><td className="py-4 px-6 text-xs text-gray-300">{formatStatus(item.providerStatus)}</td><td className="py-4 px-6 font-mono text-xs text-gray-400">{item.providerCode ?? "—"}</td><td className="py-4 px-6">{item.consistent ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle size={14}/>Sim</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle size={14}/>Não</span>}</td></tr>)}</tbody></table></div>
      <Pagination page={historyResult.page} totalPages={historyResult.totalPages} total={historyResult.total} pageSize={pageSize} setPage={setHistoryPage}/>
    </section>
  </div>;
}
