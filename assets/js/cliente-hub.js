window.ZAClienteHub = (() => {
  let clienteId = null;
  let cliente = null;

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "";
  }

  function renderCliente() {
    if (cliente) {
      setText("cliente-nome", cliente.nome || "Cliente");
      setText(
        "cliente-objetivo",
        firstFilled(
          cliente?.dadosBaseEditados?.objetivo,
          cliente?.preDiagnostico?.objetivo,
          cliente?.preDiagnostico?.objetivo_principal,
          cliente?.preDiagnostico?.objetivo_fisico,
          cliente?.objetivo,
          "Objetivo não informado"
        )
      );
      return;
    }

    setText("cliente-nome", "Cliente não encontrado");
    setText("cliente-objetivo", "Verifique o ID do cliente");
  }

  function bindEvents() {
    document.getElementById("voltar-btn")?.addEventListener("click", () => {
      window.location.href = "../clientes/";
    });

    document.querySelectorAll("[data-open]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!clienteId) return;

        const type = button.dataset.open;

        if (type === "lancamentos") {
          window.location.href = `./lancamentos.html?id=${encodeURIComponent(clienteId)}`;
          return;
        }

        if (type === "relatorio") {
          window.location.href = `./relatorio-cliente.html?id=${encodeURIComponent(clienteId)}`;
          return;
        }

        if (type === "planejamento") {
          window.location.href = `./planejamento.html?id=${encodeURIComponent(clienteId)}`;
        }
      });
    });
  }

  function init() {
    clienteId = getQueryParam("id");
    cliente = clienteId ? getClienteById(clienteId) : null;

    renderCliente();
    bindEvents();
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAStorage.init();
  window.ZAClienteHub.init();
});