window.ZAPlanoCliente = (() => {
  let clienteId = null;
  let archivedId = null;
  let cliente = null;
  let planejamentoSelecionado = null;

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
    if (el) el.textContent = normalizeValue(value);
  }

  function setHTML(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function normalizeValue(value) {
    if (value === undefined || value === null || String(value).trim() === "") {
      return "—";
    }
    return String(value);
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return String(dateValue);
    }
  }

  function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getObjetivo() {
    return (
      firstFilled(
        cliente?.dadosBaseEditados?.objetivo,
        cliente?.preDiagnostico?.objetivo,
        cliente?.preDiagnostico?.objetivo_principal,
        cliente?.preDiagnostico?.objetivo_fisico,
        cliente?.objetivo
      ) || "Objetivo não informado"
    );
  }

  function getPlanejamentoAtivo() {
    return cliente?.planejamento || {};
  }

  function getPlanejamentosArquivados() {
    return Array.isArray(cliente?.planejamentosArquivados)
      ? cliente.planejamentosArquivados
      : [];
  }

  function resolvePlanejamento() {
    if (!cliente) return null;

    if (archivedId) {
      return (
        getPlanejamentosArquivados().find(
          (item) => String(item.id) === String(archivedId)
        ) || null
      );
    }

    const ativo = getPlanejamentoAtivo();
    if (ativo && Object.keys(ativo).length > 0) return ativo;

    return null;
  }

  function hasPlanning() {
    return !!planejamentoSelecionado;
  }

  function renderMeta() {
    const nomeCiclo = planejamentoSelecionado?.encerramento?.nomeCiclo;

    setText("meta-cliente", cliente?.nome || "Cliente");
    setText("meta-objetivo", getObjetivo());
    setText(
      "meta-data",
      formatDate(
        planejamentoSelecionado?.updatedAt ||
        planejamentoSelecionado?.archivedAt ||
        new Date().toISOString()
      )
    );

    if (nomeCiclo) {
      setText("plan-title", nomeCiclo);
      setText(
        "plan-cover-subtitle",
        archivedId
          ? "Planejamento arquivado para consulta."
          : "Documento de direcionamento do processo."
      );
      return;
    }

    setText(
      "plan-cover-subtitle",
      firstFilled(
        planejamentoSelecionado?.titulo,
        planejamentoSelecionado?.estrategia?.focoCentral,
        archivedId
          ? "Planejamento arquivado para consulta."
          : "Documento de direcionamento do processo."
      )
    );
  }

  function renderArchiveBadge() {
    const root = document.getElementById("plan-archive-badge-wrap");
    if (!root) return;

    if (archivedId) {
      const archivedDate = formatDate(
        planejamentoSelecionado?.archivedAt ||
        planejamentoSelecionado?.encerramento?.encerradoEm
      );

      root.innerHTML = `
        <span class="plan-archive-badge archived">
          Ciclo encerrado • ${archivedDate}
        </span>
      `;
      return;
    }

    root.innerHTML = `
      <span class="plan-archive-badge active">
        Planejamento ativo
      </span>
    `;
  }

  function renderEncerramento() {
    const encerramento = planejamentoSelecionado?.encerramento || {};
    const status = encerramento.statusCiclo || "";
    const resultado = encerramento.resultadoCiclo || "";
    const observacao = encerramento.observacaoEncerramento || "";

    if (!archivedId && !status && !resultado && !observacao) {
      setText("encerramento-status-view", "Ciclo em andamento");
      setText("encerramento-resultado-view", "Ainda não encerrado.");
      setText("encerramento-observacao-view", "Sem observações de encerramento.");
      return;
    }

    if (status) {
      setHTML(
        "encerramento-status-view",
        `<span class="cycle-pill ${status}">${capitalize(status)}</span>`
      );
    } else {
      setText("encerramento-status-view", "—");
    }

    setText("encerramento-resultado-view", resultado || "Sem resultado registrado.");
    setText("encerramento-observacao-view", observacao || "Sem observação de encerramento.");
  }

  function renderVisaoGeral() {
    const estrategia = planejamentoSelecionado?.estrategia || {};

    setText("visao-meta-30d", estrategia.objetivo30d);
    setText("visao-foco-central", estrategia.focoCentral);
    setText("visao-indicador", estrategia.indicadorSucesso);
    setText("visao-diretriz", estrategia.diretrizTecnica);
  }

  function renderHabitos() {
    const habitos = planejamentoSelecionado?.habitos || {};

    setText("habito-ancora-view", habitos.habitoAncora);
    setText("habito-ambiente-view", habitos.ajusteAmbiente);
    setText("habito-checkin-view", habitos.frequenciaCheckin);
    setText("habito-sono-view", habitos.metaSono);
    setText("habito-hidratacao-view", habitos.metaHidratacao);
    setText("habito-passos-view", habitos.metaPassos);
    setText("habito-alimentacao-view", habitos.metaAlimentacao);
    setText("habito-ritual-view", habitos.ritualAntiSabotagem);
    setText("habito-regra-view", habitos.regraMinima);
  }

  function renderNutricional() {
    const nutricional = planejamentoSelecionado?.nutricional || {};

    setText("nutri-objetivo-view", nutricional.objetivo);
    setText("nutri-foco-view", nutricional.focoPrincipal);
    setText("nutri-regra-view", nutricional.regraMinima);
    setText("nutri-refeicoes-view", nutricional.refeicoesPrioritarias);
    setText("nutri-corridos-view", nutricional.estrategiaDiasCorridos);
    setText("nutri-fds-view", nutricional.estrategiaFimDeSemana);
    setText("nutri-recaida-view", nutricional.respostaRecaidas);
    setText("nutri-observacoes-view", nutricional.observacoes);
  }

  function renderTreino() {
    const treino = planejamentoSelecionado?.treino || {};

    setText("treino-objetivo-view", treino.objetivoCiclo);
    setText("treino-frequencia-view", treino.frequenciaSemanal);
    setText("treino-duracao-view", treino.duracaoMedia);
    setText("treino-local-view", treino.local);
    setText("treino-intensidade-view", treino.intensidadeAlvo);
    setText("treino-progressao-view", treino.criterioProgressao);
    setText("treino-estrutura-view", treino.estruturaGeral);
    setText("treino-restricoes-view", treino.restricoes);
    setText("treino-observacoes-view", treino.observacoesTecnicas);

    setText("mes1-foco-view", treino?.mes1?.foco);
    setText("mes1-divisao-view", treino?.mes1?.divisao);
    setText("mes1-divisao-card-view", treino?.mes1?.divisao);
    setText("mes1-programa-view", treino?.mes1?.programa);

    setText("mes2-foco-view", treino?.mes2?.foco);
    setText("mes2-divisao-view", treino?.mes2?.divisao);
    setText("mes2-divisao-card-view", treino?.mes2?.divisao);
    setText("mes2-programa-view", treino?.mes2?.programa);

    setText("mes3-foco-view", treino?.mes3?.foco);
    setText("mes3-divisao-view", treino?.mes3?.divisao);
    setText("mes3-divisao-card-view", treino?.mes3?.divisao);
    setText("mes3-programa-view", treino?.mes3?.programa);
  }

  function renderCardio() {
    const cardio = planejamentoSelecionado?.cardio || {};

    setText("cardio-modalidade-view", cardio.modalidade);
    setText("cardio-frequencia-view", cardio.frequencia);
    setText("cardio-duracao-view", cardio.duracao);
    setText("cardio-intensidade-view", cardio.intensidade);
    setText("cardio-neat-view", cardio.metaNeat);
    setText("cardio-recuperacao-view", cardio.estrategiaRecuperacao);
    setText("cardio-observacoes-view", cardio.observacoes);
  }

  function renderProximosPassos() {
    const observacoes = planejamentoSelecionado?.observacoes || {};

    setText("proxima-revisao-view", formatDate(observacoes.dataRevisao));
    setText("tom-comunicacao-view", observacoes.tomComunicacao);
  }

  function bindEvents() {
    document.getElementById("print-plan-btn")?.addEventListener("click", () => {
      window.print();
    });

    const voltarPlanejamento = document.getElementById("voltar-planejamento-link");
    if (voltarPlanejamento && clienteId) {
      voltarPlanejamento.href = `./planejamento.html?id=${encodeURIComponent(clienteId)}`;
    }

    const voltarCliente = document.getElementById("voltar-cliente-link");
    if (voltarCliente && clienteId) {
      voltarCliente.href = `./index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function render() {
    if (!cliente || !hasPlanning()) {
      document.getElementById("plan-not-found")?.classList.remove("hidden");
      document.getElementById("plan-paper")?.classList.add("hidden");
      return;
    }

    document.getElementById("plan-not-found")?.classList.add("hidden");
    document.getElementById("plan-paper")?.classList.remove("hidden");

    renderMeta();
    renderArchiveBadge();
    renderEncerramento();
    renderVisaoGeral();
    renderHabitos();
    renderNutricional();
    renderTreino();
    renderCardio();
    renderProximosPassos();
  }

  async function init() {
    clienteId = getQueryParam("id");
    archivedId = getQueryParam("archived");

    if (!clienteId) {
      render();
      bindEvents();
      return;
    }

    await window.ZAStorage.init({ force: true });
    cliente = getClienteById(clienteId);
    planejamentoSelecionado = resolvePlanejamento();

    render();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAPlanoCliente.init();
});