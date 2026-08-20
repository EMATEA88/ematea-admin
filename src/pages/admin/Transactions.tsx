import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"
import {
  ArrowsLeftRight,
  MagnifyingGlass,
  ArrowClockwise,
  X,
  Copy,
  CheckCircle,
  WarningCircle
} from "@phosphor-icons/react"

interface Transaction {
  id: number
  type: string
  amount: number
  currency?: string
  status?: string
  description?: string | null
  reference?: string | null
  relatedPublicId?: string | null
  externalId?: string | null
  gatewayProvider?: string | null
  gatewayStatus?: string | null
  merchantTransactionId?: string | null
  providerOrderSn?: string | null
  createdAt: string
  processedAt?: string | null

  user?: {
    id?: number
    phone?: string
    fullName?: string | null
    email?: string | null
    publicId?: string | null
  }

  metadata?: Record<string, any> | null

  ServiceRequest?: ServiceRequest[]
}

interface ServiceRequest {
  id: number
  planId?: number | null
  serviceId?: number | null
  serviceGroupId?: number | null
  providerId?: number | null
  providerName?: string | null

  amount?: number | null
  cost?: number | null
  profit?: number | null

  customerReference?: string | null
  customerName?: string | null

  partnerName?: string | null
  partnerId?: number | null

  serviceName?: string | null
  serviceGroupName?: string | null
  planName?: string | null

  status?: string

  transactionId?: number | null
  externalProviderRef?: string | null
  externalTransactionId?: string | null

  providerResponse?: Record<string, any> | string | null

  completedAt?: string | null
  providerFinalBalance?: number | null
  providerConfirmedAt?: string | null
  providerReconciledAt?: string | null
  providerOperationStatus?: string | null
  providerOperationCode?: number | null

  createdAt?: string
  updatedAt?: string
}

