window.ZAClientes = (() => {
  let currentFilter = "ativos";

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getListElement() {
    return (
      document.getElementById("clientes-table-body") ||
      document.getElementById("clientes-list")
    );
  }

  function getFilteredClientes(clientes) {
    if (currentFilter === "ativos") {
      return clientes.filter(
        (cliente) => String(cliente.status || "ativo").toLowerCase() !== "arquivado"
      );
    }

    if (currentFilter === "arquivados") {
      return clientes.filter(
        (cliente) => String(cliente.status || "").toLowerCase() === "arquivado"
      );
    }

    return clientes;
  }

  function getObjetivo(cliente) {
    return (
      cliente?.dadosBaseEditados?.objetivo ||
      cliente?.preDiagnostico?.objetivo ||
      cliente?.preDiagnostico?.objetivo_principal ||
      cliente?.preDiagnostico?.objetivo_fisico ||
      cliente?.objetivo ||
      "—"
    );
  }

  function getStatusLabel(cliente) {
    return String(cliente.status || "").toLowerCase() === "arquivado"
      ? "Arquivado"
      : "Ativo";
  }

  function renderLista(clientes) {
    const list = getListElement();
    const emptyState = document.getElementById("empty-clientes");

    if (!list) return;

    const lista = getFilteredClientes(clientes);

    if (!lista.length) {
      list.innerHTML = "";
      emptyState?.classList.remove("hidden");
      return;
    }

    emptyState?.classList.add("hidden");

    list.innerHTML = lista
      .map((cliente) => {
        const isArchived = String(cliente.status || "").toLowerCase() === "arquivado";

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition">
            <td class="px-4 py-3 font-medium text-slate-800">
              ${cliente.nome || "-"}
            </td>

            <td class="px-4 py-3 text-slate-600">
              ${getObjetivo(cliente)}
            </td>

            <td class="px-4 py-3">
              ${getStatusLabel(cliente)}
            </td>

            <td class="px-4 py-3">
              <div class="cliente-acoes">
                <a
                  href="../cliente/index.html?id=${encodeURIComponent(cliente.id)}"
                  class="cliente-btn cliente-btn-abrir"
                >
                  Abrir
                </a>

                ${
                  isArchived
                    ? `
                      <button
                        type="button"
                        data-reactivate="${cliente.id}"
                        data-nome="${cliente.nome || ""}"
                        class="cliente-btn cliente-btn-reativar"
                      >
                        Reativar
                      </button>
                    `
                    : `
                      <button
                        type="button"
                        data-archive="${cliente.id}"
                        data-nome="${cliente.nome || ""}"
                        class="cliente-btn cliente-btn-arquivar"
                      >
                        Arquivar
                      </button>
                    `
                }
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    bindActionButtons();
  }

  function renderFilters() {
    const container = document.getElementById("clientes-filters");
    if (!container) return;

    container.innerHTML = `
      <div class="clientes-filtros">
        <button
          type="button"
          data-filter="ativos"
          class="cliente-filtro-btn ${currentFilter === "ativos" ? "is-active" : ""}"
        >
          <span>Ativos</span>
        </button>

        <button
          type="button"
          data-filter="arquivados"
          class="cliente-filtro-btn ${currentFilter === "arquivados" ? "is-active" : ""}"
        >
          <span>Arquivados</span>
        </button>

        <button
          type="button"
          data-filter="todos"
          class="cliente-filtro-btn ${currentFilter === "todos" ? "is-active" : ""}"
        >
          <span>Todos</span>
        </button>
      </div>
    `;

    container.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        init();
      });
    });
  }

  async function archive(id, nome = "") {
    const ok = window.confirm(`Deseja arquivar ${nome || "este cliente"}?`);
    if (!ok) return;

    const archived = window.ZAStorage?.archiveCliente?.(id);

    if (!archived) {
      window.alert("Erro ao arquivar cliente.");
      return;
    }

    const syncResult = await window.ZAStorage.syncNow();

    if (!syncResult?.ok) {
      window.alert(
        `Cliente arquivado localmente, mas houve falha ao sincronizar com o banco: ${syncResult?.error || "erro desconhecido"}`
      );
      return;
    }

    await init();
  }

  async function reactivate(id, nome = "") {
    const ok = window.confirm(`Deseja reativar ${nome || "este cliente"}?`);
    if (!ok) return;

    const reactivated = window.ZAStorage?.reactivateCliente?.(id);

    if (!reactivated) {
      window.alert("Erro ao reativar cliente.");
      return;
    }

    const syncResult = await window.ZAStorage.syncNow();

    if (!syncResult?.ok) {
      window.alert(
        `Cliente reativado localmente, mas houve falha ao sincronizar com o banco: ${syncResult?.error || "erro desconhecido"}`
      );
      return;
    }

    await init();
  }

  function bindActionButtons() {
    document.querySelectorAll("[data-archive]").forEach((button) => {
      button.addEventListener("click", async () => {
        await archive(button.dataset.archive, button.dataset.nome || "");
      });
    });

    document.querySelectorAll("[data-reactivate]").forEach((button) => {
      button.addEventListener("click", async () => {
        await reactivate(button.dataset.reactivate, button.dataset.nome || "");
      });
    });
  }

  async function init() {
    await window.ZAStorage.init({ force: true });
    const clientes = getClientes();
    renderFilters();
    renderLista(clientes);
  }

  return {
    init,
    archive,
    reactivate
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAClientes.init();
});