window.ZAClientes = (() => {
  let currentFilter = "ativos";

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function formatDateBR(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
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

  function getStatusChipClass(status) {
    if (status === "ativo") return "success";
    if (status === "arquivado") return "warning";
    return "secondary";
  }

  function renderTabela(clientes) {
    const tbody = document.getElementById("clientes-table-body");
    const emptyState = document.getElementById("empty-clientes");
    const tableWrap = document.getElementById("clientes-table-wrap");

    if (!tbody) return;

    const lista = getFilteredClientes(clientes);

    if (!lista.length) {
      tbody.innerHTML = "";
      emptyState?.classList.remove("hidden");
      tableWrap?.classList.add("hidden");
      return;
    }

    emptyState?.classList.add("hidden");
    tableWrap?.classList.remove("hidden");

    tbody.innerHTML = lista
      .map((cliente) => {
        const isArchived = cliente.status === "arquivado";

        return `
          <tr>
            <td>${cliente.nome || "-"}</td>
            <td>${cliente.email || "-"}</td>
            <td>${cliente.plano || "-"}</td>
            <td>${cliente.fase_nome || "-"}</td>
            <td>
              <span class="chip ${getStatusChipClass(cliente.status)}">
                ${cliente.status || "-"}
              </span>
            </td>
            <td>${formatDateBR(cliente.data_inicio || cliente.created_at)}</td>
            <td>
              <div class="actions">
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
            </td>
          </tr>
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
      alert("Não foi possível arquivar o cliente.");
      return;
    }

    init();
  }

  function reactivate(id) {
    const ok = window.confirm("Deseja reativar este cliente?");
    if (!ok) return;

    const reactivated = window.ZAStorage.reactivateCliente(id);
    if (!reactivated) {
      alert("Não foi possível reativar o cliente.");
      return;
    }

    init();
  }

  function init() {
    const clientes = getClientes();
    renderFilters();
    renderTabela(clientes);
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