import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import {
  ShieldCheck,
  ArrowsClockwise,
} from "@phosphor-icons/react"
import AdminAccountDeletionService from "../../services/admin-account-deletion.service"
import type {
  DeletableUser,
  DeletionRole,
} from "../../services/admin-account-deletion.service"

type ToastType = "success" | "error"

interface ToastState {
  type: ToastType
  message: string
}

const ROLE_LABELS: Record<DeletionRole, string> = {
  ALL: "Todos",
  CLIENT: "Clientes",
  AGENT: "Agentes",
  SUB_AGENT: "Sub-Agentes",
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  }).format(value || 0)
}

function formatDate(value: string) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getUserName(user: DeletableUser) {
  return user.fullName?.trim() || "Sem nome"
}

function getProfileCode(user: DeletableUser) {
  if (user.role === "AGENT") {
    return user.agentCode || user.publicId
  }

  if (user.role === "SUB_AGENT") {
    return user.employeeCode || user.publicId
  }

  return user.publicId
}

function getRoleStyle(role: DeletableUser["role"]) {
  switch (role) {
    case "AGENT":
      return "bg-blue-500/10 text-blue-400 border-blue-500/25"

    case "SUB_AGENT":
      return "bg-purple-500/10 text-purple-400 border-purple-500/25"

    default:
      return "bg-gray-500/10 text-gray-300 border-gray-500/25"
  }
}

function getRoleLabel(role: DeletableUser["role"]) {
  switch (role) {
    case "AGENT":
      return "AGENTE"

    case "SUB_AGENT":
      return "SUB-AGENTE"

    default:
      return "CLIENTE"
  }
}

