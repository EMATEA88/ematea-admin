import React, { useEffect, useState } from "react";
import AdminSubAgentService, { type SubAgent } from "../../services/adminSubAgent.service";
import { Download, Edit3, DollarSign, Calendar, Award, Search, TrendingUp, Briefcase, History } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SubAgentSalariesPage() {
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal de Edição Financeira
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(null);
  const [baseSalary, setBaseSalary] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSubAgents = async () => {
    try {
      setLoading(true);
      const data = await AdminSubAgentService.getAll();
      setSubAgents(data);
    } catch (error) {
      console.error("Erro ao carregar sub-agentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAgents();
  }, []);

  const handleOpenModal = (agent: SubAgent) => {
    setSelectedAgent(agent);
    setBaseSalary(String(agent.baseSalary || ""));
    setPaymentDate(agent.paymentDate ? agent.paymentDate.split("T")[0] : "");
    setIsModalOpen(true);
  };

  const handleSaveFinancials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    try {
      await AdminSubAgentService.updateFinancials(selectedAgent.id, {
        baseSalary: Number(baseSalary),
        paymentDate: paymentDate || null,
      });
      setIsModalOpen(false);
      fetchSubAgents();
    } catch (error) {
      console.error("Erro ao atualizar dados financeiros:", error);
      alert("Erro ao salvar alterações.");
    }
  };

  // Cálculo dos totais para os Cards Superiores
  const totalCompanyProfit = subAgents.reduce((acc, agent) => acc + Number(agent.companyProfitWeek || 0), 0);
  const totalBonuses = subAgents.reduce((acc, agent) => acc + Number(agent.performanceBonus || 0), 0);
  const totalBaseSalaries = subAgents.reduce((acc, agent) => acc + Number(agent.baseSalary || 0), 0);

  // Função para exportar a lista em PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("EMATEA - Relatório de Salários, Bónus e Lucros", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-PT")}`, 14, 28);

    const tableColumn = [
      "Código", 
      "Nome", 
      "Salário Base (75% Lucro)", 
      "Vendas (Semana)", 
      "Bónus (0.01%)", 
      "Lucro Empresa (25%)", 
      "Pagamento"
    ];

    const tableRows = filteredAgents.map((agent) => [
      agent.employeeCode,
      agent.user.fullName,
      Number(agent.baseSalary).toLocaleString("pt-PT") + " Kz",
      Number(agent.totalSalesWeek).toLocaleString("pt-PT") + " Kz",
      Number(agent.performanceBonus).toLocaleString("pt-PT") + " Kz",
      Number(agent.companyProfitWeek || 0).toLocaleString("pt-PT") + " Kz",
      agent.paymentDate ? new Date(agent.paymentDate).toLocaleDateString("pt-PT") : "Não agendado",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    doc.save(`relatorio-financeiro-subagentes-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const filteredAgents = subAgents.filter(
    (agent) =>
      agent.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allHistoryRecords = subAgents.flatMap((agent: any) => {
    // Se o backend fornecer agent.paymentHistory usamos ele, caso contrário geramos histórico estático global fixo por agente
    const history = agent.paymentHistory ?? [];

return history.map((item: any) => ({
      agentName: agent.user.fullName,
      employeeCode: agent.employeeCode,
      month: item.month,
      year: item.year,
      totalPaid: item.totalPaid
    }));
  });

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 antialiased">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-mono">
            Gestão de Salários & Bónus — EMATEA
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Controle de vencimentos (75% do lucro acumulado mensal), bónus de desempenho (0.01% das vendas) e repartição para a empresa.
          </p>
        </div>

        <button
          onClick={exportToPDF}
          className="h-10 px-4 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition-all duration-200 shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <Download size={16} />
          <span>Exportar Relatório PDF</span>
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 rounded-2xl bg-[#161A1F] border border-white/[0.08] shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-[11px] font-mono text-gray-400 uppercase">Lucro da Empresa (25%)</p>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              {totalCompanyProfit.toLocaleString("pt-PT")} <span className="text-xs text-cyan-400">Kz</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161A1F] border border-white/[0.08] shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[11px] font-mono text-gray-400 uppercase">Total Bónus Desempenho (0.01%)</p>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              {totalBonuses.toLocaleString("pt-PT")} <span className="text-xs text-emerald-400">Kz</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161A1F] border border-white/[0.08] shadow-lg flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[11px] font-mono text-gray-400 uppercase">Total Salários Base (75% Lucro)</p>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              {totalBaseSalaries.toLocaleString("pt-PT")} <span className="text-xs text-amber-400">Kz</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="my-6 flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#161A1F] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tabela Principal de Sub-Agentes */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161A1F] overflow-hidden shadow-xl mb-10">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <DollarSign size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            Posição Atual (Mês Corrente)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-mono text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-4">Funcionário</th>
                <th className="py-4 px-4">Salário Base (75% Lucro)</th>
                <th className="py-4 px-4">Vendas (Semana)</th>
                <th className="py-4 px-4">Bónus Desempenho (0.01%)</th>
                <th className="py-4 px-4">Lucro EMATEA (25%)</th>
                <th className="py-4 px-4">Data Pagamento</th>
                <th className="py-4 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-mono">
                    A carregar dados financeiros...
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-mono">
                    Nenhum sub-agente encontrado.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{agent.user.fullName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{agent.employeeCode}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">
                      {Number(agent.baseSalary).toLocaleString("pt-PT")} Kz
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-300">
                      {Number(agent.totalSalesWeek).toLocaleString("pt-PT")} Kz
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                        <Award size={14} />
                        <span>+{Number(agent.performanceBonus).toLocaleString("pt-PT")} Kz</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-500/20">
                        <TrendingUp size={14} />
                        <span>{Number(agent.companyProfitWeek || 0).toLocaleString("pt-PT")} Kz</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-400">
                      {agent.paymentDate ? new Date(agent.paymentDate).toLocaleDateString("pt-PT") : "Não agendado"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(agent)}
                        className="h-8 px-3 rounded-lg bg-white/[0.05] border border-white/10 text-gray-300 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Histórico de Salários Pagos */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161A1F] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <History size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
            Histórico de Salários Pagos (Anterior)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-mono text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-4">Funcionário</th>
                <th className="py-4 px-4">Mês</th>
                <th className="py-4 px-4">Ano</th>
                <th className="py-4 px-4 text-right">Salário Total Já Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {allHistoryRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500 font-mono">
                    Nenhum registo de histórico encontrado.
                  </td>
                </tr>
              ) : (
                allHistoryRecords.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{item.agentName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.employeeCode}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-cyan-400 font-semibold">
                      {item.month}
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-300">
                      {item.year}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">
                      {Number(item.totalPaid).toLocaleString("pt-PT")} Kz
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Configuração */}
      {isModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#161A1F] border border-white/10 p-6 shadow-2xl relative">
            <h2 className="text-base font-bold text-white mb-1 font-mono">
              Definir Salário & Pagamento
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Funcionário: <span className="text-cyan-400 font-semibold">{selectedAgent.user.fullName}</span> ({selectedAgent.employeeCode})
            </p>

            <form onSubmit={handleSaveFinancials} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">
                  Salário Base / Acumulado (Kz)
                </label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0B0E11] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">
                  Agendar Data de Pagamento
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0B0E11] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-xl bg-white/[0.05] text-gray-300 text-xs font-semibold hover:bg-white/[0.1] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/10"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}