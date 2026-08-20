import {
  useState,
  useEffect,
  useCallback
} from "react"

import {
  adminRedotPayService
} from "../../services/adminRedotPay.service"

import {
  Receipt,
  Funnel,
  ArrowClockwise
} from "@phosphor-icons/react"


interface TransactionRecord {
  [key: string]: any
}


export default function RedotPayTransactionsPage() {

  const [
    transactions,
    setTransactions
  ] = useState<TransactionRecord[]>([])


  const [
    loading,
    setLoading
  ] = useState(false)


  const [
    error,
    setError
  ] = useState<string | null>(null)


  const [
    page,
    setPage
  ] = useState(1)


  const [
    pagination,
    setPagination
  ] = useState({
    page: 1,
    limit: 20,
    total: 0
  })


  /* =====================================================
     FILTERS
  ===================================================== */

  const [
    statusFilter,
    setStatusFilter
  ] = useState("ALL")


  const [
    searchOuterOrder,
    setSearchOuterOrder
  ] = useState("")


  const [
    searchTxId,
    setSearchTxId
  ] = useState("")


  const [
    startDate,
    setStartDate
  ] = useState("")


  const [
    endDate,
    setEndDate
  ] = useState("")


  /* =====================================================
     FETCH
  ===================================================== */

  const fetchTransactions =
    useCallback(async () => {

      try {

        setLoading(true)

        setError(null)


        const response =
          await adminRedotPayService.getTransactions({

            page,

            limit: 20,

            outerOrderSn:
              searchOuterOrder ||
              undefined,

            txId:
              searchTxId ||
              undefined,

            status:
              statusFilter !== "ALL"
                ? statusFilter
                : undefined,

            startTime:
              startDate
                ? new Date(
                    `${startDate}T00:00:00`
                  ).getTime()
                : undefined,

            endTime:
              endDate
                ? new Date(
                    `${endDate}T23:59:59`
                  ).getTime()
                : undefined

          })


        if (
          !response.data?.success
        ) {

          throw new Error(
            "A RedotPay não retornou uma resposta válida."
          )

        }


        const result =
          response.data.data


        setTransactions(
          result?.transactions ?? []
        )


        setPagination(
          result?.pagination ?? {
            page,
            limit: 20,
            total: 0
          }
        )

      } catch (error: any) {

        console.error(
          "[REDOTPAY ADMIN] Transactions:",
          error
        )

        setTransactions([])

        setError(
          error?.message ??
          "Erro ao carregar transações."
        )

      } finally {

        setLoading(false)

      }

    }, [
      page,
      statusFilter,
      searchOuterOrder,
      searchTxId,
      startDate,
      endDate
    ])


  useEffect(() => {

    fetchTransactions()

  }, [fetchTransactions])


  /* =====================================================
     STATUS
  ===================================================== */

  const getStatusBadge =
    (status: unknown) => {

      const value =
        String(
          status ?? ""
        ).toUpperCase()


      if (
        value === "SUCCESS" ||
        value === "2"
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
            SUCCESS
          </span>
        )

      }


      if (
        value === "PENDING" ||
        value === "1"
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
              bg-amber-500/10
              text-amber-400
              border
              border-amber-500/20
            "
          >
            PENDING
          </span>
        )

      }


      if (
        value === "FAILED" ||
        value === "3"
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
            FAILED
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
            bg-gray-500/10
            text-gray-400
            border
            border-gray-500/20
          "
        >
          {value || "UNKNOWN"}
        </span>
      )

    }


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate =
    (value: unknown) => {

      if (!value)
        return "—"


      const numeric =
        Number(value)


      const timestamp =
        Number.isFinite(numeric) &&
        numeric > 0

          ? numeric

          : Date.parse(
              String(value)
            )


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


  /* =====================================================
     HELPERS
  ===================================================== */

  const getValue =
    (
      tx: TransactionRecord,
      ...keys: string[]
    ) => {

      for (
        const key of keys
      ) {

        const value =
          tx[key]

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {

          return value

        }

      }

      return null

    }


  const formatAmount =
    (
      value: unknown,
      currency?: string
    ) => {

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        return "—"

      }


      const amount =
        Number(value)


      if (
        !Number.isFinite(amount)
      ) {

        return String(value)

      }


      return `${amount.toFixed(2)}${
        currency
          ? ` ${currency}`
          : ""
      }`

    }


  /* =====================================================
     RENDER
  ===================================================== */

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

            <Receipt
              className="text-blue-400"
              size={24}
            />

            Transações RedotPay

          </h2>


          <p
            className="
              text-gray-400
              text-xs
              mt-1
            "
          >
            Histórico de pedidos retornados
            pela OpenAPI da RedotPay.
          </p>

        </div>


        <button
          type="button"
          onClick={fetchTransactions}
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

          Atualizar Lista

        </button>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

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
            text-gray-400
          "
        >

          <Funnel
            size={16}
            className="text-blue-400"
          />

          Filtros de Pesquisa

        </div>


        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
          "
        >

          {/* STATUS */}

          <div className="space-y-1.5">

            <label
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Status
            </label>


            <select
              value={statusFilter}
              onChange={(event) => {

                setPage(1)

                setStatusFilter(
                  event.target.value
                )

              }}
              className="
                w-full
                bg-[#0B0E11]
                border
                border-white/10
                rounded-xl
                px-4
                py-2.5
                text-xs
                text-white
                font-mono
                focus:outline-none
                focus:border-blue-500
              "
            >

              <option value="ALL">
                Todos
              </option>

              <option value="SUCCESS">
                SUCCESS
              </option>

              <option value="PENDING">
                PENDING
              </option>

              <option value="FAILED">
                FAILED
              </option>

            </select>

          </div>


          {/* OUTER ORDER */}

          <div className="space-y-1.5">

            <label
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Outer Order
            </label>


            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchOuterOrder}
              onChange={(event) => {

                setPage(1)

                setSearchOuterOrder(
                  event.target.value
                )

              }}
              className="
                w-full
                bg-[#0B0E11]
                border
                border-white/10
                rounded-xl
                px-4
                py-2.5
                text-xs
                text-white
                font-mono
                focus:outline-none
                focus:border-blue-500
              "
            />

          </div>


          {/* TX ID */}

          <div className="space-y-1.5">

            <label
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              TX ID
            </label>


            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTxId}
              onChange={(event) => {

                setPage(1)

                setSearchTxId(
                  event.target.value
                )

              }}
              className="
                w-full
                bg-[#0B0E11]
                border
                border-white/10
                rounded-xl
                px-4
                py-2.5
                text-xs
                text-white
                font-mono
                focus:outline-none
                focus:border-blue-500
              "
            />

          </div>


          {/* DATA INICIAL */}

          <div className="space-y-1.5">

            <label
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Data Inicial
            </label>


            <input
              type="date"
              value={startDate}
              onChange={(event) => {

                setPage(1)

                setStartDate(
                  event.target.value
                )

              }}
              className="
                w-full
                bg-[#0B0E11]
                border
                border-white/10
                rounded-xl
                px-4
                py-2.5
                text-xs
                text-white
                font-mono
                focus:outline-none
                focus:border-blue-500
              "
            />

          </div>


          {/* DATA FINAL */}

          <div className="space-y-1.5">

            <label
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Data Final
            </label>


            <input
              type="date"
              value={endDate}
              onChange={(event) => {

                setPage(1)

                setEndDate(
                  event.target.value
                )

              }}
              className="
                w-full
                bg-[#0B0E11]
                border
                border-white/10
                rounded-xl
                px-4
                py-2.5
                text-xs
                text-white
                font-mono
                focus:outline-none
                focus:border-blue-500
              "
            />

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="
            bg-[#161A1F]
            border
            border-red-500/10
            rounded-[2rem]
            p-6
            text-red-400
            text-sm
            font-bold
          "
        >
          {error}
        </div>

      )}


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
                  Outer Order
                </th>

                <th className="py-4 px-4">
                  RedotPay Order
                </th>

                <th className="py-4 px-4">
                  Diferença
                </th>

                <th className="py-4 px-4">
                  Valor USD
                </th>

                <th className="py-4 px-4">
                  Crypto
                </th>

                <th className="py-4 px-4">
                  Taxa
                </th>

                <th className="py-4 px-4">
                  Líquido
                </th>

                <th className="py-4 px-4 text-center">
                  Status
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
                    colSpan={9}
                    className="
                      py-12
                      text-center
                      text-gray-500
                      uppercase
                      tracking-widest
                      font-black
                    "
                  >
                    Carregando transações...
                  </td>

                </tr>

              ) : transactions.length === 0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="
                      py-12
                      text-center
                      text-gray-500
                      uppercase
                      tracking-widest
                      font-black
                    "
                  >
                    Nenhuma transação encontrada.
                  </td>

                </tr>

              ) : (

                transactions.map(
                  (
                    tx,
                    index
                  ) => {

                    const outerOrder =
                      getValue(
                        tx,
                        "outerOrderSn",
                        "outerOrder"
                      )


                    const redotPayOrder =
                      getValue(
                        tx,
                        "orderSn",
                        "preSn"
                      )


                    const txId =
                      getValue(
                        tx,
                        "txId"
                      )


                    const orderAmount =
                      getValue(
                        tx,
                        "orderAmount"
                      )


                    const cryptoAmount =
                      getValue(
                        tx,
                        "cryptoAmount"
                      )


                    const billAmount =
                      getValue(
                        tx,
                        "billAmount"
                      )


                    const fee =
                      orderAmount !== null &&
                      billAmount !== null

                        ? Number(
                            cryptoAmount ??
                            orderAmount
                          ) -
                          Number(
                            billAmount
                          )

                        : null


                    const status =
                      getValue(
                        tx,
                        "orderStatus",
                        "status"
                      )


                    const date =
                      getValue(
                        tx,
                        "paymentTime",
                        "orderTime",
                        "createdAt"
                      )


                    return (

                      <tr
                        key={
                          String(
                            txId ??
                            redotPayOrder ??
                            outerOrder ??
                            index
                          )
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


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-400
                            max-w-[220px]
                            truncate
                          "
                        >
                          {outerOrder ?? "—"}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-400
                            max-w-[220px]
                            truncate
                          "
                        >
                          {redotPayOrder ?? "—"}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-gray-400
                            max-w-[220px]
                            truncate
                          "
                        >
                          {txId ?? "—"}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-white
                            font-bold
                          "
                        >
                          {formatAmount(
                            orderAmount,
                            "USD"
                          )}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-emerald-400
                          "
                        >
                          {formatAmount(
                            cryptoAmount,
                            "USDT"
                          )}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-rose-400
                          "
                        >
                          {fee !== null
                            ? formatAmount(
                                fee,
                                "USDT"
                              )
                            : "—"}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-blue-400
                            font-bold
                          "
                        >
                          {formatAmount(
                            billAmount,
                            "USDT"
                          )}
                        </td>


                        <td
                          className="
                            py-4
                            px-4
                            text-center
                          "
                        >
                          {getStatusBadge(
                            status
                          )}
                        </td>

                      </tr>

                    )

                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        <div
          className="
            mt-6
            pt-5
            border-t
            border-white/5
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <span
            className="
              text-[10px]
              text-gray-500
              font-mono
              uppercase
              tracking-wider
            "
          >
            Total:
            {" "}
            {pagination.total}
          </span>


          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={
                loading ||
                page <= 1
              }
              onClick={() =>
                setPage(
                  current =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
              className="
                px-4
                py-2
                rounded-xl
                bg-white/5
                border
                border-white/10
                text-gray-300
                disabled:opacity-30
                disabled:cursor-not-allowed
                text-xs
                font-bold
              "
            >
              Anterior
            </button>


            <span
              className="
                px-3
                text-xs
                text-gray-400
                font-mono
              "
            >
              Página {page}
            </span>


            <button
              type="button"
              disabled={
                loading ||
                transactions.length < pagination.limit
              }
              onClick={() =>
                setPage(
                  current =>
                    current + 1
                )
              }
              className="
                px-4
                py-2
                rounded-xl
                bg-white/5
                border
                border-white/10
                text-gray-300
                disabled:opacity-30
                disabled:cursor-not-allowed
                text-xs
                font-bold
              "
            >
              Próxima
            </button>

          </div>

        </div>

      </div>

    </div>

  )

}