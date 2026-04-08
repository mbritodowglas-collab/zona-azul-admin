document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  const printBtn = document.getElementById("print-report-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  if (window.ZAStorage?.init) {
    await window.ZAStorage.init({ force: true });
  }

  const notFoundEl = document.getElementById("relatorio-not-found");
  const relatorioPage = document.getElementById("relatorio-page");

  function showNotFound() {
    notFoundEl?.classList.remove("hidden");
    relatorioPage?.classList.add("hidden");
  }

  if (!clienteId) {
    showNotFound();
    return;
  }

  const clientes = window.ZAStorage?.getClientes?.() || JSON.parse(localStorage.getItem("za_clientes") || "[]");
  const leads = window.ZAStorage?.getLeads?.() || JSON.parse(localStorage.getItem("za_leads") || "[]");

  const cliente = clientes.find(c => String(c.id) === String(clienteId));
  const leadRelacionado =
    leads.find(l => String(l.clienteId) === String(clienteId)) ||
    leads.find(l => String(l.id) === String(clienteId)) ||
    null;

  if (!cliente) {
    showNotFound();
    return;
  }

  const pre = cliente.preDiagnostico || leadRelacionado || {};
  const planejamento = cliente.planejamento || {};
  const relatorioCompleto = cliente.relatorioCompleto || {};
  const base = cliente.dadosBaseEditados || {};
  const estrategia = planejamento.estrategia || {};
  const diagnostico = planejamento.diagnostico || {};
  const metricas = planejamento.metricas || {};
  const habitos = planejamento.habitos || {};
  const treino = planejamento.treino || {};
  const cardio = planejamento.cardio || {};
  const nutricional = planejamento.nutricional || {};
  const radar = planejamento.radar || {};
  const perimetriaPlanejamento = planejamento.perimetria || {};
  const exames = planejamento.exames || relatorioCompleto.exames || cliente.exames || {};
  const profissional = planejamento.profissional || {};
  const acompanhamentos = Array.isArray(cliente.acompanhamentos) ? cliente.acompanhamentos : [];
  const timelineCliente = Array.isArray(cliente.timeline) ? cliente.timeline : [];
  const evolucaoPlanejamento = Array.isArray(planejamento.evolucao) ? planejamento.evolucao : [];
  const reavaliacoes = Array.isArray(cliente.reavaliacoes) ? cliente.reavaliacoes : [];

  const PROFISSIONAIS = {
    marcio: {
      nome: "Márcio Dowglas",
      cref: "003918-G/AM"
    },
    filipe: {
      nome: "Filipe Oliveira",
      cref: "008318-G/AM"
    }
  };

  function getProfissionalAtual() {
    const key = (localStorage.getItem("profissional_ativo") || "marcio").toLowerCase();
    return PROFISSIONAIS[key] || PROFISSIONAIS.marcio;
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value === 0) return value;
      if (value === false) return value;
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "—";
  }

  function hasContent(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return String(value).trim() !== "" && String(value).trim() !== "—";
  }

  function asNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === "") return fallback;
    const cleaned = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatDateBR(value) {
    if (!value) return new Date().toLocaleDateString("pt-BR");
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("pt-BR");
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
  }

  function initials(name) {
    return String(name || "C").trim().charAt(0).toUpperCase();
  }

  function toTitle(value) {
    if (!value || value === "—") return "—";
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function getObjetivo() {
    return firstFilled(
      estrategia.objetivo30d,
      base.objetivo,
      pre.objetivo,
      pre.objetivo_principal,
      pre.objetivo_fisico,
      cliente.objetivo
    );
  }

  function getFase() {
    return firstFilled(
      estrategia.fase,
      cliente.fase_nome,
      cliente.fase_atual,
      cliente.fase,
      "Fase não definida"
    );
  }

  function getInitialMetric(...keys) {
    for (const key of keys) {
      const value = firstFilled(base[key], pre[key], cliente[key]);
      if (value !== "—") return value;
    }
    return 0;
  }

  function createEmptyBox(texto) {
    return `<div class="empty-box">${texto}</div>`;
  }

  function metricCard(label, atual, anterior, suffix = "") {
    const atualNum = asNumber(atual, 0);
    const anteriorNum = asNumber(anterior, 0);
    const delta = atualNum - anteriorNum;

    let deltaClass = "delta-neutral";
    if (delta > 0) deltaClass = "delta-positive";
    if (delta < 0) deltaClass = "delta-negative";

    const deltaText = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${suffix}`;

    return `
      <div class="metric-card">
        <span class="metric-label">${label}</span>
        <div class="metric-values">
          <div>
            <small>Atual</small>
            <strong>${atualNum}${suffix}</strong>
          </div>
          <div>
            <small>Inicial</small>
            <strong>${anteriorNum}${suffix}</strong>
          </div>
        </div>
        <div class="metric-delta ${deltaClass}">
          Δ ${deltaText}
        </div>
      </div>
    `;
  }

  function perimetriaCard(label, value) {
    return `
      <div class="perimetria-item">
        <span>${label}</span>
        <strong>${String(value).includes("cm") ? value : `${value} cm`}</strong>
      </div>
    `;
  }

  function exameCard(label, valor, referencia = "—", observacao = "—") {
    return `
      <div class="summary-item">
        <span class="summary-label">${label}</span>
        <div class="summary-value">${valor}</div>
        <div style="margin-top:10px; color: var(--muted); font-size: 13px; line-height: 1.6;">
          Referência: ${referencia}<br>
          Observação: ${observacao}
        </div>
      </div>
    `;
  }

  function maybeHideSectionById(id, shouldShow) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("hidden", !shouldShow);
  }

  const nomeCliente = firstFilled(cliente.nome, pre.nome, "Cliente");
  const emailCliente = firstFilled(cliente.email, pre.email, "");
  const objetivoCliente = getObjetivo();
  const faseCliente = getFase();
  const profAtivo = getProfissionalAtual();
  const nomeProfissional = firstFilled(profissional.nome, profAtivo.nome);
  const crefProfissional = firstFilled(profissional.cref, profAtivo.cref);

  text("report-profissional-nome", nomeProfissional);
  text("report-profissional-cref", crefProfissional);
  text("report-nome", nomeCliente);
  text("report-email", emailCliente === "—" ? "" : emailCliente);

  const reportMeta = firstFilled(
    base.observacaoInicial,
    pre.rotina,
    pre.queixa_principal,
    pre.queixa,
    cliente.objetivo,
    ""
  );
  text("report-meta", reportMeta === "—" ? "" : reportMeta);

  const avatar = document.getElementById("report-avatar");
  if (avatar) avatar.textContent = initials(nomeCliente);

  text("report-data-geracao", formatDateBR(new Date()));
  text("report-fase-chip", `Fase atual: ${faseCliente}`);
  text("report-objetivo-chip", `Objetivo: ${objetivoCliente}`);
  text("report-cliente-meta-nome", nomeCliente);
  text("report-cliente-meta-objetivo", objetivoCliente);
  text("report-cliente-meta-fase", faseCliente);

  const voltarLink = document.getElementById("voltar-cliente-link");
  if (voltarLink) {
    voltarLink.href = `../cliente/index.html?id=${clienteId}`;
  }

  text("summary-objetivo", objetivoCliente);
  text(
    "summary-avanco",
    firstFilled(
      relatorioCompleto.avancoPrincipal,
      estrategia.avancoPrincipal,
      diagnostico.avancoPrincipal,
      "Leitura inicial construída a partir do cadastro e do pré-diagnóstico."
    )
  );
  text(
    "summary-gargalo",
    firstFilled(
      relatorioCompleto.gargaloPrincipal,
      estrategia.gargaloPrincipal,
      diagnostico.gargaloPrincipal,
      pre.dificuldade_principal,
      pre.maior_dificuldade,
      pre.queixa_principal,
      "Gargalo ainda em observação."
    )
  );
  text(
    "summary-prioridade",
    firstFilled(
      relatorioCompleto.prioridade,
      estrategia.focoCentral,
      diagnostico.foco,
      "Consolidar base comportamental e aderência."
    )
  );

  const pesoInicial = getInitialMetric("peso");
  const pesoAtual = firstFilled(metricas.peso, base.peso, pre.peso, cliente.peso, 0);

  const bfInicial = getInitialMetric("bf", "percentual_gordura");
  const bfAtual = firstFilled(metricas.bf, base.bf, pre.bf, pre.percentual_gordura, cliente.bf, 0);

  const massaInicial = getInitialMetric("massaMagra", "massa");
  const massaAtual = firstFilled(metricas.massa, base.massaMagra, pre.massaMagra, cliente.massaMagra, 0);

  const cinturaInicial = getInitialMetric("cintura");
  const cinturaAtual = firstFilled(metricas.cintura, base.cintura, pre.cintura, cliente.cintura, 0);

  const metricsGrid = document.getElementById("metrics-grid");
  const hasMetricasComparativas = [pesoAtual, bfAtual, massaAtual, cinturaAtual].some(hasContent);

  if (metricsGrid) {
    if (!hasMetricasComparativas) {
      metricsGrid.innerHTML = createEmptyBox("Nenhuma métrica comparativa registrada até o momento.");
    } else {
      metricsGrid.innerHTML = [
        metricCard("Peso", pesoAtual, pesoInicial, " kg"),
        metricCard("BF", bfAtual, bfInicial, "%"),
        metricCard("Massa magra", massaAtual, massaInicial, " kg"),
        metricCard("Cintura", cinturaAtual, cinturaInicial, " cm")
      ].join("");
    }
  }

  const radarInicial = {
    movimento: asNumber(firstFilled(pre.score_movimento, pre.radar?.movimento, 4), 4),
    alimentacao: asNumber(firstFilled(pre.score_alimentacao, pre.radar?.alimentacao, 4), 4),
    sono: asNumber(firstFilled(pre.score_sono, pre.radar?.sono, 4), 4),
    proposito: asNumber(firstFilled(pre.score_proposito, pre.radar?.proposito, 4), 4),
    social: asNumber(firstFilled(pre.score_social, pre.radar?.social, 4), 4),
    estresse: asNumber(firstFilled(pre.score_estresse, pre.radar?.estresse, 4), 4)
  };

  const radarAtual = {
    movimento: asNumber(firstFilled(radar.movimento, radar.treino, radarInicial.movimento, 5), 5),
    alimentacao: asNumber(firstFilled(radar.alimentacao, radar.dieta, radarInicial.alimentacao, 5), 5),
    sono: asNumber(firstFilled(radar.sono, radarInicial.sono, 5), 5),
    proposito: asNumber(firstFilled(radar.proposito, radar.disciplina, radarInicial.proposito, 5), 5),
    social: asNumber(firstFilled(radar.social, radarInicial.social, 5), 5),
    estresse: asNumber(firstFilled(radar.estresse, radar.mental, radarInicial.estresse, 5), 5)
  };

  const hasRadar = Object.values(radarAtual).some(v => Number.isFinite(v));

  const radarCanvas = document.getElementById("radar-chart");
  if (radarCanvas && typeof Chart !== "undefined" && hasRadar) {
    new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Movimento", "Alimentação", "Sono", "Propósito", "Social", "Estresse"],
        datasets: [
          {
            label: "Base inicial",
            data: Object.values(radarInicial),
            borderColor: "rgba(156,176,203,0.9)",
            backgroundColor: "rgba(156,176,203,0.15)"
          },
          {
            label: "Leitura atual",
            data: Object.values(radarAtual),
            borderColor: "#47b8ff",
            backgroundColor: "rgba(71,184,255,0.20)"
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { display: false },
            grid: { color: "rgba(255,255,255,0.10)" },
            angleLines: { color: "rgba(255,255,255,0.08)" },
            pointLabels: { color: "#dce8f8" }
          }
        },
        plugins: {
          legend: {
            labels: { color: "#dce8f8" }
          }
        }
      }
    });
  }

  const evolucaoCanvas = document.getElementById("evolucao-chart");
  let evolucao = [...evolucaoPlanejamento];

  if (!evolucao.length && hasContent(pesoInicial) && hasContent(pesoAtual)) {
    evolucao = [
      { data: "Inicial", peso: asNumber(pesoInicial, 0) },
      { data: "Atual", peso: asNumber(pesoAtual, 0) }
    ];
  }

  if (evolucaoCanvas && typeof Chart !== "undefined" && evolucao.length) {
    new Chart(evolucaoCanvas, {
      type: "line",
      data: {
        labels: evolucao.map(e => firstFilled(e.data, "Registro")),
        datasets: [{
          label: "Peso",
          data: evolucao.map(e => asNumber(e.peso, 0)),
          borderColor: "#7cff5a",
          backgroundColor: "rgba(124,255,90,0.15)",
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#dce8f8" } }
        },
        scales: {
          x: {
            ticks: { color: "#dce8f8" },
            grid: { color: "rgba(255,255,255,0.06)" }
          },
          y: {
            ticks: { color: "#dce8f8" },
            grid: { color: "rgba(255,255,255,0.06)" }
          }
        }
      }
    });
  }

  const perimetriaGrid = document.getElementById("perimetria-grid");
  if (perimetriaGrid) {
    const perimetriaBase = {
      cintura: firstFilled(perimetriaPlanejamento.cintura, base.cintura, pre.cintura, cliente.cintura),
      quadril: firstFilled(perimetriaPlanejamento.quadril, base.quadril, pre.quadril, cliente.quadril),
      peito: firstFilled(perimetriaPlanejamento.peito, base.peito, pre.peito, cliente.peito),
      coxa: firstFilled(perimetriaPlanejamento.coxa, base.coxa, pre.coxa, cliente.coxa),
      braco: firstFilled(perimetriaPlanejamento.braco, base.braco, pre.braco, cliente.braco),
      abdome: firstFilled(perimetriaPlanejamento.abdome, base.abdome, pre.abdome, cliente.abdome)
    };

    const items = Object.entries(perimetriaBase).filter(([, value]) => value !== "—");

    if (!items.length) {
      perimetriaGrid.innerHTML = createEmptyBox("Nenhuma medida registrada até o momento.");
    } else {
      perimetriaGrid.innerHTML = items
        .map(([key, value]) => perimetriaCard(toTitle(key), value))
        .join("");
    }
  }

  text(
    "diagnostico-leitura",
    firstFilled(
      relatorioCompleto.leituraTecnica,
      diagnostico.leitura,
      planejamento.leituraTecnica,
      pre.leituraTecnica,
      "O caso apresenta leitura técnica estruturada a partir dos dados de entrada e do acompanhamento do cliente."
    )
  );

  text(
    "diagnostico-sintese",
    firstFilled(
      relatorioCompleto.sinteseDiagnostica,
      diagnostico.sintese,
      planejamento.sinteseDiagnostica,
      pre.sinteseDiagnostica,
      "Ainda sem síntese diagnóstica posterior consolidada."
    )
  );

  text(
    "behavior-aderencia",
    firstFilled(
      relatorioCompleto.aderencia,
      planejamento.aderencia,
      habitos.regraMinima,
      pre.aderencia,
      "Aderência inicial em observação"
    )
  );

  text(
    "behavior-ambiente",
    firstFilled(
      relatorioCompleto.ambiente,
      habitos.ajusteAmbiente,
      planejamento.ambiente,
      pre.ambiente,
      "Ambiente ainda sem leitura consolidada"
    )
  );

  text(
    "behavior-sabotadores",
    firstFilled(
      relatorioCompleto.sabotadores,
      planejamento.sabotadores,
      pre.sabotadores,
      pre.maior_dificuldade,
      "Sabotadores ainda não mapeados"
    )
  );

  text(
    "behavior-leitura",
    firstFilled(
      relatorioCompleto.leituraComportamental,
      planejamento.leituraComportamental,
      pre.leituraComportamental,
      "Leitura comportamental inicial em construção."
    )
  );

  text(
    "next-manter",
    firstFilled(
      relatorioCompleto.manter,
      planejamento.manter,
      treino.frequencia,
      "Manter execução do básico com consistência."
    )
  );

  text(
    "next-ajustar",
    firstFilled(
      relatorioCompleto.ajustar,
      planejamento.ajustar,
      cardio.frequencia,
      nutricional.regraMinima,
      "Ajustar rotina, previsibilidade e aderência."
    )
  );

  text(
    "next-foco",
    firstFilled(
      relatorioCompleto.focoProximoCiclo,
      planejamento.focoProximoCiclo,
      estrategia.focoCentral,
      "Consolidar base comportamental e organização do processo."
    )
  );

  text(
    "next-meta",
    firstFilled(
      relatorioCompleto.metaPrincipal,
      planejamento.metaPrincipal,
      estrategia.objetivo30d,
      cliente.objetivo,
      "Meta principal ainda não definida."
    )
  );

  const timelineList = document.getElementById("timeline-list");
  if (timelineList) {
    const timelineAcompanhamentos = acompanhamentos.map(item => ({
      titulo: item.titulo,
      data: item.data,
      descricao: item.descricao
    }));

    const timelineBase = timelineCliente.map(item => ({
      titulo: firstFilled(item.tipo, "Registro"),
      data: item.data,
      descricao: item.descricao
    }));

    const timelineReavaliacoes = reavaliacoes.map(item => ({
      titulo: firstFilled(item.titulo, "Reavaliação"),
      data: item.data,
      descricao: firstFilled(item.descricao, item.resumo, "Reavaliação registrada no sistema.")
    }));

    const linhaInicial = {
      titulo: "Entrada inicial do caso",
      data: firstFilled(cliente.data_inicio, cliente.updatedAt, cliente.createdAt, pre.created_at, new Date().toISOString()),
      descricao: firstFilled(
        pre.queixa_principal,
        pre.objetivo,
        cliente.objetivo,
        "Cadastro inicial registrado no sistema."
      )
    };

    const timelineFinal = [...timelineAcompanhamentos, ...timelineBase, ...timelineReavaliacoes];
    if (!timelineFinal.length) timelineFinal.push(linhaInicial);

    timelineFinal.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    timelineList.innerHTML = timelineFinal.map(item => `
      <div class="timeline-item">
        <div class="timeline-item-top">
          <strong>${firstFilled(item.titulo, "Acompanhamento")}</strong>
          <span>${formatDateBR(item.data)}</span>
        </div>
        <p>${firstFilled(item.descricao, "Sem descrição registrada.")}</p>
      </div>
    `).join("");
  }

  const hasLeituraTecnica = hasContent(firstFilled(
    relatorioCompleto.leituraTecnica,
    diagnostico.leitura,
    planejamento.leituraTecnica,
    pre.leituraTecnica
  )) || hasContent(firstFilled(
    relatorioCompleto.sinteseDiagnostica,
    diagnostico.sintese,
    planejamento.sinteseDiagnostica,
    pre.sinteseDiagnostica
  ));

  const hasComportamento = [
    relatorioCompleto.aderencia,
    planejamento.aderencia,
    habitos.regraMinima,
    relatorioCompleto.ambiente,
    habitos.ajusteAmbiente,
    planejamento.ambiente,
    relatorioCompleto.sabotadores,
    planejamento.sabotadores,
    pre.sabotadores,
    relatorioCompleto.leituraComportamental,
    planejamento.leituraComportamental
  ].some(hasContent);

  const hasDirecionamento = [
    relatorioCompleto.manter,
    planejamento.manter,
    treino.frequencia,
    relatorioCompleto.ajustar,
    planejamento.ajustar,
    cardio.frequencia,
    nutricional.regraMinima,
    relatorioCompleto.focoProximoCiclo,
    planejamento.focoProximoCiclo,
    estrategia.focoCentral,
    relatorioCompleto.metaPrincipal,
    planejamento.metaPrincipal
  ].some(hasContent);

  const examesEntries = Object.entries(exames).filter(([, value]) => hasContent(value));
  let examesSection = document.getElementById("exames-section");
  if (!examesSection && examesEntries.length) {
    const perimetriaSection = document.querySelector("#perimetria-grid")?.closest(".card");
    if (perimetriaSection) {
      examesSection = document.createElement("section");
      examesSection.className = "card full-width";
      examesSection.id = "exames-section";
      examesSection.innerHTML = `
        <h3 class="section-title">Controle Geral por Exames</h3>
        <p class="section-subtitle">
          Marcadores laboratoriais registrados no acompanhamento para leitura complementar do processo.
        </p>
        <div id="exames-grid" class="summary-grid"></div>
      `;
      perimetriaSection.insertAdjacentElement("afterend", examesSection);
    }
  }

  if (examesSection) {
    const examesGrid = examesSection.querySelector("#exames-grid");
    if (examesGrid) {
      examesGrid.innerHTML = examesEntries.map(([key, value]) => {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          return exameCard(
            toTitle(key),
            firstFilled(value.valor, "—"),
            firstFilled(value.referencia, "—"),
            firstFilled(value.observacao, "Sem observação")
          );
        }
        return exameCard(toTitle(key), value, "—", "Sem observação");
      }).join("");
    }
  }

  maybeHideSectionById(
    "radar-chart",
    hasRadar
  );
  maybeHideSectionById(
    "evolucao-chart",
    evolucao.length > 0
  );

  const radarSection = document.getElementById("radar-chart")?.closest(".card");
  if (radarSection) radarSection.classList.toggle("hidden", !hasRadar);

  const evolucaoSection = document.getElementById("evolucao-chart")?.closest(".card");
  if (evolucaoSection) evolucaoSection.classList.toggle("hidden", !(evolucao.length > 0));

  const perimetriaSection = document.getElementById("perimetria-grid")?.closest(".card");
  if (perimetriaSection) {
    const temPerimetria = Object.keys(perimetriaPlanejamento).length > 0 ||
      ["cintura", "quadril", "peito", "coxa", "braco", "abdome"].some(key =>
        hasContent(firstFilled(base[key], pre[key], cliente[key]))
      );
    perimetriaSection.classList.toggle("hidden", !temPerimetria);
  }

  const leituraSection = document.getElementById("diagnostico-leitura")?.closest(".card");
  if (leituraSection) leituraSection.classList.toggle("hidden", !hasLeituraTecnica);

  const behaviorSection = document.getElementById("behavior-aderencia")?.closest(".card");
  if (behaviorSection) behaviorSection.classList.toggle("hidden", !hasComportamento);

  const nextSection = document.getElementById("next-manter")?.closest(".card");
  if (nextSection) nextSection.classList.toggle("hidden", !hasDirecionamento);

  if (examesSection) {
    examesSection.classList.toggle("hidden", !examesEntries.length);
  }
});