export default function AdminTransactions() {

  const [items, setItems] =
    useState<Transaction[]>([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState("")

  const [searching, setSearching] =
    useState(false)

  const [selected, setSelected] =
    useState<Transaction | null>(null)

  const [detailsLoading, setDetailsLoading] =
    useState(false)

  const [copied, setCopied] =
    useState<string | null>(null)


  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    load()
  }, [])


  async function load() {

    try {

      setLoading(true)

      const res =
        await AdminService.transactions()

      const list =
        Array.isArray(res)
          ? res
          : res?.items ?? []

      setItems(list)

    } catch {

      toast.error(
        "Erro ao carregar transações"
      )

    } finally {

      setLoading(false)

    }

  }


  /* =====================================================
     SEARCH
  ===================================================== */

  async function handleSearch() {

    const query =
      search.trim()

    if (!query) {

      await load()

      return

    }

    try {

      setSearching(true)

      const result =
        await AdminService.transactionSearch(
          query
        )

      const list =
        Array.isArray(result)
          ? result
          : result?.items ?? []

      setItems(list)

      if (!list.length) {

        toast.error(
          "Nenhuma operação encontrada"
        )

      }

    } catch {

      toast.error(
        "Erro ao pesquisar operação"
      )

    } finally {

      setSearching(false)

    }

  }


  /* =====================================================
     ENTER
  ===================================================== */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {

    if (event.key === "Enter") {
      handleSearch()
    }

  }


  /* =====================================================
     CLEAR
  ===================================================== */

  async function clearSearch() {

    setSearch("")

    await load()

  }


  /* =====================================================
     DETAILS
  ===================================================== */

  async function openDetails(
    transactionId: number
  ) {

    try {

      setDetailsLoading(true)

      const data =
        await AdminService.transactionDetails(
          transactionId
        )

      setSelected(data)

    } catch {

      toast.error(
        "Erro ao carregar detalhes da operação"
      )

    } finally {

      setDetailsLoading(false)

    }

  }


  /* =====================================================
     COPY
  ===================================================== */

  async function copyValue(
    value: unknown,
    key: string
  ) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return
    }

    try {

      await navigator.clipboard.writeText(
        String(value)
      )

      setCopied(key)

      setTimeout(() => {
        setCopied(null)
      }, 1500)

    } catch {

      toast.error(
        "Não foi possível copiar"
      )

    }

  }


  return (

    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">

        <div className="space-y-1">

          <div className="flex items-center gap-2">

            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Módulo Financeiro
            </span>

            <span className="text-gray-500 text-xs">
              •
            </span>

            <span className="text-gray-400 text-xs font-mono">
              Investigação de Operações
            </span>

          </div>

          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Transações
          </h1>

          <p className="text-gray-400 text-sm flex items-center gap-2">

            <ArrowsLeftRight
              size={16}
              className="text-blue-400"
            />

            Registo global e investigação detalhada das operações da plataforma.

          </p>

        </div>


        <button
          onClick={load}
          disabled={loading || searching}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >

          <ArrowClockwise
            size={16}
            className={`text-blue-400 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Atualizar Dados

        </button>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-5 shadow-xl">

        <div className="flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">

            <MagnifyingGlass
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              placeholder="Pesquisar por ID, ordem, Transaction ID, telefone, referência..."
              className="w-full bg-[#0B0E11] border border-white/5 pl-11 pr-4 py-4 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={handleKeyDown}
            />

          </div>


          <button
            onClick={handleSearch}
            disabled={
              searching ||
              !search.trim()
            }
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40"
          >

            <MagnifyingGlass
              size={17}
            />

            {searching
              ? "Pesquisando..."
              : "Pesquisar"}

          </button>


          {search && (

            <button
              onClick={clearSearch}
              className="flex items-center justify-center gap-2 bg-[#0B0E11] hover:bg-[#1C2128] border border-white/5 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider"
            >

              <X size={17} />

              Limpar

            </button>

          )}

        </div>

        <p className="text-[11px] text-gray-500 mt-3">
          Pesquisa global no backend. Pode utilizar ID da transação,
          ID da ordem, Transaction ID da AKI, referência, telefone,
          email ou nome do cliente.
        </p>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">

        {loading || searching ? (

          <div className="p-16 space-y-4">

            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />

          </div>

        ) : items.length === 0 ? (

          <div className="p-16 text-center">

            <WarningCircle
              size={40}
              className="mx-auto text-gray-500 mb-4"
            />

            <p className="text-gray-400 text-sm">
              Nenhuma operação encontrada.
            </p>

          </div>

        ) : (

          <DataTable

            data={items}

            columns={[

              {
                key: "id",
                label: "ID",

                render:
                  (r: Transaction) => (

                    <button
                      onClick={() =>
                        openDetails(r.id)
                      }
                      className="text-blue-400 hover:text-blue-300 text-xs font-mono font-bold hover:underline cursor-pointer"
                    >
                      #{r.id}
                    </button>

                  )
              },


              {
                key: "user",
                label: "Telefone",

                render:
                  (r: Transaction) => (

                    <span className="font-semibold text-gray-200">
                      {r.user?.phone || "-"}
                    </span>

                  )
              },


              {
                key: "type",
                label: "Tipo",

                render:
                  (r: Transaction) => (
                    <TypeBadge
                      type={r.type}
                    />
                  )
              },


              {
                key: "amount",
                label: "Valor",

                render:
                  (r: Transaction) => (

                    <Amount
                      value={Number(r.amount)}
                      type={r.type}
                    />

                  )
              },


              {
                key: "status",
                label: "Estado",

                render:
                  (r: Transaction) => (
                    <StatusBadge
                      status={r.status}
                    />
                  )
              },


              {
                key: "createdAt",
                label: "Data",

                render:
                  (r: Transaction) => (

                    <span className="text-gray-400 text-xs font-mono">
                      {formatDate(r.createdAt)}
                    </span>

                  )
              },


              {
                key: "actions",
                label: "Operação",

                render:
                  (r: Transaction) => (

                    <button
                      onClick={() =>
                        openDetails(r.id)
                      }
                      className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Detalhes
                    </button>

                  )
              }

            ]}

          />

        )}

      </div>


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selected && (

        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#11151A] border border-white/10 rounded-[2rem] shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 bg-[#11151A]/95 backdrop-blur border-b border-white/5 p-6 flex items-center justify-between">

              <div>

                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-black">
                  Dossiê da Operação
                </div>

                <h2 className="text-2xl font-black mt-1">
                  Transação #{selected.id}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelected(null)
                }
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
              >

                <X size={24} />

              </button>

            </div>


            {detailsLoading ? (

              <div className="p-16 text-center">

                <ArrowClockwise
                  size={30}
                  className="mx-auto animate-spin text-blue-400"
                />

                <p className="text-gray-400 mt-4">
                  Carregando operação...
                </p>

              </div>

            ) : (

              <div className="p-6 space-y-8">

                {/* STATUS */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                  <InfoCard
                    label="Estado"
                    value={
                      selected.status ||
                      "-"
                    }
                  />

                  <InfoCard
                    label="Tipo"
                    value={
                      selected.type
                    }
                  />

                  <InfoCard
                    label="Valor"
                    value={
                      formatMoney(
                        Number(
                          selected.amount
                        )
                      )
                    }
                  />

                  <InfoCard
                    label="Moeda"
                    value={
                      selected.currency ||
                      "AOA"
                    }
                  />

                </div>


                {/* CLIENTE */}

                <Section title="Cliente">

                  <InfoGrid>

                    <CopyField
                      label="ID"
                      value={
                        selected.user?.id
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "userId"
                      }
                      copyKey="userId"
                    />

                    <CopyField
                      label="Public ID"
                      value={
                        selected.user?.publicId
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "publicId"
                      }
                      copyKey="publicId"
                    />

                    <CopyField
                      label="Nome"
                      value={
                        selected.user?.fullName
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "fullName"
                      }
                      copyKey="fullName"
                    />

                    <CopyField
                      label="Telefone"
                      value={
                        selected.user?.phone
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "phone"
                      }
                      copyKey="phone"
                    />

                    <CopyField
                      label="Email"
                      value={
                        selected.user?.email
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "email"
                      }
                      copyKey="email"
                    />

                  </InfoGrid>

                </Section>


                {/* IDENTIFICADORES */}

                <Section title="Identificadores da Operação">

                  <InfoGrid>

                    <CopyField
                      label="Transaction ID"
                      value={
                        selected.id
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "transactionId"
                      }
                      copyKey="transactionId"
                    />

                    <CopyField
                      label="ServiceRequest / Ordem"
                      value={
                        selected.relatedPublicId
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "orderId"
                      }
                      copyKey="orderId"
                    />

                    <CopyField
                      label="Merchant Transaction ID"
                      value={
                        selected.merchantTransactionId
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "merchantTransactionId"
                      }
                      copyKey="merchantTransactionId"
                    />

                    <CopyField
                      label="External ID"
                      value={
                        selected.externalId
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "externalId"
                      }
                      copyKey="externalId"
                    />

                    <CopyField
                      label="Provider Order"
                      value={
                        selected.providerOrderSn
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "providerOrderSn"
                      }
                      copyKey="providerOrderSn"
                    />

                    <CopyField
                      label="Referência"
                      value={
                        selected.reference
                      }
                      onCopy={
                        copyValue
                      }
                      copied={
                        copied === "reference"
                      }
                      copyKey="reference"
                    />

                  </InfoGrid>

                </Section>


                {/* SERVICE REQUEST */}

                {selected.ServiceRequest?.[0] && (

                  <Section title="Service Request / Operação Externa">

                    <InfoGrid>

                      <CopyField
                        label="ServiceRequest ID"
                        value={
                          selected.ServiceRequest[0].id
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "serviceRequestId"
                        }
                        copyKey="serviceRequestId"
                      />

                      <CopyField
                        label="Transaction ID"
                        value={
                          selected.ServiceRequest[0].transactionId
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "serviceTransactionId"
                        }
                        copyKey="serviceTransactionId"
                      />

                      <CopyField
                        label="AKI Transaction ID"
                        value={
                          selected.ServiceRequest[0].externalProviderRef
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "akiTransactionId"
                        }
                        copyKey="akiTransactionId"
                      />

                      <CopyField
                        label="AKI Order ID"
                        value={
                          selected.ServiceRequest[0].externalTransactionId
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "akiOrderId"
                        }
                        copyKey="akiOrderId"
                      />

                      <CopyField
                        label="Provedor"
                        value={
                          selected.ServiceRequest[0].providerName
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "providerName"
                        }
                        copyKey="providerName"
                      />

                      <CopyField
                        label="Parceiro"
                        value={
                          selected.ServiceRequest[0].partnerName
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "partnerName"
                        }
                        copyKey="partnerName"
                      />

                      <CopyField
                        label="Serviço"
                        value={
                          selected.ServiceRequest[0].serviceName
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "serviceName"
                        }
                        copyKey="serviceName"
                      />

                      <CopyField
                        label="Plano"
                        value={
                          selected.ServiceRequest[0].planName
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "planName"
                        }
                        copyKey="planName"
                      />

                      <CopyField
                        label="Referência do cliente"
                        value={
                          selected.ServiceRequest[0].customerReference
                        }
                        onCopy={
                          copyValue
                        }
                        copied={
                          copied === "customerReference"
                        }
                        copyKey="customerReference"
                      />

                    </InfoGrid>

                  </Section>

                )}


                {/* VOUCHER */}

                {getVoucherPin(
                  selected
                ) && (

                  <Section title="Voucher / Resultado">

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <div className="text-[10px] uppercase tracking-widest text-blue-400 font-black">
                            PIN / Voucher
                          </div>

                          <div className="text-2xl font-black font-mono mt-2 tracking-wider">
                            {getVoucherPin(
                              selected
                            )}
                          </div>

                        </div>

                        <button
                          onClick={() =>
                            copyValue(
                              getVoucherPin(
                                selected
                              ),
                              "voucherPin"
                            )
                          }
                          className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400"
                        >

                          {copied === "voucherPin"
                            ? <CheckCircle size={20} />
                            : <Copy size={20} />
                          }

                        </button>

                      </div>

                    </div>

                  </Section>

                )}


                {/* FINANCEIRO */}

                <Section title="Financeiro">

                  <InfoGrid>

                    <CopyField
                      label="Valor"
                      value={
                        formatMoney(
                          Number(
                            selected.amount
                          )
                        )
                      }
                      copyable={false}
                    />

                    <CopyField
                      label="Status Gateway"
                      value={
                        selected.gatewayStatus
                      }
                      copyable={false}
                    />

                    <CopyField
                      label="Gateway"
                      value={
                        selected.gatewayProvider
                      }
                      copyable={false}
                    />

                    <CopyField
                      label="Criada em"
                      value={
                        formatDate(
                          selected.createdAt
                        )
                      }
                      copyable={false}
                    />

                    <CopyField
                      label="Processada em"
                      value={
                        selected.processedAt
                          ? formatDate(
                              selected.processedAt
                            )
                          : "-"
                      }
                      copyable={false}
                    />

                  </InfoGrid>

                </Section>


                {/* RAW PROVIDER RESPONSE */}

                <Section title="Resposta do Provedor">

                  <JsonBlock
                    value={
                      selected.ServiceRequest?.[0]
                        ?.providerResponse ??
                      selected.metadata ??
                      null
                    }
                  />

                </Section>


                {/* METADATA */}

                <Section title="Metadata da Transação">

                  <JsonBlock
                    value={
                      selected.metadata
                    }
                  />

                </Section>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  )
}


/* =====================================================
   COMPONENTS
===================================================== */

function InfoCard({
  label,
  value
}: {
  label: string
  value: string
}) {

  return (

    <div className="bg-[#0B0E11] border border-white/5 rounded-2xl p-4">

      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
        {label}
      </div>

      <div className="mt-2 font-black text-white truncate">
        {value}
      </div>

    </div>

  )

}


function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {

  return (

    <section className="space-y-4">

      <h3 className="text-xs uppercase tracking-widest font-black text-gray-400">
        {title}
      </h3>

      {children}

    </section>

  )

}


function InfoGrid({
  children
}: {
  children: React.ReactNode
}) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {children}
    </div>

  )

}


function CopyField({
  label,
  value,
  onCopy,
  copied,
  copyKey,
  copyable = true
}: {
  label: string
  value: unknown
  onCopy?: (
    value: unknown,
    key: string
  ) => void
  copied?: boolean
  copyKey?: string
  copyable?: boolean
}) {

  return (

    <div className="bg-[#0B0E11] border border-white/5 rounded-2xl p-4">

      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
        {label}
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">

        <div className="font-mono text-sm text-gray-200 break-all">
          {value === null ||
          value === undefined ||
          value === ""
            ? "-"
            : String(value)}
        </div>

        {copyable &&
        onCopy &&
        value !== null &&
        value !== undefined &&
        value !== "" && (

          <button
            onClick={() =>
              onCopy(
                value,
                copyKey || label
              )
            }
            className="shrink-0 p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white"
          >

            {copied
              ? <CheckCircle
                  size={16}
                  className="text-emerald-400"
                />
              : <Copy size={16} />
            }

          </button>

        )}

      </div>

    </div>

  )

}


function JsonBlock({
  value
}: {
  value: unknown
}) {

  return (

    <pre className="bg-[#0B0E11] border border-white/5 rounded-2xl p-5 overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed max-h-[420px]">
      {value
        ? JSON.stringify(
            value,
            null,
            2
          )
        : "Sem dados"}
    </pre>

  )

}


/* =====================================================
   HELPERS
===================================================== */

function getVoucherPin(
  transaction: Transaction
): string | null {

  const metadata =
    transaction.metadata

  if (!metadata) {
    return null
  }

  const receipt =
    metadata.receipt

  if (
    receipt &&
    typeof receipt === "object" &&
    receipt.voucherPin
  ) {

    return String(
      receipt.voucherPin
    )

  }

  const extraInfo =
    metadata.extraInfo

  if (
    extraInfo !== null &&
    extraInfo !== undefined &&
    extraInfo !== ""
  ) {

    return String(
      extraInfo
    )

  }

  return null
}


/* =====================================================
   AMOUNT
===================================================== */

function Amount({
  value,
  type
}: {
  value: number
  type: string
}) {

  const creditTypes = [
    "RECHARGE",
    "SELL_CREDIT",
    "COMMISSION",
    "GIFT"
  ]

  const isCredit =
    creditTypes.includes(type)

  return (

    <span
      className={`font-black font-mono ${
        isCredit
          ? "text-emerald-400"
          : "text-red-400"
      }`}
    >

      {isCredit
        ? "+"
        : "-"}

      {" "}

      {formatMoney(
        value
      )}

    </span>

  )

}


/* =====================================================
   BADGES
===================================================== */

function TypeBadge({
  type
}: {
  type: string
}) {

  const styles: Record<
    string,
    string
  > = {

    RECHARGE:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

    WITHDRAW:
      "bg-red-500/10 text-red-400 border border-red-500/20",

    BUY_DEBIT:
      "bg-orange-500/10 text-orange-400 border border-orange-500/20",

    SELL_CREDIT:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

    SERVICE_DEBIT:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",

    COMMISSION:
      "bg-purple-500/10 text-purple-400 border border-purple-500/20",

    GIFT:
      "bg-pink-500/10 text-pink-400 border border-pink-500/20"

  }

  return (

    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        styles[type] ||
        "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {type}

    </span>

  )

}


function StatusBadge({
  status
}: {
  status?: string
}) {

  const value =
    status || "UNKNOWN"

  const normalized =
    value.toUpperCase()

  const isSuccess =
    [
      "PAID",
      "APPROVED",
      "SUCCESS",
      "COMPLETED"
    ].includes(normalized)

  const isError =
    [
      "FAILED",
      "REJECTED",
      "CANCELLED"
    ].includes(normalized)

  return (

    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        isSuccess
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : isError
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      }`}
    >
      {value}

    </span>

  )

}


/* =====================================================
   UTILS
===================================================== */

function formatMoney(
  value: number
) {

  return new Intl.NumberFormat(
    "pt-AO",
    {
      style: "currency",
      currency: "AOA"
    }
  ).format(
    value ?? 0
  )

}


function formatDate(
  date: string
) {

  return new Date(
    date
  ).toLocaleString(
    "pt-AO"
  )

}


function SkeletonRow() {

  return (

    <div className="flex items-center justify-between animate-pulse py-4 border-b border-white/5 last:border-none">

      <div className="w-12 h-4 bg-white/5 rounded" />

      <div className="w-32 h-4 bg-white/5 rounded" />

      <div className="w-24 h-6 bg-white/5 rounded-full" />

      <div className="w-28 h-4 bg-white/5 rounded" />

      <div className="w-36 h-4 bg-white/5 rounded" />

    </div>

  )

}