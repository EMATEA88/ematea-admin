import { useEffect, useState } from "react";
import { AdminCommissionService } from "../services/admin-commission.service";
import AdminAgentService, { type Agent } from "../services/adminAgent.service";
import AdminSubAgentService, { type SubAgent } from "../services/adminSubAgent.service";

export default function SalesAndCommissionsReport() {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "subagents" | "clients">("overview");

  // Dados consolidados
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [clientsReport, setClientsReport] = useState<any[]>([]);
  
  // Listas de apoio estruturais
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [subAgentsList, setSubAgentsList] = useState<SubAgent[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        dash,
        agentsRep,
        subAgentsRep,
        clients,
        agentsData,
        subAgentsData
      ] = await Promise.all([
        AdminCommissionService.getDashboard().catch(() => null),
        AdminCommissionService.getAgentsReport().catch(() => []),
        AdminCommissionService.getSubAgentsReport().catch(() => []),
        AdminCommissionService.getClients().catch(() => []),
        AdminAgentService.getAll().catch(() => [] as Agent[]),
        AdminSubAgentService.getAll().catch(() => [] as SubAgent[])
      ]);

      setDashboardData(dash);
      
      // Tratamento seguro garantindo compatibilidade com arrays ou respostas paginadas via 'any'
      const rawClients: any = clients;
      const resolvedClients = Array.isArray(rawClients) ? rawClients : (rawClients?.data || []);
      setClientsReport(resolvedClients);

      const rawAgents: any = agentsData;
      setAgentsList(Array.isArray(rawAgents) ? rawAgents : (rawAgents?.data || []));

      const rawSubAgents: any = subAgentsData;
      setSubAgentsList(Array.isArray(rawSubAgents) ? rawSubAgents : (rawSubAgents?.data || []));
      
      console.log("Relatórios carregados com sucesso:", { agentsRep, subAgentsRep, resolvedClients });
    } catch (error) {
      console.error("Erro ao carregar dados do relatório de vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar segura para extrair e formatar valores numéricos (evita NaN e valores zerados)
  const parseNumericValue = (val: unknown): number => {
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    if (typeof val === "string") {
      const clean = val.replace(/[^0-9,-]+/g, "").replace(",", ".");
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const formatCurrency = (value: unknown) => {
    const safeNum = parseNumericValue(value);
    return `${safeNum.toLocaleString("pt-AO", { minimumFractionDigits: 2 })} Kz`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-white space-y-6 bg-[#0B0E11] min-h-screen">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#12161B] p-6 rounded-2xl border border-[#1E2329] shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-white">Relatório de Vendas e Comissões</h1>
          <p className="text-sm text-gray-400 mt-1">
            Visão consolidada do volume transacionado e comissões geradas por agentes, sub-agentes e clientes.
          </p>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow disabled:opacity-50 cursor-pointer"
        >
          {loading ? "A atualizar..." : "Atualizar Dados"}
        </button>
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap gap-2 border-b border-[#1E2329] pb-3">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "overview" ? "bg-[#161A1F] text-white border border-white/10 shadow" : "bg-[#12161B] text-gray-400 hover:text-white"
          }`}
        >
          Visão Geral (Resumo)
        </button>
        <button
          onClick={() => setActiveTab("agents")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "agents" ? "bg-[#161A1F] text-white border border-white/10 shadow" : "bg-[#12161B] text-gray-400 hover:text-white"
          }`}
        >
          Vendas de Agentes
        </button>
        <button
          onClick={() => setActiveTab("subagents")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "subagents" ? "bg-[#161A1F] text-white border border-white/10 shadow" : "bg-[#12161B] text-gray-400 hover:text-white"
          }`}
        >
          Vendas de Sub-Agentes
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "clients" ? "bg-[#161A1F] text-white border border-white/10 shadow" : "bg-[#12161B] text-gray-400 hover:text-white"
          }`}
        >
          Vendas de Clientes
        </button>
      </div>

      {/* CONTEÚDO: ABA VISÃO GERAL */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <div className="bg-[#12161B] border border-[#1E2329] p-5 rounded-2xl shadow">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Total Global Vendido</span>
                  <h2 className="text-2xl font-bold mt-2 text-emerald-400">
                    {formatCurrency(dashboardData?.totalSales ?? dashboardData?.totalVolume ?? 0)}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Volume consolidado geral</p>
                </div>

                <div className="bg-[#12161B] border border-[#1E2329] p-5 rounded-2xl shadow">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Comissões Totais</span>
                  <h2 className="text-2xl font-bold mt-2 text-cyan-400">
                    {formatCurrency(dashboardData?.totalCommissions ?? dashboardData?.totalCommission ?? 0)}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Distribuídas aos parceiros</p>
                </div>

                <div className="bg-[#12161B] border border-[#1E2329] p-5 rounded-2xl shadow">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Total Agentes Ativos</span>
                  <h2 className="text-2xl font-bold mt-2 text-amber-400">{agentsList.length}</h2>
                  <p className="text-xs text-gray-500 mt-1">Parceiros principais</p>
                </div>

                <div className="bg-[#12161B] border border-[#1E2329] p-5 rounded-2xl shadow">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Total Sub-Agentes</span>
                  <h2 className="text-2xl font-bold mt-2 text-purple-400">{subAgentsList.length}</h2>
                  <p className="text-xs text-gray-500 mt-1">Rede operacional</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-[#12161B] border border-[#1E2329] p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-white">Resumo por Categoria de Utilizador</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161A1F] p-4 rounded-xl border border-[#1E2329]">
                <span className="text-sm text-gray-400">Agentes Principais</span>
                <div className="mt-2 text-lg font-bold text-white">{agentsList.length} Registados</div>
                <div className="text-xs text-emerald-400 mt-1">Comissões e vendas diretas</div>
              </div>
              <div className="bg-[#161A1F] p-4 rounded-xl border border-[#1E2329]">
                <span className="text-sm text-gray-400">Sub-Agentes (Agentes + EMATEA)</span>
                <div className="mt-2 text-lg font-bold text-white">{subAgentsList.length} Registados</div>
                <div className="text-xs text-emerald-400 mt-1">Desempenho semanal ativo</div>
              </div>
              <div className="bg-[#161A1F] p-4 rounded-xl border border-[#1E2329]">
                <span className="text-sm text-gray-400">Clientes Finais</span>
                <div className="mt-2 text-lg font-bold text-white">{clientsReport.length} Registados</div>
                <div className="text-xs text-emerald-400 mt-1">Transações de consumo direto</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO: ABA AGENTES */}
      {activeTab === "agents" && (
        <div className="bg-[#12161B] border border-[#1E2329] rounded-2xl overflow-hidden shadow">
          <div className="p-5 border-b border-[#1E2329]">
            <h3 className="text-lg font-semibold text-white">Vendas e Comissões por Agentes</h3>
            <p className="text-xs text-gray-400">Desempenho financeiro individual de cada Agente principal.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161A1F] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">Nome / Empresa</th>
                  <th className="p-4">Código</th>
                  <th className="p-4">Total Vendas</th>
                  <th className="p-4">Comissão Gerada</th>
                  <th className="p-4">Saldo Comissão</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {loading ? (
                  <>
                    <SkeletonRow cols={6} />
                    <SkeletonRow cols={6} />
                    <SkeletonRow cols={6} />
                  </>
                ) : (
                  agentsList.map((agent: any) => (
                    <tr key={agent.id} className="hover:bg-[#161A1F]/50 transition">
                      <td className="p-4 font-medium text-white">{agent.companyName || agent.user?.fullName || "N/A"}</td>
                      <td className="p-4 text-gray-400">{agent.agentCode || "-"}</td>
                      <td className="p-4 font-semibold text-emerald-400">{formatCurrency(agent.totalSales)}</td>
                      <td className="p-4 font-semibold text-cyan-400">{formatCurrency(agent.totalCommission)}</td>
                      <td className="p-4 text-gray-200">{formatCurrency(agent.commissionBalance)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          agent.status === "ACTIVE" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                        }`}>
                          {agent.status || "ATIVO"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && agentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-500">Nenhum agente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO: ABA SUB-AGENTES */}
      {activeTab === "subagents" && (
        <div className="bg-[#12161B] border border-[#1E2329] rounded-2xl overflow-hidden shadow">
          <div className="p-5 border-b border-[#1E2329]">
            <h3 className="text-lg font-semibold text-white">Vendas e Desempenho por Sub-Agentes</h3>
            <p className="text-xs text-gray-400">Inclui sub-agentes vinculados a agentes e sub-agentes diretos da EMATEA.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161A1F] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">Nome do Sub-Agente</th>
                  <th className="p-4">Código</th>
                  <th className="p-4">Supervisor / Agente</th>
                  <th className="p-4">Vendas (Semana)</th>
                  <th className="p-4">Lucro / Comissão Gerada</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {loading ? (
                  <>
                    <SkeletonRow cols={6} />
                    <SkeletonRow cols={6} />
                    <SkeletonRow cols={6} />
                  </>
                ) : (
                  subAgentsList.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-[#161A1F]/50 transition">
                      <td className="p-4 font-medium text-white">{sub.user?.fullName || "N/A"}</td>
                      <td className="p-4 text-gray-400">{sub.employeeCode || "-"}</td>
                      <td className="p-4 text-gray-300">{sub.supervisor?.fullName || "EMATEA Direct"}</td>
                      <td className="p-4 font-semibold text-emerald-400">{formatCurrency(sub.totalSalesWeek)}</td>
                      <td className="p-4 font-semibold text-cyan-400">{formatCurrency(sub.totalProfitWeek ?? sub.performanceBonus)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          sub.isActive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-red-950/60 text-red-400 border border-red-800/40"
                        }`}>
                          {sub.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && subAgentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-500">Nenhum sub-agente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO: ABA CLIENTES */}
      {activeTab === "clients" && (
        <div className="bg-[#12161B] border border-[#1E2329] rounded-2xl overflow-hidden shadow">
          <div className="p-5 border-b border-[#1E2329]">
            <h3 className="text-lg font-semibold text-white">Relatório de Clientes e Transações</h3>
            <p className="text-xs text-gray-400">Volume de compras realizadas diretamente pelos clientes finais.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#161A1F] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">Nome do Cliente</th>
                  <th className="p-4">Contacto / Email</th>
                  <th className="p-4">Total de Compras</th>
                  <th className="p-4">Total Gasto / Vendas</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {loading ? (
                  <>
                    <SkeletonRow cols={5} />
                    <SkeletonRow cols={5} />
                    <SkeletonRow cols={5} />
                    <SkeletonRow cols={5} />
                  </>
                ) : (
                  clientsReport.map((client: any, idx: number) => {
                    const spentValue = client.totalSpent ?? client.amount ?? client.balance ?? client.totalSales ?? 0;
                    const purchasesCount = client.totalPurchases ?? client.purchasesCount ?? client.count ?? 0;

                    return (
                      <tr key={client.id || idx} className="hover:bg-[#161A1F]/50 transition">
                        <td className="p-4 font-medium text-white">{client.fullName || client.name || "Cliente Final"}</td>
                        <td className="p-4 text-gray-400">{client.phone || client.email || "-"}</td>
                        <td className="p-4 text-gray-300">{purchasesCount} operações</td>
                        <td className="p-4 font-semibold text-emerald-400">
                          {formatCurrency(spentValue)}
                        </td>
                        <td className="p-4">
                          <span className="text-xs text-gray-300 bg-[#161A1F] border border-[#1E2329] px-2.5 py-1 rounded-lg">Registo Ativo</span>
                        </td>
                      </tr>
                    );
                  })
                )}
                {!loading && clientsReport.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-gray-500">Nenhum registo de cliente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares para o efeito Skeleton
function SkeletonCard() {
  return (
    <div className="bg-[#12161B] border border-[#1E2329] p-5 rounded-2xl shadow animate-pulse space-y-3">
      <div className="h-3 bg-white/5 rounded w-28" />
      <div className="h-7 bg-white/5 rounded w-36" />
      <div className="h-2.5 bg-white/5 rounded w-20" />
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-white/5 rounded w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}