import { useEffect, useMemo, useState } from "react";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  CurrencyCircleDollar,
  DownloadSimple,
  UserCircle
} from "@phosphor-icons/react";
import { toast } from "react-hot-toast";
import { AdminCommissionService } from "../../services/admin-commission.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================================================
   TYPES
===================================================== */

interface CalendarSale {
  id: number;
  time: string;
  service: string;
  amount: number;
  customerReference?: string | null;
  createdAt?: string;
}

interface CalendarResponse {
  date: string;
  subAgentUserId: number;
  sales: CalendarSale[];
  total: number;
}

interface SubAgent {
  id: number;
  name: string;
}

/* =====================================================
   CONSTANTS
===================================================== */

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const WEEK_DAYS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb"
];

/* =====================================================
   HELPERS
===================================================== */

function formatCurrency(value: number) {
  return `${Number(value || 0).toLocaleString("pt-AO")} Kz`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function CommissionCalendarPage() {

  const now = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(now.getMonth());

  const [currentYear, setCurrentYear] =
    useState(now.getFullYear());

  const [selectedDate, setSelectedDate] =
    useState(formatDate(now));

  const [selectedSubAgent, setSelectedSubAgent] =
    useState<number | null>(null);

  const [subAgents, setSubAgents] =
    useState<SubAgent[]>([]);

  const [dailyData, setDailyData] =
    useState<CalendarResponse | null>(null);

  const [loadingSubAgents, setLoadingSubAgents] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  /* =====================================================
     SUB-AGENTES
  ===================================================== */

  useEffect(() => {

    async function loadSubAgents() {

      try {

        setLoadingSubAgents(true);

        const response =
          await AdminCommissionService.getSubAgentsReport();

        if (!Array.isArray(response)) {
          setSubAgents([]);
          return;
        }

        const mapped = response
          .map((item: any) => {

            const id =
              item?.userId ??
              item?.user?.id ??
              item?.id;

            const name =
              item?.subAgentName ??
              item?.name ??
              item?.user?.name ??
              item?.user?.fullName ??
              item?.user?.email ??
              `Sub-agente ${id}`;

            return {
              id: Number(id),
              name: String(name)
            };
          })
          .filter(
            (item: SubAgent) =>
              Number.isInteger(item.id) &&
              item.id > 0
          );

        setSubAgents(mapped);

      } catch (error) {

        console.error(
          "Erro ao carregar sub-agentes:",
          error
        );

        toast.error(
          "Erro ao carregar sub-agentes."
        );

      } finally {
        setLoadingSubAgents(false);
      }

    }

    loadSubAgents();

  }, []);

  /* =====================================================
     CARREGAR VENDAS DO DIA
  ===================================================== */

  useEffect(() => {

    async function loadDailySales() {

      if (!selectedSubAgent) {
        setDailyData(null);
        return;
      }

      try {

        setLoading(true);

        const response =
          await AdminCommissionService.getSubAgentDailySales(
            selectedSubAgent,
            selectedDate
          );

        setDailyData(response ?? null);

      } catch (error) {

        console.error(
          "Erro ao carregar vendas do dia:",
          error
        );

        setDailyData(null);

        toast.error(
          "Erro ao carregar vendas."
        );

      } finally {

        setLoading(false);

      }

    }

    loadDailySales();

  }, [
    selectedSubAgent,
    selectedDate
  ]);

  /* =====================================================
     CALENDAR DAYS
  ===================================================== */

  const calendarDays = useMemo(() => {

    const firstDay = new Date(
      currentYear,
      currentMonth,
      1
    );

    const lastDay = new Date(
      currentYear,
      currentMonth + 1,
      0
    );

    const firstWeekDay =
      firstDay.getDay();

    const totalDays =
      lastDay.getDate();

    const cells: Array<Date | null> = [];

    for (
      let i = 0;
      i < firstWeekDay;
      i++
    ) {
      cells.push(null);
    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      cells.push(
        new Date(
          currentYear,
          currentMonth,
          day
        )
      );
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;

  }, [
    currentMonth,
    currentYear
  ]);

  /* =====================================================
     MONTH NAVIGATION
  ===================================================== */

  function changeMonth(
    direction: number
  ) {

    let month =
      currentMonth + direction;

    let year =
      currentYear;

    if (month < 0) {

      month = 11;
      year--;

    }

    if (month > 11) {

      month = 0;
      year++;

    }

    setCurrentMonth(month);
    setCurrentYear(year);

    const firstDayOfNewMonth =
      new Date(
        year,
        month,
        1
      );

    setSelectedDate(
      formatDate(firstDayOfNewMonth)
    );

  }

  /* =====================================================
     SELECT DATE
  ===================================================== */

  function selectDate(date: Date) {

    setSelectedDate(
      formatDate(date)
    );

  }

  /* =====================================================
     SELECTED SUB-AGENT NAME
  ===================================================== */

  const selectedSubAgentName =
    subAgents.find(
      subAgent =>
        subAgent.id === selectedSubAgent
    )?.name ?? "";

  /* =====================================================
     EXPORTAR EXTRATO PARA PDF
  ===================================================== */

  function exportToPDF() {
    if (!selectedSubAgent || !dailyData) {
      toast.error("Selecione um sub-agente para exportar o extrato.");
      return;
    }

    if (!dailyData.sales?.length) {
      toast.error("Não existem transações para exportar neste dia.");
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const selectedDateFormatted = parseDate(selectedDate).toLocaleDateString(
        "pt-AO",
        {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }
      );

      // Cabeçalho
      pdf.setFillColor(7, 9, 13);
      pdf.rect(0, 0, pageWidth, 38, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("EMATEA", 14, 15);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(190, 198, 210);
      pdf.text("EXTRATO DIÁRIO", 14, 23);

      pdf.setFontSize(9);
      pdf.text(
        `Gerado em ${new Date().toLocaleString("pt-AO")}`,
        pageWidth - 14,
        15,
        { align: "right" }
      );

      // Informações do extrato
      pdf.setTextColor(35, 40, 48);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Informações do extrato", 14, 50);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      pdf.text("Sub-agente:", 14, 59);
      pdf.setFont("helvetica", "bold");
      pdf.text(selectedSubAgentName || `Sub-agente ${selectedSubAgent}`, 42, 59);

      pdf.setFont("helvetica", "normal");
      pdf.text("Data:", 14, 66);
      pdf.setFont("helvetica", "bold");
      pdf.text(selectedDateFormatted, 42, 66);

      pdf.setFont("helvetica", "normal");
      pdf.text("Total de transações:", 14, 73);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(dailyData.sales.length), 54, 73);

      // Resumo financeiro
      pdf.setFillColor(239, 250, 245);
      pdf.roundedRect(14, 81, pageWidth - 28, 25, 3, 3, "F");

      pdf.setTextColor(20, 100, 70);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("TOTAL ACUMULADO DO DIA", 20, 91);

      pdf.setFontSize(15);
      pdf.text(formatCurrency(dailyData.total), 20, 100);

      // Tabela
      const tableRows = dailyData.sales.map((sale) => [
        sale.time || "-",
        sale.service || "-",
        sale.customerReference || "-",
        formatCurrency(sale.amount)
      ]);

      autoTable(pdf, {
        startY: 115,
        head: [["Hora", "Serviço", "Referência", "Valor"]],
        body: tableRows,
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 8.5,
          cellPadding: 3,
          textColor: [45, 50, 58],
          lineColor: [220, 224, 230],
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: [17, 21, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [248, 249, 251]
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 55 },
          3: { cellWidth: 36, halign: "right" }
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            data.cell.styles.textColor = [20, 140, 90];
            data.cell.styles.fontStyle = "bold";
          }
        },
        margin: {
          left: 14,
          right: 14,
          bottom: 20
        }
      });

      // Rodapé em todas as páginas
      const pageCount = pdf.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        pdf.setPage(page);

        pdf.setDrawColor(225, 228, 233);
        pdf.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(120, 126, 135);

        pdf.text(
          "EMATEA • Extrato de transações • Documento gerado pelo sistema",
          14,
          pageHeight - 9
        );

        pdf.text(
          `Página ${page} de ${pageCount}`,
          pageWidth - 14,
          pageHeight - 9,
          { align: "right" }
        );
      }

      const safeAgentName = (selectedSubAgentName || `sub-agente-${selectedSubAgent}`)
        .trim()
        .replace(/[^a-zA-Z0-9À-ÿ]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      pdf.save(`extrato-diario-${safeAgentName}-${selectedDate}.pdf`);

      toast.success("Extrato PDF exportado com sucesso.");
    } catch (error) {
      console.error("Erro ao exportar extrato para PDF:", error);
      toast.error("Não foi possível gerar o PDF.");
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="min-h-screen bg-[#07090D] text-white p-4 md:p-8">

      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* =================================================
            HEADER FINTECH STYLE
        ================================================= */}

        <div className="bg-[#11151B] border border-white/[0.08] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <CalendarBlank
                size={24}
                className="text-blue-400"
                weight="duotone"
              />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Extrato Diário
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                Auditoria e transações por sub-agente
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">

            <button
              type="button"
              onClick={exportToPDF}
              disabled={!selectedSubAgent || !dailyData?.sales?.length || loading}
              title="Exportar extrato para PDF"
              className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-[#161B22] disabled:text-gray-600 disabled:border-white/5 text-white border border-blue-500/30 flex items-center justify-center gap-2 text-xs md:text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed"
            >
              <DownloadSimple size={18} weight="bold" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>

            <div className="relative w-full md:w-[280px]">

              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <UserCircle size={18} />
              </div>

              {loadingSubAgents ? (
                <div className="h-11 w-full bg-[#161B22] border border-white/10 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={selectedSubAgent ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSelectedSubAgent(value ? Number(value) : null);
                  }}
                  className="w-full bg-[#161B22] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm font-medium outline-none focus:border-blue-500 transition text-white appearance-none cursor-pointer"
                >
                  <option value="">Selecionar sub-agente...</option>
                  {subAgents.map((subAgent) => (
                    <option key={subAgent.id} value={subAgent.id}>
                      {subAgent.name}
                    </option>
                  ))}
                </select>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN LAYOUT: COMPACT CALENDAR + TRANSACTION FEED
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* =================================================
              CALENDÁRIO COMPACTO (LADO ESQUERDO)
          ================================================= */}

          <div className="lg:col-span-5 bg-[#11151B] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between">

            <div>

              {/* MONTH NAVIGATION */}
              <div className="flex items-center justify-between mb-4">

                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="w-9 h-9 rounded-lg bg-[#161B22] border border-white/10 flex items-center justify-center hover:bg-white/10 transition active:scale-95"
                >
                  <CaretLeft size={16} className="text-gray-300" />
                </button>

                <div className="text-center">
                  <span className="text-sm font-bold text-white capitalize">
                    {MONTHS[currentMonth]} {currentYear}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="w-9 h-9 rounded-lg bg-[#161B22] border border-white/10 flex items-center justify-center hover:bg-white/10 transition active:scale-95"
                >
                  <CaretRight size={16} className="text-gray-300" />
                </button>

              </div>

              {/* WEEK DAYS HEADER */}
              <div className="grid grid-cols-7 mb-2">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* DAYS GRID */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {

                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="h-9 rounded-lg bg-transparent opacity-20"
                      />
                    );
                  }

                  const dateKey = formatDate(date);
                  const isSelected = dateKey === selectedDate;
                  const isToday = dateKey === formatDate(now);
                  const isCurrentMonth = date.getMonth() === currentMonth;

                  return (
                    <button
                      type="button"
                      key={dateKey}
                      onClick={() => selectDate(date)}
                      className={`
                        h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition relative
                        ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                            : isToday
                            ? "border border-blue-500/50 text-blue-400 bg-blue-500/10"
                            : "text-gray-300 hover:bg-white/[0.06]"
                        }
                        ${!isCurrentMonth ? "opacity-30" : ""}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );

                })}
              </div>

            </div>

            {/* MINI BALANCE BADGE INSIDE CALENDAR CARD */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Data selecionada:</span>
              <span className="font-semibold text-gray-200">
                {parseDate(selectedDate).toLocaleDateString("pt-AO", {
                  day: "2-digit",
                  month: "short"
                })}
              </span>
            </div>

          </div>

          {/* =================================================
              EXTRATO DE TRANSAÇÕES DO DIA (LADO DIREITO)
          ================================================= */}

          <div className="lg:col-span-7 bg-[#11151B] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between">

            <div>

              {/* HEADER DO EXTRATO */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    Total Acumulado do Dia
                  </span>
                  {loading ? (
                    <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse mt-1" />
                  ) : (
                    <div className="text-xl md:text-2xl font-black text-emerald-400 mt-0.5">
                      {formatCurrency(dailyData?.total ?? 0)}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400">
                    {selectedSubAgentName ? selectedSubAgentName : "Nenhum agente"}
                  </span>
                </div>
              </div>

              {/* LISTA DE VENDAS / FEED DE TRANSAÇÕES */}
              <div className="space-y-2.5 min-h-[220px]">

                {!selectedSubAgent ? (
                  <div className="py-12 text-center">
                    <UserCircle size={40} className="mx-auto text-gray-600 animate-pulse" />
                    <p className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                      Escolha um sub-agente para visualizar o extrato.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between gap-3 bg-[#161B22] border border-white/5 rounded-xl p-3.5 animate-pulse"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0" />
                          <div className="space-y-1.5 w-full max-w-[180px]">
                            <div className="h-3.5 bg-white/10 rounded w-full" />
                            <div className="h-2.5 bg-white/5 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="h-4 bg-white/10 rounded w-20 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : !dailyData?.sales?.length ? (
                  <div className="py-12 text-center">
                    <CurrencyCircleDollar size={40} className="mx-auto text-gray-600" />
                    <p className="text-xs md:text-sm text-gray-400 mt-2 font-medium">
                      Sem transações registadas neste dia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {dailyData.sales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between gap-3 bg-[#161B22] border border-white/[0.04] hover:border-white/[0.08] transition rounded-xl p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xs md:text-sm font-semibold text-white">
                              {sale.service}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400">
                                {sale.time}
                              </span>
                              {sale.customerReference && (
                                <span className="text-[10px] text-gray-500 font-mono">
                                  • Ref: {sale.customerReference}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs md:text-sm font-bold text-emerald-400 whitespace-nowrap">
                          +{formatCurrency(sale.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

            {/* FOOTER DO EXTRATO */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
              <span>Transações validadas em tempo real</span>
              <span>Modo Seguro</span>
            </div>

          </div>

        </div>

      </div>

    </div>

  );

}