import { useEffect, useMemo, useState } from "react";
import { AdminCommissionService } from "../services/admin-commission.service";
import AdminAgentService, { type Agent } from "../services/adminAgent.service";
import AdminSubAgentService, { type SubAgent } from "../services/adminSubAgent.service";

type Tab = "overview" | "agents" | "subagents" | "clients";
type AgentReport = {
  id: number | string; userId?: number | string; agentName?: string; agentEmail?: string;
  metrics?: {
    today?: { sales?: number; profit?: number }; yesterday?: { sales?: number; profit?: number };
    week?: { sales?: number; profit?: number }; month?: { sales?: number; profit?: number };
    year?: { sales?: number; profit?: number }; totalProfit?: number;
  };
};
const PAGE_SIZE_OPTIONS = [10, 25, 50];

function unwrapList(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
}

function parseNumericValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const text = value.trim().replace(/[^\d,.-]/g, "");
  if (!text) return 0;
  const comma = text.lastIndexOf(",");
  const dot = text.lastIndexOf(".");
  let normalized = text;
  if (comma >= 0 && dot >= 0) normalized = comma > dot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  else if (comma >= 0) normalized = text.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
function formatCurrency(value: unknown): string {
  return `${parseNumericValue(value).toLocaleString("pt-AO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`;
}
const textOf = (value: unknown) => String(value ?? "").toLocaleLowerCase("pt");

