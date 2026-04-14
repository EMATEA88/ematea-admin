import { useEffect, useState } from "react"
import { AdminKixikilaService } from "../../services/adminKixikila.service"

export default function AdminKixikila(){

  const [groups,setGroups] = useState<any[]>([])
  const [requests,setRequests] = useState<any[]>([])

  const [name,setName] = useState("")
  const [contribution,setContribution] = useState("")
  const [membersLimit,setMembersLimit] = useState("")
  const [cycleMonths,setCycleMonths] = useState("")

  async function load(){

    const g = await AdminKixikilaService.groups()

    setGroups(g)

  }

  async function loadRequests(){

    const res = await fetch(
      import.meta.env.VITE_API_URL + "/kixikila/admin/requests",
      {
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    const data = await res.json()

    setRequests(data)

  }

  async function createGroup(){

    await AdminKixikilaService.createGroup({
      name,
      contribution:Number(contribution),
      membersLimit:Number(membersLimit),
      cycleMonths:Number(cycleMonths)
    })

    setName("")
    setContribution("")
    setMembersLimit("")
    setCycleMonths("")

    load()

  }

  async function approve(requestId:number){

    const position = Number(prompt("Posição no ciclo"))

    if(!position) return

    await AdminKixikilaService.approve(requestId,position)

    loadRequests()

  }

  /* ======================
     NOVAS FUNÇÕES
  ====================== */

  async function deleteGroup(id:string){

    const ok = confirm("Remover grupo?")

    if(!ok) return

    await fetch(
      import.meta.env.VITE_API_URL + "/kixikila/admin/group/" + id,
      {
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      }
    )

    load()

  }

  async function editGroup(group:any){

    const newName = prompt("Nome do grupo",group.name)
    const newContribution = prompt("Contribuição",group.contribution)
    const newMembers = prompt("Membros",group.membersLimit)
    const newCycle = prompt("Meses do ciclo",group.cycleMonths)

    if(!newName) return

    await fetch(
      import.meta.env.VITE_API_URL + "/kixikila/admin/group/" + group.id,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("token")}`
        },
        body:JSON.stringify({
          name:newName,
          contribution:Number(newContribution),
          membersLimit:Number(newMembers),
          cycleMonths:Number(newCycle)
        })
      }
    )

    load()

  }

  useEffect(()=>{

    load()
    loadRequests()

  },[])

  return(

    <div className="p-6 bg-[#0B0E11] text-white min-h-screen">

      <h1 className="text-xl font-semibold mb-6">
        Admin Kixikila
      </h1>

      {/* CREATE GROUP */}

      <div className="bg-[#14181D] border border-[#2B3139] p-4 rounded-xl mb-6">

        <p className="font-semibold mb-3">
          Criar Grupo
        </p>

        <div className="flex flex-col gap-2">

          <input
            placeholder="Nome"
            value={name}
            onChange={e=>setName(e.target.value)}
            className="p-2 bg-[#0B0E11] border border-[#2B3139] rounded"
          />

          <input
            placeholder="Contribuição"
            value={contribution}
            onChange={e=>setContribution(e.target.value)}
            className="p-2 bg-[#0B0E11] border border-[#2B3139] rounded"
          />

          <input
            placeholder="Membros"
            value={membersLimit}
            onChange={e=>setMembersLimit(e.target.value)}
            className="p-2 bg-[#0B0E11] border border-[#2B3139] rounded"
          />

          <input
            placeholder="Meses do ciclo"
            value={cycleMonths}
            onChange={e=>setCycleMonths(e.target.value)}
            className="p-2 bg-[#0B0E11] border border-[#2B3139] rounded"
          />

          <button
            onClick={createGroup}
            className="bg-[#FCD535] text-black py-2 rounded"
          >
            Criar Grupo
          </button>

        </div>

      </div>

      {/* REQUESTS */}

      <div className="mb-6">

        <h2 className="font-semibold mb-3">
          Pedidos de Entrada
        </h2>

        {requests.map(r=>(

          <div
            key={r.id}
            className="bg-[#14181D] border border-[#2B3139] p-3 rounded mb-2 flex justify-between"
          >

            <div>

              <p>{r.user?.fullName}</p>

              <p className="text-sm text-[#848E9C]">
                {r.group?.name}
              </p>

            </div>

            <button
              onClick={()=>approve(r.id)}
              className="bg-green-600 px-3 rounded"
            >
              Aprovar
            </button>

          </div>

        ))}

      </div>

      {/* GROUPS */}

      <div>

        <h2 className="font-semibold mb-3">
          Grupos
        </h2>

        {groups.map(g=>(

          <div
            key={g.id}
            className="bg-[#14181D] border border-[#2B3139] p-3 rounded mb-2 flex justify-between items-center"
          >

            <div>

              <p>{g.name}</p>

              <p className="text-sm text-[#848E9C]">
                {g.filled}/{g.membersLimit} membros
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={()=>editGroup(g)}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Editar
              </button>

              <button
                onClick={()=>deleteGroup(g.id)}
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                Remover
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}