
import { useState } from "react"

import AkiDashboardPage from "./AkiAccountPage"
import AkiReportsPage from "./AkiReportsPage"
import AkiOrderQueryPage from "./AkiOrderQueryPage"

type FiveLinesTab =
  | "ACCOUNT"
  | "REPORTS"
  | "ORDER_QUERY"

const tabs: { id: FiveLinesTab; label: string }[] = [
  { id: "ACCOUNT", label: "Conta 5Linhas" },
  { id: "REPORTS", label: "Relatórios 5Linhas" },
  { id: "ORDER_QUERY", label: "Consultar Ordens AKI" },
]

export default function FiveLinesPage() {
  const [activeTab, setActiveTab] =
    useState<FiveLinesTab>("ACCOUNT")

  return (
    <div className="w-full">

      {/* NAVEGAÇÃO DAS CATEGORIAS */}
      <div className="px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-5">
          {tabs.map((tab) => {
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={active}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-[#161A1F] text-gray-400 border-white/5 hover:text-white hover:bg-[#1C2128]"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* PÁGINAS ORIGINAIS */}
      <div>
        {activeTab === "ACCOUNT" && <AkiDashboardPage />}

        {activeTab === "REPORTS" && <AkiReportsPage />}

        {activeTab === "ORDER_QUERY" && <AkiOrderQueryPage />}
      </div>

    </div>
  )
}
