import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash, X, FloppyDisk, Bank as BankIcon, ShieldCheck, ArrowsClockwise } from '@phosphor-icons/react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Bank {
  id: number
  name: string
  bank: string
  iban: string
  createdAt: string
}

export default function Banks() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '',
    bank: '',
    iban: '',
  })

  // ================= LOAD =================

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await AdminService.banks()
      setBanks(Array.isArray(data) ? data : data?.items ?? [])
    } catch {
      toast.error('Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBanks()
  }, [loadBanks])

  // ================= FORM =================

  function resetForm() {
    setForm({ name: '', bank: '', iban: '' })
    setEditingId(null)
  }

  function handleEdit(bank: Bank) {
    setEditingId(bank.id)
    setForm({
      name: bank.name,
      bank: bank.bank,
      iban: bank.iban,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.bank || !form.iban) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        await AdminService.updateBank(editingId, form)
        toast.success('Banco atualizado com sucesso')
      } else {
        await AdminService.createBank(form)
        toast.success('Banco adicionado com sucesso')
      }

      resetForm()
      await loadBanks()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Erro ao salvar banco'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deseja eliminar este banco?')) return

    try {
      await AdminService.deleteBank(id)
      setBanks(prev => prev.filter(b => b.id !== id))
      toast.success('Banco removido com sucesso')
    } catch {
      toast.error('Erro ao remover banco')
    }
  }

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Gestão Financeira & Operacional
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Gestão de Bancos
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Contas bancárias oficiais configuradas para depósitos e levantamentos na plataforma.
          </p>
        </div>

        <button 
          onClick={loadBanks}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 transition-all shadow-xl font-bold text-xs uppercase tracking-wider"
        >
          <ArrowsClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* FORM CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              {editingId ? 'Editar Conta Bancária' : 'Adicionar Nova Conta Bancária'}
            </h2>
            <p className="text-xs text-gray-500">Preencha os dados rigorosamente para evitar falhas em transações</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <BankIcon size={20} className="text-emerald-400" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome do Titular</label>
            <input
              className="w-full bg-[#0B0E11] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
              placeholder="Ex: Empresa Lda / Nome Completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instituição Bancária</label>
            <input
              className="w-full bg-[#0B0E11] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
              placeholder="Ex: BAI, BFA, BIC..."
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Número de IBAN</label>
            <input
              className="w-full bg-[#0B0E11] border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition font-mono"
              placeholder="AO06..."
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg"
            >
              {editingId ? <FloppyDisk size={16} /> : <Plus size={16} />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Banco'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 bg-[#0B0E11] hover:bg-white/5 text-gray-300 border border-white/5 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-white">Bancos Cadastrados</h3>
            <p className="text-xs text-gray-500">Lista ativa disponível para processamento</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
            Total: {banks.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500">
                <th className="py-4 px-6">Titular</th>
                <th className="py-4 px-6">Banco</th>
                <th className="py-4 px-6">IBAN</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    Nenhum banco cadastrado no sistema.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr key={bank.id} className="hover:bg-[#12161B] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      {bank.name}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {bank.bank}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-gray-400">
                      {bank.iban}
                    </td>

                    <td className="py-4 px-6 flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(bank)}
                        className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-bold transition-all"
                        title="Editar"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        onClick={() => handleDelete(bank.id)}
                        className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold transition-all"
                        title="Eliminar"
                      >
                        <Trash size={14} />
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
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-36" /></td>
      <td className="py-4 px-6"><div className="h-5 bg-white/5 rounded-full w-20" /></td>
      <td className="py-4 px-6"><div className="h-4 bg-white/5 rounded w-64" /></td>
      <td className="py-4 px-6 text-right"><div className="h-8 bg-white/5 rounded-xl w-32 ml-auto" /></td>
    </tr>
  )
}