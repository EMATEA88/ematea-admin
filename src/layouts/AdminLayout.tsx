import { Outlet, useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/admin/Sidebar"
import Topbar from "../components/admin/Topbar"
import { Menu, X } from "lucide-react"

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Fecha o menu ao mudar de página
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Abre e fecha o menu com gestos
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - touchStartX.current
    const deltaY = Math.abs(endY - touchStartY.current)

    // Evita confundir um gesto vertical com um gesto horizontal
    if (deltaY > 80 || Math.abs(deltaX) < 60) return

    // Abrir: deslizar da margem esquerda para a direita
    if (!open && touchStartX.current < 40 && deltaX > 0) {
      setOpen(true)
    }

    // Fechar: deslizar da direita para a esquerda
    if (open && deltaX < -80) {
      setOpen(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0B0E11] text-white flex"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:flex lg:w-64 lg:min-h-screen border-r border-[#1E2329]">
        <Sidebar />
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Tocar fora fecha o menu */}
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 w-full h-full bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 max-w-[85vw] bg-[#0F1419] border-r border-[#1E2329] shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#1E2329]">
              <span className="font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-col flex-1 min-h-screen min-w-0">
        <div className="h-16 flex items-center justify-between border-b border-[#1E2329] bg-[#0B0E11] px-4 lg:px-6 flex-shrink-0">
          <button
            type="button"
            aria-label="Abrir menu"
            className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Topbar />
        </div>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#0B0E11]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}