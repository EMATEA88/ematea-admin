import { useEffect, useState } from "react"
import { api } from "../../services/api"

type FinancialData = {
  totalVolumeAOA: number
  totalProfit: number
  totalTrades: number
  today: {
    volume: number
    profit: number
  }
}

export default function AdminFinancial(){

  const [data,setData] = useState<FinancialData | null>(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    load()
  },[])

  async function load(){
    try{
      const res = await api.get("/admin/otc/financial-summary")
      setData(res.data)
    }catch(err){
      console.error("Financial error",err)
    }finally{
      setLoading(false)
    }
  }

  if(loading) return <div className="p-6 text-gray-400">Loading financial data...</div>
  if(!data) return <div className="p-6 text-red-500">Error loading financial data</div>

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-semibold text-white">
        OTC Financial Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
          title="Total Volume (AOA)"
          value={format(data.totalVolumeAOA)}
        />

        <Card
          title="Total Profit"
          value={format(data.totalProfit)}
          highlight
          positive={data.totalProfit >= 0}
        />

        <Card
          title="Total Trades"
          value={data.totalTrades}
        />

        <Card
          title="Today Profit"
          value={format(data.today.profit)}
          highlight
          positive={data.today.profit >= 0}
        />

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card
          title="Today Volume"
          value={format(data.today.volume)}
        />

      </div>

    </div>
  )
}

/* ================= CARD ================= */

function Card({
  title,
  value,
  highlight,
  positive
}:{
  title:string
  value:any
  highlight?:boolean
  positive?:boolean
}){

  const border =
    highlight
      ? positive
        ? "border-green-500"
        : "border-red-500"
      : "border-gray-700"

  return(
    <div className={`
      bg-[#14171A]
      border
      ${border}
      p-6
      rounded-xl
    `}>
      <div className="text-sm text-gray-400">
        {title}
      </div>

      <div className="text-2xl font-bold text-white mt-2">
        {value}
      </div>
    </div>
  )
}

/* ================= FORMAT ================= */

function format(value:number){
  return new Intl.NumberFormat("pt-AO",{
    style:"currency",
    currency:"AOA"
  }).format(Number(value ?? 0))
}