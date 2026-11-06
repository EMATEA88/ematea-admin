
import { useState } from "react"

import UsersGeneral from "./UsersGeneral"
import Agents from "./Agents"
import Clients from "./Clients"
import SubAgents from "./SubAgents"

type UserTab = "GENERAL" | "AGENTS" | "CLIENTS" | "SUB_AGENTS"

const tabs: { id: UserTab; label: string }[] = [
  { id: "GENERAL", label: "Geral" },
  { id: "AGENTS", label: "Agentes" },
  { id: "CLIENTS", label: "Clientes" },
  { id: "SUB_AGENTS", label: "Sub-Agentes" },
]

export default function Users() {
  const [activeTab, setActiveTab] = useState<UserTab>("GENERAL")

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

      {/* APRESENTAÇÃO DAS PÁGINAS ORIGINAIS */}
      <div>
        {activeTab === "GENERAL" && <UsersGeneral />}

        {activeTab === "AGENTS" && <Agents />}

        {activeTab === "CLIENTS" && <Clients />}

        {activeTab === "SUB_AGENTS" && <SubAgents />}
      </div>

    </div>
  )
}
