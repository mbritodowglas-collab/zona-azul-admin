window.ZAClientes = (() => {
  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function formatDateBR(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
  }

  function renderTabela(clientes) {
    const tbody = document.getElementById("clientes-table-body");
    const emptyState = document.getElementById("empty-clientes");
    const tableWrap = document.getElementById("clientes-table-wrap");

    if (!tbody) return;

    if (!clientes.length) {
      tbody.innerHTML = "";
      emptyState?.classList.remove("hidden");
      tableWrap?.classList.add("hidden");
      return;
    }

    emptyState?.classList.add("hidden");
    tableWrap?.classList.remove("hidden");

    tbody.innerHTML = clientes
      .map(
        (cliente) => `
          <tr>
            <td>${cliente.nome || "-"}</td>
            <td>${cliente.email || "-"}</td>
            <td>${cliente.plano || "-"}</td>
            <td>${cliente.fase_nome || "-"}</td>
            <td>
              <span class="chip ${cliente.status === "ativo" ? "success" : "warning"}">
                ${cliente.status || "-"}
              </span>
            </td>
            <td>${formatDateBR(cliente.data_inicio || cliente.created_at)}</td>
            <td>
              <a
                class="btn small"
                href="../cliente/?id=${encodeURIComponent(cliente.id)}"
              >
                Abrir
              </a>
            </td>
          </tr>
        `
      )
      .join("");
  }

  function init() {
    const clientes = getClientes();
    renderTabela(clientes);
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZAClientes.init();
});