import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Recharge {
  id: number
  amount: number | string
  currency?: string
  method?: string
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

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : []

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

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'APPROVED' } : item
        )
      )

      toast.success('Recarga aprovada')

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

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'REJECTED' } : item
        )
      )

      toast.success('Recarga rejeitada')

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
              <th className="p-4 text-left">Valor</th>
              <th className="p-4 text-left">Método</th>
              <th className="p-4 text-left">Comprovativo</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/50">
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-500 italic">
                  Nenhuma recarga encontrada
                </td>
              </tr>
            )}

            {items.map((r) => {
              const isApproving = processing?.id === r.id && processing.action === 'approve'
              const isRejecting = processing?.id === r.id && processing.action === 'reject'

              const currency = String(r.currency || 'AOA').toUpperCase().trim()
              const method = String(r.method || 'BANK').toUpperCase()
              const amount = Number(r.amount || 0)

              const isUSDT = currency === 'USDT' || currency === 'USDC'

              return (
                <tr key={r.id} className="hover:bg-gray-800/20 transition">
                  <td className="p-4 text-gray-500 text-xs font-mono">#{r.id}</td>

                  <td className="p-4 font-semibold text-gray-200">
                    {r.user?.phone || '—'}
                  </td>

                  {/* VALOR */}
                  <td className={`p-4 font-bold ${isUSDT ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {isUSDT
                      ? `${amount.toFixed(2)} USDT`
                      : new Intl.NumberFormat("pt-AO", {
                          style: "currency",
                          currency: "AOA"
                        }).format(amount)}
                  </td>

                  {/* MÉTODO */}
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      method === 'CRYPTO'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {method}
                    </span>
                  </td>

                  {/* COMPROVATIVO */}
                  <td className="p-4">
                    {r.image ? (
                      <button
                        onClick={() => window.open(r.image!, '_blank')}
                        className="text-cyan-400 text-xs"
                      >
                        VER
                      </button>
                    ) : (
                      <span className="text-gray-600 text-xs">SEM</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* AÇÕES */}
                  <td className="p-4 text-right">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          disabled={!!processing}
                          onClick={() => approve(r.id)}
                          className="bg-emerald-600 px-3 py-1 text-xs rounded"
                        >
                          {isApproving ? '...' : 'Aprovar'}
                        </button>

                        <button
                          disabled={!!processing}
                          onClick={() => reject(r.id)}
                          className="bg-red-600 px-3 py-1 text-xs rounded"
                        >
                          {isRejecting ? '...' : 'Rejeitar'}
                        </button>
                      </div>
                    )}
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
    PENDING: 'bg-amber-500/10 text-amber-500',
    APPROVED: 'bg-emerald-500/10 text-emerald-400',
    REJECTED: 'bg-red-500/10 text-red-400',
  }

  return (
    <span className={`px-2 py-1 text-xs rounded ${styles[status] || ''}`}>
      {status}
    </span>
  )
}