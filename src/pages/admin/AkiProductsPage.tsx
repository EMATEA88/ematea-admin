import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  Package,
  Power,
  Pencil,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { adminAkiService } from "../../services/adminAki.service";

interface Product {
  id: number;
  name: string;
  externalId: string | null;
  providerCode: string | null;
  price: string | number;
  cost: string | number;
  providerCommission?: string | number;
  isActive: boolean;
  isManuallyDisabled: boolean;
  partner?: { id: number; name: string };
  serviceGroup?: {
    id: number;
    name: string;
    provider?: {
      id?: number;
      name: string;
      code?: string | null;
    };
  };
}

interface ProductResponse {
  data: Product[];
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ProductOption {
  id: number;
  name: string;
  provider?: {
    id: number;
    name: string;
    code?: string | null;
  };
}

interface ProductForm {
  name: string;
  externalId: string;
  serviceGroupId: string;
  price: string;
  providerCommission: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  externalId: "",
  serviceGroupId: "",
  price: "",
  providerCommission: "0",
};

const inputClass =
  "w-full rounded-lg border border-[#252B33] bg-[#0B0E11] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500 disabled:opacity-50";

const labelClass =
  "mb-1.5 block text-xs font-medium text-gray-400";

const formatMoney = (value: string | number) =>
  Number(value ?? 0).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr
          key={index}
          className="animate-pulse border-b border-[#252B33]"
        >
          {Array.from({ length: 6 }).map((__, cell) => (
            <td key={cell} className="px-3 py-5">
              <div
                className={`h-3 rounded bg-[#252B33] ${
                  cell === 0
                    ? "w-40"
                    : cell === 3
                      ? "ml-auto w-20"
                      : "w-24"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AkiProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [groups, setGroups] = useState<ProductOption[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    providerCommission: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  const [groupEditorProduct, setGroupEditorProduct] = useState<Product | null>(null);
  const [groupEditorValue, setGroupEditorValue] = useState("");
  const [groupEditorLoading, setGroupEditorLoading] = useState(false);
  const [groupEditorSaving, setGroupEditorSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminAkiService.getProducts({
        page,
        limit,
        search,
        status: status as "ACTIVE" | "INACTIVE" | "",
      });

      const result: ProductResponse | undefined =
        response?.data;

      setProducts(result?.data ?? []);

      setSummary(
        result?.summary ?? {
          total: 0,
          active: 0,
          inactive: 0,
        }
      );

      setTotalPages(
        Math.max(
          1,
          result?.pagination?.totalPages ?? 1
        )
      );
    } catch (error: any) {
      console.error(
        "Erro ao carregar produtos AKI:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Não foi possível carregar os produtos."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function openCreateForm() {
    setForm(EMPTY_FORM);
    setGroups([]);
    setFormOpen(true);
    setOptionsLoading(true);

    try {
      const response =
        await adminAkiService.getProductOptions();

      const payload = response?.data ?? response;

      const availableGroups =
        payload?.groups ??
        payload?.data?.groups ??
        [];

      if (!Array.isArray(availableGroups)) {
        throw new Error(
          "A API devolveu uma lista de grupos inválida."
        );
      }

      setGroups(availableGroups);
    } catch (error: any) {
      console.error(
        "Erro ao carregar opções de produtos:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Não foi possível carregar os grupos de serviço."
        )
      );

      setFormOpen(false);
    } finally {
      setOptionsLoading(false);
    }
  }

  function suggestSocialGroup(value: string) {
    const normalized = value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
    if (!/(social|redes sociais)/i.test(normalized)) return;

    const socialGroup = groups.find((group) =>
      /redes sociais|social media/i.test(group.name)
    );

    if (socialGroup) {
      setForm((current) => ({
        ...current,
        serviceGroupId: String(socialGroup.id),
      }));
    }
  }

  async function openGroupEditor(product: Product) {
    setGroupEditorProduct(product);
    setGroupEditorValue(
      product.serviceGroup?.id ? String(product.serviceGroup.id) : ""
    );

    if (groups.length > 0) return;

    setGroupEditorLoading(true);
    try {
      const response = await adminAkiService.getProductOptions();
      const payload = response?.data ?? response;
      const availableGroups = payload?.groups ?? payload?.data?.groups ?? [];

      if (!Array.isArray(availableGroups)) {
        throw new Error("A API devolveu uma lista de grupos inválida.");
      }

      setGroups(availableGroups);
    } catch (error: any) {
      setGroupEditorProduct(null);
      toast.error(
        getErrorMessage(error, "Não foi possível carregar os grupos de serviço.")
      );
    } finally {
      setGroupEditorLoading(false);
    }
  }

  async function handleUpdateProductGroup() {
    if (!groupEditorProduct || !groupEditorValue || groupEditorSaving) return;

    const selected = groups.find(
      (group) => String(group.id) === groupEditorValue
    );

    if (!selected) {
      toast.error("Selecione um grupo válido.");
      return;
    }

    setGroupEditorSaving(true);
    const toastId = toast.loading("A atualizar grupo do produto...");

    try {
      const response = await adminAkiService.updateProductGroup(
        groupEditorProduct.id,
        Number(groupEditorValue)
      );

      toast.success(
        response?.message ?? "Grupo do produto atualizado com sucesso.",
        { id: toastId }
      );

      setGroupEditorProduct(null);
      setGroupEditorValue("");
      await loadProducts();
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, "Não foi possível alterar o grupo do produto."),
        { id: toastId }
      );
    } finally {
      setGroupEditorSaving(false);
    }
  }

  function openEditForm(product: Product) {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      price: String(product.price ?? ""),
      providerCommission: String(product.providerCommission ?? 0),
    });
  }

  async function handleUpdateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editProduct || editSaving) return;

    const name = editForm.name.trim();
    const price = Number(editForm.price);
    const providerCommission = Number(editForm.providerCommission);

    if (!name) {
      toast.error("Informe o nome do produto.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("O preço de venda deve ser superior a zero.");
      return;
    }

    if (
      !Number.isFinite(providerCommission) ||
      providerCommission < 0 ||
      providerCommission > price
    ) {
      toast.error(
        "A comissão deve estar entre zero e o preço de venda."
      );
      return;
    }

    setEditSaving(true);
    const toastId = toast.loading("A guardar alterações do produto...");

    try {
      const response = await adminAkiService.updateProduct(editProduct.id, {
        name,
        price,
        providerCommission,
      });

      if (response?.success === false) {
        throw new Error(
          response?.message || "Não foi possível atualizar o produto."
        );
      }

      setEditProduct(null);
      setEditForm({ name: "", price: "", providerCommission: "" });

      toast.success(
        response?.message || `Produto "${name}" atualizado com sucesso.`,
        {
          id: toastId,
          duration: 5000,
          icon: "✓",
        }
      );

      await loadProducts();
    } catch (error: any) {
      console.error("Erro ao atualizar produto AKI:", error);

      toast.error(
        getErrorMessage(error, "Não foi possível atualizar o produto."),
        {
          id: toastId,
          duration: 7000,
        }
      );
    } finally {
      setEditSaving(false);
    }
  }

  async function handleCreateProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const price = Number(form.price);
    const providerCommission = Number(
      form.providerCommission
    );
    const serviceGroupId = Number(form.serviceGroupId);

    if (
      !form.name.trim() ||
      !form.externalId.trim() ||
      !serviceGroupId
    ) {
      toast.error(
        "Preencha o nome, código externo e grupo de serviço."
      );
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error(
        "O preço de venda deve ser superior a zero."
      );
      return;
    }

    if (
      !Number.isFinite(providerCommission) ||
      providerCommission < 0 ||
      providerCommission > price
    ) {
      toast.error(
        "A comissão do fornecedor deve estar entre zero e o preço de venda."
      );
      return;
    }

    setSaving(true);

    const toastId = toast.loading(
      "A registar produto..."
    );

    try {
      const response =
        await adminAkiService.createProduct({
          name: form.name.trim(),
          externalId: form.externalId.trim(),
          serviceGroupId,
          price,
          providerCommission,
        });

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Não foi possível registar o produto."
        );
      }

      toast.success(
        response?.message ||
          "Produto registado com sucesso.",
        { id: toastId }
      );

      setFormOpen(false);
      setForm(EMPTY_FORM);

      setPage(1);
      setSearch("");
      setSearchInput("");
      setStatus("");

      // Atualiza diretamente o catálogo com os filtros limpos.
      if (
        page === 1 &&
        search === "" &&
        status === ""
      ) {
        await loadProducts();
      }
    } catch (error: any) {
      console.error(
        "Erro ao criar produto AKI:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Não foi possível registar o produto."
        ),
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(product: Product) {
    const nextStatus = !product.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? `Pretende reativar "${product.name}"? A disponibilidade será confirmada na AKI.`
        : `Pretende desativar "${product.name}"?`
    );

    if (!confirmed) return;

    setUpdatingId(product.id);

    try {
      const response =
        await adminAkiService.updateProductStatus(
          product.id,
          nextStatus
        );

      toast.success(
        response?.message ||
          (nextStatus
            ? "Produto reativado."
            : "Produto desativado.")
      );

      await loadProducts();
    } catch (error: any) {
      console.error(
        "Erro ao alterar produto:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Não foi possível alterar o estado do produto."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSyncProducts() {
    if (syncing || loading) return;

    setSyncing(true);

    const toastId = toast.loading(
      "A sincronizar catálogo AKI..."
    );

    try {
      const payload =
        await adminAkiService.syncProducts();

      // Resposta do controller:
      // { success, message, data: resultado }
      const result = payload?.data;

      if (!result || typeof result !== "object") {
        throw new Error(
          "A API devolveu uma resposta de sincronização inválida."
        );
      }

      const message =
        `${Number(result.created ?? 0)} criados, ` +
        `${Number(result.updated ?? 0)} atualizados e ` +
        `${Number(result.failed ?? 0)} falhas.`;

      if (result.success) {
        toast.success(
          `Sincronização concluída: ${message}`,
          {
            id: toastId,
            duration: 6000,
          }
        );
      } else if (result.partial) {
        toast(
          `Sincronização parcial: ${message}`,
          {
            id: toastId,
            duration: 8000,
          }
        );
      } else {
        toast.error(
          result.message ||
            payload?.message ||
            "A sincronização falhou.",
          {
            id: toastId,
            duration: 7000,
          }
        );
      }

      await loadProducts();
    } catch (error: any) {
      console.error(
        "[AKI Products] Erro na sincronização:",
        error
      );

      toast.error(
        getErrorMessage(
          error,
          "Não foi possível sincronizar os produtos."
        ),
        {
          id: toastId,
          duration: 7000,
        }
      );
    } finally {
      setSyncing(false);
    }
  }

  const selectedGroup = groups.find(
    (group) =>
      String(group.id) === form.serviceGroupId
  );
    return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 text-gray-100 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252B33] pb-5">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-white">
            <Package
              size={21}
              className="text-emerald-400"
            />
            Produtos AKI
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gestão do catálogo de produtos da 5Linhas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void openCreateForm()}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <Plus size={16} />
            Adicionar produto
          </button>

          <button
            type="button"
            onClick={() => void handleSyncProducts()}
            disabled={syncing || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                syncing ? "animate-spin" : ""
              }
            />

            {syncing
              ? "A sincronizar..."
              : "Sincronizar AKI"}
          </button>

          <button
            type="button"
            onClick={() => void loadProducts()}
            disabled={loading || syncing}
            className="flex items-center gap-2 rounded-lg border border-[#252B33] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading ? "animate-spin" : ""
              }
            />
            Atualizar lista
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryItem
          label="Total de produtos"
          value={summary.total}
        />

        <SummaryItem
          label="Produtos ativos"
          value={summary.active}
          color="text-emerald-400"
        />

        <SummaryItem
          label="Produtos inativos"
          value={summary.inactive}
          color="text-red-400"
        />
      </section>

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_auto]"
      >
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Pesquisar nome, código ou fornecedor..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">Todos os estados</option>
          <option value="ACTIVE">Ativos</option>
          <option value="INACTIVE">Inativos</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Pesquisar
        </button>
      </form>

      <div className="overflow-x-auto border-t border-[#252B33]">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[#252B33] text-[11px] uppercase tracking-wider text-gray-500">
              <th className="px-3 py-4">Produto</th>
              <th className="px-3 py-4">Código</th>
              <th className="px-3 py-4">Fornecedor</th>
              <th className="px-3 py-4 text-right">
                Preço
              </th>
              <th className="px-3 py-4">Estado</th>
              <th className="px-3 py-4 text-right">
                Ação
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#252B33]">
            {loading ? (
              <SkeletonRows />
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-4">
                    <p className="text-sm font-medium text-white">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {product.serviceGroup?.name ??
                        "Sem grupo"}
                    </p>
                  </td>

                  <td className="px-3 py-4 font-mono text-xs text-gray-400">
                    {product.externalId ?? "—"}
                  </td>

                  <td className="px-3 py-4 text-sm text-gray-400">
                    {product.serviceGroup?.provider?.name ??
                      "—"}
                  </td>

                  <td className="px-3 py-4 text-right font-mono text-sm text-gray-300">
                    {formatMoney(product.price)} Kz
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={
                        product.isActive
                          ? "text-xs font-medium text-emerald-400"
                          : "text-xs font-medium text-red-400"
                      }
                    >
                      {product.isActive
                        ? "Ativo"
                        : "Inativo"}
                    </span>

                    {product.isManuallyDisabled && (
                      <p className="mt-1 text-[10px] text-gray-500">
                        Desativado pela EMATEA
                      </p>
                    )}
                  </td>

                  <td className="px-3 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        disabled={updatingId === product.id || syncing || editSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void openGroupEditor(product)}
                        disabled={updatingId === product.id || syncing}
                        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/10 disabled:opacity-50"
                      >
                        Alterar grupo
                      </button>
                      <button
                        type="button"
                        disabled={
                          updatingId === product.id
                        }
                        onClick={() =>
                          void handleStatusChange(product)
                        }
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                        product.isActive
                          ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                          : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {updatingId === product.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Power size={14} />
                      )}

                      {updatingId === product.id
                        ? "A atualizar..."
                        : product.isActive
                          ? "Desativar"
                          : "Reativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-[#252B33] pt-4">
        <span className="text-xs text-gray-500">
          Página {page} de {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
            className="rounded-lg border border-[#252B33] px-4 py-2 text-sm text-gray-300 disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            type="button"
            disabled={
              loading || page >= totalPages
            }
            onClick={() =>
              setPage((current) => current + 1)
            }
            className="rounded-lg border border-[#252B33] px-4 py-2 text-sm text-gray-300 disabled:opacity-40"
          >
            Seguinte
          </button>
        </div>
      </footer>
            {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl border border-[#252B33] bg-[#161A1F] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B33] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  Adicionar produto
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Registo manual no catálogo da EMATEA.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="Fechar formulário"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateProduct}
              className="space-y-4 p-5"
            >
              {optionsLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  A carregar fornecedores e grupos...
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>
                      Grupo de serviço *
                    </label>

                    <select
                      required
                      value={form.serviceGroupId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          serviceGroupId: event.target.value,
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="">
                        Selecione o grupo
                      </option>

                      {groups.map((group) => (
                        <option
                          key={group.id}
                          value={group.id}
                        >
                          {group.provider?.name
                            ? `${group.provider.name} — ${group.name}`
                            : group.name}
                        </option>
                      ))}
                    </select>

                    {groups.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-400">
                        Não existem grupos AKI ativos disponíveis para cadastro.
                      </p>
                    )}
                  </div>

                  {selectedGroup?.provider?.name && (
                    <div className="rounded-lg border border-[#252B33] bg-[#0B0E11] px-3 py-2 text-xs text-gray-400">
                      Fornecedor:{" "}
                      <span className="font-medium text-white">
                        {selectedGroup.provider.name}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Nome do produto *
                      </label>

                      <input
                        required
                        maxLength={160}
                        value={form.name}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }));
                          suggestSocialGroup(event.target.value);
                        }}
                        placeholder="Ex.: Unitel Net 1.5GB"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Código externo *
                      </label>

                      <input
                        required
                        maxLength={120}
                        value={form.externalId}
                        onChange={(event) => {
                          setForm((current) => ({
                            ...current,
                            externalId: event.target.value,
                          }));
                          suggestSocialGroup(event.target.value);
                        }}
                        placeholder="Código único do produto"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Preço de venda (Kz) *
                      </label>

                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.price}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            price: event.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Comissão do fornecedor (Kz) *
                      </label>

                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.providerCommission}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            providerCommission:
                              event.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    O custo será calculado automaticamente:
                    preço de venda menos comissão do fornecedor.
                  </p>
                </>
              )}

              <div className="flex justify-end gap-2 border-t border-[#252B33] pt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="rounded-lg border border-[#252B33] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    optionsLoading ||
                    groups.length === 0
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "A registar..."
                    : "Registar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4">
          <div className="my-8 w-full max-w-xl rounded-xl border border-[#252B33] bg-[#161A1F] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B33] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Editar produto</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Código: {editProduct.externalId ?? editProduct.providerCode ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                disabled={editSaving}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                aria-label="Fechar formulário de edição"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 p-5">
              <div>
                <label className={labelClass}>Nome do produto *</label>
                <input
                  required
                  maxLength={160}
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  disabled={editSaving}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Preço de venda (Kz) *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.price}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    disabled={editSaving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Comissão do fornecedor (Kz) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.providerCommission}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        providerCommission: event.target.value,
                      }))
                    }
                    disabled={editSaving}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#252B33] bg-[#0B0E11] px-3 py-3 text-xs text-gray-400">
                O código externo, o grupo, o estado de ativação e o histórico de transações
                serão preservados. O custo será recalculado automaticamente pela diferença
                entre o preço de venda e a comissão do fornecedor.
                <p className="mt-2 text-gray-300">
                  Custo calculado:{" "}
                  <span className="font-semibold text-emerald-400">
                    {Number(editForm.price) >= Number(editForm.providerCommission) &&
                    Number(editForm.price) > 0 &&
                    Number.isFinite(Number(editForm.price)) &&
                    Number.isFinite(Number(editForm.providerCommission))
                      ? `${formatMoney(
                          Number(editForm.price) - Number(editForm.providerCommission)
                        )} Kz`
                      : "—"}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#252B33] pt-4">
                <button
                  type="button"
                  onClick={() => setEditProduct(null)}
                  disabled={editSaving}
                  className="rounded-lg border border-[#252B33] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editSaving && <Loader2 size={15} className="animate-spin" />}
                  {editSaving ? "A guardar..." : "Guardar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {groupEditorProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#252B33] bg-[#161A1F] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252B33] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Alterar grupo do produto</h2>
                <p className="mt-1 text-xs text-gray-500">{groupEditorProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setGroupEditorProduct(null)}
                disabled={groupEditorSaving}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {groupEditorLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
                  <Loader2 size={17} className="animate-spin" />
                  A carregar grupos...
                </div>
              ) : (
                <>
                  <label className={labelClass}>Novo grupo de serviço *</label>
                  <select
                    value={groupEditorValue}
                    onChange={(event) => setGroupEditorValue(event.target.value)}
                    className={inputClass}
                    disabled={groupEditorSaving}
                  >
                    <option value="">Selecione o grupo</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.provider?.name
                          ? `${group.provider.name} — ${group.name}`
                          : group.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div className="flex justify-end gap-2 border-t border-[#252B33] pt-4">
                <button
                  type="button"
                  onClick={() => setGroupEditorProduct(null)}
                  disabled={groupEditorSaving}
                  className="rounded-lg border border-[#252B33] px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleUpdateProductGroup()}
                  disabled={groupEditorLoading || groupEditorSaving || !groupEditorValue}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {groupEditorSaving && <Loader2 size={15} className="animate-spin" />}
                  {groupEditorSaving ? "A guardar..." : "Guardar grupo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="border-b border-[#252B33] pb-3">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className={`mt-1 text-2xl font-semibold ${color}`}>
        {value}
      </p>
    </div>
  );
}