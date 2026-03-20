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

  function getStatusBadge(status) {
    const safeStatus = status || "ativo";

    const map = {
      ativo: "bg-emerald-100 text-emerald-700",
      arquivado: "bg-slate-200 text-slate-700",
      pausado: "bg-amber-100 text-amber-700",
      finalizado: "bg-blue-100 text-blue-700",
    };

    const classes = map[safeStatus] || "bg-slate-100 text-slate-700";

    return `
      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}">
        ${safeStatus}
      </span>
    `;
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
              ${getStatusBadge(cliente.status)}
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
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          data-filter="ativos"
          class="rounded-lg px-3 py-2 text-sm font-medium transition ${
            currentFilter === "ativos"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }"
        >
          Ativos
        </button>

        <button
          type="button"
          data-filter="arquivados"
          class="rounded-lg px-3 py-2 text-sm font-medium transition ${
            currentFilter === "arquivados"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }"
        >
          Arquivados
        </button>

        <button
          type="button"
          data-filter="todos"
          class="rounded-lg px-3 py-2 text-sm font-medium transition ${
            currentFilter === "todos"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }"
        >
          Todos
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