import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { AdminService } from "../../services/admin.service"
import { 
  Users as UsersIcon, 
  Wallet, 
  UserMinus, 
  MagnifyingGlass, 
  X,
  Plus,
  Minus,
} from "@phosphor-icons/react"

interface User {
  id: number
  phone: string
  email: string
  balance: number
  role: string
  isBlocked?: boolean
  fullName?: string
  iban?: string
  createdAt?: string
  bankName?: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const response = await AdminService.users()
      // O seu backend retorna { items: User[], total: number }
      const list = response?.items || []
      setUsers(list)
    } catch {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      String(u.id).includes(s) ||
      u.phone?.toLowerCase().includes(s) ||
      u.fullName?.toLowerCase().includes(s)
    )
  })

  async function openUser(id: number) {
    try {
      // Garante que estamos chamando o GET /admin/users/:id corretamente
      const data = await AdminService.userDetails(id)
      setSelectedUser(data)
    } catch (err) {
      toast.error("Erro ao carregar detalhes do usuário")
    }
  }

  async function toggleUserBlock() {
    if (!selectedUser) return
    try {
      if (selectedUser.isBlocked) {
        await AdminService.unblockUser(selectedUser.id)
        toast.success("Usuário desbloqueado")
      } else {
        await AdminService.blockUser(selectedUser.id)
        toast.success("Usuário bloqueado")
      }
      await openUser(selectedUser.id)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro na operação")
    }
  }

  async function adjustBalance(action: "ADD" | "SUBTRACT") {
    if (!amount || Number(amount) <= 0) {
      toast.error("Valor inválido")
      return
    }
    if (!selectedUser) return

    try {
      setSubmitting(true)
      const result = await AdminService.adjustUserBalance(selectedUser.id, {
        amount: Number(amount),
        action,
      })
      setSelectedUser({ ...selectedUser, balance: result.balance })
      setAmount("")
      await load()
      toast.success("Saldo atualizado")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao ajustar saldo")
    } finally {
      setSubmitting(false)
    }
  }

  const totalUsers = users.length
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0)
  const blockedUsers = users.filter((u) => u.isBlocked).length

  if (loading) return (
    <div className="p-8 text-gray-500 font-bold animate-pulse">
      SINCRONIZANDO BASE DE DADOS...
    </div>
  )

  return (
    <div className="p-8 space-y-10 text-white max-w-7xl mx-auto">
      
      <header>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">User Management</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Administração de Protocolos</p>
      </header>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-6">
        <KpiCard title="Total Usuários" value={totalUsers} border="border-blue-500" icon={<UsersIcon size={20}/>} />
        <KpiCard title="Saldo Total" value={totalBalance} money border="border-emerald-500" icon={<Wallet size={20}/>} />
        <KpiCard title="Bloqueados" value={blockedUsers} border="border-red-500" icon={<UserMinus size={20}/>} />
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          className="w-full bg-gray-950 border border-gray-800 px-12 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
          placeholder="Pesquisar por ID, telefone ou nome"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Identidade / Telefone</th>
              <th className="p-4 text-left">Saldo Atual</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800/40 transition cursor-pointer" onClick={() => openUser(u.id)}>
                <td className="p-4 text-gray-500 font-mono text-xs">#{u.id}</td>
                <td className="p-4 font-bold text-blue-400 uppercase tracking-tight">{u.phone}</td>
                <td className="p-4 font-bold text-emerald-400">{formatMoney(u.balance)}</td>
                <td className="p-4">
                  <StatusBadge blocked={u.isBlocked} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALHES */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-[2rem] w-full max-w-xl p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95">
            
            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X size={24} weight="bold" />
            </button>

            <header>
              <h2 className="text-2xl font-black italic uppercase tracking-tight break-words pr-8">
                {selectedUser.fullName || selectedUser.phone}
              </h2>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Protocolo do Usuário</p>
            </header>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <InfoItem label="ID do Sistema" value={`#${selectedUser.id}`} />
              <InfoItem label="Cargo / Role" value={selectedUser.role} />
              <InfoItem label="Email" value={selectedUser.email || "Não definido"} />
              <InfoItem label="Banco" value={selectedUser.bankName || "Não vinculado"} />
              <div className="col-span-2">
                 <InfoItem label="IBAN Cadastrado" value={selectedUser.iban || "Nenhum dado disponível"} color="text-blue-400 font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <span className="text-xs font-bold text-gray-400 uppercase">Saldo em Carteira</span>
               <span className="text-xl font-black text-emerald-400 italic">{formatMoney(selectedUser.balance)}</span>
            </div>

            <button
              onClick={toggleUserBlock}
              className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                selectedUser.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {selectedUser.isBlocked ? "Restaurar Acesso" : "Bloquear Acesso"}
            </button>

            <div className="border-t border-gray-800 pt-6 space-y-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ajuste Manual de Ativos</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-gray-900 border border-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button disabled={submitting} className="px-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl active:scale-95" onClick={() => adjustBalance("ADD")}>
                  <Plus size={20} weight="bold" />
                </button>
                <button disabled={submitting} className="px-6 bg-red-600 hover:bg-red-700 rounded-xl active:scale-95" onClick={() => adjustBalance("SUBTRACT")}>
                  <Minus size={20} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ title, value, money, border, icon }: any) {
  return (
    <div className={`bg-gray-950 border border-gray-800 ${border} border-l-4 rounded-2xl p-6 shadow-lg`}>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
      </div>
      <h2 className="text-2xl font-black italic">
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function InfoItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{label}</p>
      <p className={`font-bold ${color || "text-gray-300"} truncate`}>{value}</p>
    </div>
  )
}

function StatusBadge({ blocked }: { blocked?: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
      blocked ? "bg-red-600/20 text-red-400 border border-red-500/20" : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
    }`}>
      {blocked ? "Restrito" : "Operacional"}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value || 0)
}