document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  if (!clienteId) return;

  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  const planejamentos = JSON.parse(localStorage.getItem("planejamentos") || "[]");
  const acompanhamentos = JSON.parse(localStorage.getItem("acompanhamentos") || "[]");

  const cliente = clientes.find(c => c.id === clienteId);
  const planejamento = planejamentos.find(p => p.clienteId === clienteId);

  if (!cliente || !planejamento) {
    document.getElementById("relatorio-not-found").classList.remove("hidden");
    return;
  }

  // =========================
  // PROFISSIONAL
  // =========================
  const nomeProfissional =
    planejamento.profissional?.nome ||
    planejamento.profissionalNome ||
    "Márcio Dowglas";

  const crefProfissional =
    planejamento.profissional?.cref ||
    planejamento.profissionalCref ||
    "—";

  document.getElementById("report-profissional-nome").textContent = nomeProfissional;
  document.getElementById("report-profissional-cref").textContent = crefProfissional;

  // =========================
  // HEADER
  // =========================
  document.getElementById("report-nome").textContent = cliente.nome || "Cliente";
  document.getElementById("report-email").textContent = cliente.email || "";
  document.getElementById("report-meta").textContent = cliente.objetivo || "";

  const avatar = document.getElementById("report-avatar");
  avatar.textContent = cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C";

  document.getElementById("report-data-geracao").textContent =
    new Date().toLocaleDateString("pt-BR");

  // =========================
  // RESUMO
  // =========================
  document.getElementById("summary-objetivo").textContent =
    planejamento.estrategia?.objetivo30d || "-";

  document.getElementById("summary-gargalo").textContent =
    planejamento.estrategia?.gargaloPrincipal || "-";

  document.getElementById("summary-prioridade").textContent =
    planejamento.estrategia?.focoCentral || "-";

  // =========================
  // MÉTRICAS (EXEMPLO BASE)
  // =========================
  const metrics = [
    { label: "Peso", atual: planejamento.metricas?.peso || 0, anterior: planejamento.metricas?.pesoAnterior || 0 },
    { label: "BF %", atual: planejamento.metricas?.bf || 0, anterior: planejamento.metricas?.bfAnterior || 0 },
    { label: "Massa Magra", atual: planejamento.metricas?.massa || 0, anterior: planejamento.metricas?.massaAnterior || 0 },
    { label: "Cintura", atual: planejamento.metricas?.cintura || 0, anterior: planejamento.metricas?.cinturaAnterior || 0 },
  ];

  const metricsGrid = document.getElementById("metrics-grid");

  metrics.forEach(m => {
    const delta = m.atual - m.anterior;

    let deltaClass = "delta-neutral";
    if (delta > 0) deltaClass = "delta-positive";
    if (delta < 0) deltaClass = "delta-negative";

    const card = document.createElement("div");
    card.className = "metric-card";

    card.innerHTML = `
      <span class="metric-label">${m.label}</span>
      <div class="metric-values">
        <div>
          <small>Atual</small>
          <strong>${m.atual}</strong>
        </div>
        <div>
          <small>Anterior</small>
          <strong>${m.anterior}</strong>
        </div>
      </div>
      <div class="metric-delta ${deltaClass}">
        Δ ${delta.toFixed(1)}
      </div>
    `;

    metricsGrid.appendChild(card);
  });

  // =========================
  // RADAR
  // =========================
  const radarData = planejamento.radar || {
    treino: 5,
    dieta: 5,
    sono: 5,
    disciplina: 5,
    mental: 5
  };

  new Chart(document.getElementById("radar-chart"), {
    type: "radar",
    data: {
      labels: ["Treino", "Dieta", "Sono", "Disciplina", "Mental"],
      datasets: [{
        label: "Performance",
        data: Object.values(radarData),
        borderColor: "#47b8ff",
        backgroundColor: "rgba(71,184,255,0.2)"
      }]
    }
  });

  // =========================
  // EVOLUÇÃO
  // =========================
  const evolucao = planejamento.evolucao || [];

  new Chart(document.getElementById("evolucao-chart"), {
    type: "line",
    data: {
      labels: evolucao.map(e => e.data),
      datasets: [{
        label: "Peso",
        data: evolucao.map(e => e.peso),
        borderColor: "#7cff5a",
        tension: 0.3
      }]
    }
  });

  // =========================
  // PERIMETRIA
  // =========================
  const perimetria = planejamento.perimetria || {};
  const perimetriaGrid = document.getElementById("perimetria-grid");

  Object.entries(perimetria).forEach(([key, value]) => {
    const div = document.createElement("div");
    div.className = "metric-card";
    div.innerHTML = `<strong>${key}</strong><br>${value} cm`;
    perimetriaGrid.appendChild(div);
  });

  // =========================
  // DIAGNÓSTICO
  // =========================
  document.getElementById("diagnostico-leitura").textContent =
    planejamento.diagnostico?.leitura || "";

  document.getElementById("diagnostico-sintese").textContent =
    planejamento.diagnostico?.sintese || "";

  document.getElementById("diagnostico-foco").textContent =
    planejamento.diagnostico?.foco || "";

  // =========================
  // TIMELINE
  // =========================
  const timeline = acompanhamentos.filter(a => a.clienteId === clienteId);
  const timelineList = document.getElementById("timeline-list");

  timeline.forEach(item => {
    const el = document.createElement("div");
    el.className = "timeline-item";

    el.innerHTML = `
      <div class="timeline-item-top">
        <strong>${item.titulo || "Acompanhamento"}</strong>
        <span>${item.data || ""}</span>
      </div>
      <p>${item.descricao || ""}</p>
    `;

    timelineList.appendChild(el);
  });

  // =========================
  // PRINT
  // =========================
  const printBtn = document.getElementById("print-report-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
});