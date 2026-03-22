window.ZAPlanejamento = (() => {
  let clienteId = null;
  let cliente = null;

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function setClientes(clientes) {
    return window.ZAStorage?.setClientes?.(clientes);
  }

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch (error) {
      return dateValue;
    }
  }

  function getInitials(nome) {
    if (!nome) return "C";
    const parts = nome.trim().split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "")).toUpperCase();
  }

  function renderCabecalho() {
    setText("cliente-nome-topo", cliente?.nome || "Planejamento");
    setText("cliente-subtitulo", "Estratégia comportamental e programação de treino.");
    setText("cliente-nome", cliente?.nome || "Cliente");
    setText("cliente-email", cliente?.email || "—");
    setText("cliente-objetivo", cliente?.objetivo || cliente?.objetivo_principal || "Objetivo principal");

    const avatar = document.getElementById("cliente-avatar");
    if (avatar) avatar.textContent = getInitials(cliente?.nome || "Cliente");

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderPlanejamento() {
    document.getElementById("plan-objetivo-central").value = cliente?.objetivoCentral || "";
    document.getElementById("plan-foco-mes").value = cliente?.focoMes || "";
    document.getElementById("plan-direcao-comportamental").value = cliente?.direcaoComportamental || "";
    document.getElementById("plan-habitos-chave").value = cliente?.habitosChave || "";
    document.getElementById("plan-observacoes").value = cliente?.planejamentoObservacoes || "";

    const updatedEl = document.getElementById("plan-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.planejamentoUpdatedAt ? formatDate(cliente.planejamentoUpdatedAt) : "—"}`;
    }
  }

  function renderTreino() {
    document.getElementById("treino-fase").value = cliente?.treinoFase || cliente?.faseAtual || "";
    document.getElementById("treino-frequencia").value = cliente?.treinoFrequencia || "";
    document.getElementById("treino-divisao").value = cliente?.treinoDivisao || "";
    document.getElementById("treino-objetivo-ciclo").value = cliente?.treinoObjetivoCiclo || "";
    document.getElementById("treino-resumo").value = cliente?.treinoResumo || "";
    document.getElementById("treino-orientacoes-mfit").value = cliente?.treinoOrientacoesMfit || "";

    const updatedEl = document.getElementById("treino-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.treinosUpdatedAt ? formatDate(cliente.treinosUpdatedAt) : "—"}`;
    }
  }

  function savePlanejamento() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      objetivoCentral: document.getElementById("plan-objetivo-central")?.value.trim() || "",
      focoMes: document.getElementById("plan-foco-mes")?.value.trim() || "",
      direcaoComportamental: document.getElementById("plan-direcao-comportamental")?.value.trim() || "",
      habitosChave: document.getElementById("plan-habitos-chave")?.value.trim() || "",
      planejamentoObservacoes: document.getElementById("plan-observacoes")?.value.trim() || "",
      planejamentoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Planejamento salvo.");
    renderPlanejamento();
  }

  function saveTreino() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      treinoFase: document.getElementById("treino-fase")?.value.trim() || "",
      faseAtual: document.getElementById("treino-fase")?.value.trim() || clientes[index].faseAtual || "",
      treinoFrequencia: document.getElementById("treino-frequencia")?.value.trim() || "",
      treinoDivisao: document.getElementById("treino-divisao")?.value.trim() || "",
      treinoObjetivoCiclo: document.getElementById("treino-objetivo-ciclo")?.value.trim() || "",
      treinoResumo: document.getElementById("treino-resumo")?.value.trim() || "",
      treinoOrientacoesMfit: document.getElementById("treino-orientacoes-mfit")?.value.trim() || "",
      treinosUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Programação de treino salva.");
    renderTreino();
  }

  function bindEvents() {
    document.getElementById("salvar-planejamento-btn")?.addEventListener("click", savePlanejamento);
    document.getElementById("salvar-treino-btn")?.addEventListener("click", saveTreino);
  }

  function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      document.getElementById("planejamento-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("planejamento-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    renderCabecalho();
    renderPlanejamento();
    renderTreino();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZAPlanejamento.init();
});