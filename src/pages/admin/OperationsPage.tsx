
import { useState } from "react"

import Recharges from "./Recharges"
import Withdrawals from "./Withdrawals"
import AdminKYCPage from "./kyc/AdminKYCPage"
import AdminGift from "./Gifts"

type OperationsTab =
  | "DEPOSITS"
  | "WITHDRAWALS"
  | "KYC"
  | "GIFT"

const tabs: { id: OperationsTab; label: string }[] = [
  { id: "DEPOSITS", label: "Depósitos" },
  { id: "WITHDRAWALS", label: "Levantamentos" },
  { id: "KYC", label: "KYC" },
  { id: "GIFT", label: "Gift" },
]

export default function OperationsPage() {
  const [activeTab, setActiveTab] =
    useState<OperationsTab>("DEPOSITS")

  return (
    <div className="w-full">

      {/* NAVEGAÇÃO DAS OPERAÇÕES */}
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
        {activeTab === "DEPOSITS" && <Recharges />}

        {activeTab === "WITHDRAWALS" && <Withdrawals />}

        {activeTab === "KYC" && <AdminKYCPage />}

        {activeTab === "GIFT" && <AdminGift />}
      </div>

    </div>
  )
}
