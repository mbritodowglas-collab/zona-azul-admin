window.ZARelatorio = (() => {
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

  function getLeadById(id) {
    const data = window.ZAStorage?.getData?.() || {};
    const leads = data.leads || [];
    return leads.find((item) => String(item.id) === String(id)) || null;
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

  function getPreDataFromCliente(clienteAtual) {
    if (!clienteAtual) return null;

    if (clienteAtual.preDiagnostico && typeof clienteAtual.preDiagnostico === "object") {
      return clienteAtual.preDiagnostico;
    }

    if (clienteAtual.leadId) {
      const lead = getLeadById(clienteAtual.leadId);
      if (lead) return lead;
    }

    return null;
  }

  function getRadarResumo(pre) {
    if (!pre) return "Sem radar disponível.";

    const radar =
      pre.radar ||
      pre.radarInicial ||
      pre.scores ||
      pre.pilares ||
      null;

    if (!radar || typeof radar !== "object") {
      return "Sem radar disponível.";
    }

    const entries = Object.entries(radar)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${value}`);

    return entries.length ? entries.join(" | ") : "Sem radar disponível.";
  }

  function renderCabecalho() {
    setText("cliente-nome-topo", cliente?.nome || "Relatório");
    setText("cliente-subtitulo", "Consolidação do caso do cliente.");
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

  function renderDados() {
    setText("dados-nome", cliente?.nome || "—");
    setText("dados-email", cliente?.email || "—");
    setText("dados-telefone", cliente?.telefone || "—");
    setText("dados-plano", cliente?.plano || "—");
    setText("dados-fase", cliente?.faseAtual || cliente?.fase_atual || "—");
    setText("dados-data-inicio", formatDate(cliente?.dataInicio || cliente?.createdAt || cliente?.created_at));
  }

  function renderPre() {
    const pre = getPreDataFromCliente(cliente);

    setText(
      "pre-objetivo",
      pre?.objetivo ||
      pre?.objetivo_principal ||
      cliente?.objetivo ||
      cliente?.objetivo_principal ||
      "—"
    );

    setText(
      "pre-resumo",
      pre?.resumoPrediagnostico ||
      pre?.resumo_pre_diagnostico ||
      pre?.rotina ||
      pre?.maior_dificuldade ||
      "Sem resumo registrado."
    );

    setText("pre-radar", getRadarResumo(pre));
  }

  function renderDiagnostico() {
    setText("diag-gargalo", cliente?.diagnosticoGargalo || "—");
    setText("diag-triagem", cliente?.diagnosticoTriagem || "—");
    setText("diag-leitura", cliente?.diagnosticoLeitura || "—");
    setText("diag-sintese", cliente?.diagnosticoSintese || "—");
    setText("diag-conduta", cliente?.condutaInicial || "—");
  }

  function renderAcompanhamento() {
    const acompanhamentos = Array.isArray(cliente?.acompanhamentos) ? cliente.acompanhamentos : [];
    const ultimo = acompanhamentos.length ? acompanhamentos[acompanhamentos.length - 1] : null;

    setText("acomp-data", ultimo?.data ? formatDate(ultimo.data) : "—");
    setText("acomp-aderencia", ultimo?.aderencia || "—");
    setText("acomp-evolucao", ultimo?.evolucao || "—");
    setText("acomp-dificuldades", ultimo?.dificuldades || "—");
    setText("acomp-ajustes", ultimo?.ajustes || "—");
  }

  function renderPlanejamento() {
    setText("plan-objetivo-central", cliente?.objetivoCentral || "—");
    setText("plan-foco-mes", cliente?.focoMes || "—");
    setText("plan-direcao", cliente?.direcaoComportamental || "—");
    setText("plan-habitos", cliente?.habitosChave || "—");
    setText("plan-observacoes", cliente?.planejamentoObservacoes || "—");
  }

  function renderTreino() {
    setText("treino-fase", cliente?.treinoFase || cliente?.faseAtual || "—");
    setText("treino-frequencia", cliente?.treinoFrequencia || "—");
    setText("treino-divisao", cliente?.treinoDivisao || "—");
    setText("treino-objetivo-ciclo", cliente?.treinoObjetivoCiclo || "—");
    setText("treino-resumo", cliente?.treinoResumo || "—");
    setText("treino-orientacoes", cliente?.treinoOrientacoesMfit || "—");
  }

  function bindEvents() {
    document.getElementById("imprimir-relatorio-btn")?.addEventListener("click", () => {
      window.print();
    });
  }

  function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      document.getElementById("relatorio-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("relatorio-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    renderCabecalho();
    renderDados();
    renderPre();
    renderDiagnostico();
    renderAcompanhamento();
    renderPlanejamento();
    renderTreino();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZARelatorio.init();
});