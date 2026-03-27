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

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function updateCliente(updatedCliente) {
    return window.ZAStorage?.updateCliente?.(updatedCliente);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return String(dateValue);
    }
  }

  function formatDateTime(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleString("pt-BR");
    } catch {
      return String(dateValue);
    }
  }

  function getInitials(nome) {
    if (!nome) return "C";
    const parts = nome.trim().split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "")).toUpperCase();
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "";
  }

  function val(id) {
    const el = document.getElementById(id);
    return el?.value?.trim?.() ?? el?.value ?? "";
  }

  function ensureFeedbackModal() {
    if (document.getElementById("za-feedback-overlay")) return;

    const style = document.createElement("style");
    style.id = "za-feedback-style";
    style.textContent = `
      .za-feedback-overlay {
        position: fixed;
        inset: 0;
        background: rgba(6, 10, 24, 0.72);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 9999;
      }
      .za-feedback-overlay.hidden { display: none; }
      .za-feedback-modal {
        width: min(100%, 420px);
        background: linear-gradient(180deg, rgba(25,31,56,0.98), rgba(15,20,39,0.98));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        padding: 22px 20px 18px;
        color: #f5f7ff;
      }
      .za-feedback-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .za-feedback-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: rgba(120, 130, 255, 0.16);
        border: 1px solid rgba(138, 147, 255, 0.25);
      }
      .za-feedback-title {
        margin: 0;
        font-size: 20px;
        line-height: 1.2;
        font-weight: 700;
        color: #ffffff;
      }
      .za-feedback-message {
        margin: 10px 0 0;
        color: rgba(230,235,255,0.88);
        font-size: 16px;
        line-height: 1.55;
      }
      .za-feedback-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 18px;
      }
      .za-feedback-btn {
        border: 0;
        border-radius: 14px;
        padding: 12px 18px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        color: #ffffff;
        background: linear-gradient(135deg, #6d73ff, #8d72ff);
        box-shadow: 0 10px 24px rgba(109,115,255,0.25);
      }
      .za-feedback-btn:active { transform: scale(0.98); }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "za-feedback-overlay";
    overlay.className = "za-feedback-overlay hidden";
    overlay.innerHTML = `
      <div class="za-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="za-feedback-title">
        <div class="za-feedback-head">
          <div class="za-feedback-icon" id="za-feedback-icon">✓</div>
          <h3 class="za-feedback-title" id="za-feedback-title">Tudo certo</h3>
        </div>
        <p class="za-feedback-message" id="za-feedback-message"></p>
        <div class="za-feedback-actions">
          <button type="button" class="za-feedback-btn" id="za-feedback-ok">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) hideFeedback();
    });

    document.getElementById("za-feedback-ok")?.addEventListener("click", hideFeedback);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideFeedback();
    });
  }

  function showFeedback(message, title = "Tudo certo", icon = "✓") {
    ensureFeedbackModal();

    const overlay = document.getElementById("za-feedback-overlay");
    const titleEl = document.getElementById("za-feedback-title");
    const iconEl = document.getElementById("za-feedback-icon");
    const messageEl = document.getElementById("za-feedback-message");

    if (titleEl) titleEl.textContent = title;
    if (iconEl) iconEl.textContent = icon;
    if (messageEl) messageEl.textContent = message;
    overlay?.classList.remove("hidden");
  }

  function hideFeedback() {
    document.getElementById("za-feedback-overlay")?.classList.add("hidden");
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

  function getDiagnosticoAtual() {
    return cliente?.analiseCaso?.diagnosticoCompleto || {};
  }

  function getPlanejamentoAtual() {
    return cliente?.planejamento || {};
  }

  function renderHeader() {
    setText("planner-avatar", getInitials(cliente?.nome || "Cliente"));
    setText("planner-nome", cliente?.nome || "Planejamento");
    setText("planner-sub", `Objetivo central: ${getObjetivo()}`);

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar && clienteId) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderSummary() {
    const diagnostico = getDiagnosticoAtual();

    setText("summary-objetivo", getObjetivo());
    setText("summary-gargalo", diagnostico.gargalo || "—");
    setText("summary-prioridade", diagnostico.prioridade || "—");
    setText(
      "summary-foco",
      firstFilled(
        diagnostico?.focoMes1?.gap,
        diagnostico?.focoMes1?.habito,
        diagnostico?.focoMes1?.ambiente
      ) || "—"
    );

    setText("side-objetivo", getObjetivo());
    setText("side-gargalo", diagnostico.gargalo || "—");
    setText("side-prioridade", diagnostico.prioridade || "—");
    setText("side-habito", diagnostico?.focoMes1?.habito || "—");
    setText("side-ambiente", diagnostico?.focoMes1?.ambiente || "—");
  }

  function renderPlanejamento() {
    const planejamento = getPlanejamentoAtual();
    const estrategia = planejamento.estrategia || {};
    const habitos = planejamento.habitos || {};
    const treino = planejamento.treino || {};
    const cardio = planejamento.cardio || {};
    const observacoes = planejamento.observacoes || {};

    setValue("estrategia-fase", estrategia.fase || "");
    setValue("estrategia-formato", estrategia.formato || "");
    setValue("estrategia-objetivo-30d", estrategia.objetivo30d || "");
    setValue("estrategia-foco-central", estrategia.focoCentral || "");
    setValue("estrategia-indicador-sucesso", estrategia.indicadorSucesso || "");
    setValue("estrategia-risco", estrategia.riscoPrincipal || "");
    setValue("estrategia-diretriz", estrategia.diretrizTecnica || "");
    setValue("pilar-1", estrategia.pilares?.[0] || "");
    setValue("pilar-2", estrategia.pilares?.[1] || "");
    setValue("pilar-3", estrategia.pilares?.[2] || "");

    setValue("habito-ancora", habitos.habitoAncora || "");
    setValue("ajuste-ambiente", habitos.ajusteAmbiente || "");
    setValue("meta-sono", habitos.metaSono || "");
    setValue("meta-hidratacao", habitos.metaHidratacao || "");
    setValue("meta-passos", habitos.metaPassos || "");
    setValue("meta-alimentacao", habitos.metaAlimentacao || "");
    setValue("ritual-anti-sabotagem", habitos.ritualAntiSabotagem || "");
    setValue("frequencia-checkin", habitos.frequenciaCheckin || "");
    setValue("regra-minima", habitos.regraMinima || "");

    setValue("treino-objetivo", treino.objetivoCiclo || "");
    setValue("treino-frequencia", treino.frequenciaSemanal || "");
    setValue("treino-divisao", treino.estruturaGeral || "");
    setValue("treino-duracao", treino.duracaoMedia || "");
    setValue("treino-local", treino.local || "");
    setValue("treino-intensidade", treino.intensidadeAlvo || "");
    setValue("treino-progressao", treino.criterioProgressao || "");
    setValue("treino-restricoes", treino.restricoes || "");
    setValue("treino-observacoes", treino.observacoesTecnicas || "");

    setValue("mes1-foco", treino.mes1?.foco || "");
    setValue("mes1-divisao", treino.mes1?.divisao || "");
    setValue("mes1-programa", treino.mes1?.programa || "");

    setValue("mes2-foco", treino.mes2?.foco || "");
    setValue("mes2-divisao", treino.mes2?.divisao || "");
    setValue("mes2-programa", treino.mes2?.programa || "");

    setValue("mes3-foco", treino.mes3?.foco || "");
    setValue("mes3-divisao", treino.mes3?.divisao || "");
    setValue("mes3-programa", treino.mes3?.programa || "");

    setValue("cardio-modalidade", cardio.modalidade || "");
    setValue("cardio-frequencia", cardio.frequencia || "");
    setValue("cardio-duracao", cardio.duracao || "");
    setValue("cardio-intensidade", cardio.intensidade || "");
    setValue("neat-meta", cardio.metaNeat || "");
    setValue("recuperacao-estrategia", cardio.estrategiaRecuperacao || "");
    setValue("cardio-observacoes", cardio.observacoes || "");

    setValue("comunicacao-tom", observacoes.tomComunicacao || "");
    setValue("momento-revisao", observacoes.dataRevisao || "");
    setValue("alertas-internos", observacoes.alertasInternos || "");
    setValue("mensagem-interna", observacoes.mensagemInterna || "");

    setValue("planejamento-resumo", planejamento.resumoGerado || "");

    const updated = planejamento.updatedAt ? formatDate(planejamento.updatedAt) : "—";
    setText("estrategia-updated", `Última atualização: ${updated}`);
    setText("habitos-updated", `Última atualização: ${updated}`);
    setText("treino-updated", `Última atualização: ${updated}`);
    setText("cardio-updated", `Última atualização: ${updated}`);
    setText("observacoes-updated", `Última atualização: ${updated}`);

    renderStatus();
  }

  function renderStatus() {
    const root = document.getElementById("status-planejamento");
    const badgesRoot = document.getElementById("status-badges");
    const planejamento = getPlanejamentoAtual();

    if (!root || !badgesRoot) return;

    if (!planejamento || !planejamento.updatedAt) {
      root.textContent = "Planejamento ainda não salvo.";
      badgesRoot.innerHTML = "";
      return;
    }

    root.innerHTML = `
      <strong style="display:block; margin-bottom:8px; color:#fff;">Planejamento ativo</strong>
      <span style="display:block;">Última gravação: ${formatDateTime(planejamento.updatedAt)}</span>
    `;

    const badges = [];
    if (planejamento.estrategia?.focoCentral) badges.push("Estratégia definida");
    if (planejamento.habitos?.habitoAncora) badges.push("Hábito âncora definido");
    if (planejamento.treino?.objetivoCiclo) badges.push("Ciclo de treino definido");
    if (planejamento.treino?.mes1?.programa) badges.push("Mês 1 escrito");
    if (planejamento.treino?.mes2?.programa) badges.push("Mês 2 escrito");
    if (planejamento.treino?.mes3?.programa) badges.push("Mês 3 escrito");
    if (planejamento.cardio?.modalidade) badges.push("Cardio definido");
    if (planejamento.resumoGerado) badges.push("Resumo gerado");

    badgesRoot.innerHTML = badges
      .map((badge) => `<span class="planner-badge">${badge}</span>`)
      .join("");
  }

  function buildPlanejamentoPayload() {
    return {
      estrategia: {
        fase: val("estrategia-fase"),
        formato: val("estrategia-formato"),
        objetivo30d: val("estrategia-objetivo-30d"),
        focoCentral: val("estrategia-foco-central"),
        indicadorSucesso: val("estrategia-indicador-sucesso"),
        riscoPrincipal: val("estrategia-risco"),
        diretrizTecnica: val("estrategia-diretriz"),
        pilares: [val("pilar-1"), val("pilar-2"), val("pilar-3")].filter(Boolean)
      },

      habitos: {
        habitoAncora: val("habito-ancora"),
        ajusteAmbiente: val("ajuste-ambiente"),
        metaSono: val("meta-sono"),
        metaHidratacao: val("meta-hidratacao"),
        metaPassos: val("meta-passos"),
        metaAlimentacao: val("meta-alimentacao"),
        ritualAntiSabotagem: val("ritual-anti-sabotagem"),
        frequenciaCheckin: val("frequencia-checkin"),
        regraMinima: val("regra-minima")
      },

      treino: {
        objetivoCiclo: val("treino-objetivo"),
        frequenciaSemanal: val("treino-frequencia"),
        estruturaGeral: val("treino-divisao"),
        duracaoMedia: val("treino-duracao"),
        local: val("treino-local"),
        intensidadeAlvo: val("treino-intensidade"),
        criterioProgressao: val("treino-progressao"),
        restricoes: val("treino-restricoes"),
        observacoesTecnicas: val("treino-observacoes"),

        mes1: {
          foco: val("mes1-foco"),
          divisao: val("mes1-divisao"),
          programa: val("mes1-programa")
        },

        mes2: {
          foco: val("mes2-foco"),
          divisao: val("mes2-divisao"),
          programa: val("mes2-programa")
        },

        mes3: {
          foco: val("mes3-foco"),
          divisao: val("mes3-divisao"),
          programa: val("mes3-programa")
        }
      },

      cardio: {
        modalidade: val("cardio-modalidade"),
        frequencia: val("cardio-frequencia"),
        duracao: val("cardio-duracao"),
        intensidade: val("cardio-intensidade"),
        metaNeat: val("neat-meta"),
        estrategiaRecuperacao: val("recuperacao-estrategia"),
        observacoes: val("cardio-observacoes")
      },

      observacoes: {
        tomComunicacao: val("comunicacao-tom"),
        dataRevisao: val("momento-revisao"),
        alertasInternos: val("alertas-internos"),
        mensagemInterna: val("mensagem-interna")
      },

      resumoGerado: val("planejamento-resumo"),
      updatedAt: new Date().toISOString()
    };
  }

  function savePlanejamento() {
    const payload = buildPlanejamentoPayload();

    const updatedCliente = {
      ...cliente,
      planejamento: payload,
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);

    if (!ok) {
      showFeedback("Não foi possível salvar o planejamento.", "Erro ao salvar", "⚠");
      return;
    }

    cliente = updatedCliente;
    renderPlanejamento();
    showFeedback("Planejamento salvo com sucesso.", "Plano atualizado", "🧠");
  }

  function hydrateFromDiagnostico() {
    const diagnostico = getDiagnosticoAtual();
    const planejamento = getPlanejamentoAtual();

    const gargalo = diagnostico.gargalo || "";
    const prioridade = diagnostico.prioridade || "";
    const focoGap = diagnostico?.focoMes1?.gap || "";
    const focoHabito = diagnostico?.focoMes1?.habito || "";
    const focoAmbiente = diagnostico?.focoMes1?.ambiente || "";

    const gaps = Array.isArray(diagnostico.gaps) ? diagnostico.gaps : [];

    setValue("estrategia-formato", firstFilled(val("estrategia-formato"), diagnostico?.perfil?.formato, planejamento?.estrategia?.formato));
    setValue("estrategia-objetivo-30d", firstFilled(val("estrategia-objetivo-30d"), prioridade));
    setValue("estrategia-foco-central", firstFilled(val("estrategia-foco-central"), focoGap, focoHabito, gargalo));
    setValue("estrategia-risco", firstFilled(val("estrategia-risco"), gargalo));
    setValue("estrategia-diretriz", firstFilled(
      val("estrategia-diretriz"),
      diagnostico.sintese,
      diagnostico.leitura
    ));

    setValue("pilar-1", firstFilled(val("pilar-1"), gaps?.[0]?.pilar));
    setValue("pilar-2", firstFilled(val("pilar-2"), gaps?.[1]?.pilar));
    setValue("pilar-3", firstFilled(val("pilar-3"), gaps?.[2]?.pilar));

    setValue("habito-ancora", firstFilled(val("habito-ancora"), focoHabito));
    setValue("ajuste-ambiente", firstFilled(val("ajuste-ambiente"), focoAmbiente));

    setValue("treino-objetivo", firstFilled(val("treino-objetivo"), prioridade));
    setValue("treino-restricoes", firstFilled(val("treino-restricoes"), diagnostico.triagem));
    setValue("comunicacao-tom", firstFilled(val("comunicacao-tom"), "direto e acolhedor"));

    renderStatus();
    showFeedback("Campos estratégicos puxados do diagnóstico completo.", "Diagnóstico importado", "⚡");
  }

  function generateResumo() {
    const payload = buildPlanejamentoPayload();

    const resumo = [
      `Cliente: ${cliente?.nome || "—"}`,
      `Objetivo: ${getObjetivo()}`,
      "",
      `Estratégia macro: ${payload.estrategia.focoCentral || "—"}.`,
      `Meta de 30 dias: ${payload.estrategia.objetivo30d || "—"}.`,
      `Indicador de sucesso: ${payload.estrategia.indicadorSucesso || "—"}.`,
      `Risco principal: ${payload.estrategia.riscoPrincipal || "—"}.`,
      "",
      `Pilares priorizados: ${payload.estrategia.pilares?.length ? payload.estrategia.pilares.join(", ") : "—"}.`,
      `Hábito âncora: ${payload.habitos.habitoAncora || "—"}.`,
      `Ajuste de ambiente: ${payload.habitos.ajusteAmbiente || "—"}.`,
      `Meta de sono: ${payload.habitos.metaSono || "—"}.`,
      `Meta de hidratação: ${payload.habitos.metaHidratacao || "—"}.`,
      `Meta de passos / movimento: ${payload.habitos.metaPassos || "—"}.`,
      `Meta alimentar: ${payload.habitos.metaAlimentacao || "—"}.`,
      `Regra mínima: ${payload.habitos.regraMinima || "—"}.`,
      "",
      `Treino - ciclo de 3 meses: ${payload.treino.objetivoCiclo || "—"} | frequência ${payload.treino.frequenciaSemanal || "—"} | estrutura geral ${payload.treino.estruturaGeral || "—"} | duração ${payload.treino.duracaoMedia || "—"}.`,
      `Local: ${payload.treino.local || "—"}. Intensidade alvo: ${payload.treino.intensidadeAlvo || "—"}.`,
      `Critério de progressão: ${payload.treino.criterioProgressao || "—"}.`,
      `Restrições / cuidados: ${payload.treino.restricoes || "—"}.`,
      `Mês 1: foco ${payload.treino.mes1?.foco || "—"} | divisão ${payload.treino.mes1?.divisao || "—"}.`,
      `Programa mês 1: ${payload.treino.mes1?.programa || "—"}.`,
      `Mês 2: foco ${payload.treino.mes2?.foco || "—"} | divisão ${payload.treino.mes2?.divisao || "—"}.`,
      `Programa mês 2: ${payload.treino.mes2?.programa || "—"}.`,
      `Mês 3: foco ${payload.treino.mes3?.foco || "—"} | divisão ${payload.treino.mes3?.divisao || "—"}.`,
      `Programa mês 3: ${payload.treino.mes3?.programa || "—"}.`,
      "",
      `Cardio: ${payload.cardio.modalidade || "—"} | frequência ${payload.cardio.frequencia || "—"} | duração ${payload.cardio.duracao || "—"} | intensidade ${payload.cardio.intensidade || "—"}.`,
      `Meta de NEAT: ${payload.cardio.metaNeat || "—"}.`,
      `Recuperação: ${payload.cardio.estrategiaRecuperacao || "—"}.`,
      "",
      `Tom de comunicação: ${payload.observacoes.tomComunicacao || "—"}.`,
      `Data sugerida de revisão: ${payload.observacoes.dataRevisao ? formatDate(payload.observacoes.dataRevisao) : "—"}.`,
      `Alertas internos: ${payload.observacoes.alertasInternos || "—"}.`,
      `Mensagem interna do treinador: ${payload.observacoes.mensagemInterna || "—"}.`
    ].join("\n");

    setValue("planejamento-resumo", resumo);
    renderStatus();
    showFeedback("Resumo operacional gerado.", "Resumo pronto", "📄");
  }

  async function copyResumo() {
    const texto = val("planejamento-resumo");

    if (!texto) {
      showFeedback("Gere um resumo antes de copiar.", "Nada para copiar", "⚠");
      return;
    }

    try {
      await navigator.clipboard.writeText(texto);
      showFeedback("Resumo copiado para a área de transferência.", "Copiado", "📋");
    } catch {
      showFeedback("Não consegui copiar automaticamente, mas o texto já está pronto no campo.", "Cópia manual", "⚠");
    }
  }

  function initAccordions() {
    const accordions = Array.from(document.querySelectorAll(".planner-accordion"));
    if (!accordions.length) return;

    const STORAGE_KEY = "za_planejamento_open_accordion";
    const saved = localStorage.getItem(STORAGE_KEY);

    function openAccordion(targetAccordion) {
      accordions.forEach((accordion) => {
        const toggle = accordion.querySelector(".planner-toggle");
        const isTarget = accordion === targetAccordion;

        accordion.classList.toggle("is-open", isTarget);
        if (toggle) {
          toggle.setAttribute("aria-expanded", isTarget ? "true" : "false");
        }
      });

      const name = targetAccordion?.dataset?.accordion || "";
      if (name) {
        localStorage.setItem(STORAGE_KEY, name);
      }
    }

    accordions.forEach((accordion, index) => {
      const toggle = accordion.querySelector(".planner-toggle");
      if (!toggle) return;

      toggle.addEventListener("click", () => {
        const isOpen = accordion.classList.contains("is-open");

        if (isOpen) {
          accordion.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        openAccordion(accordion);
      });

      const shouldOpen =
        (saved && accordion.dataset.accordion === saved) ||
        (!saved && index === 0);

      if (shouldOpen) {
        accordion.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        accordion.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function bindEvents() {
    document.getElementById("salvar-planejamento-btn")?.addEventListener("click", savePlanejamento);
    document.getElementById("salvar-planejamento-topo-btn")?.addEventListener("click", savePlanejamento);
    document.getElementById("puxar-diagnostico-btn")?.addEventListener("click", hydrateFromDiagnostico);
    document.getElementById("gerar-resumo-btn")?.addEventListener("click", generateResumo);
    document.getElementById("copiar-resumo-btn")?.addEventListener("click", copyResumo);
  }

  function init() {
    clienteId = getQueryParam("id");
    ensureFeedbackModal();

    if (!clienteId) {
      document.getElementById("planejamento-page")?.classList.add("hidden");
      document.getElementById("planejamento-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("planejamento-page")?.classList.add("hidden");
      document.getElementById("planejamento-not-found")?.classList.remove("hidden");
      return;
    }

    renderHeader();
    renderSummary();
    renderPlanejamento();
    bindEvents();
    initAccordions();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZAPlanejamento.init();
});