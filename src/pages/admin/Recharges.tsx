import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Recharge {
  id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  image: string | null
  user?: {
    phone: string
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
        : response?.items ?? []

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

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'APPROVED' }
            : item
        )
      )

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

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'REJECTED' }
            : item
        )
      )

    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao rejeitar')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-gray-400">
        Carregando recargas...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-bold tracking-tight">
        Depósitos
      </h1>

      {/* TABLE CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">

        <table className="w-full text-sm">

          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Usuário</th>
              <th className="p-4 text-left">Valor</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ação</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma recarga encontrada
                </td>
              </tr>
            )}

            {items.map((r) => {

              const isApproving =
                processing?.id === r.id && processing.action === 'approve'

              const isRejecting =
                processing?.id === r.id && processing.action === 'reject'

              return (
                <tr
                  key={r.id}
                  className="
                    border-t border-gray-800
                    hover:bg-gray-800/40
                    transition duration-200
                  "
                >

                  <td className="p-4 text-gray-400 text-xs">
                    #{r.id}
                  </td>

                  <td className="p-4 font-semibold">
                    {r.user?.phone || '—'}
                  </td>

                  <td className="p-4 text-emerald-400 font-semibold">
                    {formatMoney(r.amount)}
                  </td>

                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="p-4 flex gap-2">

                    {r.status === 'PENDING' && (
                      <>
                        <button
                          disabled={!!processing}
                          onClick={() => approve(r.id)}
                          className="
                            bg-emerald-600
                            hover:bg-emerald-700
                            disabled:opacity-50
                            text-white
                            px-3 py-1
                            rounded-lg
                            text-xs
                            transition
                          "
                        >
                          {isApproving ? 'Processando...' : 'Aprovar'}
                        </button>

                        <button
                          disabled={!!processing}
                          onClick={() => reject(r.id)}
                          className="
                            bg-red-600
                            hover:bg-red-700
                            disabled:opacity-50
                            text-white
                            px-3 py-1
                            rounded-lg
                            text-xs
                            transition
                          "
                        >
                          {isRejecting ? 'Processando...' : 'Rejeitar'}
                        </button>
                      </>
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

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {

  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-600/20 text-yellow-400',
    APPROVED: 'bg-emerald-600/20 text-emerald-400',
    REJECTED: 'bg-red-600/20 text-red-400',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-600/20 text-gray-400'}`}>
      {status}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value ?? 0)
}