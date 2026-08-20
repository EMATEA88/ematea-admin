import {
  Wallet,
  ArrowClockwise,
  CheckCircle,
  Snowflake,
  CurrencyDollar
} from "@phosphor-icons/react"

import type {
  RedotPayDashboard
} from "../../services/adminRedotPay.service"


interface RedotPayOverviewProps {

  data: RedotPayDashboard

  onRefresh: () => void

}


export default function RedotPayOverviewPage({

  data,

  onRefresh

}: RedotPayOverviewProps) {

  const apiStatus =
    data.api.status

  const environment =
    data.api.environment

  const merchantId =
    data.merchant.merchantId ??
    "Não configurado"

  const totalBalance =
    data.balance.total

  const availableBalance =
    data.balance.available

  const frozenBalance =
    data.balance.frozen

  const depositsToday =
    data.today.deposits

  const successfulToday =
    data.today.successful

  const pendingToday =
    data.today.pending

  const failedToday =
    data.today.failed

  const volumeToday =
    data.today.gross

  const feesToday =
    data.today.fees

  const netToday =
    data.today.net


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

            <Wallet
              className="text-blue-400"
              size={24}
            />

            RedotPay — Visão Geral & API

          </h2>


          <p
            className="
              text-gray-400
              text-xs
              mt-1
            "
          >
            Monitoramento da conexão OpenAPI,
            conta merchant e métricas financeiras
            da RedotPay.
          </p>

        </div>


        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <span
            className="
              text-xs
              font-mono
              text-gray-400
            "
          >
            Dados sincronizados da API
          </span>


          <button
            type="button"
            onClick={onRefresh}
            className="
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-xl
              bg-blue-500/10
              text-blue-400
              border
              border-blue-500/20
              hover:bg-blue-500/20
              font-black
              text-xs
              uppercase
              tracking-wider
              transition-all
              cursor-pointer
            "
          >

            <ArrowClockwise
              size={14}
            />

            Atualizar

          </button>

        </div>

      </div>


      {/* =================================================
          ACCOUNT BALANCE
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        "
      >

        {/* TOTAL */}

        <div
          className="
            bg-[#161A1F]
            border
            border-white/5
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Saldo Total
            </span>

            <CurrencyDollar
              size={20}
              className="text-blue-400"
            />

          </div>


          <div
            className="
              text-white
              font-black
              text-3xl
              font-mono
            "
          >

            {totalBalance.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}

            <span
              className="
                text-sm
                text-blue-400
                ml-2
              "
            >
              USD
            </span>

          </div>

        </div>


        {/* DISPONÍVEL */}

        <div
          className="
            bg-[#161A1F]
            border
            border-emerald-500/10
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Saldo Disponível
            </span>

            <CheckCircle
              size={20}
              className="text-emerald-400"
            />

          </div>


          <div
            className="
              text-emerald-400
              font-black
              text-3xl
              font-mono
            "
          >

            {availableBalance.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}

            <span
              className="
                text-sm
                text-emerald-400/70
                ml-2
              "
            >
              USD
            </span>

          </div>

        </div>


        {/* CONGELADO */}

        <div
          className="
            bg-[#161A1F]
            border
            border-yellow-500/10
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Saldo Congelado
            </span>

            <Snowflake
              size={20}
              className="text-yellow-400"
            />

          </div>


          <div
            className="
              text-yellow-400
              font-black
              text-3xl
              font-mono
            "
          >

            {frozenBalance.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }
            )}

            <span
              className="
                text-sm
                text-yellow-400/70
                ml-2
              "
            >
              USD
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          API / MERCHANT
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >

        {/* API */}

        <div
          className="
            bg-[#161A1F]
            border
            border-white/5
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-3
          "
        >

          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
            "
          >
            Estado da API
          </span>


          <div
            className="
              flex
              items-center
              gap-2
              text-emerald-400
              font-black
              text-lg
            "
          >

            <span
              className="
                w-2.5
                h-2.5
                rounded-full
                bg-emerald-500
                animate-pulse
              "
            />

            {apiStatus}

          </div>

        </div>


        {/* AMBIENTE */}

        <div
          className="
            bg-[#161A1F]
            border
            border-white/5
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-3
          "
        >

          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
            "
          >
            Ambiente
          </span>


          <div
            className="
              text-blue-400
              font-black
              text-lg
              uppercase
              tracking-wide
            "
          >
            {environment}
          </div>

        </div>


        {/* MERCHANT ID */}

        <div
          className="
            bg-[#161A1F]
            border
            border-white/5
            rounded-[2rem]
            p-8
            shadow-xl
            space-y-3
          "
        >

          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
            "
          >
            Merchant ID
          </span>


          <div
            className="
              text-white
              font-black
              text-xl
              font-mono
              tracking-wider
            "
          >
            {merchantId}
          </div>

        </div>

      </div>


      {/* =================================================
          TODAY
      ================================================= */}

      <div>

        <h3
          className="
            text-sm
            font-black
            uppercase
            tracking-widest
            text-gray-300
            mb-4
          "
        >
          Atividade de Hoje
        </h3>


        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >

          {/* DEPÓSITOS */}

          <div
            className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Depósitos Hoje
            </span>


            <div
              className="
                text-white
                font-black
                text-2xl
                font-mono
              "
            >
              {depositsToday}
            </div>

          </div>


          {/* SUCESSOS */}

          <div
            className="
              bg-[#161A1F]
              border
              border-emerald-500/10
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Pagamentos Sucesso
            </span>


            <div
              className="
                text-emerald-400
                font-black
                text-2xl
                font-mono
              "
            >
              {successfulToday}
            </div>

          </div>


          {/* PENDENTES */}

          <div
            className="
              bg-[#161A1F]
              border
              border-yellow-500/10
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Pendentes
            </span>


            <div
              className="
                text-yellow-400
                font-black
                text-2xl
                font-mono
              "
            >
              {pendingToday}
            </div>

          </div>


          {/* FALHADOS */}

          <div
            className="
              bg-[#161A1F]
              border
              border-red-500/10
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Falhados
            </span>


            <div
              className="
                text-red-400
                font-black
                text-2xl
                font-mono
              "
            >
              {failedToday}
            </div>

          </div>


          {/* VOLUME */}

          <div
            className="
              bg-[#161A1F]
              border
              border-blue-500/10
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Volume Hoje
            </span>


            <div
              className="
                text-blue-400
                font-black
                text-2xl
                font-mono
              "
            >

              {volumeToday.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }
              )}

              <span
                className="
                  text-xs
                  text-gray-400
                  ml-1
                "
              >
                USD
              </span>

            </div>

          </div>


          {/* FEES / NET */}

          <div
            className="
              bg-[#161A1F]
              border
              border-white/5
              rounded-[2rem]
              p-8
              shadow-xl
              space-y-3
            "
          >

            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Líquido Hoje
            </span>


            <div
              className="
                text-white
                font-black
                text-2xl
                font-mono
              "
            >

              {netToday.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }
              )}

              <span
                className="
                  text-xs
                  text-gray-400
                  ml-1
                "
              >
                USD
              </span>

            </div>


            {feesToday > 0 && (

              <div
                className="
                  text-[10px]
                  text-gray-500
                  font-bold
                  uppercase
                "
              >
                Taxas:
                {" "}
                {feesToday.toFixed(2)}
                {" "}
                USD
              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  )

}