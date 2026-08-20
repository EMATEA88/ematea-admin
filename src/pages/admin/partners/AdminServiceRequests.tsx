import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  adminServiceRequestsService,
  type ServiceRequest
} from "../../../services/adminServiceRequests.service"
import toast from "react-hot-toast"
import {
  RefreshCw,
  ClipboardList,
  Building2,
  Search,
  Filter,
  X
} from "lucide-react"

export default function AdminServiceRequests() {
  const [data, setData] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  /* =====================================================
     CARREGAR TODAS AS SOLICITAÇÕES
     ===================================================== */

  async function fetchData() {
    try {
      setLoading(true)

      const allItems: ServiceRequest[] = []

      let page = 1
      const limit = 100

      while (true) {
        const res = await adminServiceRequestsService.getRequests(
          page,
          limit
        )

        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
            ? res.items
            : Array.isArray(res?.data)
              ? res.data
              : []

        if (items.length === 0) {
          break
        }

        allItems.push(...items)

        /*
         * Se o backend informar totalPages,
         * usamos essa informação para terminar.
         */
        const totalPages =
          !Array.isArray(res) &&
          Number.isFinite(Number(res?.totalPages))
            ? Number(res.totalPages)
            : null

        if (totalPages && page >= totalPages) {
          break
        }

        /*
         * Se retornou menos que o limite solicitado,
         * significa que chegamos à última página.
         */
        if (items.length < limit) {
          break
        }

        page++

        /*
         * Proteção adicional contra respostas
         * anormais do backend.
         */
        if (page > 1000) {
          console.warn(
            "ADMIN_SERVICE_REQUESTS: limite de páginas atingido"
          )
          break
        }
      }

      /*
       * Remove possíveis duplicados caso o backend
       * tenha devolvido o mesmo registro em páginas diferentes.
       */
      const unique = new Map<number, ServiceRequest>()

      for (const item of allItems) {
        if (item?.id != null) {
          unique.set(item.id, item)
        }
      }

      const sorted = Array.from(unique.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

      setData(sorted)

    } catch (error) {
      console.error(
        "Erro ao carregar solicitações de serviço:",
        error
      )

      toast.error(
        "Erro ao carregar solicitações de serviço"
      )

      setData([])
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     CONCLUIR SERVIÇO
     ===================================================== */

  async function handleComplete(id: number) {
    if (
      !window.confirm(
        "Confirmar conclusão do serviço?"
      )
    ) {
      return
    }

    try {
      setActionLoading(id)

      await adminServiceRequestsService.completeService(id)

      toast.success(
        "Serviço concluído com sucesso"
      )

      await fetchData()

    } catch (error) {
      console.error(
        "Erro ao concluir serviço:",
        error
      )

      toast.error(
        "Falha ao concluir serviço"
      )

    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* =====================================================
     STATUS DISPONÍVEIS
     ===================================================== */

  const statuses = useMemo(() => {
    const values = new Set<string>()

    for (const item of data) {
      if (item.status) {
        values.add(String(item.status))
      }
    }

    return Array.from(values).sort()
  }, [data])

  /* =====================================================
     PESQUISA + FILTRO
     ===================================================== */

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return data.filter((r) => {
      const statusMatches =
        statusFilter === "ALL" ||
        String(r.status) === statusFilter

      if (!statusMatches) {
        return false
      }

      if (!term) {
        return true
      }

      const planObj = r.plan as any

      const searchable = [
        r.id,

        r.user?.id,
        r.user?.phone,
        r.user?.name,
        r.user?.email,

        r.amount,

        r.status,

        r.customerReference,
        r.customerName,

        r.serviceName,
        r.serviceGroupName,
        r.planName,

        r.externalProviderRef,
        r.externalTransactionId,

        r.partnerName,

        r.providerName,

        r.serviceId,
        r.serviceGroupId,
        r.providerId,
        r.partnerId,
        r.transactionId,

        planObj?.name,
        planObj?.code,

        planObj?.partner?.name,
        planObj?.provider?.name,

        (r as any).partner?.name,
        (r as any).provider?.name
      ]
        .filter(
          (value) =>
            value !== null &&
            value !== undefined
        )
        .map((value) =>
          String(value).toLowerCase()
        )

      return searchable.some((value) =>
        value.includes(term)
      )
    })
  }, [
    data,
    search,
    statusFilter
  ])

  /* =====================================================
     ESTATÍSTICAS
     ===================================================== */

  const total = data.length

  const visible = filtered.length

  const inProgress = data.filter(
    (item) =>
      String(item.status) === "IN_PROGRESS" ||
      String(item.status) === "PENDING"
  ).length

  const completed = data.filter(
    (item) =>
      String(item.status) === "COMPLETED"
  ).length

  const rejected = data.filter(
    (item) =>
      String(item.status) === "REJECTED" ||
      String(item.status) === "FAILED"
  ).length

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-8 max-w-[1800px] mx-auto font-sans">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-white/5 pb-8">

        <div className="space-y-2">

          <div className="flex items-center gap-2">

            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Gestão de Operações
            </span>

            <span className="text-gray-500 text-xs">
              •
            </span>

            <span className="text-gray-400 text-xs font-mono">
              Service Requests
            </span>

          </div>

          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Solicitações de Serviço
          </h1>

          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ClipboardList
              size={16}
              className="text-blue-400"
            />

            Gestão global de solicitações,
            operações externas e serviços processados.
          </p>

        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >

          <RefreshCw
            size={16}
            className={`text-blue-400 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          {loading
            ? "Carregando..."
            : "Atualizar Dados"}

        </button>

      </div>

      {/* =================================================
          STATS
          ================================================= */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          label="Total"
          value={total}
          description="Solicitações carregadas"
        />

        <StatCard
          label="Em processamento"
          value={inProgress}
          description="Pendentes / em progresso"
        />

        <StatCard
          label="Concluídas"
          value={completed}
          description="Operações concluídas"
        />

        <StatCard
          label="Rejeitadas"
          value={rejected}
          description="Falhas / rejeições"
        />

      </div>

      {/* =================================================
          FILTROS
          ================================================= */}

      <div className="bg-[#161A1F] border border-white/5 rounded-[1.5rem] p-5 shadow-xl">

        <div className="flex flex-col xl:flex-row gap-4">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Pesquisar por ID, telefone, cliente, plano, parceiro, referência ou ID externo..."
              className="w-full bg-[#0B0E11] border border-white/5 pl-11 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-all"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}

          </div>

          {/* STATUS */}

          <div className="relative min-w-[220px]">

            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full appearance-none bg-[#0B0E11] border border-white/5 pl-11 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/40 cursor-pointer"
            >

              <option value="ALL">
                Todos os estados
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {statusLabel(status)}
                </option>
              ))}

            </select>

          </div>

        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

          <span className="text-xs text-gray-500">
            Exibindo{" "}
            <strong className="text-gray-300">
              {visible}
            </strong>{" "}
            de{" "}
            <strong className="text-gray-300">
              {total}
            </strong>{" "}
            solicitações
          </span>

          {(search || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("")
                setStatusFilter("ALL")
              }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Limpar filtros
            </button>
          )}

        </div>

      </div>

      {/* =================================================
          TABLE
          ================================================= */}

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
              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan={10}
                    className="px-8 py-20 text-center text-gray-500"
                  >

                    <div className="flex flex-col items-center justify-center space-y-3">

                      <ClipboardList
                        size={36}
                        className="text-gray-600"
                      />

                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Nenhum registro encontrado
                      </p>

                      {search && (
                        <p className="text-xs text-gray-600">
                          Tente outro termo de pesquisa.
                        </p>
                      )}

                    </div>

                  </td>

                </tr>

              ) : (

                filtered.map((r) => {

                  const planObj =
                    r.plan as any

                  const partnerName =
                    r.partnerName ??
                    planObj?.partner?.name ??
                    planObj?.provider?.name ??
                    (r as any).partner?.name ??
                    (r as any).provider?.name ??
                    "-"

                  const serviceName =
                    r.serviceName ??
                    r.serviceGroupName ??
                    "-"

                  const planName =
                    r.planName ??
                    planObj?.name ??
                    "-"

                  const reference =
                    r.customerReference ??
                    r.externalTransactionId ??
                    r.externalProviderRef ??
                    "-"

                  return (

                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.025] transition"
                    >

                      {/* ID */}

                      <Td className="text-blue-400 font-mono font-bold whitespace-nowrap">
                        #{r.id}
                      </Td>

                      {/* USER */}

                      <Td>

                        <div className="space-y-1">

                          <div className="text-gray-200 font-semibold whitespace-nowrap">
                            {r.user?.phone ??
                              "-"}
                          </div>

                          {r.customerName && (
                            <div className="text-[11px] text-gray-500">
                              {r.customerName}
                            </div>
                          )}

                        </div>

                      </Td>

                      {/* PARTNER */}

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

                      {/* SERVICE */}

                      <Td>

                        <span className="text-gray-300 whitespace-nowrap">
                          {serviceName}
                        </span>

                      </Td>

                      {/* PLAN */}

                      <Td className="font-bold text-white">

                        <span className="whitespace-nowrap">
                          {planName}
                        </span>

                      </Td>

                      {/* REFERENCE */}

                      <Td>

                        <span className="font-mono text-xs text-gray-400 whitespace-nowrap">
                          {reference}
                        </span>

                      </Td>

                      {/* AMOUNT */}

                      <Td className="text-gray-200 font-bold font-mono whitespace-nowrap">

                        {formatMoney(r.amount)}

                      </Td>

                      {/* STATUS */}

                      <Td>

                        <StatusBadge
                          status={String(
                            r.status
                          )}
                        />

                      </Td>

                      {/* DATE */}

                      <Td>

                        <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
                          {formatDate(
                            r.createdAt
                          )}
                        </span>

                      </Td>

                      {/* ACTION */}

                      <Td>

                        {String(r.status) ===
                          "IN_PROGRESS" && (

                          <button
                            disabled={
                              actionLoading ===
                              r.id
                            }
                            onClick={() =>
                              handleComplete(
                                r.id
                              )
                            }
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg cursor-pointer whitespace-nowrap"
                          >

                            {actionLoading ===
                            r.id
                              ? "Processando..."
                              : "Concluir"}

                          </button>

                        )}

                      </Td>

                    </tr>

                  )

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

/* =====================================================
   STAT CARD
   ===================================================== */

function StatCard({
  label,
  value,
  description
}: {
  label: string
  value: number
  description: string
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
  )
}

/* =====================================================
   STATUS
   ===================================================== */

function StatusBadge({
  status
}: {
  status: string
}) {

  const map: Record<string, string> = {

    PENDING:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",

    IN_PROGRESS:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20",

    COMPLETED:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",

    REJECTED:
      "bg-red-500/10 text-red-400 border border-red-500/20",

    FAILED:
      "bg-red-500/10 text-red-400 border border-red-500/20",

    CANCELLED:
      "bg-gray-500/10 text-gray-400 border border-gray-500/20"
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
        map[status] ??
        "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {statusLabel(status)}
    </span>
  )
}

/* =====================================================
   STATUS LABEL
   ===================================================== */

function statusLabel(
  status: string
) {

  const labels: Record<string, string> = {

    PENDING:
      "Pendente",

    IN_PROGRESS:
      "Em Progresso",

    COMPLETED:
      "Concluído",

    REJECTED:
      "Rejeitado",

    FAILED:
      "Falhou",

    CANCELLED:
      "Cancelado"
  }

  return labels[status] ?? status
}

/* =====================================================
   TABLE
   ===================================================== */

function Th({
  children
}: {
  children: ReactNode
}) {
  return (
    <th className="px-6 py-4 text-left font-black whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({
  children,
  className = ""
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td
      className={`px-6 py-4 ${className}`}
    >
      {children}
    </td>
  )
}

/* =====================================================
   MONEY
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
  ).format(value ?? 0)
}

/* =====================================================
   DATE
   ===================================================== */

function formatDate(
  date: string
) {
  if (!date) {
    return "-"
  }

  return new Date(date).toLocaleString(
    "pt-AO"
  )
}

/* =====================================================
   SKELETON
   ===================================================== */

function SkeletonRow() {

  return (

    <tr className="animate-pulse">

      <td className="px-6 py-4">
        <div className="w-10 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-28 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-32 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-28 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-28 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-32 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-20 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-24 h-6 bg-white/5 rounded-full" />
      </td>

      <td className="px-6 py-4">
        <div className="w-32 h-4 bg-white/5 rounded" />
      </td>

      <td className="px-6 py-4">
        <div className="w-20 h-8 bg-white/5 rounded-xl" />
      </td>

    </tr>

  )
}