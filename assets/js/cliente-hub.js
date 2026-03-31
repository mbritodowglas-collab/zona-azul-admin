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

  function getObjetivo(clienteAtual) {
    return firstFilled(
      clienteAtual?.dadosBaseEditados?.objetivo,
      clienteAtual?.preDiagnostico?.objetivo,
      clienteAtual?.preDiagnostico?.objetivo_principal,
      clienteAtual?.preDiagnostico?.objetivo_fisico,
      clienteAtual?.objetivo,
      "Objetivo não informado"
    );
  }

  function renderCliente() {
    if (cliente) {
      setText("cliente-nome", cliente.nome || "Cliente");
      setText("cliente-objetivo", getObjetivo(cliente));
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

  async function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      renderCliente();
      bindEvents();
      return;
    }

    await window.ZAStorage.init({ force: true });
    cliente = getClienteById(clienteId);

    renderCliente();
    bindEvents();
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAClienteHub.init();
});