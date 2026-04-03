document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  const printBtn = document.getElementById("print-report-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (!clienteId) {
    document.getElementById("relatorio-not-found")?.classList.remove("hidden");
    return;
  }

  const clientes = JSON.parse(localStorage.getItem("za_clientes") || "[]");
  const leads = JSON.parse(localStorage.getItem("za_leads") || "[]");

  const cliente = clientes.find(c => String(c.id) === String(clienteId));
  const leadRelacionado =
    leads.find(l => String(l.clienteId) === String(clienteId)) ||
    leads.find(l => String(l.id) === String(clienteId)) ||
    null;

  if (!cliente) {
    document.getElementById("relatorio-not-found")?.classList.remove("hidden");
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
  const profissional = planejamento.profissional || {};
  const acompanhamentos = Array.isArray(cliente.acompanhamentos) ? cliente.acompanhamentos : [];
  const timelineCliente = Array.isArray(cliente.timeline) ? cliente.timeline : [];

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

  function asNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === "") return fallback;
    const cleaned = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }

  function toTitle(value) {
    if (!value || value === "—") return "—";
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
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

  const nomeCliente = firstFilled(cliente.nome, pre.nome, "Cliente");
  const emailCliente = firstFilled(cliente.email, pre.email, "");
  const objetivoCliente = getObjetivo();
  const faseCliente = getFase();
  const nomeProfissional = firstFilled(profissional.nome, "Márcio Dowglas");
  const crefProfissional = firstFilled(profissional.cref, "—");

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
  if (metricsGrid) {
    metricsGrid.innerHTML = [
      metricCard("Peso", pesoAtual, pesoInicial, " kg"),
      metricCard("BF", bfAtual, bfInicial, "%"),
      metricCard("Massa magra", massaAtual, massaInicial, " kg"),
      metricCard("Cintura", cinturaAtual, cinturaInicial, " cm")
    ].join("");
  }

  const radarCanvas = document.getElementById("radar-chart");
  if (radarCanvas && typeof Chart !== "undefined") {
    const inicial = {
      treino: asNumber(firstFilled(pre.radar?.treino, pre.treino_nota, 4), 4),
      dieta: asNumber(firstFilled(pre.radar?.dieta, pre.dieta_nota, 4), 4),
      sono: asNumber(firstFilled(pre.radar?.sono, pre.sono_nota, 4), 4),
      disciplina: asNumber(firstFilled(pre.radar?.disciplina, pre.disciplina_nota, 4), 4),
      mental: asNumber(firstFilled(pre.radar?.mental, pre.mental_nota, 4), 4)
    };

    const atual = {
      treino: asNumber(firstFilled(radar.treino, inicial.treino, 5), 5),
      dieta: asNumber(firstFilled(radar.dieta, inicial.dieta, 5), 5),
      sono: asNumber(firstFilled(radar.sono, inicial.sono, 5), 5),
      disciplina: asNumber(firstFilled(radar.disciplina, inicial.disciplina, 5), 5),
      mental: asNumber(firstFilled(radar.mental, inicial.mental, 5), 5)
    };

    new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Treino", "Dieta", "Sono", "Disciplina", "Mental"],
        datasets: [
          {
            label: "Base inicial",
            data: Object.values(inicial),
            borderColor: "rgba(156,176,203,0.9)",
            backgroundColor: "rgba(156,176,203,0.15)"
          },
          {
            label: "Leitura atual",
            data: Object.values(atual),
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
  if (evolucaoCanvas && typeof Chart !== "undefined") {
    let evolucao = Array.isArray(planejamento.evolucao) ? [...planejamento.evolucao] : [];

    if (!evolucao.length) {
      evolucao = [
        { data: "Inicial", peso: asNumber(pesoInicial, 0) },
        { data: "Atual", peso: asNumber(pesoAtual, 0) }
      ];
    }

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
      perimetriaGrid.innerHTML = `<div class="empty-box">Nenhuma medida registrada até o momento.</div>`;
    } else {
      perimetriaGrid.innerHTML = items.map(([key, value]) => `
        <div class="perimetria-item">
          <span>${toTitle(key)}</span>
          <strong>${value}${String(value).includes("cm") ? "" : " cm"}</strong>
        </div>
      `).join("");
    }
  }

  text(
    "diagnostico-leitura",
    firstFilled(
      relatorioCompleto.leituraTecnica,
      diagnostico.leitura,
      planejamento.leituraTecnica,
      pre.leituraTecnica,
      "O caso apresenta relatório inicial estruturado a partir dos dados de entrada do cliente."
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

  const focoEl = document.getElementById("diagnostico-foco");
  if (focoEl) {
    focoEl.textContent = firstFilled(
      diagnostico.foco,
      estrategia.focoCentral,
      planejamento.focoProximoCiclo,
      "—"
    );
  }

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

    const timelineFinal = [...timelineAcompanhamentos, ...timelineBase];
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
});