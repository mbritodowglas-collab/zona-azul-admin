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

  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  const planejamentos = JSON.parse(localStorage.getItem("planejamentos") || "[]");
  const acompanhamentos = JSON.parse(localStorage.getItem("acompanhamentos") || "[]");

  const cliente = clientes.find(c => String(c.id) === String(clienteId));
  const planejamento = planejamentos.find(p => String(p.clienteId) === String(clienteId)) || null;

  if (!cliente) {
    document.getElementById("relatorio-not-found")?.classList.remove("hidden");
    return;
  }

  const pre = cliente.preDiagnostico || {};
  const base = cliente.dadosBaseEditados || {};
  const diagnostico = planejamento?.diagnostico || {};
  const estrategia = planejamento?.estrategia || {};
  const metricas = planejamento?.metricas || {};
  const nutricional = planejamento?.nutricional || {};
  const habitos = planejamento?.habitos || {};
  const cardio = planejamento?.cardio || {};
  const treino = planejamento?.treino || {};
  const profissional = planejamento?.profissional || {};

  function firstFilled(...values) {
    for (const value of values) {
      if (value === 0) return value;
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "—";
  }

  function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = firstFilled(value);
  }

  function textRaw(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
  }

  function initials(name) {
    if (!name) return "C";
    return String(name).trim().charAt(0).toUpperCase();
  }

  function formatDateBR(value) {
    if (!value) return new Date().toLocaleDateString("pt-BR");
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("pt-BR");
  }

  function buildMetricCard(label, atual, anterior, suffix = "") {
    const atualNum = num(atual, 0);
    const anteriorNum = num(anterior, 0);
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
            <small>Anterior</small>
            <strong>${anteriorNum}${suffix}</strong>
          </div>
        </div>
        <div class="metric-delta ${deltaClass}">
          Δ ${deltaText}
        </div>
      </div>
    `;
  }

  // =========================
  // HEADER / HERO
  // =========================
  const nomeCliente = firstFilled(cliente.nome, "Cliente");
  const emailCliente = firstFilled(cliente.email, cliente.contato?.email, "");
  const objetivoCliente = firstFilled(
    estrategia.objetivo30d,
    base.objetivo,
    pre.objetivo,
    pre.objetivo_principal,
    pre.objetivo_fisico,
    cliente.objetivo
  );
  const faseCliente = firstFilled(
    estrategia.fase,
    cliente.fase_nome,
    cliente.fase,
    "Fase não definida"
  );

  const nomeProfissional = firstFilled(
    profissional.nome,
    planejamento?.profissionalNome,
    "Márcio Dowglas"
  );

  const crefProfissional = firstFilled(
    profissional.cref,
    planejamento?.profissionalCref,
    "—"
  );

  text("report-profissional-nome", nomeProfissional);
  text("report-profissional-cref", crefProfissional);

  text("report-nome", nomeCliente);
  textRaw("report-email", emailCliente === "—" ? "" : emailCliente);
  textRaw(
    "report-meta",
    firstFilled(
      base.observacaoInicial,
      pre.rotina,
      pre.queixa_principal,
      cliente.objetivo
    ) === "—"
      ? ""
      : firstFilled(base.observacaoInicial, pre.rotina, pre.queixa_principal, cliente.objetivo)
  );

  const avatar = document.getElementById("report-avatar");
  if (avatar) avatar.textContent = initials(nomeCliente);

  textRaw("report-data-geracao", formatDateBR(new Date()));

  textRaw("report-fase-chip", `Fase atual: ${faseCliente}`);
  textRaw("report-objetivo-chip", `Objetivo: ${objetivoCliente}`);

  text("report-cliente-meta-nome", nomeCliente);
  text("report-cliente-meta-objetivo", objetivoCliente);
  text("report-cliente-meta-fase", faseCliente);

  // =========================
  // RESUMO EXECUTIVO
  // =========================
  text("summary-objetivo", objetivoCliente);

  text(
    "summary-avanco",
    firstFilled(
      estrategia.avancoPrincipal,
      diagnostico.avancoPrincipal,
      planejamento?.avanco,
      "Primeira leitura em construção a partir dos dados iniciais."
    )
  );

  text(
    "summary-gargalo",
    firstFilled(
      estrategia.gargaloPrincipal,
      diagnostico.gargaloPrincipal,
      pre.dificuldade_principal,
      pre.maior_dificuldade,
      "Ainda sem gargalo técnico consolidado."
    )
  );

  text(
    "summary-prioridade",
    firstFilled(
      estrategia.focoCentral,
      diagnostico.foco,
      planejamento?.focoProximoCiclo,
      "Estruturar aderência e consolidar a base do processo."
    )
  );

  // =========================
  // MÉTRICAS FÍSICAS
  // =========================
  const metricsGrid = document.getElementById("metrics-grid");
  if (metricsGrid) {
    const pesoAtual = firstFilled(metricas.peso, base.peso, pre.peso, 0);
    const pesoAnterior = firstFilled(metricas.pesoAnterior, pre.peso, 0);

    const bfAtual = firstFilled(metricas.bf, base.bf, pre.bf, pre.percentual_gordura, 0);
    const bfAnterior = firstFilled(metricas.bfAnterior, pre.bf, pre.percentual_gordura, 0);

    const massaAtual = firstFilled(metricas.massa, base.massaMagra, pre.massaMagra, 0);
    const massaAnterior = firstFilled(metricas.massaAnterior, pre.massaMagra, 0);

    const cinturaAtual = firstFilled(metricas.cintura, base.cintura, pre.cintura, 0);
    const cinturaAnterior = firstFilled(metricas.cinturaAnterior, pre.cintura, 0);

    metricsGrid.innerHTML = [
      buildMetricCard("Peso", pesoAtual, pesoAnterior, " kg"),
      buildMetricCard("BF", bfAtual, bfAnterior, "%"),
      buildMetricCard("Massa magra", massaAtual, massaAnterior, " kg"),
      buildMetricCard("Cintura", cinturaAtual, cinturaAnterior, " cm")
    ].join("");
  }

  // =========================
  // RADAR
  // =========================
  const radarCanvas = document.getElementById("radar-chart");
  if (radarCanvas && typeof Chart !== "undefined") {
    const radarAtual = {
      treino: num(firstFilled(planejamento?.radar?.treino, pre.radar?.treino, 5), 5),
      dieta: num(firstFilled(planejamento?.radar?.dieta, pre.radar?.dieta, 5), 5),
      sono: num(firstFilled(planejamento?.radar?.sono, pre.radar?.sono, 5), 5),
      disciplina: num(firstFilled(planejamento?.radar?.disciplina, pre.radar?.disciplina, 5), 5),
      mental: num(firstFilled(planejamento?.radar?.mental, pre.radar?.mental, 5), 5)
    };

    const radarInicial = {
      treino: num(firstFilled(pre.radar?.treino, 4), 4),
      dieta: num(firstFilled(pre.radar?.dieta, 4), 4),
      sono: num(firstFilled(pre.radar?.sono, 4), 4),
      disciplina: num(firstFilled(pre.radar?.disciplina, 4), 4),
      mental: num(firstFilled(pre.radar?.mental, 4), 4)
    };

    new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Treino", "Dieta", "Sono", "Disciplina", "Mental"],
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

  // =========================
  // EVOLUÇÃO TEMPORAL
  // =========================
  const evolucaoCanvas = document.getElementById("evolucao-chart");
  if (evolucaoCanvas && typeof Chart !== "undefined") {
    let evolucao = Array.isArray(planejamento?.evolucao) ? [...planejamento.evolucao] : [];

    if (!evolucao.length) {
      evolucao = [
        {
          data: "Inicial",
          peso: num(firstFilled(pre.peso, base.peso, metricas.pesoAnterior, 0), 0)
        },
        {
          data: "Atual",
          peso: num(firstFilled(metricas.peso, base.peso, pre.peso, 0), 0)
        }
      ];
    }

    new Chart(evolucaoCanvas, {
      type: "line",
      data: {
        labels: evolucao.map(e => firstFilled(e.data, "Registro")),
        datasets: [
          {
            label: "Peso",
            data: evolucao.map(e => num(e.peso, 0)),
            borderColor: "#7cff5a",
            backgroundColor: "rgba(124,255,90,0.15)",
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#dce8f8" }
          }
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

  // =========================
  // PERIMETRIA
  // =========================
  const perimetriaGrid = document.getElementById("perimetria-grid");
  if (perimetriaGrid) {
    const perimetria = planejamento?.perimetria || {
      cintura: firstFilled(base.cintura, pre.cintura, "—"),
      quadril: firstFilled(base.quadril, pre.quadril, "—"),
      peito: firstFilled(base.peito, pre.peito, "—"),
      coxa: firstFilled(base.coxa, pre.coxa, "—")
    };

    const items = Object.entries(perimetria)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
      .slice(0, 8);

    if (!items.length) {
      perimetriaGrid.innerHTML = `<div class="empty-box">Nenhuma medida registrada até o momento.</div>`;
    } else {
      perimetriaGrid.innerHTML = items.map(([key, value]) => `
        <div class="perimetria-item">
          <span>${key}</span>
          <strong>${value}${String(value).includes("cm") || value === "—" ? "" : " cm"}</strong>
        </div>
      `).join("");
    }
  }

  // =========================
  // LEITURA TÉCNICA
  // =========================
  text(
    "diagnostico-leitura",
    firstFilled(
      diagnostico.leitura,
      planejamento?.leituraTecnica,
      pre.leituraTecnica,
      "Cliente em fase de estruturação diagnóstica. O relatório atual utiliza os dados iniciais disponíveis e deve ser refinado conforme novas avaliações forem registradas."
    )
  );

  text(
    "diagnostico-sintese",
    firstFilled(
      diagnostico.sintese,
      planejamento?.sinteseDiagnostica,
      pre.sinteseDiagnostica,
      "Ainda sem síntese técnica consolidada para o caso."
    )
  );

  // =========================
  // ANÁLISE COMPORTAMENTAL
  // =========================
  text(
    "behavior-aderencia",
    firstFilled(
      planejamento?.aderencia,
      habitos?.regraMinima,
      pre.aderencia,
      "Aderência em observação"
    )
  );

  text(
    "behavior-ambiente",
    firstFilled(
      habitos?.ajusteAmbiente,
      planejamento?.ambiente,
      pre.ambiente,
      "Ambiente ainda sem leitura consolidada"
    )
  );

  text(
    "behavior-sabotadores",
    firstFilled(
      planejamento?.sabotadores,
      pre.sabotadores,
      pre.maior_dificuldade,
      "Sabotadores ainda não mapeados"
    )
  );

  text(
    "behavior-leitura",
    firstFilled(
      planejamento?.leituraComportamental,
      pre.leituraComportamental,
      "Leitura comportamental inicial em construção."
    )
  );

  // =========================
  // PRÓXIMO DIRECIONAMENTO
  // =========================
  text(
    "next-manter",
    firstFilled(
      planejamento?.manter,
      treino?.frequencia,
      "Manter o básico executado com consistência."
    )
  );

  text(
    "next-ajustar",
    firstFilled(
      planejamento?.ajustar,
      cardio?.frequencia,
      nutricional?.regraMinima,
      "Ajustar rotina, aderência e previsibilidade do processo."
    )
  );

  text(
    "next-foco",
    firstFilled(
      planejamento?.focoProximoCiclo,
      estrategia?.focoCentral,
      "Consolidar aderência antes de aumentar complexidade."
    )
  );

  text(
    "next-meta",
    firstFilled(
      planejamento?.metaPrincipal,
      estrategia?.objetivo30d,
      cliente?.objetivo,
      "Meta principal ainda não definida."
    )
  );

  // =========================
  // TIMELINE
  // =========================
  const timelineList = document.getElementById("timeline-list");
  if (timelineList) {
    const timeline = acompanhamentos
      .filter(a => String(a.clienteId) === String(clienteId))
      .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    if (!timeline.length) {
      timelineList.innerHTML = `<div class="empty-box">Nenhum acompanhamento registrado até o momento.</div>`;
    } else {
      timelineList.innerHTML = timeline.map(item => `
        <div class="timeline-item">
          <div class="timeline-item-top">
            <strong>${firstFilled(item.titulo, "Acompanhamento")}</strong>
            <span>${formatDateBR(item.data)}</span>
          </div>
          <p>${firstFilled(item.descricao, "Sem descrição registrada.")}</p>
        </div>
      `).join("");
    }
  }
});