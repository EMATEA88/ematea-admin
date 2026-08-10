import { useEffect, useState, useCallback } from "react";
import { adminAkiService } from "../../services/adminAki.service";
import {
  ShieldCheck,
  WarningCircle,
  ClockCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Cpu,
  ListMagnifyingGlass
} from "@phosphor-icons/react";

interface Props {
  data?: any;
}

export default function AkiAuditPage({ data }: Props) {
  const [summary, setSummary] = useState<any>(data?.audit?.summary || null);
  const [pending, setPending] = useState<any[]>(data?.audit?.pending || []);
  const [inconsistencies, setInconsistencies] = useState<any[]>(data?.audit?.inconsistencies || []);
  const [audits, setAudits] = useState<any[]>(data?.audit?.history || []);
  const [loading, setLoading] = useState(!data);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await adminAkiService.getDashboard();
      const dashboard = response.data;

      if (dashboard?.audit) {
        setSummary(dashboard.audit.summary);
        setPending(dashboard.audit.pending);
        setInconsistencies(dashboard.audit.inconsistencies);
        setAudits(dashboard.audit.history);
      }

    } catch (error) {
      console.error("Erro ao carregar auditoria:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data?.audit) {
      setSummary(data.audit.summary);
      setPending(data.audit.pending);
      setInconsistencies(data.audit.inconsistencies);
      setAudits(data.audit.history);
      setLoading(false);
    } else {
      load();
    }
  }, [data, load]);

  if (loading && !summary) {
    return (
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 my-12">
        <Cpu className="animate-spin text-blue-400" size={32} />
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">
          A carregar relatórios de auditoria e consistência...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* HEADER DE AÇÃO */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <ListMagnifyingGlass size={22} className="text-blue-400" />
            Auditoria & Integridade do Sistema
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Monitorização em tempo real de transações pendentes, divergências de gateway e validação de consistência.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
        >
          <ArrowsClockwise size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Atualizando..." : "Atualizar Dados"}
        </button>
      </div>

      {/* CARTÕES DE MÉTRICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="rounded-[2rem] bg-[#161A1F] border border-white/5 p-7 relative overflow-hidden shadow-xl">
          <div className="absolute -right-4 -bottom-4 text-white/5 pointer-events-none">
            <ListMagnifyingGlass size={100} />
          </div>
          <div className="text-gray-400 text-xs font-black uppercase tracking-widest">
            Total Auditado
          </div>
          <div className="text-4xl font-black text-white mt-3 tracking-tight">
            {summary?.total ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-gray-500 font-medium">
            Transações verificadas no sistema
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#161A1F] border border-green-500/20 p-7 relative overflow-hidden shadow-xl">
          <div className="absolute -right-4 -bottom-4 text-green-500/5 pointer-events-none">
            <ShieldCheck size={100} />
          </div>
          <div className="flex items-center gap-2 text-green-400 text-xs font-black uppercase tracking-widest">
            <ShieldCheck size={18} />
            Consistentes
          </div>
          <div className="text-4xl font-black text-white mt-3 tracking-tight">
            {summary?.consistent ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-green-400/70 font-medium">
            Em perfeita sincronia com a operadora
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#161A1F] border border-red-500/20 p-7 relative overflow-hidden shadow-xl">
          <div className="absolute -right-4 -bottom-4 text-red-500/5 pointer-events-none">
            <WarningCircle size={100} />
          </div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest">
            <WarningCircle size={18} />
            Inconsistências
          </div>
          <div className="text-4xl font-black text-white mt-3 tracking-tight">
            {summary?.inconsistent ?? 0}
          </div>
          <div className="mt-2 text-[11px] text-red-400/70 font-medium">
            Requerem atenção ou intervenção manual
          </div>
        </div>

      </div>

      {/* SEÇÃO: COMPRAS PENDENTES */}
      <div className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <ClockCounterClockwise size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Compras Pendentes</h3>
              <p className="text-xs text-gray-400">Transações aguardando confirmação final da operadora</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
            {pending.length} registos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20">
                <th className="py-4 px-8">ID Requisição</th>
                <th className="py-4 px-6">ID Pedido (Order)</th>
                <th className="py-4 px-8">Status Operadora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500 text-xs uppercase font-medium">
                    Nenhuma compra pendente no momento.
                  </td>
                </tr>
              ) : (
                pending.map(item => (
                  <tr key={item.serviceRequestId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-8 font-mono text-xs text-gray-300">
                      #{item.serviceRequestId}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">
                      {item.orderId || "N/A"}
                    </td>
                    <td className="py-4 px-8">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        <ClockCounterClockwise size={14} />
                        {item.providerStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO: INCONSISTÊNCIAS */}
      <div className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <WarningCircle size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Inconsistências Detectadas</h3>
              <p className="text-xs text-gray-400">Divergências registadas entre o sistema local e a operadora</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            {inconsistencies.length} alertas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20">
                <th className="py-4 px-8">ID Requisição</th>
                <th className="py-4 px-6">Status Local</th>
                <th className="py-4 px-6">Status Operadora</th>
                <th className="py-4 px-8">Mensagem de Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {inconsistencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-xs uppercase font-medium">
                    Nenhuma inconsistência encontrada. Sistema íntegro!
                  </td>
                </tr>
              ) : (
                inconsistencies.map(item => (
                  <tr key={item.serviceRequestId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-8 font-mono text-xs text-gray-300">
                      #{item.serviceRequestId}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-gray-300">
                        {item.localStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/20">
                        {item.providerStatus}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-red-400 font-medium text-xs">
                      {item.providerMessage || "Sem descrição fornecida"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO: AUDITORIA GERAL */}
      <div className="rounded-[2rem] bg-[#161A1F] border border-white/5 overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Histórico de Auditoria Geral</h3>
              <p className="text-xs text-gray-400">Registo completo de todas as validações cruzadas</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
            {audits.length} transações
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-gray-500 bg-black/20">
                <th className="py-4 px-8">ID Requisição</th>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Status Local</th>
                <th className="py-4 px-6">Status AKI</th>
                <th className="py-4 px-8">Consistente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-xs uppercase font-medium">
                    Nenhum registo de auditoria disponível.
                  </td>
                </tr>
              ) : (
                audits.map(item => (
                  <tr key={item.serviceRequestId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-8 font-mono text-xs text-gray-300">
                      #{item.serviceRequestId}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">
                      {item.orderId || "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-gray-300">
                        {item.localStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 text-gray-300">
                        {item.providerStatus}
                      </span>
                    </td>
                    <td className="py-4 px-8">
                      {item.consistent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle size={14} />
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle size={14} />
                          Não
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}