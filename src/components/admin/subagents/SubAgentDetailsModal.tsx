import { X } from "lucide-react"

import type { SubAgent } from "../../../services/adminSubAgent.service"

interface Props {

  open: boolean

  subAgent: SubAgent | null

  onClose(): void

}

function formatDate(date?: string) {

  if (!date) return "-"

  return new Date(date).toLocaleString("pt-PT")

}

function Row({

  label,

  value

}: {

  label: string

  value?: any

}) {

  return (

    <div className="grid grid-cols-3 gap-4 border-b py-3">

      <span className="font-medium text-gray-500">

        {label}

      </span>

      <span className="col-span-2 text-gray-800 break-all">

        {value || "-"}

      </span>

    </div>

  )

}

export default function SubAgentDetailsModal({

  open,

  subAgent,

  onClose

}: Props) {

  if (!open || !subAgent) {

    return null

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">

      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-8 py-6">

          <div>

            <h2 className="text-2xl font-bold">

              Detalhes do Sub-Agente

            </h2>

            <p className="mt-1 text-sm text-gray-500">

              Informações completas do funcionário.

            </p>

          </div>

          <button

            onClick={onClose}

            className="rounded-lg p-2 hover:bg-gray-100"

          >

            <X size={22} />

          </button>

        </div>

        {/* BODY */}

        <div className="space-y-8 p-8">

          {/* DADOS PESSOAIS */}

          <section>

            <h3 className="mb-4 text-lg font-semibold">

              Dados Pessoais

            </h3>

            <div className="rounded-xl border">

              <Row
                label="Nome"
                value={subAgent.user.fullName}
              />

              <Row
                label="ID Público"
                value={subAgent.user.publicId}
              />

              <Row
                label="Código"
                value={subAgent.employeeCode}
              />

              <Row
                label="Email"
                value={subAgent.user.email}
              />

              <Row
                label="Telefone"
                value={subAgent.user.phone}
              />

            </div>

          </section>

          {/* PROFISSIONAL */}

          <section>

            <h3 className="mb-4 text-lg font-semibold">

              Dados Profissionais

            </h3>

            <div className="rounded-xl border">

              <Row
                label="Cargo"
                value={subAgent.position}
              />

              <Row
                label="Departamento"
                value={subAgent.department}
              />

              <Row
                label="Posto"
                value={subAgent.workstation}
              />

              <Row
                label="Supervisor"
                value={subAgent.supervisor?.fullName}
              />

              <Row
                label="Estado"
                value={
                  subAgent.isActive
                    ? "Ativo"
                    : "Desativado"
                }
              />

              <Row
                label="Contratado em"
                value={formatDate(subAgent.hiredAt)}
              />

            </div>

          </section>

          {/* ADMINISTRAÇÃO */}

          <section>

            <h3 className="mb-4 text-lg font-semibold">

              Administração

            </h3>

            <div className="rounded-xl border">

              <Row
                label="Morada"
                value={subAgent.address}
              />

              <Row
                label="Criado em"
                value={formatDate(subAgent.createdAt)}
              />

              <Row
                label="Conta criada em"
                value={formatDate(subAgent.user.createdAt)}
              />

            </div>

          </section>

        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t px-8 py-6">

          <button

            onClick={onClose}

            className="rounded-xl bg-slate-800 px-6 py-3 text-white transition hover:bg-slate-900"

          >

            Fechar

          </button>

        </div>

      </div>

    </div>

  )

}