export default function SalesAndCommissionsReport() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [clientsReport, setClientsReport] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<AgentReport[]>([]);
  const [subAgentsList, setSubAgentsList] = useState<SubAgent[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadError, setLoadError] = useState("");

  useEffect(() => { void loadAllData(); }, []);
  useEffect(() => { setPage(1); }, [activeTab, search, pageSize]);

  async function loadAllData() {
    setLoading(true);
    setLoadError("");
    const results = await Promise.allSettled([
      AdminCommissionService.getDashboard(),
      AdminCommissionService.getAgentsReport(),
      AdminCommissionService.getSubAgentsReport(),
      AdminCommissionService.getClients(),
      AdminAgentService.getAll(),
      AdminSubAgentService.getAll(),
    ]);
    const [dash, agents, subReports, clients, _legacyAgents, legacySubs] = results;
    setDashboardData(dash.status === "fulfilled" ? dash.value : null);
    // A fonte de métricas dos agentes é o relatório, não a lista estrutural de perfis.
    if (agents.status === "fulfilled") setAgentsList(unwrapList(agents.value));
    else {
      setAgentsList([]);
      setLoadError("Não foi possível carregar o relatório de vendas dos agentes. Verifique o servidor e tente atualizar.");
      console.error("Erro no relatório de agentes:", agents.reason);
    }
    // Mantém a fonte estrutural existente para não alterar o comportamento da lista de sub-agentes.
    if (legacySubs.status === "fulfilled") setSubAgentsList(unwrapList(legacySubs.value));
    else if (subReports.status === "fulfilled") setSubAgentsList(unwrapList(subReports.value));
    else setSubAgentsList([]);
    if (clients.status === "fulfilled") setClientsReport(unwrapList(clients.value));
    else { setClientsReport([]); console.error("Erro ao carregar clientes:", clients.reason); }
    if (_legacyAgents.status === "rejected") console.error("Erro ao carregar perfis de agentes:", _legacyAgents.reason);
    setLoading(false);
  }

  const filteredAgents = useMemo(() => {
    const q = textOf(search).trim();
    return !q ? agentsList : agentsList.filter((a) => [a.agentName, a.agentEmail, a.userId, a.id].some((v) => textOf(v).includes(q)));
  }, [agentsList, search]);
  const filteredSubs = useMemo(() => {
    const q = textOf(search).trim();
    return !q ? subAgentsList : subAgentsList.filter((s: any) => [s.user?.fullName, s.user?.email, s.employeeCode, s.supervisor?.fullName, s.id].some((v) => textOf(v).includes(q)));
  }, [subAgentsList, search]);
  const filteredClients = useMemo(() => {
    const q = textOf(search).trim();
    return !q ? clientsReport : clientsReport.filter((c: any) => [c.fullName, c.name, c.phone, c.email, c.id].some((v) => textOf(v).includes(q)));
  }, [clientsReport, search]);
  const currentItems: any[] = activeTab === "agents" ? filteredAgents : activeTab === "subagents" ? filteredSubs : activeTab === "clients" ? filteredClients : [];
  const totalPages = Math.max(1, Math.ceil(currentItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = currentItems.slice((safePage - 1) * pageSize, safePage * pageSize);
  const overview = dashboardData?.overview ?? dashboardData ?? {};
  const totalSales = overview.totalSales ?? 0;
  const totalCommission = overview.totalCommission ?? dashboardData?.totalCommission ?? dashboardData?.totalCommissions ?? 0;
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Visão geral", icon: "▦" }, { id: "agents", label: "Agentes", icon: "♙" },
    { id: "subagents", label: "Sub-agentes", icon: "♧" }, { id: "clients", label: "Clientes", icon: "◎" },
  ];

  return <div className="min-h-screen bg-[#080D18] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#14213A] via-[#101827] to-[#0D1422] p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-300"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" />EMATEA · Painel administrativo</div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Relatório de vendas e comissões</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Acompanhe o volume transacionado e o desempenho de agentes, sub-agentes e clientes num único painel.</p>
          </div>
          <button type="button" onClick={() => void loadAllData()} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"><span className={loading ? "animate-spin" : ""}>↻</span>{loading ? "A atualizar…" : "Atualizar dados"}</button>
        </div>
      </header>
      {loadError && <div role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-200">{loadError}</div>}
      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#0E1523] p-2">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setSearch(""); }} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.id ? "bg-sky-500 text-white shadow-lg shadow-sky-950/30" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}><span aria-hidden="true">{tab.icon}</span>{tab.label}</button>)}</nav>

      {activeTab === "overview" && <section className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Vendas concluídas" value={formatCurrency(totalSales)} detail="Volume global registado" accent="emerald" icon="↗" loading={loading} />
          <MetricCard title="Comissões registadas" value={formatCurrency(totalCommission)} detail="Valor agregado no sistema" accent="sky" icon="◇" loading={loading} />
          <MetricCard title="Agentes registados" value={String(agentsList.length)} detail="Agentes no relatório" accent="amber" icon="♙" loading={loading} />
          <MetricCard title="Sub-agentes registados" value={String(subAgentsList.length)} detail={`${clientsReport.length} clientes registados`} accent="violet" icon="♧" loading={loading} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-[#0E1523] p-6 xl:col-span-2">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-bold text-white">Resumo por período</h2><p className="mt-1 text-sm text-slate-400">Indicadores devolvidos pelo relatório financeiro.</p></div><span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">Kz</span></div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{[["Hoje", dashboardData?.today], ["Esta semana", dashboardData?.week], ["Este mês", dashboardData?.month], ["Este ano", dashboardData?.year]].map(([label, metric]: any) => <div key={label} className="rounded-xl border border-white/[0.06] bg-[#111B2B] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>{loading ? <div className="mt-3 h-6 w-32 animate-pulse rounded bg-white/5" /> : <><p className="mt-2 text-xl font-bold text-white">{formatCurrency(metric?.sales)}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400"><span>Lucro: <b className="text-emerald-300">{formatCurrency(metric?.profit)}</b></span><span>Operações: <b className="text-slate-200">{parseNumericValue(metric?.requests)}</b></span></div></>}</div>)}</div>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-[#0E1523] p-6"><h2 className="text-base font-bold text-white">Estado das comissões</h2><p className="mt-1 text-sm text-slate-400">Distribuição por estado.</p><div className="mt-5 space-y-4">{[{ label: "Pendentes", value: dashboardData?.commissions?.pending, color: "bg-amber-400" }, { label: "Pagas", value: dashboardData?.commissions?.paid, color: "bg-emerald-400" }, { label: "Canceladas", value: dashboardData?.commissions?.cancelled, color: "bg-rose-400" }].map((item) => <div key={item.label}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="text-slate-400">{item.label}</span><span className="font-semibold text-white">{formatCurrency(item.value)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full w-full ${item.color} opacity-80`} /></div></div>)}{!loading && !dashboardData?.commissions && <p className="text-sm text-slate-500">Estados das comissões não disponíveis nesta resposta.</p>}</div></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3"><CategoryCard title="Agentes principais" count={agentsList.length} description="Vendas individuais por período" onClick={() => setActiveTab("agents")} /><CategoryCard title="Sub-agentes" count={subAgentsList.length} description="Desempenho da rede operacional" onClick={() => setActiveTab("subagents")} /><CategoryCard title="Clientes finais" count={clientsReport.length} description="Compras e volume gasto" onClick={() => setActiveTab("clients")} /></div>
      </section>}

      {activeTab !== "overview" && <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0E1523] shadow-xl">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold text-white">{activeTab === "agents" ? "Desempenho dos agentes" : activeTab === "subagents" ? "Desempenho dos sub-agentes" : "Relatório de clientes"}</h2><p className="mt-1 text-sm text-slate-400">{activeTab === "agents" ? "Vendas e lucros reais calculados a partir das operações concluídas." : activeTab === "subagents" ? "Consulte os sub-agentes registados e o respetivo supervisor." : "Volume de compras e contacto dos clientes finais."}</p></div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"><label className="relative block min-w-0 flex-1 lg:w-80"><span className="sr-only">Pesquisar registos</span><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={activeTab === "agents" ? "Pesquisar agente, e-mail ou ID…" : activeTab === "subagents" ? "Pesquisar sub-agente ou supervisor…" : "Pesquisar cliente, contacto ou e-mail…"} className="w-full rounded-xl border border-white/10 bg-[#080D18] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10" /></label><label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#080D18] px-3 text-xs text-slate-400">Linhas<select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-transparent py-3 text-sm font-semibold text-white outline-none">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size} className="bg-[#0E1523]">{size}</option>)}</select></label></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] px-5 py-3 text-xs text-slate-500"><span>{currentItems.length.toLocaleString("pt-AO")} registo(s) encontrado(s)</span><span>{currentItems.length ? `A mostrar ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, currentItems.length)} de ${currentItems.length}` : "Sem resultados"}</span></div>
        <div className="overflow-x-auto">
          {activeTab === "agents" && <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#111B2B] text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Agente", "Vendas hoje", "Vendas semana", "Vendas mês", "Vendas ano", "Lucro ano"].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.05]">{loading ? <SkeletonRows cols={6} /> : paginatedItems.map((agent: AgentReport) => <tr key={agent.id} className="transition hover:bg-white/[0.025]"><td className="px-5 py-4"><div className="font-semibold text-white">{agent.agentName || "Agente sem nome"}</div><div className="mt-1 text-xs text-slate-500">{agent.agentEmail || "E-mail não disponível"}</div><div className="mt-1 text-[10px] text-slate-600">ID: {agent.userId ?? agent.id}</div></td><td className="whitespace-nowrap px-5 py-4 font-medium text-slate-200">{formatCurrency(agent.metrics?.today?.sales)}</td><td className="whitespace-nowrap px-5 py-4 font-medium text-slate-200">{formatCurrency(agent.metrics?.week?.sales)}</td><td className="whitespace-nowrap px-5 py-4 font-medium text-slate-200">{formatCurrency(agent.metrics?.month?.sales)}</td><td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-300">{formatCurrency(agent.metrics?.year?.sales)}</td><td className="whitespace-nowrap px-5 py-4 font-semibold text-sky-300">{formatCurrency(agent.metrics?.year?.profit)}</td></tr>)}{!loading && paginatedItems.length === 0 && <EmptyRow cols={6} text="Nenhum agente corresponde à pesquisa." />}</tbody></table>}
          {activeTab === "subagents" && <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#111B2B] text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Sub-agente", "Código", "Supervisor / Agente", "Vendas semana", "Lucro / bónus", "Estado"].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.05]">{loading ? <SkeletonRows cols={6} /> : paginatedItems.map((sub: any) => <tr key={sub.id} className="transition hover:bg-white/[0.025]"><td className="px-5 py-4"><div className="font-semibold text-white">{sub.user?.fullName || sub.subAgentName || "N/A"}</div><div className="mt-1 text-xs text-slate-500">{sub.user?.email || sub.subAgentEmail || "E-mail não disponível"}</div></td><td className="px-5 py-4 text-slate-400">{sub.employeeCode || sub.id || "—"}</td><td className="px-5 py-4 text-slate-300">{sub.supervisor?.fullName || sub.supervisorName || "EMATEA Direct"}</td><td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-300">{formatCurrency(sub.totalSalesWeek ?? sub.metrics?.week?.sales)}</td><td className="whitespace-nowrap px-5 py-4 font-semibold text-sky-300">{formatCurrency(sub.totalProfitWeek ?? sub.performanceBonus ?? sub.metrics?.week?.profit)}</td><td className="px-5 py-4"><StatusPill active={Boolean(sub.isActive ?? sub.active ?? true)} label={sub.isActive === false || sub.active === false ? "Inativo" : "Registado"} /></td></tr>)}{!loading && paginatedItems.length === 0 && <EmptyRow cols={6} text="Nenhum sub-agente corresponde à pesquisa." />}</tbody></table>}
          {activeTab === "clients" && <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#111B2B] text-[11px] uppercase tracking-wider text-slate-500"><tr>{["Cliente", "Contacto", "Compras", "Total gasto", "Estado"].map((h) => <th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-white/[0.05]">{loading ? <SkeletonRows cols={5} /> : paginatedItems.map((client: any, index: number) => <tr key={client.id ?? index} className="transition hover:bg-white/[0.025]"><td className="px-5 py-4 font-semibold text-white">{client.fullName || client.name || "Cliente final"}</td><td className="px-5 py-4 text-slate-400">{client.phone || client.email || "—"}</td><td className="px-5 py-4 text-slate-300">{client.totalPurchases ?? client.purchasesCount ?? client.count ?? 0}</td><td className="whitespace-nowrap px-5 py-4 font-bold text-emerald-300">{formatCurrency(client.totalSpent ?? client.amount ?? client.balance ?? client.totalSales ?? 0)}</td><td className="px-5 py-4"><StatusPill active label={client.status || "Registado"} /></td></tr>)}{!loading && paginatedItems.length === 0 && <EmptyRow cols={5} text="Nenhum cliente corresponde à pesquisa." />}</tbody></table>}
        </div>
        <footer className="flex flex-col gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Página {safePage} de {totalPages}</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage(1)} disabled={safePage <= 1 || loading} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30">Primeira</button><button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1 || loading} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30">Anterior</button><button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages || loading} className="rounded-lg border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-30">Seguinte</button><button type="button" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages || loading} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30">Última</button></div></footer>
      </section>}
      <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-4 text-xs text-slate-600 sm:flex-row"><span>EMATEA · Relatórios administrativos</span><span>Os indicadores dependem dos dados devolvidos pelo servidor.</span></footer>
    </div>
  </div>;
}

function MetricCard({ title, value, detail, accent, icon, loading }: { title: string; value: string; detail: string; accent: "emerald" | "sky" | "amber" | "violet"; icon: string; loading: boolean }) {
  const styles = { emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15", sky: "text-sky-300 bg-sky-400/10 border-sky-400/15", amber: "text-amber-300 bg-amber-400/10 border-amber-400/15", violet: "text-violet-300 bg-violet-400/10 border-violet-400/15" };
  return <div className="rounded-2xl border border-white/[0.07] bg-[#0E1523] p-5 shadow-lg transition hover:-translate-y-0.5 hover:border-white/[0.12]"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg ${styles[accent]}`}>{icon}</span></div>{loading ? <div className="mt-5 h-8 w-40 animate-pulse rounded bg-white/5" /> : <p className="mt-4 break-words text-2xl font-bold tracking-tight text-white">{value}</p>}<p className="mt-2 text-xs text-slate-500">{detail}</p></div>;
}
function CategoryCard({ title, count, description, onClick }: { title: string; count: number; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group rounded-2xl border border-white/[0.07] bg-[#0E1523] p-5 text-left transition hover:border-sky-400/30 hover:bg-[#111B2B]"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">{title}</h3><span className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-sm font-bold text-sky-200">{count}</span></div><p className="mt-2 text-sm text-slate-500">{description}</p><p className="mt-4 text-xs font-semibold text-sky-300 opacity-80 group-hover:opacity-100">Ver relatório →</p></button>;
}
function StatusPill({ active, label }: { active: boolean; label: string }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300" : "border-slate-500/20 bg-slate-500/[0.08] text-slate-400"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />{label}</span>;
}
function SkeletonRows({ cols }: { cols: number }) {
  return <>{Array.from({ length: 5 }).map((_, row) => <tr key={row} className="animate-pulse">{Array.from({ length: cols }).map((__, col) => <td key={col} className="px-5 py-5"><div className="h-4 w-full max-w-[150px] rounded bg-white/[0.06]" /></td>)}</tr>)}</>;
}
function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return <tr><td colSpan={cols} className="px-5 py-14 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-xl text-slate-500">⌕</div><p className="mt-3 text-sm font-semibold text-slate-300">{text}</p><p className="mt-1 text-xs text-slate-600">Experimente alterar os termos da pesquisa.</p></td></tr>;
}
