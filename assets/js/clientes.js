window.ZAClientes = (() => {
  let currentFilter = "ativos";

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getFilteredClientes(clientes) {
    if (currentFilter === "ativos") {
      return clientes.filter(cliente => cliente.status !== "arquivado");
    }

    if (currentFilter === "arquivados") {
      return clientes.filter(cliente => cliente.status === "arquivado");
    }

    return clientes;
  }

  function renderLista(clientes) {
    const list = document.getElementById("clientes-list");
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
          <div class="card" style="margin-bottom:12px;">
            <div class="card-body">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                
                <div style="font-weight:700; font-size:1rem;">
                  ${cliente.nome || "-"}
                </div>

                <div class="actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                  
                  <a
                    class="btn small"
                    href="../cliente/?id=${encodeURIComponent(cliente.id)}"
                  >
                    Abrir
                  </a>

                  ${
                    isArchived
                      ? `
                        <button
                          class="btn small secondary"
                          type="button"
                          onclick="window.ZAClientes.reactivate('${cliente.id}')"
                        >
                          Reativar
                        </button>
                      `
                      : `
                        <button
                          class="btn small danger"
                          type="button"
                          onclick="window.ZAClientes.archive('${cliente.id}')"
                        >
                          Arquivar
                        </button>
                      `
                  }

                </div>

              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderFilters() {
    const container = document.getElementById("clientes-filters");
    if (!container) return;

    container.innerHTML = `
      <div class="actions">
        <button class="btn small ${currentFilter === "ativos" ? "" : "secondary"}" type="button" data-filter="ativos">
          Ativos
        </button>
        <button class="btn small ${currentFilter === "arquivados" ? "" : "secondary"}" type="button" data-filter="arquivados">
          Arquivados
        </button>
        <button class="btn small ${currentFilter === "todos" ? "" : "secondary"}" type="button" data-filter="todos">
          Todos
        </button>
      </div>
    `;

    container.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        init();
      });
    });
  }

  function archive(id) {
    const ok = window.confirm("Deseja arquivar este cliente?");
    if (!ok) return;

    const archived = window.ZAStorage.archiveCliente(id);

    if (!archived) {
      alert("Erro ao arquivar cliente.");
      return;
    }

    init();
  }

  function reactivate(id) {
    const ok = window.confirm("Deseja reativar este cliente?");
    if (!ok) return;

    const reactivated = window.ZAStorage.reactivateCliente(id);

    if (!reactivated) {
      alert("Erro ao reativar cliente.");
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
    reactivate
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZAClientes.init();
});