export default function AdminAccountDeletion() {
  const [users, setUsers] = useState<DeletableUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState("")
  const [role, setRole] = useState<DeletionRole>("ALL")

  const [selectedUser, setSelectedUser] = useState<DeletableUser | null>(null)
  const [reason, setReason] = useState("")

  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message })

    window.setTimeout(() => {
      setToast(null)
    }, 4000)
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)

      const response = await AdminAccountDeletionService.list(
        search,
        role
      )

      setUsers(Array.isArray(response.items) ? response.items : [])
    } catch (error: any) {
      console.error("[ADMIN ACCOUNT DELETION]", error)

      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Não foi possível carregar os utilizadores."
      )
    } finally {
      setLoading(false)
    }
  }, [role, search, showToast])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadUsers()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [loadUsers])

  const summary = useMemo(() => {
    return {
      total: users.length,
      clients: users.filter((user) => user.role === "CLIENT").length,
      agents: users.filter((user) => user.role === "AGENT").length,
      subAgents: users.filter((user) => user.role === "SUB_AGENT").length,
    }
  }, [users])

  const openDeleteModal = (user: DeletableUser) => {
    setSelectedUser(user)
    setReason("")
  }

  const closeDeleteModal = () => {
    if (deleting) return

    setSelectedUser(null)
    setReason("")
  }

  const handleDelete = async () => {
    if (!selectedUser || deleting) return

    try {
      setDeleting(true)

      await AdminAccountDeletionService.delete(
        selectedUser.id,
        "LOGICAL",
        reason.trim() || undefined
      )

      showToast(
        "success",
        `${getUserName(selectedUser)} foi eliminado logicamente com sucesso.`
      )

      closeDeleteModal()

      await loadUsers()
    } catch (error: any) {
      console.error("[ADMIN ACCOUNT DELETION]", error)

      showToast(
        "error",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Não foi possível eliminar o utilizador."
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 bg-[#0B0E11] min-h-screen text-white space-y-8 max-w-[1600px] mx-auto">
      {/* TOAST */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] w-[min(420px,calc(100vw-2rem))]">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-red-500/25 bg-red-500/10"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
            ) : (
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-400"
              />
            )}

            <p
              className={`text-sm font-medium ${
                toast.type === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto text-gray-500 transition hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">
              Administração & Segurança
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Eliminar Utilizador
          </h1>

          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-red-500" />
            Eliminação lógica de clientes, agentes e sub-agentes com preservação de histórico financeiro.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 transition-all shadow-xl font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          <ArrowsClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* WARNING */}
      <div className="flex items-start gap-3 rounded-[2rem] border border-amber-500/25 bg-amber-500/5 p-5 shadow-xl">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-amber-400"
        />

        <div>
          <p className="text-sm font-bold text-amber-300">
            Operação administrativa sensível
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            A eliminação nesta página é lógica. Os dados financeiros, transações e histórico do utilizador não são apagados.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-[#161A1F] border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Total
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-black text-white">{summary.total}</p>
          )}
        </div>

        <div className="bg-[#161A1F] border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Clientes
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-black text-gray-200">{summary.clients}</p>
          )}
        </div>

        <div className="bg-[#161A1F] border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Agentes
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-black text-blue-400">{summary.agents}</p>
          )}
        </div>

        <div className="bg-[#161A1F] border border-white/5 p-6 rounded-[2rem] shadow-xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Sub-Agentes
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-black text-purple-400">{summary.subAgents}</p>
          )}
        </div>
      </div>

      {/* FILTERS & TABLE CONTAINER */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por nome, telefone, email, ID ou código..."
              className="w-full rounded-xl border border-white/5 bg-[#0B0E11] py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500/50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {(Object.keys(ROLE_LABELS) as DeletionRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                  role === item
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-white/5 bg-[#0B0E11] text-gray-500 hover:border-white/10 hover:text-gray-300"
                }`}
              >
                {ROLE_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500">
                <th className="py-4 px-6">Utilizador</th>
                <th className="py-4 px-6">Contacto</th>
                <th className="py-4 px-6">Perfil</th>
                <th className="py-4 px-6 text-right">Saldo</th>
                <th className="py-4 px-6">Registo</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-center">
                      <UserRound size={36} className="mb-3 text-gray-700" />
                      <p className="text-sm font-bold text-gray-400">
                        Nenhum utilizador encontrado
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Ajuste a pesquisa ou o filtro selecionado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#12161B] transition-colors"
                  >
                    {/* USER */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/[0.03]">
                          <UserRound size={18} className="text-gray-400" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {getUserName(user)}
                          </p>

                          <p className="mt-0.5 text-[11px] font-mono text-gray-500">
                            ID: {user.publicId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="py-4 px-6">
                      <p className="text-xs text-gray-300 font-mono">
                        {user.phone || "—"}
                      </p>

                      <p className="mt-1 max-w-[220px] truncate text-[11px] text-gray-500">
                        {user.email || "Sem email"}
                      </p>
                    </td>

                    {/* PROFILE */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1.5">
                        <span
                          className={`rounded-lg border px-2.5 py-1 text-[10px] font-black ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>

                        <span className="text-[11px] font-mono text-gray-500">
                          {getProfileCode(user)}
                        </span>
                      </div>
                    </td>

                    {/* BALANCE */}
                    <td className="py-4 px-6 text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {formatCurrency(user.balance)}
                      </p>

                      {user.frozenBalance > 0 && (
                        <p className="mt-1 text-[10px] text-amber-500 font-mono">
                          Congelado: {formatCurrency(user.frozenBalance)}
                        </p>
                      )}
                    </td>

                    {/* CREATED */}
                    <td className="py-4 px-6">
                      <span className="text-xs text-gray-400 font-mono">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 text-center">
                      {user.isBlocked ? (
                        <span className="inline-flex rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-red-400">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-400">
                          Ativo
                        </span>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal()
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#161A1F] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <Trash2 size={19} className="text-red-400" />
                </div>

                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">
                    Eliminar utilizador
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Eliminação lógica do sistema
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-5">
              <div className="rounded-2xl border border-white/5 bg-[#0B0E11] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/5">
                    <UserRound size={20} className="text-gray-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {getUserName(selectedUser)}
                    </p>

                    <p className="mt-0.5 text-xs font-mono text-gray-500">
                      {selectedUser.phone}
                    </p>
                  </div>

                  <span
                    className={`ml-auto shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black ${getRoleStyle(
                      selectedUser.role
                    )}`}
                  >
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>
                    <p className="text-xs font-bold text-amber-300">
                      Atenção
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      O utilizador será marcado como eliminado e deixará de ser tratado como uma conta ativa. O histórico financeiro será preservado.
                    </p>
                  </div>
                </div>
              </div>

              {/* REASON */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300">
                  Motivo da eliminação
                  <span className="ml-1 font-normal text-gray-600">
                    (opcional)
                  </span>
                </label>

                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Indique o motivo administrativo..."
                  disabled={deleting}
                  className="w-full resize-none rounded-xl border border-white/5 bg-[#0B0E11] px-4 py-3 text-xs text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/40 disabled:opacity-50"
                />

                <div className="text-right text-[10px] font-mono text-gray-600">
                  {reason.length}/500
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="rounded-xl border border-white/5 bg-white/5 px-5 py-3 text-xs font-bold text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-3 text-xs font-bold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      A eliminar...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Confirmar eliminação
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-40" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-28" /></td>
      <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-lg w-24" /></td>
      <td className="py-4 px-6 text-right"><div className="h-4 bg-white/5 rounded w-20 ml-auto" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-28" /></td>
      <td className="py-4 px-6 text-center"><div className="h-5 bg-white/5 rounded-full w-16 mx-auto" /></td>
      <td className="py-4 px-6 text-right"><div className="h-8 bg-white/5 rounded-xl w-20 ml-auto" /></td>
    </tr>
  )
}