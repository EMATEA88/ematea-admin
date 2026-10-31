import { useState } from "react";
import {
  Search,
  RefreshCw,
  ShieldCheck,
  Server,
  Copy,
  Check,
  AlertCircle,
  Clock,
  FileJson,
  Hash,
  ArrowUpRight,
  Info,
  CircleCheck,
  CircleX,
  Loader2,
  Lock,
} from "lucide-react";

import { adminAkiService } from "../../services/adminAki.service";

type QueryResult = {
  success?: boolean;
  data?: any;
  message?: string;
};

function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.Response?.Description ||
    error?.message ||
    "Não foi possível consultar a ordem na AKI."
  );
}

function getResponsePayload(response: any) {
  return response?.data ?? response;
}

function getProviderResponse(payload: any) {
  return payload?.data ?? payload?.result ?? payload;
}

function getField(payload: any, fields: string[]): any {
  const sources = [
    payload,
    payload?.Response,
    payload?.response,
    payload?.Result,
    payload?.result,
  ];

  for (const source of sources) {
    if (!source) continue;

    for (const field of fields) {
      const value = source[field];

      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return null;
}

function formatStatus(value: any): string {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  return String(value);
}

function getStatusStyle(status: string) {
  const normalized = status.toUpperCase();

  if (
    normalized.includes("SUCCESS") ||
    normalized.includes("SUCESS") ||
    normalized.includes("COMPLETED") ||
    normalized.includes("COMPLET")
  ) {
    return {
      className:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
      icon: CircleCheck,
      label: "Sucesso",
    };
  }

  if (
    normalized.includes("FAIL") ||
    normalized.includes("REJECT") ||
    normalized.includes("ERROR") ||
    normalized.includes("ERRO")
  ) {
    return {
      className:
        "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.08)]",
      icon: CircleX,
      label: "Falha reportada",
    };
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("RUNNING") ||
    normalized.includes("PROCESS") ||
    normalized.includes("WAIT")
  ) {
    return {
      className:
        "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.08)]",
      icon: Clock,
      label: "Em processamento",
    };
  }

  return {
    className:
      "bg-slate-500/10 text-slate-300 border-slate-500/20 shadow-[0_0_20px_rgba(100,116,139,0.08)]",
    icon: Info,
    label: "Estado não classificado",
  };
}

function formatDate(value: any): string {
  if (!value) return "Não informado";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("pt-PT");
}

function InfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: any;
  icon: any;
}) {
  return (
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/80 group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
      <div className="flex items-center gap-2.5 text-slate-400 mb-3">
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-cyan-400">
          <Icon size={16} />
        </div>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          {label}
        </span>
      </div>
      <p className="text-base font-bold tracking-tight text-slate-100 break-words">
        {value ?? "Não informado"}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-slate-800" />
        <div className="h-3 w-24 bg-slate-800 rounded" />
      </div>
      <div className="h-5 w-32 bg-slate-800/70 rounded mt-2" />
    </div>
  );
}

function SkeletonResult() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-3 w-32 bg-slate-800/60 rounded" />
        </div>
        <div className="h-8 w-36 bg-slate-800/80 rounded-lg" />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-3 w-36 bg-slate-800 rounded" />
              <div className="h-7 w-48 bg-slate-800/80 rounded" />
            </div>
          </div>
          <div className="h-12 w-32 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-20 w-full bg-slate-800/50 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-40 bg-slate-800 rounded" />
          <div className="h-8 w-28 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-48 w-full bg-slate-800/40 rounded-xl" />
      </div>
    </div>
  );
}

