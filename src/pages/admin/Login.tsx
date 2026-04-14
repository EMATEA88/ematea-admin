import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api"
import toast from "react-hot-toast"
import { ShieldCheck } from "lucide-react"

export default function AdminLogin() {

  const navigate = useNavigate()

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function normalizePhone(value: string) {
    if (!value) return value

    let numbers = value.replace(/\D/g, "")

    if (numbers.startsWith("244")) {
      numbers = numbers.slice(3)
    }

    if (numbers.startsWith("0")) {
      numbers = numbers.slice(1)
    }

    return `+244${numbers}`
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)

      const normalizedPhone = normalizePhone(phone)

      const { data } = await api.post("/auth/login", {
        phone: normalizedPhone,
        password,
      })

      if (data.user.role !== "ADMIN") {
        toast.error("Acesso restrito a administradores")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.user.role)

      toast.success("Login efetuado com sucesso")
      navigate("/admin")

    } catch (err: any) {
      toast.error(
        err?.response?.data?.error ||
        "Credenciais inválidas"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">

      <div className="w-full max-w-md">

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 backdrop-blur">

          <div className="flex flex-col items-center mb-8">

            <div className="bg-amber-500/10 p-4 rounded-full mb-4">
              <ShieldCheck className="text-amber-400 w-8 h-8" />
            </div>

            <h1 className="text-2xl font-semibold text-white">
              Painel Administrativo
            </h1>

            <p className="text-neutral-400 text-sm mt-2">
              Acesso restrito e monitorizado
            </p>

          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="text-sm text-neutral-400">
                Telefone
              </label>

              <input
                type="text"
                placeholder="+2449XXXXXXXX"
                className="w-full bg-neutral-800 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 mt-2 outline-none transition"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-neutral-400">
                Palavra-passe
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-neutral-800 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white rounded-xl px-4 py-3 mt-2 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
            >
              {loading ? "Autenticando..." : "Entrar"}
            </button>

          </form>

        </div>

        <p className="text-center text-neutral-600 text-xs mt-6">
          © {new Date().getFullYear()} EMATEA FINTECH
        </p>

      </div>
    </div>
  )
}