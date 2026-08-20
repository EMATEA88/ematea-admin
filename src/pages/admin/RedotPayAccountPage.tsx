import {
  useEffect,
  useState,
  useCallback
} from "react"

import {
  adminRedotPayService,
  type RedotPayDashboard
} from "../../services/adminRedotPay.service"

import RedotPayOverviewPage from "./RedotPayOverviewPage"
import RedotPayBusinessPage from "./RedotPayBusinessPage"
import RedotPayTransactionsPage from "./RedotPayTransactionsPage"
import RedotPayAuditPage from "./RedotPayAuditPage"

import {
  ShieldCheck,
  Cpu
} from "@phosphor-icons/react"


type Tab =
  | "overview"
  | "business"
  | "transactions"
  | "audit"


export default function RedotPayAccountPage() {

  const [
    activeTab,
    setActiveTab
  ] = useState<Tab>("overview")


  const [
    dashboardData,
    setDashboardData
  ] = useState<RedotPayDashboard | null>(
    null
  )


  const [
    loading,
    setLoading
  ] = useState(true)


  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  const fetchDashboardData =
    useCallback(async () => {

      try {

        setLoading(true)

        const response =
          await adminRedotPayService.getDashboard()

        if (
          !response.data?.success
        ) {

          throw new Error(
            "RedotPay dashboard request failed."
          )

        }

        setDashboardData(
          response.data.data
        )

      } catch (error) {

        console.error(
          "[REDOTPAY ADMIN] Dashboard:",
          error
        )

      } finally {

        setLoading(false)

      }

    }, [])


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    fetchDashboardData()

  }, [fetchDashboardData])


  return (

    <div
      className="
        p-10
        bg-[#0B0E11]
        min-h-screen
        text-white
        space-y-10
        max-w-[1600px]
        mx-auto
        font-sans
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-6
          border-b
          border-white/5
          pb-8
        "
      >

        <div className="space-y-1">

          <div className="flex items-center gap-2">

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                px-2.5
                py-0.5
                rounded-full
                bg-blue-500/10
                text-blue-400
                border
                border-blue-500/25
              "
            >
              Parceria RedotPay
            </span>

            <span className="text-gray-500 text-xs">
              •
            </span>

            <span
              className="
                text-gray-400
                text-xs
                font-mono
              "
            >
              OpenAPI Integration
            </span>

          </div>


          <h1
            className="
              text-3xl
              font-black
              tracking-tight
              uppercase
              text-white
            "
          >
            Painel Geral & Controle RedotPay
          </h1>


          <p
            className="
              text-gray-400
              text-sm
              flex
              items-center
              gap-2
            "
          >

            <ShieldCheck
              size={16}
              className="text-blue-400"
            />

            Gestão unificada de pagamentos,
            reembolsos, chargebacks e webhooks
            via OpenAPI.

          </p>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            bg-[#161A1F]
            p-1.5
            rounded-2xl
            border
            border-white/5
            shadow-xl
            flex-wrap
          "
        >

          <button
            type="button"
            onClick={() =>
              setActiveTab("overview")
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              font-black
              text-xs
              uppercase
              tracking-wider
              transition-all
              cursor-pointer
              ${
                activeTab === "overview"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            Visão Geral & API
          </button>


          <button
            type="button"
            onClick={() =>
              setActiveTab("business")
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              font-black
              text-xs
              uppercase
              tracking-wider
              transition-all
              cursor-pointer
              ${
                activeTab === "business"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            Negócio & Finanças
          </button>


          <button
            type="button"
            onClick={() =>
              setActiveTab("transactions")
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              font-black
              text-xs
              uppercase
              tracking-wider
              transition-all
              cursor-pointer
              ${
                activeTab === "transactions"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            Transações & Webhooks
          </button>


          <button
            type="button"
            onClick={() =>
              setActiveTab("audit")
            }
            className={`
              px-5
              py-2.5
              rounded-xl
              font-black
              text-xs
              uppercase
              tracking-wider
              transition-all
              cursor-pointer
              ${
                activeTab === "audit"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            Auditoria
          </button>

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && !dashboardData ? (

        <div
          className="
            space-y-6
            animate-pulse
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
            "
          >

            <div
              className="
                bg-[#161A1F]
                border
                border-white/5
                rounded-[2rem]
                p-8
                h-40
              "
            />

            <div
              className="
                bg-[#161A1F]
                border
                border-white/5
                rounded-[2rem]
                p-8
                h-40
              "
            />

            <div
              className="
                bg-[#161A1F]
                border
                border-white/5
                rounded-[2rem]
                p-8
                h-40
              "
            />

          </div>


          <div
            className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-12
              h-96
              flex
              items-center
              justify-center
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                text-gray-500
              "
            >

              <Cpu
                className="
                  animate-spin
                  text-blue-400
                "
                size={24}
              />

              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-widest
                "
              >
                Sincronizando dados da RedotPay...
              </span>

            </div>

          </div>

        </div>

      ) : !dashboardData ? (

        <div
          className="
            bg-[#161A1F]
            border
            border-red-500/10
            rounded-[2rem]
            p-12
            text-center
          "
        >

          <p
            className="
              text-red-400
              font-bold
            "
          >
            Não foi possível carregar os
            dados da conta RedotPay.
          </p>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="
              mt-4
              px-5
              py-2.5
              rounded-xl
              bg-blue-500/10
              border
              border-blue-500/20
              text-blue-400
              font-bold
              text-xs
              uppercase
              tracking-wider
            "
          >
            Tentar novamente
          </button>

        </div>

      ) : (

        <div
          className="
            transition-all
            duration-200
          "
        >

          {activeTab === "overview" && (

            <RedotPayOverviewPage
              data={dashboardData}
              onRefresh={
                fetchDashboardData
              }
            />

          )}


          {activeTab === "business" && (

            <RedotPayBusinessPage
              data={dashboardData}
            />

          )}


          {activeTab === "transactions" && (

            <RedotPayTransactionsPage />

          )}


          {activeTab === "audit" && (

            <RedotPayAuditPage />

          )}

        </div>

      )}

    </div>

  )

}