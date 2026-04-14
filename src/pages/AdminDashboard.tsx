import { useEffect, useState } from 'react'
import * as adminService from '../services/adminService'

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [tasks, statData] = await Promise.all([
        adminService.getPendingTasks(),
        adminService.getAdminStats()
      ])
      setPending(tasks)
      setStats(statData)
    } catch (err) {
      alert('Erro ao carregar dados do Admin')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: number, action: 'APPROVE' | 'REJECT') {
    if (!confirm(`Deseja realmente ${action === 'APPROVE' ? 'APROVAR' : 'REJEITAR'} esta tarefa?`)) return

    try {
      await adminService.reviewTask(id, action)
      alert('Sucesso!')
      loadData() // Recarrega a lista
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="p-10 text-white">Carregando Painel EMATEA...</div>

  return (
    <div className="p-6 bg-[#0B0E11] min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-[#FCD535]">Painel Administrativo EMATEA</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Usuários Totais</p>
          <p className="text-2xl font-bold">{stats?.totalUsers}</p>
        </div>
        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Tarefas Pendentes</p>
          <p className="text-2xl font-bold text-orange-400">{pending.length}</p>
        </div>
        <div className="bg-[#1E2329] p-4 rounded-xl border border-[#2B3139]">
          <p className="text-gray-400 text-sm">Conclusões com Sucesso</p>
          <p className="text-2xl font-bold text-green-400">{stats?.totalCompleted}</p>
        </div>
      </div>

      {/* LISTA DE PENDÊNCIAS */}
      <h2 className="text-xl font-semibold mb-4 text-gray-300">Aprovações Pendentes</h2>
      <div className="space-y-4">
        {pending.length === 0 && <p className="text-gray-500 italic">Nenhuma tarefa aguardando revisão.</p>}
        
        {pending.map((item) => (
          <div key={item.id} className="bg-[#1E2329] border border-[#2B3139] p-6 rounded-2xl flex flex-col md:flex-row gap-6">
            {/* Imagem da Prova */}
            <div className="md:w-1/3">
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Prova Enviada:</p>
              {item.proofType === 'IMAGE' ? (
                <img 
                  src={item.proof} 
                  alt="Prova" 
                  className="w-full h-48 object-cover rounded-xl border border-[#2B3139] cursor-pointer"
                  onClick={() => window.open(item.proof, '_blank')}
                />
              ) : (
                <a href={item.proof} target="_blank" className="text-blue-400 underline">{item.proof}</a>
              )}
            </div>

            {/* Detalhes do Usuário e Tarefa */}
            <div className="flex-1">
              <h3 className="text-lg font-bold">{item.task.title}</h3>
              <p className="text-sm text-gray-400 mb-2">Usuário: <b>{item.user.name}</b> ({item.user.phone})</p>
              <p className="text-[#FCD535] font-bold text-lg">{item.task.reward} Kz</p>
              
              <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => handleReview(item.id, 'APPROVE')}
                  className="bg-[#02C076] hover:bg-[#02a867] text-white px-6 py-2 rounded-xl font-bold transition-all"
                >
                  Aprovar e Pagar
                </button>
                <button 
                  onClick={() => handleReview(item.id, 'REJECT')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-all"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}