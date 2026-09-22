import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowClockwise,
  Eye,
  EyeSlash,
  MagnifyingGlass,
  UserCircle,
  UsersThree,
  UserCheck,
  UserMinus,
  X,
  ShieldCheck,
  ShieldWarning,
  Phone,
  Envelope,
  CalendarBlank,
  Wallet,
  MapPin,
  PencilSimple,
  PlusCircle,
  MinusCircle,
  Key,
  LockKey,
  UserGear
} from "@phosphor-icons/react"
import { toast } from "react-hot-toast"

import AdminClientsService, {
  type ClientListItem,
  type ClientDetails,
  type ClientStatus
} from "../../services/admin-clients.service"

type Filter = "ALL" | "ACTIVE" | "BLOCKED"

export default function Clients() {
  const [clients, setClients] = useState<ClientListItem[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("ALL")

  const [selectedClient, setSelectedClient] =
    useState<ClientDetails | null>(null)

  const [detailsLoading, setDetailsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    province: "",
    neighborhood: "",
    bio: ""
  })

  const [balanceOpen, setBalanceOpen] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceAction, setBalanceAction] = useState<"ADD" | "SUBTRACT">("ADD")
  const [balanceAmount, setBalanceAmount] = useState("")

  const [resetOpen, setResetOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetType, setResetType] = useState<"PASSWORD" | "PIN">("PASSWORD")
  const [resetValue, setResetValue] = useState("")
  const [showResetValue, setShowResetValue] = useState(false)

  const [roleOpen, setRoleOpen] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)
  const [newRole, setNewRole] = useState("CLIENT")

  // =========================================================
  // CARREGAR CLIENTES
  // =========================================================

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)

      const status: ClientStatus = filter

      const response =
        await AdminClientsService.list(
          search.trim() || undefined,
          status
        )

      setClients(
        Array.isArray(response?.items)
          ? response.items
          : []
      )
    } catch (error) {
      console.error(
        "[ADMIN CLIENTS] Erro ao carregar clientes:",
        error
      )

      toast.error(
        "Não foi possível carregar os clientes."
      )

      setClients([])
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients()
    }, 300)

    return () => clearTimeout(timer)
  }, [loadClients])

  // =========================================================
  // ESTATÍSTICAS
  // =========================================================

  const statistics = useMemo(() => {
    const total = clients.length

    const active = clients.filter(
      client => !client.isBlocked
    ).length

    const blocked = clients.filter(
      client => client.isBlocked
    ).length

    const verified = clients.filter(
      client => client.isVerified
    ).length

    return {
      total,
      active,
      blocked,
      verified
    }
  }, [clients])

  // =========================================================
  // DETALHES
  // =========================================================

  async function handleViewClient(id: number) {
    try {
      setDetailsLoading(true)

      const client =
        await AdminClientsService.getById(id)

      setSelectedClient(client)
    } catch (error) {
      console.error(
        "[ADMIN CLIENTS] Erro ao obter cliente:",
        error
      )

      toast.error(
        "Não foi possível carregar os dados do cliente."
      )
    } finally {
      setDetailsLoading(false)
    }
  }

  // =========================================================
  // BLOQUEAR / DESBLOQUEAR
  // =========================================================

  async function handleToggleBlock(
    client: ClientListItem
  ) {
    try {
      setActionLoading(client.id)

      if (client.isBlocked) {
        await AdminClientsService.unblock(
          client.id
        )

        toast.success(
          "Cliente desbloqueado com sucesso."
        )
      } else {
        await AdminClientsService.block(
          client.id
        )

        toast.success(
          "Cliente bloqueado com sucesso."
        )
      }

      await loadClients()

      if (
        selectedClient &&
        selectedClient.id === client.id
      ) {
        const updated =
          await AdminClientsService.getById(
            client.id
          )

        setSelectedClient(updated)
      }
    } catch (error) {
      console.error(
        "[ADMIN CLIENTS] Erro ao alterar estado:",
        error
      )

      toast.error(
        "Não foi possível alterar o estado do cliente."
      )
    } finally {
      setActionLoading(null)
    }
  }

  // =========================================================
  // EDITAR DADOS
  // =========================================================

  function openEditClient(client: ClientDetails) {
    setEditForm({
      fullName: client.fullName || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      country: client.country || "",
      province: client.province || "",
      neighborhood: client.neighborhood || "",
      bio: client.bio || ""
    })
    setEditOpen(true)
  }

  async function handleEditClient() {
    if (!selectedClient) return

    try {
      setEditLoading(true)
      const updated = await AdminClientsService.updatePersonalData(
        selectedClient.id,
        editForm
      )

      setSelectedClient({ ...selectedClient, ...updated })
      setEditOpen(false)
      await loadClients()
      toast.success("Dados do cliente atualizados com sucesso.")
    } catch (error) {
      console.error("[ADMIN CLIENTS] Erro ao editar cliente:", error)
      toast.error("Não foi possível atualizar os dados do cliente.")
    } finally {
      setEditLoading(false)
    }
  }

  // =========================================================
  // AJUSTAR SALDO
  // =========================================================

  async function handleAdjustBalance() {
    if (!selectedClient) return

    const amount = Number(balanceAmount.replace(/[^0-9.,]/g, "").replace(",", "."))

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Informe um valor válido.")
      return
    }

    try {
      setBalanceLoading(true)
      const result = await AdminClientsService.adjustBalance(
        selectedClient.id,
        amount,
        balanceAction
      )

      const updated = await AdminClientsService.getById(selectedClient.id)
      setSelectedClient(updated)
      setBalanceAmount("")
      setBalanceOpen(false)
      await loadClients()
      toast.success(
        balanceAction === "ADD"
          ? `Saldo adicionado. Novo saldo: ${formatCurrency(result.balance)}`
          : `Saldo retirado. Novo saldo: ${formatCurrency(result.balance)}`
      )
    } catch (error) {
      console.error("[ADMIN CLIENTS] Erro ao ajustar saldo:", error)
      toast.error("Não foi possível ajustar o saldo.")
    } finally {
      setBalanceLoading(false)
    }
  }

  // =========================================================
  // RESET PASSWORD / PIN
  // =========================================================

  async function handleResetCredential() {
    if (!selectedClient) return

    if (resetType === "PASSWORD" && resetValue.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres.")
      return
    }

    if (resetType === "PIN" && !/^\d{4,6}$/.test(resetValue)) {
      toast.error("O PIN deve conter entre 4 e 6 dígitos.")
      return
    }

    try {
      setResetLoading(true)

      if (resetType === "PASSWORD") {
        await AdminClientsService.resetPassword(selectedClient.id, resetValue)
      } else {
        await AdminClientsService.resetPin(selectedClient.id, resetValue)
      }

      setResetValue("")
      setResetOpen(false)
      toast.success(
        resetType === "PASSWORD"
          ? "Palavra-passe redefinida com sucesso."
          : "PIN redefinido com sucesso."
      )
    } catch (error) {
      console.error("[ADMIN CLIENTS] Erro ao redefinir credencial:", error)
      toast.error("Não foi possível redefinir a credencial.")
    } finally {
      setResetLoading(false)
    }
  }

  // =========================================================
  // ALTERAR FUNÇÃO
  // =========================================================

  async function handleChangeRole() {
    if (!selectedClient) return

    if (!["CLIENT", "AGENT"].includes(newRole)) {
      toast.error("Função inválida.")
      return
    }

    try {
      setRoleLoading(true)
      const updated = await AdminClientsService.updateRole(
        selectedClient.id,
        newRole
      )
      setSelectedClient({ ...selectedClient, ...updated, role: newRole })
      setRoleOpen(false)
      await loadClients()
      toast.success("Função atualizada com sucesso.")
    } catch (error) {
      console.error("[ADMIN CLIENTS] Erro ao alterar função:", error)
      toast.error("Não foi possível alterar a função.")
    } finally {
      setRoleLoading(false)
    }
  }

  // =========================================================
  // FORMATAÇÃO
  // =========================================================

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(
      "pt-AO",
      {
        style: "currency",
        currency: "AOA",
        minimumFractionDigits: 2
      }
    ).format(Number(value || 0))
  }

  function formatDate(value: string) {
    if (!value) return "—"

    return new Intl.DateTimeFormat(
      "pt-AO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(new Date(value))
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white p-6 md:p-8">

      <div className="max-w-[1600px] mx-auto space-y-7">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <UsersThree
                  size={21}
                  className="text-blue-400"
                />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  Clientes
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Gestão centralizada dos clientes da EMATEA.
            </p>
          </div>

          <button
            type="button"
            onClick={loadClients}
            disabled={loading}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-2.5
              rounded-xl
              bg-[#161A1F]
              border border-white/10
              text-xs font-bold uppercase tracking-wider
              text-gray-300
              hover:bg-white/5
              hover:text-white
              transition
              disabled:opacity-50
            "
          >
            <ArrowClockwise
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Atualizar
          </button>

        </div>

        {/* =================================================
            CARDS DE ESTATÍSTICAS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Total de Clientes"
            value={statistics.total}
            icon={
              <UsersThree
                size={20}
              />
            }
          />

          <StatCard
            title="Clientes Ativos"
            value={statistics.active}
            icon={
              <UserCheck
                size={20}
              />
            }
          />

          <StatCard
            title="Contas Bloqueadas"
            value={statistics.blocked}
            icon={
              <UserMinus
                size={20}
              />
            }
          />

          <StatCard
            title="Clientes Verificados"
            value={statistics.verified}
            icon={
              <ShieldCheck
                size={20}
              />
            }
          />

        </div>

        {/* =================================================
            FILTROS
        ================================================= */}

        <div className="
          rounded-2xl
          bg-[#11151A]
          border border-white/5
          p-4
          flex flex-col xl:flex-row
          gap-4
          xl:items-center
          xl:justify-between
        ">

          <div className="
            relative
            w-full
            xl:max-w-md
          ">

            <MagnifyingGlass
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />

            <input
              type="text"
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
              placeholder="
                Pesquisar por nome, telefone, email ou código...
              "
              className="
                w-full
                bg-[#0B0E11]
                border border-white/10
                rounded-xl
                pl-11
                pr-4
                py-3
                text-sm
                text-white
                placeholder:text-gray-600
                outline-none
                focus:border-blue-500/40
                transition
              "
            />

          </div>

          <div className="
            flex
            flex-wrap
            gap-2
          ">

            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
            >
              Todos
            </FilterButton>

            <FilterButton
              active={filter === "ACTIVE"}
              onClick={() => setFilter("ACTIVE")}
            >
              Ativos
            </FilterButton>

            <FilterButton
              active={filter === "BLOCKED"}
              onClick={() => setFilter("BLOCKED")}
            >
              Bloqueados
            </FilterButton>

          </div>

        </div>

        {/* =================================================
            TABELA
        ================================================= */}

        <div className="
          rounded-2xl
          bg-[#11151A]
          border border-white/5
          overflow-hidden
        ">

          <div className="
            px-6
            py-5
            border-b border-white/5
            flex
            items-center
            justify-between
          ">

            <div>
              <h2 className="
                text-sm
                font-black
                uppercase
                tracking-widest
                text-white
              ">
                Lista de Clientes
              </h2>

              <p className="
                text-xs
                text-gray-500
                mt-1
              ">
                {clients.length} registo(s)
              </p>
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="
                  border-b border-white/5
                  bg-black/20
                  text-[10px]
                  uppercase
                  tracking-widest
                  font-black
                  text-gray-500
                ">

                  <th className="px-6 py-4">
                    Cliente
                  </th>

                  <th className="px-6 py-4">
                    Contactos
                  </th>

                  <th className="px-6 py-4">
                    Saldo
                  </th>

                  <th className="px-6 py-4">
                    Registo
                  </th>

                  <th className="px-6 py-4">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-right">
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody className="
                divide-y
                divide-white/5
              ">

                {loading && clients.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="
                        py-16
                        text-center
                        text-gray-500
                        text-sm
                      "
                    >
                      <ArrowClockwise
                        size={22}
                        className="
                          animate-spin
                          mx-auto
                          mb-3
                        "
                      />

                      A carregar clientes...
                    </td>
                  </tr>

                ) : clients.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="
                        py-16
                        text-center
                        text-gray-500
                        text-sm
                      "
                    >
                      <UserCircle
                        size={30}
                        className="
                          mx-auto
                          mb-3
                          text-gray-600
                        "
                      />

                      Nenhum cliente encontrado.
                    </td>
                  </tr>

                ) : (

                  clients.map(client => (

                    <tr
                      key={client.id}
                      className="
                        hover:bg-white/[0.02]
                        transition-colors
                      "
                    >

                      {/* CLIENTE */}

                      <td className="px-6 py-4">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-blue-500/10
                            border border-blue-500/10
                            flex
                            items-center
                            justify-center
                            shrink-0
                          ">
                            <UserCircle
                              size={21}
                              className="text-blue-400"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="
                              text-sm
                              font-semibold
                              text-white
                              truncate
                              max-w-[220px]
                            ">
                              {client.fullName ||
                                "Sem nome"}
                            </p>

                            <p className="
                              text-[11px]
                              font-mono
                              text-gray-500
                              mt-0.5
                            ">
                              {client.publicId}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CONTACTOS */}

                      <td className="px-6 py-4">

                        <div className="space-y-1">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-gray-300
                          ">
                            <Phone
                              size={13}
                              className="text-gray-500"
                            />

                            {client.phone || "—"}
                          </div>

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            text-gray-500
                          ">
                            <Envelope
                              size={13}
                            />

                            <span className="
                              max-w-[220px]
                              truncate
                            ">
                              {client.email || "—"}
                            </span>
                          </div>

                        </div>

                      </td>

                      {/* SALDO */}

                      <td className="px-6 py-4">

                        <div className="
                          flex
                          items-center
                          gap-2
                        ">

                          <Wallet
                            size={15}
                            className="text-blue-400"
                          />

                          <span className="
                            text-sm
                            font-semibold
                            text-white
                            whitespace-nowrap
                          ">
                            {formatCurrency(
                              client.balance
                            )}
                          </span>

                        </div>

                      </td>

                      {/* DATA */}

                      <td className="px-6 py-4">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-gray-400
                        ">
                          <CalendarBlank
                            size={14}
                            className="text-gray-600"
                          />

                          {formatDate(
                            client.createdAt
                          )}
                        </div>

                      </td>

                      {/* ESTADO */}

                      <td className="px-6 py-4">

                        {client.isBlocked ? (

                          <span className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5
                            py-1.5
                            rounded-lg
                            text-[10px]
                            uppercase
                            font-black
                            tracking-wider
                            bg-red-500/10
                            text-red-400
                            border
                            border-red-500/20
                          ">
                            <ShieldWarning
                              size={13}
                            />

                            Bloqueado
                          </span>

                        ) : (

                          <span className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5
                            py-1.5
                            rounded-lg
                            text-[10px]
                            uppercase
                            font-black
                            tracking-wider
                            bg-emerald-500/10
                            text-emerald-400
                            border
                            border-emerald-500/20
                          ">
                            <ShieldCheck
                              size={13}
                            />

                            Ativo
                          </span>

                        )}

                      </td>

                      {/* AÇÕES */}

                      <td className="px-6 py-4">

                        <div className="
                          flex
                          justify-end
                          items-center
                          gap-2
                        ">

                          <button
                            type="button"
                            title="Ver cliente"
                            onClick={() =>
                              handleViewClient(
                                client.id
                              )
                            }
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-white/5
                              border border-white/10
                              flex
                              items-center
                              justify-center
                              text-gray-400
                              hover:text-white
                              hover:bg-white/10
                              transition
                            "
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionLoading ===
                              client.id
                            }
                            title={
                              client.isBlocked
                                ? "Desbloquear cliente"
                                : "Bloquear cliente"
                            }
                            onClick={() =>
                              handleToggleBlock(
                                client
                              )
                            }
                            className={`
                              w-9
                              h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              transition
                              border
                              disabled:opacity-50
                              ${
                                client.isBlocked
                                  ? `
                                    bg-emerald-500/10
                                    border-emerald-500/20
                                    text-emerald-400
                                    hover:bg-emerald-500/20
                                  `
                                  : `
                                    bg-red-500/10
                                    border-red-500/20
                                    text-red-400
                                    hover:bg-red-500/20
                                  `
                              }
                            `}
                          >
                            {actionLoading ===
                            client.id ? (
                              <ArrowClockwise
                                size={16}
                                className="animate-spin"
                              />
                            ) : client.isBlocked ? (
                              <ShieldCheck
                                size={17}
                              />
                            ) : (
                              <ShieldWarning
                                size={17}
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Editar cliente"
                            onClick={() => handleViewClient(client.id)}
                            className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition"
                          >
                            <PencilSimple size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ===================================================
          MODAL DE DETALHES
      =================================================== */}

      {selectedClient && (

        <div className="
          fixed
          inset-0
          z-50
          bg-black/70
          backdrop-blur-sm
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-3xl
            max-h-[90vh]
            overflow-y-auto
            bg-[#11151A]
            border border-white/10
            rounded-2xl
            shadow-2xl
          ">

            {/* MODAL HEADER */}

            <div className="
              px-6
              py-5
              border-b border-white/5
              flex
              items-center
              justify-between
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-500/10
                  border border-blue-500/20
                  flex
                  items-center
                  justify-center
                ">
                  <UserCircle
                    size={23}
                    className="text-blue-400"
                  />
                </div>

                <div>

                  <h2 className="
                    text-lg
                    font-black
                    text-white
                  ">
                    Dados do Cliente
                  </h2>

                  <p className="
                    text-xs
                    text-gray-500
                    font-mono
                  ">
                    {selectedClient.publicId}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedClient(null)
                }
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-white/5
                  border border-white/10
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  hover:text-white
                  hover:bg-white/10
                  transition
                "
              >
                <X size={18} />
              </button>

            </div>

            {detailsLoading ? (

              <div className="
                py-20
                text-center
                text-gray-500
              ">
                <ArrowClockwise
                  size={25}
                  className="
                    animate-spin
                    mx-auto
                    mb-3
                  "
                />

                A carregar dados...
              </div>

            ) : (

              <div className="p-6 space-y-6">

                {/* IDENTIDADE */}

                <div className="
                  rounded-xl
                  bg-[#0B0E11]
                  border border-white/5
                  p-5
                ">

                  <h3 className="
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                    text-gray-500
                    mb-4
                  ">
                    Identificação
                  </h3>

                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  ">

                    <Detail
                      label="Nome completo"
                      value={
                        selectedClient.fullName ||
                        "—"
                      }
                    />

                    <Detail
                      label="Código"
                      value={
                        selectedClient.publicId
                      }
                    />

                    <Detail
                      label="Telefone"
                      value={
                        selectedClient.phone ||
                        "—"
                      }
                    />

                    <Detail
                      label="Email"
                      value={
                        selectedClient.email ||
                        "—"
                      }
                    />

                  </div>

                </div>

                {/* CONTA */}

                <div className="
                  rounded-xl
                  bg-[#0B0E11]
                  border border-white/5
                  p-5
                ">

                  <h3 className="
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                    text-gray-500
                    mb-4
                  ">
                    Conta
                  </h3>

                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  ">

                    <Detail
                      label="Saldo disponível"
                      value={formatCurrency(
                        selectedClient.balance
                      )}
                    />

                    <Detail
                      label="Saldo congelado"
                      value={formatCurrency(
                        selectedClient.frozenBalance
                      )}
                    />

                    <Detail
                      label="Estado"
                      value={
                        selectedClient.isBlocked
                          ? "Bloqueado"
                          : "Ativo"
                      }
                    />

                    <Detail
                      label="Verificação"
                      value={
                        selectedClient.isVerified
                          ? "Verificado"
                          : "Não verificado"
                      }
                    />

                  </div>

                </div>

                {/* LOCALIZAÇÃO */}

                <div className="
                  rounded-xl
                  bg-[#0B0E11]
                  border border-white/5
                  p-5
                ">

                  <h3 className="
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                    text-gray-500
                    mb-4
                  ">
                    Localização
                  </h3>

                  <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-5
                  ">

                    <Detail
                      label="País"
                      value={
                        selectedClient.country ||
                        "—"
                      }
                    />

                    <Detail
                      label="Província"
                      value={
                        selectedClient.province ||
                        "—"
                      }
                    />

                    <Detail
                      label="Bairro"
                      value={
                        selectedClient.neighborhood ||
                        "—"
                      }
                    />

                    <Detail
                      label="Endereço"
                      value={
                        selectedClient.address ||
                        "—"
                      }
                    />

                  </div>

                  <div className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-gray-500
                  ">
                    <MapPin size={14} />

                    <span>
                      Registado em {formatDate(selectedClient.createdAt)}
                    </span>
                  </div>

                </div>

                {/* BANCO */}

                {selectedClient.bank && (

                  <div className="
                    rounded-xl
                    bg-[#0B0E11]
                    border border-white/5
                    p-5
                  ">

                    <h3 className="
                      text-xs
                      font-black
                      uppercase
                      tracking-widest
                      text-gray-500
                      mb-4
                    ">
                      Dados Bancários
                    </h3>

                    <div className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-5
                    ">

                      <Detail
                        label="Banco"
                        value={
                          selectedClient.bank.bank ||
                          "—"
                        }
                      />

                      <Detail
                        label="Titular"
                        value={
                          selectedClient.bank.name ||
                          "—"
                        }
                      />

                      <Detail
                        label="IBAN"
                        value={
                          selectedClient.bank.iban ||
                          "—"
                        }
                      />

                    </div>

                  </div>

                )}

                {/* AÇÃO */}

                <div className="
                  flex
                  flex-wrap
                  justify-end
                  gap-2
                  pt-2
                ">

                  <button
                    type="button"
                    onClick={() => openEditClient(selectedClient)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                  >
                    <PencilSimple size={16} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => { setBalanceAction("ADD"); setBalanceAmount(""); setBalanceOpen(true) }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                  >
                    <PlusCircle size={16} />
                    Adicionar saldo
                  </button>

                  <button
                    type="button"
                    onClick={() => { setBalanceAction("SUBTRACT"); setBalanceAmount(""); setBalanceOpen(true) }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    <MinusCircle size={16} />
                    Retirar saldo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetType("PASSWORD")
                      setResetValue("")
                      setShowResetValue(false)
                      setResetOpen(true)
                   }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition"
                  >
                    <Key size={16} />
                    Palavra-passe
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetType("PIN")
                      setResetValue("")
                      setShowResetValue(false)
                      setResetOpen(true)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition"
                  >
                    <LockKey size={16} />
                    PIN
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewRole(selectedClient.role || "CLIENT"); setRoleOpen(true) }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition"
                  >
                    <UserGear size={16} />
                    Função
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading ===
                      selectedClient.id
                    }
                    onClick={() =>
                      handleToggleBlock(
                        selectedClient
                      )
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-2.5
                      rounded-xl
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      border
                      transition
                      disabled:opacity-50
                      ${
                        selectedClient.isBlocked
                          ? `
                            bg-emerald-500/10
                            text-emerald-400
                            border-emerald-500/20
                            hover:bg-emerald-500/20
                          `
                          : `
                            bg-red-500/10
                            text-red-400
                            border-red-500/20
                            hover:bg-red-500/20
                          `
                      }
                    `}
                  >

                    {actionLoading ===
                    selectedClient.id ? (
                      <ArrowClockwise
                        size={16}
                        className="animate-spin"
                      />
                    ) : selectedClient.isBlocked ? (
                      <ShieldCheck
                        size={16}
                      />
                    ) : (
                      <ShieldWarning
                        size={16}
                      />
                    )}

                    {selectedClient.isBlocked
                      ? "Desbloquear cliente"
                      : "Bloquear cliente"}

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* MODAL EDITAR */}
      {editOpen && selectedClient && (
        <ActionModal
          title="Editar cliente"
          onClose={() => setEditOpen(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ["fullName", "Nome completo"],
              ["phone", "Telefone"],
              ["email", "Email"],
              ["country", "País"],
              ["province", "Província"],
              ["neighborhood", "Bairro"],
              ["address", "Endereço"],
              ["bio", "Bio"]
            ] as const).map(([key, label]) => (
              <label key={key} className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest font-black text-gray-600">{label}</span>
                <input
                  value={editForm[key]}
                  onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                  className="w-full bg-[#0B0E11] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/40"
                />
              </label>
            ))}
          </div>
          <ModalActions loading={editLoading} onCancel={() => setEditOpen(false)} onConfirm={handleEditClient} label="Guardar alterações" />
        </ActionModal>
      )}

      {/* MODAL SALDO */}
      {balanceOpen && selectedClient && (
        <ActionModal
          title={balanceAction === "ADD" ? "Adicionar saldo" : "Retirar saldo"}
          onClose={() => setBalanceOpen(false)}
        >
          <p className="text-sm text-gray-400 mb-4">
            Cliente: <span className="text-white font-semibold">{selectedClient.fullName || selectedClient.publicId}</span>
          </p>
          <label className="space-y-1.5 block">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-600">Valor em Kz</span>
            <input
              type="text"
              inputMode="decimal"
              value={balanceAmount}
              onChange={e => setBalanceAmount(e.target.value)}
              placeholder="0,00"
              className="w-full bg-[#0B0E11] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500/40"
            />
          </label>
          <ModalActions loading={balanceLoading} onCancel={() => setBalanceOpen(false)} onConfirm={handleAdjustBalance} label={balanceAction === "ADD" ? "Adicionar" : "Retirar"} />
        </ActionModal>
      )}

      {/* MODAL RESET */}
      {resetOpen && selectedClient && (
        <ActionModal
          title={resetType === "PASSWORD" ? "Redefinir palavra-passe" : "Redefinir PIN"}
          onClose={() => setResetOpen(false)}
        >
          <label className="space-y-1.5 block">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-600">{resetType === "PASSWORD" ? "Nova palavra-passe" : "Novo PIN"}</span>
            <div className="relative">
              <input
                type={showResetValue ? "text" : "password"}
                inputMode={resetType === "PIN" ? "numeric" : undefined}
                maxLength={resetType === "PIN" ? 6 : undefined}
                value={resetValue}
                onChange={e => setResetValue(e.target.value)}
                className="w-full bg-[#0B0E11] border border-white/10 rounded-xl px-3 py-3 pr-11 text-sm text-white outline-none focus:border-blue-500/40"
              />

              <button
                type="button"
                onClick={() => setShowResetValue(prev => !prev)}
                aria-label={
                  showResetValue
                    ? "Ocultar valor"
                    : "Mostrar valor"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
               >
                {showResetValue ? (
                  <EyeSlash size={18} />
                ) : (
                  <Eye size={18} />
              )}
           </button>
        </div>
          </label>
          <ModalActions loading={resetLoading} onCancel={() => setResetOpen(false)} onConfirm={handleResetCredential} label="Redefinir" />
        </ActionModal>
      )}

      {/* MODAL FUNÇÃO */}
      {roleOpen && selectedClient && (
        <ActionModal title="Alterar função" onClose={() => setRoleOpen(false)}>
          <label className="space-y-1.5 block">
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-600">Função</span>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="w-full bg-[#0B0E11] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500/40"
            >
              <option value="CLIENT">CLIENT</option>
              <option value="AGENT">AGENT</option>
            </select>
          </label>
          <p className="mt-3 text-xs text-amber-400">A alteração de função muda as permissões e o fluxo da conta.</p>
          <ModalActions loading={roleLoading} onCancel={() => setRoleOpen(false)} onConfirm={handleChangeRole} label="Guardar função" />
        </ActionModal>
      )}

    </div>
  )
}

// =========================================================
// COMPONENTES AUXILIARES
// =========================================================

function ActionModal({
  title,
  onClose,
  children
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#11151A] border border-white/10 rounded-2xl shadow-2xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-black text-white">{title}</h3>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({
  loading,
  onCancel,
  onConfirm,
  label
}: {
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
  label: string
}) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition disabled:opacity-50">Cancelar</button>
      <button type="button" onClick={onConfirm} disabled={loading} className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition disabled:opacity-50">
        {loading ? <ArrowClockwise size={16} className="animate-spin" /> : label}
      </button>
    </div>
  )
}

// =========================================================
// COMPONENTES AUXILIARES
// =========================================================

function StatCard({
  title,
  value,
  icon
}: {
  title: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="
      rounded-2xl
      bg-[#11151A]
      border border-white/5
      p-5
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div className="
          w-10
          h-10
          rounded-xl
          bg-blue-500/10
          border border-blue-500/10
          flex
          items-center
          justify-center
          text-blue-400
        ">
          {icon}
        </div>

        <span className="
          text-2xl
          font-black
          text-white
        ">
          {value}
        </span>

      </div>

      <p className="
        mt-4
        text-xs
        font-semibold
        text-gray-500
        uppercase
        tracking-wider
      ">
        {title}
      </p>

    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4
        py-2.5
        rounded-xl
        text-xs
        font-bold
        uppercase
        tracking-wider
        border
        transition
        ${
          active
            ? `
              bg-blue-500/10
              text-blue-400
              border-blue-500/20
            `
            : `
              bg-[#0B0E11]
              text-gray-500
              border-white/10
              hover:text-gray-300
              hover:bg-white/5
            `
        }
      `}
    >
      {children}
    </button>
  )
}

function Detail({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="
        text-[10px]
        uppercase
        tracking-widest
        font-black
        text-gray-600
        mb-1.5
      ">
        {label}
      </p>

      <p className="
        text-sm
        text-gray-200
        break-words
      ">
        {value}
      </p>
    </div>
  )
}