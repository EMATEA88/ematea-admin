import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Recharge {
  id: number
  amount: number
  currency: 'AOA' | 'USDT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  image: string | null
  user?: {
    phone: string
    fullName?: string
  }
}

type ProcessingState = {
  id: number
  action: 'approve' | 'reject'
} | null

export default function Recharges() {
  const [items, setItems] = useState<Recharge[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<ProcessingState>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const response = await AdminService.recharges()
      console.log("DADOS DA API:", response) // 🟢 Verifique o console F12
      const list = Array.isArray(response) ? response : response?.items ?? []
      setItems(list)
    } catch {
      toast.error('Erro ao carregar recargas')
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: number) {
    if (processing) return
    try {
      setProcessing({ id, action: 'approve' })
      await AdminService.approveRecharge(id)
      toast.success('Recarga aprovada')
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item))
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao aprovar')
    } finally {
      setProcessing(null)
    }
  }

  async function reject(id: number) {
    if (processing) return
    try {
      setProcessing({ id, action: 'reject' })
      await AdminService.rejectRecharge(id)
      toast.success('Recarga rejeitada')
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED' } : item))
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao rejeitar')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400 font-medium">Sincronizando...</span>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">
      <h1 className="text-3xl font-bold tracking-tight">Depósitos</h1>

      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Usuário</th>
              <th className="p-4 text-left">Valor / Moeda</th>
              <th className="p-4 text-left">Comprovativo</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50">
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500 italic">Nenhuma recarga encontrada</td>
              </tr>
            )}

            {items.map((r) => {
              const isApproving = processing?.id === r.id && processing.action === 'approve'
              const isRejecting = processing?.id === r.id && processing.action === 'reject'
              
              // 🔍 Logica de detecção de moeda
              const rawCurrency = (r as any).currency || (r as any).Currency || 'AOA'
              const isUSDT = String(rawCurrency).trim().toUpperCase() === 'USDT'

              return (
                <tr key={r.id} className="hover:bg-gray-800/20 transition duration-150">
                  <td className="p-4 text-gray-500 text-xs font-mono">#{r.id}</td>
                  <td className="p-4 font-semibold text-gray-200">{r.user?.phone || '—'}</td>
                  
                  {/* VALOR DINÂMICO */}
                  <td className={`p-4 font-bold text-base ${isUSDT ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {isUSDT ? (
                      <span className="flex items-center gap-1">
                        {Number(r.amount).toFixed(2)}
                        <span className="text-[10px] bg-cyan-500/10 px-1 rounded text-cyan-500 font-black">USDT</span>
                      </span>
                    ) : (
                      <span>
                        {new Intl.NumberFormat("pt-AO", { 
                          style: "currency", 
                          currency: "AOA" 
                        }).format(r.amount || 0)}
                      </span>
                    )}
                  </td>

                  {/* COMPROVATIVO */}
                  <td className="p-4">
                    {r.image ? (
                      <button
                        onClick={() => window.open(r.image!, '_blank')}
                        className="text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-all shadow-sm"
                      >
                        📄 VER PRINT
                      </button>
                    ) : (
                      <span className="text-gray-600 text-[10px] italic font-medium">SEM ANEXO</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* AÇÕES */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            disabled={!!processing}
                            onClick={() => approve(r.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                          >
                            {isApproving ? '...' : 'Aprovar'}
                          </button>

                          <button
                            disabled={!!processing}
                            onClick={() => reject(r.id)}
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white disabled:bg-gray-800 px-4 py-1.5 rounded-lg text-xs font-bold border border-red-600/20 transition-all"
                          >
                            {isRejecting ? '...' : 'Rejeitar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
      {status}
    </span>
  )
}