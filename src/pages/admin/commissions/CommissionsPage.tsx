
import { useState } from "react"

import AdminCommissionsPage from "./AdminCommissionsPage"
import CommissionAgentsPage from "./CommissionAgents"
import ClientCommissionsPage from "../ClientCommissionsPage"
import CommissionSubAgentsPage from "./CommissionSubAgents"
import SubAgentSalariesPage from "../SubAgentSalariesPage"

type CommissionTab =
  | "GENERAL"
  | "AGENTS"
  | "CLIENTS"
  | "SUB_AGENTS"
  | "SALARIES"

const tabs: { id: CommissionTab; label: string }[] = [
  { id: "GENERAL", label: "Comissão Geral" },
  { id: "AGENTS", label: "Comissão Agentes" },
  { id: "CLIENTS", label: "Comissão Clientes" },
  { id: "SUB_AGENTS", label: "Comissão Sub-Agentes" },
  { id: "SALARIES", label: "Salários & Bónus" },
]

export default function CommissionsPage() {
  const [activeTab, setActiveTab] =
    useState<CommissionTab>("GENERAL")

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
        {activeTab === "GENERAL" && <AdminCommissionsPage />}

        {activeTab === "AGENTS" && <CommissionAgentsPage />}

        {activeTab === "CLIENTS" && <ClientCommissionsPage />}

        {activeTab === "SUB_AGENTS" && <CommissionSubAgentsPage />}

        {activeTab === "SALARIES" && <SubAgentSalariesPage />}
      </div>

    </div>
  )
}
