import { api } from "./api"

export const AdminKixikilaService = {

  /* =========================
     LISTAR GRUPOS
  ========================= */

  async groups(){

    const res = await api.get("/kixikila/admin/groups")

    return res.data

  },

  /* =========================
     CRIAR GRUPO
  ========================= */

  async createGroup(data:{
    name:string
    contribution:number
    membersLimit:number
    cycleMonths:number
  }){

    const res = await api.post("/kixikila/admin/group",data)

    return res.data

  },

  /* =========================
     APROVAR MEMBRO
  ========================= */

  async approve(requestId:number,position:number){

    const res = await api.post("/kixikila/admin/approve",{
      requestId,
      position
    })

    return res.data

  },

  /* =========================
     PAGAR MEMBRO
  ========================= */

  async pay(memberId:number){

    const res = await api.post("/kixikila/admin/pay",{
      memberId
    })

    return res.data

  }

}