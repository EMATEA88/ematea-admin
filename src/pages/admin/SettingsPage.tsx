
import { useState } from "react"

import BanksPage from "./Banks"
import SalesSettingsPage from "../SalesSettingsPage"
import ExchangeRatesPage from "./ExchangeRatesPage"
import AdminAccountDeletion from "./AdminAccountDeletion"

type SettingsTab =
  | "BANKS"
  | "SALES_LIMIT"
  | "EXCHANGE_RATES"
  | "ACCOUNT_DELETION"

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "BANKS", label: "Bancos" },
  { id: "SALES_LIMIT", label: "Limite de Vendas" },
  { id: "EXCHANGE_RATES", label: "Taxas de Câmbio" },
  { id: "ACCOUNT_DELETION", label: "Eliminar Utilizador" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("BANKS")

  return (
    <div className="w-full">

      {/* NAVEGAÇÃO DAS DEFINIÇÕES */}
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
        {activeTab === "BANKS" && <BanksPage />}

        {activeTab === "SALES_LIMIT" && <SalesSettingsPage />}

        {activeTab === "EXCHANGE_RATES" && <ExchangeRatesPage />}

        {activeTab === "ACCOUNT_DELETION" && <AdminAccountDeletion />}
      </div>

    </div>
  )
}
