import { Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Sidebar from "../components/admin/Sidebar"
import Topbar from "../components/admin/Topbar"
import { Menu, X } from "lucide-react"

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Fecha automaticamente ao mudar de rota
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen w-full bg-[#0B0E11] text-white flex">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:flex lg:w-64 lg:min-h-screen border-r border-[#1E2329]">
        <Sidebar />
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-64 bg-[#0F1419] border-r border-[#1E2329] shadow-2xl flex flex-col">

            <div className="flex justify-between items-center p-4 border-b border-[#1E2329]">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Scroll real */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>

          </div>
        </div>
      )}

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <div className="flex flex-col flex-1 min-h-screen">

        {/* TOPBAR */}
        <div className="h-16 flex items-center justify-between border-b border-[#1E2329] bg-[#0B0E11] px-4 lg:px-6 flex-shrink-0">

          {/* Botão mobile */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Topbar />
        </div>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#0B0E11]">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  )
}