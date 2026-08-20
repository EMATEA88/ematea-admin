import {
  useState,
  useEffect,
  useCallback
} from "react"

import {
  adminRedotPayService
} from "../../services/adminRedotPay.service"

import type {
  RedotPayBusinessReport
} from "../../services/adminRedotPay.service"

import {
  ChartBar,
  Wallet,
  Coins,
  ArrowClockwise
} from "@phosphor-icons/react"


interface RedotPayBusinessPageProps {

  data: {
    balance?: {
      total?: number
      available?: number
      frozen?: number
    }
  } | null

}


type Period =
  | "today"
  | "7days"
  | "30days"


export default function RedotPayBusinessPage({

  data

}: RedotPayBusinessPageProps) {

  const [
    period,
    setPeriod
  ] = useState<Period>("today")


  const [
    reportData,
    setReportData
  ] = useState<RedotPayBusinessReport | null>(
    null
  )


  const [
    loading,
    setLoading
  ] = useState(false)


  const [
    error,
    setError
  ] = useState<string | null>(
    null
  )


  /* =====================================================
     LOAD REPORT
  ===================================================== */

  const fetchBusinessReport =
    useCallback(async () => {

      try {

        setLoading(true)

        setError(null)

        const response =
          await adminRedotPayService.getBusinessReport({
            period
          })


        if (
          !response.data?.success
        ) {

          throw new Error(
            "A RedotPay não retornou um relatório válido."
          )

        }


        setReportData(
          response.data.data
        )

      } catch (error: any) {

        console.error(
          "[REDOTPAY ADMIN] Business report:",
          error
        )

        setReportData(null)

        setError(
          error?.message ??
          "Não foi possível carregar o relatório."
        )

      } finally {

        setLoading(false)

      }

    }, [period])


  useEffect(() => {

    fetchBusinessReport()

  }, [fetchBusinessReport])


  /* =====================================================
     FORMATTERS
  ===================================================== */

  const formatNumber =
    (value: number) =>
      Number(value || 0).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )


  const formatReportValue =
    (value?: string) =>
      value || "—"


  return (

    <div className="space-y-8">

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
          gap-4
          bg-[#161A1F]
          border
          border-white/5
          rounded-[2rem]
          p-8
          shadow-xl
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-black
              uppercase
              tracking-tight
              text-white
              flex
              items-center
              gap-2
            "
          >

            <ChartBar
              className="text-blue-400"
              size={24}
            />

            Negócio & Finanças RedotPay

          </h2>


          <p
            className="
              text-gray-400
              text-xs
              mt-1
            "
          >
            Relatório baseado nos pagamentos
            retornados pela OpenAPI da RedotPay.
          </p>

        </div>


        {/* =================================================
            PERIOD
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            bg-[#0B0E11]
            p-1.5
            rounded-xl
            border
            border-white/10
          "
        >

          {(
            [
              ["today", "Hoje"],
              ["7days", "7 Dias"],
              ["30days", "30 Dias"]
            ] as const
          ).map(
            ([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  setPeriod(value)
                }
                className={`
                  px-4
                  py-2
                  rounded-lg
                  font-black
                  text-xs
                  uppercase
                  transition-all
                  cursor-pointer
                  ${
                    period === value
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-400 hover:text-white"
                  }
                `}
              >
                {label}
              </button>

            )
          )}

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div
          className="
            bg-[#161A1F]
            border
            border-white/5
            rounded-[2rem]
            p-8
            flex
            items-center
            justify-center
            gap-3
            text-gray-400
          "
        >

          <ArrowClockwise
            size={18}
            className="animate-spin text-blue-400"
          />

          <span
            className="
              text-xs
              font-black
              uppercase
              tracking-widest
            "
          >
            Consultando RedotPay...
          </span>

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div
          className="
            bg-[#161A1F]
            border
            border-red-500/10
            rounded-[2rem]
            p-8
          "
        >

          <p
            className="
              text-red-400
              text-sm
              font-bold
            "
          >
            {error}
          </p>


          <button
            type="button"
            onClick={fetchBusinessReport}
            className="
              mt-4
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-xl
              bg-blue-500/10
              border
              border-blue-500/20
              text-blue-400
              font-black
              text-xs
              uppercase
              tracking-wider
            "
          >

            <ArrowClockwise size={14} />

            Tentar novamente

          </button>

        </div>

      )}


      {/* =================================================
          REPORT
      ================================================= */}

      {!loading &&
        !error &&
        reportData && (

        <>

          {/* =================================================
              MAIN METRICS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-5
              gap-6
            "
          >

            {/* GROSS */}

            <div className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-6
              shadow-xl
              space-y-2
            ">

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              ">
                Volume Bruto
              </span>

              <div className="
                text-white
                font-black
                text-xl
                font-mono
              ">
                {formatReportValue(
                  reportData.grossVolume
                )}
              </div>

            </div>


            {/* FEES */}

            <div className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-6
              shadow-xl
              space-y-2
            ">

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              ">
                Taxas
              </span>

              <div className="
                text-rose-400
                font-black
                text-xl
                font-mono
              ">
                {formatReportValue(
                  reportData.fees
                )}
              </div>

            </div>


            {/* NET */}

            <div className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-6
              shadow-xl
              space-y-2
            ">

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              ">
                Volume Líquido
              </span>

              <div className="
                text-blue-400
                font-black
                text-xl
                font-mono
              ">
                {formatReportValue(
                  reportData.netVolume
                )}
              </div>

            </div>


            {/* PAYMENTS */}

            <div className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-6
              shadow-xl
              space-y-2
            ">

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              ">
                Qtd. Pagamentos
              </span>

              <div className="
                text-white
                font-black
                text-xl
                font-mono
              ">
                {reportData.totalPayments}
              </div>

            </div>


            {/* AVERAGE */}

            <div className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-6
              shadow-xl
              space-y-2
            ">

              <span className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              ">
                Ticket Médio
              </span>

              <div className="
                text-emerald-400
                font-black
                text-xl
                font-mono
              ">
                {formatReportValue(
                  reportData.averageTicket
                )}
              </div>

            </div>

          </div>


          {/* =================================================
              ASSET FLOW
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
            "
          >

            {/* CRYPTO */}

            <div
              className="
                bg-[#161A1F]
                border
                border-white/5
                rounded-[2rem]
                p-8
                shadow-xl
                space-y-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-black
                  uppercase
                  tracking-widest
                  text-blue-400
                "
              >

                <Wallet size={18} />

                Fluxo Financeiro RedotPay

              </div>


              <div
                className="
                  space-y-4
                  font-mono
                  text-xs
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                    border-b
                    border-white/5
                  "
                >

                  <span className="text-gray-400 uppercase">
                    Recebido:
                  </span>

                  <span className="text-white font-bold">
                    {formatReportValue(
                      reportData.usdtReceived
                    )}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                    border-b
                    border-white/5
                  "
                >

                  <span className="text-gray-400 uppercase">
                    Líquido:
                  </span>

                  <span className="text-emerald-400 font-bold">
                    {formatReportValue(
                      reportData.usdtNet
                    )}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                  "
                >

                  <span className="text-gray-400 uppercase">
                    Taxas RedotPay:
                  </span>

                  <span className="text-rose-400 font-bold">
                    {formatReportValue(
                      reportData.redotPayFees
                    )}
                  </span>

                </div>

              </div>

            </div>


            {/* AOA */}

            <div
              className="
                bg-[#161A1F]
                border
                border-white/5
                rounded-[2rem]
                p-8
                shadow-xl
                space-y-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-black
                  uppercase
                  tracking-widest
                  text-emerald-400
                "
              >

                <Coins size={18} />

                Estado da Liquidez RedotPay

              </div>


              <div
                className="
                  space-y-4
                  font-mono
                  text-xs
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                    border-b
                    border-white/5
                  "
                >

                  <span className="text-gray-400 uppercase">
                    
                  </span>

                  <span className="text-emerald-400 font-bold">
                    {formatReportValue(
                      reportData.aoaCredited
                    )}
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                    border-b
                    border-white/5
                  "
                >

                  <span className="text-gray-400 uppercase">
                    Saldo Disponível RedotPay:
                  </span>

                  <span className="text-white font-bold">
                    {formatNumber(
                      data?.balance?.available ?? 0
                    )}
                    {" "}
                    USD
                  </span>

                </div>


                <div
                  className="
                    flex
                    justify-between
                    items-center
                    py-3
                  "
                >

                  <span className="text-gray-400 uppercase">
                    Saldo Congelado:
                  </span>

                  <span className="text-yellow-400 font-bold">
                    {formatNumber(
                      data?.balance?.frozen ?? 0
                    )}
                    {" "}
                    USD
                  </span>

                </div>

              </div>

            </div>

          </div>

        </>

      )}

    </div>

  )

}