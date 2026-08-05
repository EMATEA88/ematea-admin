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
  ShieldCheck,
  Eye,
  FileText
} from "@phosphor-icons/react"

interface User {
  id: number
  phone: string
  email: string
  balance: number
  role: string
  isBlocked?: boolean
  fullName?: string
  name?: string
  iban?: string
  createdAt?: string
  bankName?: string
  verification?: {
    status: string
    frontImage: string
    backImage: string
    selfieImage: string
    fullName?: string
    rejectionReason?: string
  }
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  
  const [previewImage, setPreviewImage] = useState<{ src: string; label: string } | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const response = await AdminService.users()
      const list = response?.items || []
      setUsers(list)
    } catch {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  // Função auxiliar para extrair o nome de qualquer propriedade possível do backend
  const getUserName = (u: User) => {
    return u.fullName || u.name || u.verification?.fullName || ""
  }

  // Filtro completo cobrindo ID, Nome, Email e Telefone
  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    const nameMatch = getUserName(u).toLowerCase()
    const phoneMatch = (u.phone || "").toLowerCase()
    const emailMatch = (u.email || "").toLowerCase()
    const idMatch = String(u.id).toLowerCase()

    return (
      idMatch.includes(s) ||
      phoneMatch.includes(s) ||
      nameMatch.includes(s) ||
      emailMatch.includes(s)
    )
  })

  async function openUser(id: number) {
    try {
      const data = await AdminService.userDetails(id)
      setSelectedUser(data)
    } catch {
      toast.error("Erro ao carregar detalhes do usuário")
    }
  }

  async function toggleUserBlock() {
    if (!selectedUser) return
    try {
      if (selectedUser.isBlocked) {
        await AdminService.unblockUser(selectedUser.id)
        toast.success("Usuário desbloqueado com sucesso")
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
      toast.error("Insira um valor válido")
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
      toast.success("Saldo atualizado com sucesso")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao ajustar saldo")
    } finally {
      setSubmitting(false)
    }
  }

  const totalUsers = users.length
  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0)
  const blockedUsers = users.filter((u) => u.isBlocked).length

  return (
    <div className="p-10 space-y-8 max-w-7xl mx-auto text-gray-100 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-white tracking-tight uppercase">
          Gestão de Utilizadores
        </h1>
        <p className="text-gray-400 text-sm">
          Administração centralizada de perfis, saldos, acessos e auditoria de identidade.
        </p>
      </div>

      {/* KPIS */}
      <div className="grid md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
          </>
        ) : (
          <>
            <KpiCard title="Total de Utilizadores" value={totalUsers} border="border-blue-500" icon={<UsersIcon size={20}/>} />
            <KpiCard title="Saldo Acumulado (Geral)" value={totalBalance} money border="border-emerald-500" icon={<Wallet size={20}/>} />
            <KpiCard title="Utilizadores Bloqueados" value={blockedUsers} border="border-red-500" icon={<UserMinus size={20}/>} />
          </>
        )}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full bg-[#161A1F] border border-white/5 px-12 py-3 rounded-xl focus:outline-none focus:border-emerald-500/50 text-sm transition-all text-white placeholder-gray-500"
            placeholder="Pesquisar por ID, nome, email ou telemóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#161A1F] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0B0E11] text-gray-400 uppercase text-[10px] tracking-wider border-b border-white/5">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Identidade / Telefone</th>
              <th className="p-4 text-left">Nome Completo</th>
              <th className="p-4 text-left">Tipo</th>
              <th className="p-4 text-left">Saldo Atual</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              filteredUsers.map((u) => {
                const displayName = getUserName(u);
                return (
                  <tr 
                    key={u.id} 
                    className="hover:bg-[#1C2128] transition cursor-pointer" 
                    onClick={() => openUser(u.id)}
                  >
                    <td className="p-4 text-gray-500 font-mono text-xs">#{u.id}</td>
                    <td className="p-4 font-bold text-blue-400 tracking-tight">{u.phone}</td>
                    <td className="p-4 text-gray-200 font-medium">
                      {displayName ? (
                        displayName
                      ) : (
                        <span className="text-gray-600 italic">Não preenchido</span>
                      )}
                    </td>
                    <td className="p-4">
                      <UserTypeBadge role={u.role} />
                    </td>
                    <td className="p-4 font-bold text-emerald-400">{formatMoney(u.balance)}</td>
                    <td className="p-4">
                      <StatusBadge blocked={u.isBlocked} />
                    </td>
                  </tr>
                )
              })
            )}
            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 text-xs">
                  Nenhum utilizador encontrado com os critérios de pesquisa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALHES DO UTILIZADOR */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161A1F] border border-white/10 rounded-[2rem] w-full max-w-2xl p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            
            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-white/5 rounded-full hover:bg-white/10 transition cursor-pointer">
              <X size={20} weight="bold" />
            </button>

            <header className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-tight break-words pr-8 text-white">
                {getUserName(selectedUser) || selectedUser.phone}
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Painel de Controlo do Perfil</p>
            </header>

            <div className="grid grid-cols-2 gap-4 text-sm bg-[#0B0E11] p-5 rounded-2xl border border-white/5">
              <InfoItem label="ID do Sistema" value={`#${selectedUser.id}`} />
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Tipo / Cargo</p>
                <div className="mt-1"><UserTypeBadge role={selectedUser.role} /></div>
              </div>
              <InfoItem label="Correio Eletrónico" value={selectedUser.email || "Não definido"} />
              <InfoItem label="Instituição Bancária" value={selectedUser.bankName || "Não vinculado"} />
              <div className="col-span-2">
                 <InfoItem label="IBAN Registado" value={selectedUser.iban || "Nenhum IBAN associado"} color="text-blue-400 font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
               <span className="text-xs font-bold text-gray-400 uppercase">Saldo Ativo em Carteira</span>
               <span className="text-xl font-black text-emerald-400">{formatMoney(selectedUser.balance)}</span>
            </div>

            <button
              onClick={toggleUserBlock}
              className={`w-full py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all cursor-pointer shadow-lg ${
                selectedUser.isBlocked ? "bg-emerald-600 hover:bg-emerald-500 text-black" : "bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20"
              }`}
            >
              {selectedUser.isBlocked ? "Restaurar Acesso à Conta" : "Bloquear Acesso do Utilizador"}
            </button>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Identidade & Documentação (KYC)
                </span>
                {selectedUser.verification ? (
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedUser.verification.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {selectedUser.verification.status}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 italic">Não submetido</span>
                )}
              </div>

              {selectedUser.verification ? (
                <div className="grid grid-cols-3 gap-3">
                  <DocumentThumbnail 
                    label="Frente do BI" 
                    src={selectedUser.verification.frontImage} 
                    onZoom={() => setPreviewImage({ src: selectedUser.verification!.frontImage, label: "Documento - Frente" })} 
                  />
                  <DocumentThumbnail 
                    label="Verso do BI" 
                    src={selectedUser.verification.backImage} 
                    onZoom={() => setPreviewImage({ src: selectedUser.verification!.backImage, label: "Documento - Verso" })} 
                  />
                  <DocumentThumbnail 
                    label="Selfie Biométrica" 
                    src={selectedUser.verification.selfieImage} 
                    onZoom={() => setPreviewImage({ src: selectedUser.verification!.selfieImage, label: "Selfie de Confirmação" })} 
                  />
                </div>
              ) : (
                <div className="bg-[#0B0E11] p-4 rounded-xl border border-white/5 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                  <FileText size={16} />
                  Este utilizador ainda não realizou o processo de verificação de identidade.
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6 space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ajuste Manual de Ativos (Saldo)</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="0.00"
                  className="flex-1 bg-[#0B0E11] border border-white/5 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-sm text-white placeholder-gray-600"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button 
                  disabled={submitting} 
                  className="px-5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl active:scale-95 transition flex items-center justify-center cursor-pointer disabled:opacity-50" 
                  onClick={() => adjustBalance("ADD")}
                  title="Adicionar Saldo"
                >
                  <Plus size={18} weight="bold" />
                </button>
                <button 
                  disabled={submitting} 
                  className="px-5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold rounded-xl active:scale-95 transition flex items-center justify-center cursor-pointer disabled:opacity-50" 
                  onClick={() => adjustBalance("SUBTRACT")}
                  title="Remover Saldo"
                >
                  <Minus size={18} weight="bold" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DE IMAGEM */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative bg-[#161A1F] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {previewImage.label}
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-center bg-[#0B0E11] rounded-xl overflow-hidden border border-white/5 p-4 max-h-[75vh]">
              <img 
                src={previewImage.src} 
                alt={previewImage.label} 
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function KpiCard({ title, value, money, border, icon }: any) {
  return (
    <div className={`bg-[#161A1F] border border-white/5 ${border} border-l-4 rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight">
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function SkeletonKpi() {
  return (
    <div className="bg-[#161A1F] border border-white/5 border-l-4 border-l-white/10 rounded-2xl p-6 shadow-xl animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-white/5 rounded" />
        <div className="w-28 h-3 bg-white/5 rounded" />
      </div>
      <div className="w-36 h-7 bg-white/5 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      <td className="p-4"><div className="w-8 h-4 bg-white/5 rounded" /></td>
      <td className="p-4"><div className="w-32 h-4 bg-white/5 rounded" /></td>
      <td className="p-4"><div className="w-48 h-4 bg-white/5 rounded" /></td>
      <td className="p-4"><div className="w-16 h-6 bg-white/5 rounded-full" /></td>
      <td className="p-4"><div className="w-24 h-4 bg-white/5 rounded" /></td>
      <td className="p-4"><div className="w-20 h-6 bg-white/5 rounded-full" /></td>
    </tr>
  )
}

function InfoItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`font-semibold ${color || "text-gray-200"} truncate text-sm mt-0.5`}>{value}</p>
    </div>
  )
}

function UserTypeBadge({ role }: { role: string }) {
  const r = (role || "").toLowerCase()
  
  let label = "Cliente"
  let colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20"

  if (r.includes("admin")) {
    label = "Admin"
    colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20"
  } else if (r.includes("sub") || r.includes("subagent")) {
    label = "Sub-agente"
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20"
  } else if (r.includes("agent") || r.includes("agente")) {
    label = "Agente"
    colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${colorClass}`}>
      {label}
    </span>
  )
}

function StatusBadge({ blocked }: { blocked?: boolean }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
      blocked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }`}>
      {blocked ? "Restrito" : "Operacional"}
    </span>
  )
}

function DocumentThumbnail({ label, src, onZoom }: { label: string; src: string; onZoom: () => void }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-medium text-gray-400 block truncate">{label}</span>
      <div 
        onClick={onZoom}
        className="group relative h-28 bg-[#0B0E11] rounded-xl overflow-hidden border border-white/5 cursor-pointer flex items-center justify-center transition-all hover:border-white/20"
      >
        <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <Eye size={18} />
        </div>
      </div>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value || 0)
}