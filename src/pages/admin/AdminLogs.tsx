import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"
import type { AdminLogItem } from "../../services/admin.service"
import { Shield, MagnifyingGlass, ArrowClockwise, CaretLeft, CaretRight, User as UserIcon } from "@phosphor-icons/react"

export default function AdminLogs() {
  const [items, setItems] = useState<AdminLogItem[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [actionFilter, setActionFilter] = useState("")
  const [entityFilter, setEntityFilter] = useState("")

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.logs(
        page,
        20,
        actionFilter || undefined,
        entityFilter || undefined
      )

      setItems(res.items)
      setTotalPages(res.totalPages)

    } catch (err) {
      console.error("Erro ao carregar logs", err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page])

  function applyFilters() {
    setPage(1)
    load()
  }

  return (
    <div className="p-10 bg-[#0B0E11] min-h-screen text-white space-y-10 max-w-[1600px] mx-auto font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
              Auditoria de Segurança
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs font-mono">Registo de Atividades</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-white">
            Logs Administrativos
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            Monitore todas as ações e alterações executadas pelos administradores na plataforma.
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-[#161A1F] hover:bg-[#1C2128] text-white px-5 py-3 rounded-2xl border border-white/5 text-xs font-bold uppercase tracking-wider transition-all shadow-xl disabled:opacity-50 cursor-pointer"
        >
          <ArrowClockwise size={16} className={`text-blue-400 ${loading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full md:w-80">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Filtrar por ação..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-[#161A1F] border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
          />
        </div>

        <div className="relative w-full md:w-80">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Filtrar por entidade..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full bg-[#161A1F] border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
          />
        </div>

        <button
          onClick={applyFilters}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#161A1F] border border-white/5 rounded-[2rem] shadow-xl overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-16 space-y-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="bg-[#0B0E11] text-gray-400 border-b border-white/5 text-xs uppercase tracking-wider font-black">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Admin</th>
                  <th className="px-6 py-4 text-left">Ação</th>
                  <th className="px-6 py-4 text-left">Entidade</th>
                  <th className="px-6 py-4 text-left">Data</th>
                  <th className="px-6 py-4 text-left">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Shield size={32} className="text-gray-600" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Nenhum log encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="px-6 py-4 text-blue-400 text-xs font-mono font-bold">
                        #{log.id}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <UserIcon size={12} />
                          </div>
                          <span className="font-mono text-xs">{log.admin?.phone || "-"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        <span className="font-semibold">{log.entity || "-"}</span>
                        {log.entityId && (
                          <span className="text-blue-400 ml-2 text-xs font-mono font-bold">
                            #{log.entityId}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                        {new Date(log.createdAt).toLocaleString("pt-AO")}
                      </td>

                      <td className="px-6 py-4">
                        {log.metadata ? (
                          <pre className="text-xs bg-[#0B0E11] border border-white/5 p-3 rounded-xl max-w-xs overflow-auto text-gray-400 font-mono shadow-inner">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-gray-600 font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-6 bg-[#0B0E11] border-t border-white/5 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161A1F] hover:bg-[#1C2128] text-white border border-white/5 disabled:opacity-30 transition cursor-pointer text-xs font-bold uppercase tracking-wider"
          >
            <CaretLeft size={16} />
            Anterior
          </button>

          <span className="text-gray-400 text-xs font-mono">
            Página <strong className="text-white">{page}</strong> de <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161A1F] hover:bg-[#1C2128] text-white border border-white/5 disabled:opacity-30 transition cursor-pointer text-xs font-bold uppercase tracking-wider"
          >
            Próxima
            <CaretRight size={16} />
          </button>
        </div>

      </div>

    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse py-4 border-b border-white/5 last:border-none">
      <div className="w-12 h-4 bg-white/5 rounded" />
      <div className="w-36 h-4 bg-white/5 rounded" />
      <div className="w-24 h-6 bg-white/5 rounded-full" />
      <div className="w-32 h-4 bg-white/5 rounded" />
      <div className="w-36 h-4 bg-white/5 rounded" />
      <div className="w-48 h-12 bg-white/5 rounded-xl" />
    </div>
  )
}