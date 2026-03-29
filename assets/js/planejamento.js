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

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
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
        width: min(100%, 460px);
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
        gap: 10px;
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
      }
      .za-feedback-btn-primary {
        background: linear-gradient(135deg, #6d73ff, #8d72ff);
        box-shadow: 0 10px 24px rgba(109,115,255,0.25);
      }
      .za-feedback-btn-secondary {
        background: rgba(255,255,255,0.08);
      }
      .za-feedback-btn:active { transform: scale(0.98); }
      .za-feedback-field {
        display: grid;
        gap: 8px;
        margin-top: 14px;
      }
      .za-feedback-field label {
        color: rgba(230,235,255,0.88);
        font-size: 13px;
        font-weight: 700;
      }
      .za-feedback-field select,
      .za-feedback-field input,
      .za-feedback-field textarea {
        width: 100%;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        color: #fff;
        padding: 12px 14px;
        font: inherit;
        outline: none;
        box-sizing: border-box;
      }
      .za-feedback-field textarea {
        min-height: 92px;
        resize: vertical;
      }
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
        <div id="za-feedback-body">
          <p class="za-feedback-message" id="za-feedback-message"></p>
        </div>
        <div class="za-feedback-actions" id="za-feedback-actions">
          <button type="button" class="za-feedback-btn za-feedback-btn-primary" id="za-feedback-ok">OK</button>
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
    const bodyEl = document.getElementById("za-feedback-body");
    const actionsEl = document.getElementById("za-feedback-actions");

    if (titleEl) titleEl.textContent = title;
    if (iconEl) iconEl.textContent = icon;
    if (bodyEl) {
      bodyEl.innerHTML = `<p class="za-feedback-message" id="za-feedback-message">${message}</p>`;
    }
    if (actionsEl) {
      actionsEl.innerHTML = `<button type="button" class="za-feedback-btn za-feedback-btn-primary" id="za-feedback-ok">OK</button>`;
      document.getElementById("za-feedback-ok")?.addEventListener("click", hideFeedback);
    }

    overlay?.classList.remove("hidden");
  }

  function hideFeedback() {
    document.getElementById("za-feedback-overlay")?.classList.add("hidden");
  }

  function askCycleClosingData() {
    return new Promise((resolve) => {
      ensureFeedbackModal();

      const overlay = document.getElementById("za-feedback-overlay");
      const titleEl = document.getElementById("za-feedback-title");
      const iconEl = document.getElementById("za-feedback-icon");
      const bodyEl = document.getElementById("za-feedback-body");
      const actionsEl = document.getElementById("za-feedback-actions");

      if (titleEl) titleEl.textContent = "Encerramento do ciclo";
      if (iconEl) iconEl.textContent = "🏁";

      if (bodyEl) {
        bodyEl.innerHTML = `
          <p class="za-feedback-message">
            Antes de arquivar, registre como esse ciclo terminou.
          </p>

          <div class="za-feedback-field">
            <label for="za-cycle-name">Nome do ciclo</label>
            <input id="za-cycle-name" type="text" placeholder="Ex.: Ciclo 1, Base, Cutting, Consolidação..." />
          </div>

          <div class="za-feedback-field">
            <label for="za-cycle-status">Status do ciclo</label>
            <select id="za-cycle-status">
              <option value="completo">Completo</option>
              <option value="parcial">Parcial</option>
              <option value="abandonado">Abandonado</option>
            </select>
          </div>

          <div class="za-feedback-field">
            <label for="za-cycle-result">Resultado do ciclo</label>
            <textarea id="za-cycle-result" placeholder="Ex.: perdeu 3kg, passou a treinar 3x na semana, melhorou a rotina de sono."></textarea>
          </div>

          <div class="za-feedback-field">
            <label for="za-cycle-note">Observação de encerramento</label>
            <textarea id="za-cycle-note" placeholder="Ex.: respondeu bem ao foco de constância, mas ainda precisa consolidar alimentação no fim de semana."></textarea>
          </div>
        `;
      }

      if (actionsEl) {
        actionsEl.innerHTML = `
          <button type="button" class="za-feedback-btn za-feedback-btn-secondary" id="za-cycle-cancel">Cancelar</button>
          <button type="button" class="za-feedback-btn za-feedback-btn-primary" id="za-cycle-confirm">Arquivar</button>
        `;
      }

      overlay?.classList.remove("hidden");

      document.getElementById("za-cycle-cancel")?.addEventListener("click", () => {
        hideFeedback();
        resolve(null);
      });

      document.getElementById("za-cycle-confirm")?.addEventListener("click", () => {
        const nomeCiclo = document.getElementById("za-cycle-name")?.value?.trim?.() || "";
        const statusCiclo = document.getElementById("za-cycle-status")?.value || "completo";
        const resultadoCiclo = document.getElementById("za-cycle-result")?.value?.trim?.() || "";
        const observacaoEncerramento = document.getElementById("za-cycle-note")?.value?.trim?.() || "";

        hideFeedback();
        resolve({
          nomeCiclo,
          statusCiclo,
          resultadoCiclo,
          observacaoEncerramento,
          encerradoEm: new Date().toISOString()
        });
      });
    });
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

  function getPlanejamentosArquivados() {
    return Array.isArray(cliente?.planejamentosArquivados) ? cliente.planejamentosArquivados : [];
  }

  function ensurePlanejamentoStructure(planejamento = {}) {
    return {
      id: planejamento.id || `plan_${Date.now()}`,
      titulo: planejamento.titulo || "",
      status: planejamento.status || "ativo",
      createdAt: planejamento.createdAt || new Date().toISOString(),
      updatedAt: planejamento.updatedAt || "",
      archivedAt: planejamento.archivedAt || null,
      encerramento: planejamento.encerramento || {
        nomeCiclo: "",
        statusCiclo: "",
        resultadoCiclo: "",
        observacaoEncerramento: "",
        encerradoEm: ""
      },
      estrategia: planejamento.estrategia || {},
      habitos: planejamento.habitos || {},
      nutricional: planejamento.nutricional || {},
      treino: planejamento.treino || {},
      cardio: planejamento.cardio || {},
      observacoes: planejamento.observacoes || {},
      resumoGerado: planejamento.resumoGerado || "",
      notasTreinador: Array.isArray(planejamento.notasTreinador) ? planejamento.notasTreinador : []
    };
  }

  function hasPlanning() {
    const planejamento = getPlanejamentoAtual();
    return !!planejamento && Object.keys(planejamento).length > 0;
  }

  function renderHeader() {
    setText("planner-avatar", getInitials(cliente?.nome || "Cliente"));
    setText("planner-nome", cliente?.nome || "Planejamento");
    setText("planner-sub", `Objetivo central: ${getObjetivo()}`);

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar && clienteId) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }

    const planoClienteBtn = document.getElementById("abrir-plano-cliente-btn");
    if (planoClienteBtn && clienteId) {
      planoClienteBtn.href = `./plano-cliente.html?id=${encodeURIComponent(clienteId)}`;
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
    const empty = !hasPlanning();
    const planejamento = empty ? ensurePlanejamentoStructure({}) : ensurePlanejamentoStructure(getPlanejamentoAtual());
    const estrategia = planejamento.estrategia || {};
    const habitos = planejamento.habitos || {};
    const nutricional = planejamento.nutricional || {};
    const treino = planejamento.treino || {};
    const cardio = planejamento.cardio || {};
    const observacoes = planejamento.observacoes || {};

    setValue("estrategia-titulo", empty ? "" : planejamento.titulo || "");
    setValue("estrategia-fase", empty ? "" : estrategia.fase || "");
    setValue("estrategia-formato", empty ? "" : estrategia.formato || "");
    setValue("estrategia-objetivo-30d", empty ? "" : estrategia.objetivo30d || "");
    setValue("estrategia-foco-central", empty ? "" : estrategia.focoCentral || "");
    setValue("estrategia-indicador-sucesso", empty ? "" : estrategia.indicadorSucesso || "");
    setValue("estrategia-risco", empty ? "" : estrategia.riscoPrincipal || "");
    setValue("estrategia-diretriz", empty ? "" : estrategia.diretrizTecnica || "");
    setValue("pilar-1", empty ? "" : estrategia.pilares?.[0] || "");
    setValue("pilar-2", empty ? "" : estrategia.pilares?.[1] || "");
    setValue("pilar-3", empty ? "" : estrategia.pilares?.[2] || "");

    setValue("habito-ancora", empty ? "" : habitos.habitoAncora || "");
    setValue("ajuste-ambiente", empty ? "" : habitos.ajusteAmbiente || "");
    setValue("meta-sono", empty ? "" : habitos.metaSono || "");
    setValue("meta-hidratacao", empty ? "" : habitos.metaHidratacao || "");
    setValue("meta-passos", empty ? "" : habitos.metaPassos || "");
    setValue("meta-alimentacao", empty ? "" : habitos.metaAlimentacao || "");
    setValue("ritual-anti-sabotagem", empty ? "" : habitos.ritualAntiSabotagem || "");
    setValue("frequencia-checkin", empty ? "" : habitos.frequenciaCheckin || "");
    setValue("regra-minima", empty ? "" : habitos.regraMinima || "");

    setValue("nutri-objetivo", empty ? "" : nutricional.objetivo || "");
    setValue("nutri-foco-principal", empty ? "" : nutricional.focoPrincipal || "");
    setValue("nutri-regra-minima", empty ? "" : nutricional.regraMinima || "");
    setValue("nutri-refeicoes-prioritarias", empty ? "" : nutricional.refeicoesPrioritarias || "");
    setValue("nutri-dias-corridos", empty ? "" : nutricional.estrategiaDiasCorridos || "");
    setValue("nutri-fim-semana", empty ? "" : nutricional.estrategiaFimDeSemana || "");
    setValue("nutri-sabotadores", empty ? "" : nutricional.sabotadores || "");
    setValue("nutri-resposta-recaida", empty ? "" : nutricional.respostaRecaidas || "");
    setValue("nutri-observacoes", empty ? "" : nutricional.observacoes || "");

    setValue("treino-objetivo", empty ? "" : treino.objetivoCiclo || "");
    setValue("treino-frequencia", empty ? "" : treino.frequenciaSemanal || "");
    setValue("treino-divisao", empty ? "" : treino.estruturaGeral || "");
    setValue("treino-duracao", empty ? "" : treino.duracaoMedia || "");
    setValue("treino-local", empty ? "" : treino.local || "");
    setValue("treino-intensidade", empty ? "" : treino.intensidadeAlvo || "");
    setValue("treino-progressao", empty ? "" : treino.criterioProgressao || "");
    setValue("treino-restricoes", empty ? "" : treino.restricoes || "");
    setValue("treino-observacoes", empty ? "" : treino.observacoesTecnicas || "");

    setValue("mes1-foco", empty ? "" : treino.mes1?.foco || "");
    setValue("mes1-divisao", empty ? "" : treino.mes1?.divisao || "");
    setValue("mes1-programa", empty ? "" : treino.mes1?.programa || "");

    setValue("mes2-foco", empty ? "" : treino.mes2?.foco || "");
    setValue("mes2-divisao", empty ? "" : treino.mes2?.divisao || "");
    setValue("mes2-programa", empty ? "" : treino.mes2?.programa || "");

    setValue("mes3-foco", empty ? "" : treino.mes3?.foco || "");
    setValue("mes3-divisao", empty ? "" : treino.mes3?.divisao || "");
    setValue("mes3-programa", empty ? "" : treino.mes3?.programa || "");

    setValue("cardio-modalidade", empty ? "" : cardio.modalidade || "");
    setValue("cardio-frequencia", empty ? "" : cardio.frequencia || "");
    setValue("cardio-duracao", empty ? "" : cardio.duracao || "");
    setValue("cardio-intensidade", empty ? "" : cardio.intensidade || "");
    setValue("neat-meta", empty ? "" : cardio.metaNeat || "");
    setValue("recuperacao-estrategia", empty ? "" : cardio.estrategiaRecuperacao || "");
    setValue("cardio-observacoes", empty ? "" : cardio.observacoes || "");

    setValue("comunicacao-tom", empty ? "" : observacoes.tomComunicacao || "");
    setValue("momento-revisao", empty ? "" : observacoes.dataRevisao || "");
    setValue("alertas-internos", empty ? "" : observacoes.alertasInternos || "");
    setValue("mensagem-interna", empty ? "" : observacoes.mensagemInterna || "");

    setValue("planejamento-resumo", empty ? "" : planejamento.resumoGerado || "");

    const updated = empty ? "—" : (planejamento.updatedAt ? formatDate(planejamento.updatedAt) : "—");
    setText("estrategia-updated", `Última atualização: ${updated}`);
    setText("habitos-updated", `Última atualização: ${updated}`);
    setText("nutricional-updated", `Última atualização: ${updated}`);
    setText("treino-updated", `Última atualização: ${updated}`);
    setText("cardio-updated", `Última atualização: ${updated}`);
    setText("observacoes-updated", `Última atualização: ${updated}`);

    renderStatus();
    renderNotes();
    renderArchivedList();
  }

  function renderStatus() {
    const root = document.getElementById("status-planejamento");
    const badgesRoot = document.getElementById("status-badges");
    const pill = document.getElementById("planejamento-status-pill");

    if (!root || !badgesRoot || !pill) return;

    if (!hasPlanning()) {
      root.innerHTML = `
        <strong style="display:block; margin-bottom:8px; color:#fff;">Status atual: sem planejamento ativo</strong>
        <span style="display:block;">Você pode iniciar um novo ciclo agora.</span>
      `;
      badgesRoot.innerHTML = "";
      pill.textContent = "Sem planejamento ativo";
      pill.className = "status-pill status-vazio";
      return;
    }

    const planejamento = ensurePlanejamentoStructure(getPlanejamentoAtual());

    root.innerHTML = `
      <strong style="display:block; margin-bottom:8px; color:#fff;">Status atual: ativo</strong>
      <span style="display:block;">Última gravação: ${formatDateTime(planejamento.updatedAt)}</span>
    `;

    pill.textContent = "Ativo";
    pill.className = "status-pill status-ativo";

    const badges = [];
    if (planejamento.estrategia?.focoCentral) badges.push("Estratégia definida");
    if (planejamento.habitos?.habitoAncora) badges.push("Hábito âncora definido");
    if (planejamento.nutricional?.focoPrincipal) badges.push("Nutrição direcionada");
    if (planejamento.treino?.objetivoCiclo) badges.push("Ciclo de treino definido");
    if (planejamento.treino?.mes1?.programa) badges.push("Mês 1 escrito");
    if (planejamento.treino?.mes2?.programa) badges.push("Mês 2 escrito");
    if (planejamento.treino?.mes3?.programa) badges.push("Mês 3 escrito");
    if (planejamento.cardio?.modalidade) badges.push("Cardio definido");
    if (planejamento.resumoGerado) badges.push("Resumo gerado");
    if ((planejamento.notasTreinador || []).length) badges.push(`${planejamento.notasTreinador.length} nota(s)`);

    badgesRoot.innerHTML = badges
      .map((badge) => `<span class="planner-badge">${badge}</span>`)
      .join("");
  }

  function renderNotes() {
    const root = document.getElementById("notes-list");
    if (!root) return;

    if (!hasPlanning()) {
      root.innerHTML = `<div class="empty-state-box">Crie ou salve um planejamento para começar a registrar notas.</div>`;
      return;
    }

    const planejamento = ensurePlanejamentoStructure(getPlanejamentoAtual());
    const notes = Array.isArray(planejamento.notasTreinador) ? planejamento.notasTreinador : [];

    if (!notes.length) {
      root.innerHTML = `<div class="empty-state-box">Nenhuma nota registrada ainda.</div>`;
      return;
    }

    root.innerHTML = notes
      .slice()
      .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0))
      .map((note) => `
        <div class="note-item">
          <div class="note-top">
            <div class="note-meta">
              <strong>${capitalize(note.tipo || "observacao")}</strong>
              <span>${formatDateTime(note.data)}</span>
            </div>
            <button type="button" class="cliente-btn cliente-btn-secundario" data-delete-note="${note.id}">Excluir</button>
          </div>
          <div class="note-text">${escapeHtml(note.texto || "")}</div>
        </div>
      `)
      .join("");

    root.querySelectorAll("[data-delete-note]").forEach((button) => {
      button.addEventListener("click", () => {
        const noteId = button.getAttribute("data-delete-note");
        deleteNote(noteId);
      });
    });
  }

  function renderArchivedList() {
    const root = document.getElementById("archived-list");
    if (!root) return;

    const archived = getPlanejamentosArquivados();

    if (!archived.length) {
      root.innerHTML = `<div class="empty-state-box">Nenhum planejamento arquivado ainda.</div>`;
      return;
    }

    root.innerHTML = archived
      .map((plan) => {
        const title = firstFilled(
          plan?.encerramento?.nomeCiclo,
          plan.titulo,
          plan.estrategia?.focoCentral,
          "Planejamento arquivado"
        );
        const archivedAt = plan.archivedAt ? formatDateTime(plan.archivedAt) : "Data não informada";
        const cycle = firstFilled(plan.treino?.objetivoCiclo, plan.estrategia?.objetivo30d, "Sem descrição");
        const statusCiclo = plan?.encerramento?.statusCiclo || "parcial";
        const resultadoCiclo = firstFilled(plan?.encerramento?.resultadoCiclo, "Sem resultado registrado");

        return `
          <div class="archived-item">
            <strong>${escapeHtml(title)}</strong>
            <span>Arquivado em: ${archivedAt}</span>
            <span>Resumo: ${escapeHtml(cycle)}</span>
            <span>Resultado: ${escapeHtml(resultadoCiclo)}</span>

            <div class="cycle-pill ${escapeHtml(statusCiclo)}">
              ${escapeHtml(capitalize(statusCiclo))}
            </div>

            <div class="planner-inline-actions" style="margin-top: 12px;">
              <a
                class="cliente-btn cliente-btn-secundario"
                href="./plano-cliente.html?id=${encodeURIComponent(clienteId)}&archived=${encodeURIComponent(plan.id)}"
              >
                Abrir PDF
              </a>

              <button
                type="button"
                class="cliente-btn cliente-btn-secundario"
                data-duplicate-plan="${plan.id}"
              >
                Duplicar
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    root.querySelectorAll("[data-duplicate-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        const planId = button.getAttribute("data-duplicate-plan");
        duplicateArchivedPlanning(planId);
      });
    });
  }

  function buildPlanejamentoPayload(existing = null) {
    const previous = ensurePlanejamentoStructure(existing || getPlanejamentoAtual());

    return {
      id: previous.id || `plan_${Date.now()}`,
      titulo: val("estrategia-titulo"),
      status: "ativo",
      createdAt: previous.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
      encerramento: previous.encerramento || {
        nomeCiclo: "",
        statusCiclo: "",
        resultadoCiclo: "",
        observacaoEncerramento: "",
        encerradoEm: ""
      },

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

      nutricional: {
        objetivo: val("nutri-objetivo"),
        focoPrincipal: val("nutri-foco-principal"),
        regraMinima: val("nutri-regra-minima"),
        refeicoesPrioritarias: val("nutri-refeicoes-prioritarias"),
        estrategiaDiasCorridos: val("nutri-dias-corridos"),
        estrategiaFimDeSemana: val("nutri-fim-semana"),
        sabotadores: val("nutri-sabotadores"),
        respostaRecaidas: val("nutri-resposta-recaida"),
        observacoes: val("nutri-observacoes")
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
      notasTreinador: Array.isArray(previous.notasTreinador) ? previous.notasTreinador : []
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
    setValue("estrategia-diretriz", firstFilled(val("estrategia-diretriz"), diagnostico.sintese, diagnostico.leitura));
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
      `Nutricional: ${payload.nutricional.focoPrincipal || "—"}.`,
      `Objetivo nutricional: ${payload.nutricional.objetivo || "—"}.`,
      `Regra alimentar mínima: ${payload.nutricional.regraMinima || "—"}.`,
      `Refeições prioritárias: ${payload.nutricional.refeicoesPrioritarias || "—"}.`,
      `Estratégia para dias corridos: ${payload.nutricional.estrategiaDiasCorridos || "—"}.`,
      `Estratégia para fim de semana: ${payload.nutricional.estrategiaFimDeSemana || "—"}.`,
      `Sabotadores: ${payload.nutricional.sabotadores || "—"}.`,
      `Resposta para recaídas: ${payload.nutricional.respostaRecaidas || "—"}.`,
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

  function saveNote() {
    if (!hasPlanning()) {
      showFeedback("Salve primeiro um planejamento para começar a registrar notas.", "Planejamento não iniciado", "⚠");
      return;
    }

    const texto = val("nota-texto");
    const tipo = val("nota-tipo") || "observacao";

    if (!texto) {
      showFeedback("Escreva a nota antes de salvar.", "Campo obrigatório", "⚠");
      return;
    }

    const planejamento = ensurePlanejamentoStructure(getPlanejamentoAtual());

    planejamento.notasTreinador.unshift({
      id: `nota_${Date.now()}`,
      data: new Date().toISOString(),
      tipo,
      texto
    });

    planejamento.updatedAt = new Date().toISOString();

    const updatedCliente = {
      ...cliente,
      planejamento,
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);

    if (!ok) {
      showFeedback("Não foi possível salvar a nota.", "Erro ao salvar", "⚠");
      return;
    }

    cliente = updatedCliente;
    setValue("nota-texto", "");
    setValue("nota-tipo", "lembrete");
    renderPlanejamento();
    showFeedback("Nota do treinador salva.", "Nota registrada", "📝");
  }

  function deleteNote(noteId) {
    if (!noteId || !hasPlanning()) return;

    const confirmed = window.confirm("Deseja excluir esta nota?");
    if (!confirmed) return;

    const planejamento = ensurePlanejamentoStructure(getPlanejamentoAtual());
    planejamento.notasTreinador = (planejamento.notasTreinador || []).filter(
      (note) => String(note.id) !== String(noteId)
    );
    planejamento.updatedAt = new Date().toISOString();

    const updatedCliente = {
      ...cliente,
      planejamento,
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);
    if (!ok) {
      showFeedback("Não foi possível excluir a nota.", "Erro ao excluir", "⚠");
      return;
    }

    cliente = updatedCliente;
    renderPlanejamento();
    showFeedback("Nota excluída com sucesso.", "Nota removida", "🗑️");
  }

  async function archivePlanning() {
    const planejamentoAtual = getPlanejamentoAtual();

    if (!planejamentoAtual || Object.keys(planejamentoAtual).length === 0) {
      showFeedback("Não há planejamento para arquivar.", "Nada para arquivar", "⚠");
      return;
    }

    const encerramento = await askCycleClosingData();
    if (!encerramento) return;

    const planejamento = ensurePlanejamentoStructure(planejamentoAtual);
    planejamento.status = "arquivado";
    planejamento.archivedAt = new Date().toISOString();
    planejamento.updatedAt = new Date().toISOString();
    planejamento.encerramento = encerramento;

    const historico = Array.isArray(cliente.planejamentosArquivados)
      ? cliente.planejamentosArquivados
      : [];

    historico.unshift(planejamento);

    const updatedCliente = {
      ...cliente,
      planejamento: {},
      planejamentosArquivados: historico,
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);

    if (!ok) {
      showFeedback("Erro ao arquivar planejamento.", "Erro", "⚠");
      return;
    }

    cliente = updatedCliente;
    renderPlanejamento();
    showFeedback("Planejamento finalizado, classificado e novo ciclo liberado.", "Ciclo encerrado", "🏁");
  }

  function duplicateArchivedPlanning(planId) {
    if (!planId) return;

    const archived = getPlanejamentosArquivados();
    const source = archived.find((item) => String(item.id) === String(planId));

    if (!source) {
      showFeedback("Não encontrei esse planejamento arquivado.", "Arquivo não encontrado", "⚠");
      return;
    }

    if (hasPlanning()) {
      const confirmedReplace = window.confirm(
        "Já existe um planejamento ativo. Deseja substituí-lo pelo planejamento duplicado?"
      );
      if (!confirmedReplace) return;
    }

    const confirmed = window.confirm(
      "Deseja duplicar este planejamento arquivado para iniciar um novo ciclo?"
    );
    if (!confirmed) return;

    const duplicated = {
      ...source,
      id: `plan_${Date.now()}`,
      titulo: source.titulo ? `${source.titulo} (novo ciclo)` : "Novo ciclo",
      status: "ativo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: null,
      encerramento: {
        nomeCiclo: "",
        statusCiclo: "",
        resultadoCiclo: "",
        observacaoEncerramento: "",
        encerradoEm: ""
      },
      notasTreinador: []
    };

    const updatedCliente = {
      ...cliente,
      planejamento: duplicated,
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);

    if (!ok) {
      showFeedback("Não foi possível duplicar o planejamento.", "Erro ao duplicar", "⚠");
      return;
    }

    cliente = updatedCliente;
    renderPlanejamento();
    showFeedback("Planejamento duplicado e carregado como novo ciclo.", "Novo ciclo criado", "♻️");
  }

  function deletePlanning() {
    const planejamentoAtual = getPlanejamentoAtual();
    const empty = !planejamentoAtual || Object.keys(planejamentoAtual).length === 0;

    if (empty) {
      showFeedback("Não há planejamento salvo para excluir.", "Nada para excluir", "⚠");
      return;
    }

    const confirmed = window.confirm("Deseja excluir completamente este planejamento? Essa ação remove o plano salvo do cliente.");
    if (!confirmed) return;

    const updatedCliente = {
      ...cliente,
      planejamento: {},
      updatedAt: new Date().toISOString()
    };

    const ok = updateCliente(updatedCliente);
    if (!ok) {
      showFeedback("Não foi possível excluir o planejamento.", "Erro ao excluir", "⚠");
      return;
    }

    cliente = updatedCliente;
    renderPlanejamento();
    showFeedback("Planejamento excluído com sucesso.", "Planejamento removido", "🗑️");
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
    document.getElementById("salvar-nota-btn")?.addEventListener("click", saveNote);
    document.getElementById("arquivar-planejamento-btn")?.addEventListener("click", archivePlanning);
    document.getElementById("excluir-planejamento-btn")?.addEventListener("click", deletePlanning);
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