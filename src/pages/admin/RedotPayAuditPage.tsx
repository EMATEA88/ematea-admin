import {
  useState,
  useEffect,
  useCallback
} from "react"

import {
  adminRedotPayService
} from "../../services/adminRedotPay.service"

import type {
  RedotPayAuditResponse
} from "../../services/adminRedotPay.service"

import {
  ShieldCheck,
  ArrowClockwise
} from "@phosphor-icons/react"


export default function RedotPayAuditPage() {

  const [
    auditLogs,
    setAuditLogs
  ] = useState<RedotPayAuditResponse | null>(null)


  const [
    loading,
    setLoading
  ] = useState(false)


  const fetchAudit =
    useCallback(async () => {

      try {

        setLoading(true)

        const response =
          await adminRedotPayService.getAudit({
            page: 1,
            limit: 50
          })


        if (
          !response.data?.success
        ) {

          throw new Error(
            "Falha ao consultar auditoria RedotPay."
          )

        }


        setAuditLogs(
          response.data.data
        )

      } catch (error) {

        console.error(
          "[REDOTPAY ADMIN] Audit:",
          error
        )

        setAuditLogs(null)

      } finally {

        setLoading(false)

      }

    }, [])


  useEffect(() => {

    fetchAudit()

  }, [fetchAudit])


  const logs =
    auditLogs?.logs ?? []


  const getEventBadge =
    (event: string) => {

      const normalized =
        event.toUpperCase()


      if (
        normalized.includes("FAILED") ||
        normalized.includes("ERROR") ||
        normalized.includes("REJECT")
      ) {

        return (
          <span
            className="
              px-2.5
              py-1
              rounded-full
              text-[10px]
              font-black
              uppercase
              bg-rose-500/10
              text-rose-400
              border
              border-rose-500/20
            "
          >
            {event}
          </span>
        )

      }


      if (
        normalized.includes("SUCCESS") ||
        normalized.includes("VERIFIED") ||
        normalized.includes("CONFIRMED")
      ) {

        return (
          <span
            className="
              px-2.5
              py-1
              rounded-full
              text-[10px]
              font-black
              uppercase
              bg-emerald-500/10
              text-emerald-400
              border
              border-emerald-500/20
            "
          >
            {event}
          </span>
        )

      }


      return (
        <span
          className="
            px-2.5
            py-1
            rounded-full
            text-[10px]
            font-black
            uppercase
            bg-blue-500/10
            text-blue-400
            border
            border-blue-500/25
          "
        >
          {event}
        </span>
      )

    }


  const formatDate =
    (value: unknown) => {

      if (!value)
        return "—"


      const timestamp =
        typeof value === "number"
          ? value
          : Date.parse(String(value))


      if (
        !Number.isFinite(timestamp)
      ) {

        return String(value)

      }


      return new Date(timestamp)
        .toLocaleString(
          "pt-PT",
          {
            dateStyle: "short",
            timeStyle: "medium"
          }
        )

    }


  const getValue =
    (
      log: Record<string, unknown>,
      ...keys: string[]
    ) => {

      for (const key of keys) {

        const value =
          log[key]

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {

          return String(value)

        }

      }

      return "—"

    }


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

            <ShieldCheck
              className="text-blue-400"
              size={24}
            />

            Auditoria & Trilha de Eventos RedotPay

          </h2>


          <p
            className="
              text-gray-400
              text-xs
              mt-1
            "
          >
            Registro dos eventos e movimentos
            retornados pela API da RedotPay.
          </p>

        </div>


        <button
          type="button"
          onClick={fetchAudit}
          disabled={loading}
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
            disabled:opacity-50
            disabled:cursor-not-allowed
            font-black
            text-xs
            uppercase
            tracking-wider
            transition-all
            cursor-pointer
            self-start
            md:self-auto
          "
        >

          <ArrowClockwise
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Atualizar Logs

        </button>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div
        className="
          bg-[#161A1F]
          border
          border-white/5
          rounded-[2rem]
          p-8
          shadow-xl
          overflow-hidden
        "
      >

        <div className="overflow-x-auto">

          <table
            className="
              w-full
              text-left
              border-collapse
            "
          >

            <thead>

              <tr
                className="
                  border-b
                  border-white/5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  text-gray-400
                "
              >

                <th className="py-4 px-4">
                  Data
                </th>

                <th className="py-4 px-4">
                  Evento
                </th>

                <th className="py-4 px-4">
                  Outer Order
                </th>

                <th className="py-4 px-4">
                  TX ID
                </th>

                <th className="py-4 px-4 text-center">
                  Status
                </th>

                <th className="py-4 px-4">
                  Resultado / Descrição
                </th>

              </tr>

            </thead>


            <tbody
              className="
                divide-y
                divide-white/5
                text-xs
                font-mono
              "
            >

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      py-12
                      text-center
                      text-gray-500
                      uppercase
                      tracking-widest
                      font-black
                    "
                  >
                    Carregando auditoria...
                  </td>

                </tr>

              ) : logs.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      py-12
                      text-center
                      text-gray-500
                      uppercase
                      tracking-widest
                      font-black
                    "
                  >
                    Nenhum registro encontrado.
                  </td>

                </tr>

              ) : (

                logs.map(
                  (
                    rawLog,
                    index
                  ) => {

                    const log =
                      rawLog as Record<
                        string,
                        unknown
                      >


                    const event =
                      getValue(
                        log,
                        "event",
                        "eventType",
                        "webhookEventType",
                        "actionType"
                      )


                    const status =
                      getValue(
                        log,
                        "status",
                        "orderStatus",
                        "result"
                      )


                    const outerOrder =
                      getValue(
                        log,
                        "outerOrder",
                        "outerOrderSn"
                      )


                    const txId =
                      getValue(
                        log,
                        "txId",
                        "transactionId"
                      )


                    const description =
                      getValue(
                        log,
                        "result",
                        "description",
                        "message"
                      )


                    const date =
                      getValue(
                        log,
                        "date",
                        "createdAt",
                        "updatedAt",
                        "paymentTime",
                        "orderTime"
                      )


                    return (

                      <tr
                        key={
                          `${txId}-${index}`
                        }
                        className="
                          hover:bg-white/[0.02]
                          transition-colors
                        "
                      >

                        <td
                          className="
                            py-4
                            px-4
                            text-gray-300
                            whitespace-nowrap
                          "
                        >
                          {formatDate(date)}
                        </td>


                        <td className="py-4 px-4">

                          {getEventBadge(
                            event
                          )}

                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-400
                            max-w-[220px]
                            truncate
                          "
                          title={outerOrder}
                        >
                          {outerOrder}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-400
                            max-w-[220px]
                            truncate
                          "
                          title={txId}
                        >
                          {txId}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-center
                          "
                        >

                          <span
                            className={`
                              font-bold
                              ${
                                status
                                  .toUpperCase()
                                  .includes(
                                    "SUCCESS"
                                  ) ||
                                status === "2"
                                  ? "text-emerald-400"
                                  : status
                                      .toUpperCase()
                                      .includes(
                                        "FAIL"
                                      ) ||
                                    status === "3"
                                    ? "text-rose-400"
                                    : "text-yellow-400"
                              }
                            `}
                          >
                            {status}
                          </span>

                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-300
                            max-w-[350px]
                            truncate
                          "
                          title={description}
                        >
                          {description}
                        </td>

                      </tr>

                    )

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          PAGINATION INFO
      ================================================= */}

      {auditLogs?.pagination && (

        <div
          className="
            text-right
            text-[10px]
            text-gray-500
            font-mono
            uppercase
            tracking-wider
          "
        >
          Total de registros:
          {" "}
          {auditLogs.pagination.total}
        </div>

      )}

    </div>

  )

}