export default function AkiOrderQueryPage() {
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [searchedOrder, setSearchedOrder] = useState("");
  const [searchedTransaction, setSearchedTransaction] = useState("");
  const [copied, setCopied] = useState(false);

  const handleQuery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedOrderId = orderId.trim();
    const normalizedTransactionId = transactionId.trim();

    if (!normalizedOrderId) {
      setError("O Order_ID é obrigatório.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    setSearchedOrder(normalizedOrderId);
    setSearchedTransaction(normalizedTransactionId);

    try {
      const response = await adminAkiService.queryPurchaseOrder({
        Order_ID: normalizedOrderId,
        ...(normalizedTransactionId
          ? { Transaction_ID: normalizedTransactionId }
          : {}),
      });

      if (response?.success === false) {
        throw new Error(
          response?.message || "A AKI não conseguiu processar a consulta."
        );
      }

      setResult(response);
    } catch (err: any) {
      setError(getErrorMessage(err));

      const providerData = err?.response?.data?.data;

      if (providerData) {
        setResult({
          success: false,
          data: providerData,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOrderId("");
    setTransactionId("");
    setResult(null);
    setError("");
    setSearchedOrder("");
    setSearchedTransaction("");
    setCopied(false);
  };

  const payload = result ? getResponsePayload(result) : null;
  const provider = payload ? getProviderResponse(payload) : null;

  const status = formatStatus(
    getField(provider, [
      "Status",
      "Purchase_Status",
      "Purchase_StatusDescription",
      "Transaction_Status",
      "Purchase_State",
    ])
  );

  const code = getField(provider, [
    "Code",
    "Response_Code",
    "ResponseCode",
    "Transaction_Code",
  ]);

  const description = getField(provider, [
    "Description",
    "Message",
    "Response_Description",
    "ResponseMessage",
  ]);

  const returnedOrderId = getField(provider, ["Order_ID", "OrderId"]);

  const returnedTransactionId = getField(provider, [
    "Transaction_ID",
    "TransactionId",
  ]);

  const amount = getField(provider, [
    "Transaction_Value",
    "Transaction_Amount",
    "Amount",
    "Purchase_Amount",
  ]);

  const balance = getField(provider, ["FinalBalance", "Final_Balance", "Balance"]);

  const responseDate = getField(provider, [
    "Transaction_Date",
    "Purchase_Date",
    "Date",
    "Created_At",
  ]);

  const statusStyle = getStatusStyle(status);
  const StatusIcon = statusStyle.icon;

  const rawJson = result ? JSON.stringify(result, null, 2) : "";

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar a resposta.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background radial ambient lights for fintech depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Ecossistema AKI
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-slate-400">
                Gateway Provider Integration
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Consulta de Ordens
            </h1>

            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Consulta transacional direta na infraestrutura segura da API 5Linhas,
              com bypass de registos locais da EMATEA para auditoria em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-5 py-4 shadow-xl">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={22} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">Conexão Criptografada</p>
                <Lock size={12} className="text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Modo estrito de leitura segura
              </p>
            </div>
          </div>
        </header>

        {/* INDICADORES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <InfoCard
            label="Fornecedor Ativo"
            value="5Linhas / AKI Gateway"
            icon={Server}
          />

          <InfoCard
            label="Protocolo de Consulta"
            value="Estado Síncrono v1"
            icon={Search}
          />

          <InfoCard
            label="Segurança Financeira"
            value="Zero Impacto no Saldo"
            icon={ShieldCheck}
          />
        </div>

        {/* FORMULÁRIO */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 md:px-8 py-6 border-b border-slate-800/80 flex items-center gap-3.5 bg-slate-950/30">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
              <Search size={20} />
            </div>

            <div>
              <h2 className="font-bold text-base text-white tracking-tight">
                Parâmetros de Consulta
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Insira os identificadores oficiais fornecidos pela transação.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuery} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Order_ID
                  <span className="text-rose-400 ml-1 font-mono">*</span>
                </label>

                <div className="relative group">
                  <Hash
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
                  />

                  <input
                    type="text"
                    value={orderId}
                    onChange={(event) => setOrderId(event.target.value)}
                    placeholder="Ex.: 10002"
                    autoComplete="off"
                    disabled={loading}
                    className="w-full bg-[#07090E] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 transition-all disabled:opacity-50"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Identificador primário da ordem no ecossistema AKI.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Transaction_ID
                  <span className="text-slate-500 ml-1 font-normal lowercase">
                    (opcional)
                  </span>
                </label>

                <div className="relative group">
                  <ArrowUpRight
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
                  />

                  <input
                    type="text"
                    value={transactionId}
                    onChange={(event) => setTransactionId(event.target.value)}
                    placeholder="Ex.: 99753994"
                    autoComplete="off"
                    disabled={loading}
                    className="w-full bg-[#07090E] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10 transition-all disabled:opacity-50"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Referência secundária devolvida pelo gateway.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-fadeIn">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Falha na Operação
                  </p>
                  <p className="text-xs text-rose-300/90 break-words leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Consultando Gateway...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Executar Consulta
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-bold transition-all disabled:opacity-40"
              >
                <RefreshCw size={16} />
                Limpar Campos
              </button>
            </div>
          </form>
        </section>

        {/* LOADING SKELETON STATE */}
        {loading && <SkeletonResult />}

        {/* RESULTADO */}
        {result && !loading && (
          <section className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  Resultado Consolidado
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dados processados a partir do payload oficial da API 5Linhas.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl shadow-inner">
                <span className="text-slate-500">Order_ID:</span>
                <span className="text-cyan-400 font-bold">{searchedOrder}</span>
              </div>
            </div>

            {/* ESTADO PRINCIPAL */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${statusStyle.className}`}>
                    <StatusIcon size={28} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Estado Atual do Fornecedor
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight break-all">
                      {status}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {statusStyle.label}
                    </p>
                  </div>
                </div>

                {code !== null && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-4 text-left md:text-right shadow-inner">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Código de Resposta
                    </p>
                    <p className="text-2xl font-mono font-black text-cyan-400 mt-1">
                      {String(code)}
                    </p>
                  </div>
                )}
              </div>

              {description && (
                <div className="mt-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Descrição do Fornecedor
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed break-words font-medium">
                    {String(description)}
                  </p>
                </div>
              )}
            </div>

            {/* DETALHES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <InfoCard
                label="Order_ID Retornado"
                value={returnedOrderId ?? searchedOrder}
                icon={Hash}
              />

              <InfoCard
                label="Transaction_ID Retornado"
                value={returnedTransactionId ?? (searchedTransaction || "Não informado")}
                icon={ArrowUpRight}
              />

              <InfoCard
                label="Valor da Transação"
                value={amount !== null ? `${String(amount)}` : "Não informado"}
                icon={Server}
              />

              <InfoCard
                label="Saldo Final"
                value={balance !== null ? String(balance) : "Não informado"}
                icon={ShieldCheck}
              />

              <InfoCard
                label="Data da Transação"
                value={formatDate(responseDate)}
                icon={Clock}
              />

              <InfoCard
                label="Status HTTP"
                value={result.success === false ? "Erro na Resposta" : "Sucesso 200 OK"}
                icon={FileJson}
              />
            </div>

            {/* JSON TÉCNICO */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-slate-800/80 bg-slate-950/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <FileJson size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Payload Técnico Completo
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Estrutura de dados bruta retornada pelo servidor backend.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyResponse}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? "Copiado com Sucesso" : "Copiar JSON"}
                </button>
              </div>

              <div className="p-6 md:p-8 bg-[#040609]">
                <pre className="text-xs leading-relaxed text-cyan-200/90 overflow-x-auto max-h-[500px] overflow-y-auto font-mono whitespace-pre-wrap break-all custom-scrollbar">
                  {rawJson}
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* ESTADO INICIAL */}
        {!result && !loading && !error && (
          <div className="bg-slate-900/40 backdrop-blur-xl border border-dashed border-slate-800 rounded-3xl p-12 md:p-16 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5">
              <Search size={28} />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-bold text-white text-base">
                Nenhuma Consulta Ativa
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Insira o <code className="text-cyan-400 font-mono">Order_ID</code> correspondente para auditar o estado atualizado diretamente na base da 5Linhas.
              </p>
            </div>
          </div>
        )}

        {/* AVISO OPERACIONAL */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 backdrop-blur-xl">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
            <Info size={18} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Aviso Operacional de Conformidade
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esta interface executa estritamente operações de leitura junto ao fornecedor. 
              Nenhum crédito, débito ou alteração de estado é efetuado no sistema local. 
              Mensagens do tipo &quot;Transaction not found&quot; não confirmam falha na operação original.
            </p>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-600 pb-6 pt-2 font-mono">
          EMATEA · Secured Gateway Integration · AKI Financial Services v2.4
        </footer>

      </div>
    </div>
  );
}