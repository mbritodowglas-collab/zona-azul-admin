document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getClienteById(id) {
    return getClientes().find((cliente) => String(cliente.id) === String(id)) || null;
  }

  const cliente = getClienteById(clienteId);

  if (!cliente) {
    alert("Cliente não encontrado.");
    window.location.href = "../clientes/";
    return;
  }

  const nomeEl = document.getElementById("cliente-nome");
  const objetivoEl = document.getElementById("cliente-objetivo");
  const voltarBtn = document.getElementById("voltar-btn");

  if (nomeEl) {
    nomeEl.textContent = cliente.nome || "Cliente";
  }

  if (objetivoEl) {
    objetivoEl.textContent =
      cliente.objetivo ||
      cliente.objetivo_principal ||
      "Sem objetivo definido";
  }

  if (voltarBtn) {
    voltarBtn.addEventListener("click", () => {
      window.location.href = "../clientes/";
    });
  }

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.open;

      if (tipo === "lancamentos") {
        window.location.href = `../cliente/lancamentos.html?id=${encodeURIComponent(clienteId)}`;
        return;
      }

      if (tipo === "relatorio") {
        window.location.href = `../cliente/relatorio.html?id=${encodeURIComponent(clienteId)}`;
        return;
      }

      if (tipo === "planejamento") {
        window.location.href = `../cliente/planejamento.html?id=${encodeURIComponent(clienteId)}`;
      }
    });
  });
});