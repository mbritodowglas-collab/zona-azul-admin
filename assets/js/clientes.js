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
      return clientes.filter((cliente) => cliente.status !== "arquivado");
    }

    if (currentFilter === "arquivados") {
      return clientes.filter((cliente) => cliente.status === "arquivado");
    }

    return clientes;
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
        const isArchived = cliente.status === "arquivado";

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition">
            <td class="px-4 py-3 font-medium text-slate-800">
              ${cliente.nome || "-"}
            </td>

            <td class="px-4 py-3">
              <div class="cliente-acoes">
                <a
                  href="../cliente/?id=${cliente.id}"
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
                        class="cliente-btn cliente-btn-reativar"
                      >
                        Reativar
                      </button>
                    `
                    : `
                      <button
                        type="button"
                        data-archive="${cliente.id}"
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

    list.querySelectorAll("[data-archive]").forEach((button) => {
      button.addEventListener("click", () => {
        archive(button.dataset.archive);
      });
    });

    list.querySelectorAll("[data-reactivate]").forEach((button) => {
      button.addEventListener("click", () => {
        reactivate(button.dataset.reactivate);
      });
    });
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
          <span class="cliente-filtro-icone">●</span>
          <span>Ativos</span>
        </button>

        <button
          type="button"
          data-filter="arquivados"
          class="cliente-filtro-btn ${currentFilter === "arquivados" ? "is-active" : ""}"
        >
          <span class="cliente-filtro-icone">●</span>
          <span>Arquivados</span>
        </button>

        <button
          type="button"
          data-filter="todos"
          class="cliente-filtro-btn ${currentFilter === "todos" ? "is-active" : ""}"
        >
          <span class="cliente-filtro-icone">●</span>
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

  function archive(id) {
    const ok = window.confirm("Deseja arquivar este cliente?");
    if (!ok) return;

    const archived = window.ZAStorage?.archiveCliente?.(id);

    if (!archived) {
      window.alert("Erro ao arquivar cliente.");
      return;
    }

    init();
  }

  function reactivate(id) {
    const ok = window.confirm("Deseja reativar este cliente?");
    if (!ok) return;

    const reactivated = window.ZAStorage?.reactivateCliente?.(id);

    if (!reactivated) {
      window.alert("Erro ao reativar cliente.");
      return;
    }

    init();
  }

  function init() {
    const clientes = getClientes();
    renderFilters();
    renderLista(clientes);
  }

  return {
    init,
    archive,
    reactivate,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZAClientes.init();
});