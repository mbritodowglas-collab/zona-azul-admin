window.ZACliente = (() => {

  function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function getCliente(id) {
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    return clientes.find(c => c.id === id);
  }

  function renderVisao(cliente) {
    return `
      <h2>Resumo do Pré-Diagnóstico</h2>
      <p><strong>Média:</strong> ${cliente.preDiagnostico.media_geral}</p>
      <p><strong>Pilar mais baixo:</strong> ${cliente.preDiagnostico.pilar_mais_baixo}</p>
    `;
  }

  function renderDiagnostico(cliente) {
    const scores = cliente.preDiagnostico.scores;

    return `
      <h2>Radar (Base)</h2>
      <p>Movimento: ${scores.movimento}</p>
      <p>Alimentação: ${scores.alimentacao}</p>

      <h3>Revisão</h3>
      <input placeholder="Movimento revisado" id="rev-movimento" />
      <textarea placeholder="Notas movimento"></textarea>
    `;
  }

  function renderFisico(cliente) {
    return `
      <h2>Avaliação Física</h2>
      <input placeholder="Peso" id="peso" />
      <input placeholder="Altura" id="altura" />
    `;
  }

  function renderPlanejamento(cliente) {
    return `
      <h2>Planejamento</h2>
      <textarea placeholder="Objetivo central"></textarea>
      <textarea placeholder="Foco do mês 1"></textarea>
    `;
  }

  function render(cliente) {
    document.getElementById("cliente-nome").textContent = cliente.nome;

    document.getElementById("tab-visao").innerHTML = renderVisao(cliente);
    document.getElementById("tab-diagnostico").innerHTML = renderDiagnostico(cliente);
    document.getElementById("tab-fisico").innerHTML = renderFisico(cliente);
    document.getElementById("tab-planejamento").innerHTML = renderPlanejamento(cliente);
  }

  function init() {
    const id = getIdFromURL();
    const cliente = getCliente(id);
    if (!cliente) return;

    render(cliente);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  ZACliente.init();
});