window.ZARelatorioCliente = (() => {
  let registroId = null;
  let registro = null;
  let radarChart = null;

  const CONFIG_PROFISSIONAL = {
    nome: "Márcio Dowglas",
    cref: "003918-G/AM"
  };

  const RADAR_LABELS = {
    score_movimento: "Movimento",
    score_alimentacao: "Alimentação",
    score_sono: "Sono",
    score_proposito: "Propósito",
    score_social: "Social",
    score_estresse: "Estresse"
  };

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return JSON.parse(localStorage.getItem("za_clientes") || "[]");
  }

  function getLeads() {
    return JSON.parse(localStorage.getItem("za_leads") || "[]");
  }

  function getRegistroById(id) {
    return (
      getClientes().find(i => String(i.id) === String(id)) ||
      getLeads().find(i => String(i.id) === String(id)) ||
      null
    );
  }

  function firstFilled(...values) {
    for (const v of values) {
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return "—";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function getPre() {
    return registro?.preDiagnostico || registro || {};
  }

  function getNome() {
    return firstFilled(registro?.nome, getPre()?.nome);
  }

  function getEmail() {
    return firstFilled(registro?.email, getPre()?.email);
  }

  function getObjetivo() {
    return firstFilled(
      registro?.objetivo,
      getPre()?.objetivo,
      getPre()?.objetivo_principal
    );
  }

  function getScore(key) {
    return Number(firstFilled(registro?.[key], getPre()?.[key], 0)) || 0;
  }

  function getRadarData() {
    return Object.keys(RADAR_LABELS).map(k => getScore(k));
  }

  function getRadarAverage() {
    const vals = getRadarData().filter(v => v > 0);
    if (!vals.length) return "—";
    return (vals.reduce((a, b) => a + b, 0) / vals.length)
      .toFixed(1)
      .replace(".", ",");
  }

  function getTopGaps() {
    return Object.entries(RADAR_LABELS)
      .map(([k, l]) => ({ label: l, score: getScore(k) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }

  function getParecerProfissional() {
    return firstFilled(
      registro?.parecerProfissional,
      getPre()?.parecerProfissional,
      ""
    );
  }

  function salvarParecerProfissional(texto) {
    registro.parecerProfissional = texto;

    const clientes = getClientes();
    const leads = getLeads();

    const ci = clientes.findIndex(i => i.id == registro.id);
    const li = leads.findIndex(i => i.id == registro.id);

    if (ci >= 0) {
      clientes[ci].parecerProfissional = texto;
      localStorage.setItem("za_clientes", JSON.stringify(clientes));
    }

    if (li >= 0) {
      leads[li].parecerProfissional = texto;
      localStorage.setItem("za_leads", JSON.stringify(leads));
    }
  }

  function renderHeader() {
    setText("report-lead-name", getNome());
    setText("report-date", new Date().toLocaleDateString("pt-BR"));
    setText("report-profissional", CONFIG_PROFISSIONAL.nome);
    setText("report-cref", CONFIG_PROFISSIONAL.cref);
  }

  function createSection(title, content, extra = "") {
    return `
      <section class="report-section ${extra}">
        <h2>${title}</h2>
        ${content}
      </section>
    `;
  }

  function renderRadar() {
    const root = document.getElementById("report-body");

    root.insertAdjacentHTML(
      "beforeend",
      createSection(
        "Radar inicial",
        `<div class="report-chart-wrap"><canvas id="radar"></canvas></div>`
      )
    );

    const ctx = document.getElementById("radar");

    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.values(RADAR_LABELS),
        datasets: [{
          data: getRadarData(),
          borderColor: "#47b8ff",
          backgroundColor: "rgba(71,184,255,0.2)"
        }]
      },
      options: { responsive: true }
    });
  }

  function renderBody() {
    const root = document.getElementById("report-body");
    const gaps = getTopGaps();
    const parecerAtual = getParecerProfissional();

    root.innerHTML = `
      ${createSection("Identificação", `
        <div class="report-grid cols-2">
          <div class="report-info-card"><span>Nome</span><strong>${getNome()}</strong></div>
          <div class="report-info-card"><span>Email</span><strong>${getEmail()}</strong></div>
        </div>
      `)}

      ${createSection("Condição atual", `
        <div class="report-info-card">
          <span>Objetivo</span>
          <strong>${getObjetivo()}</strong>
        </div>
      `)}
    `;

    renderRadar();

    root.insertAdjacentHTML(
      "beforeend",
      createSection("Gaps prioritários", `
        <div class="report-grid cols-3">
          ${gaps.map(g => `
            <div class="report-info-card">
              <strong>${g.label} — ${g.score}/10</strong>
            </div>
          `).join("")}
        </div>
      `)
    );

    // 🔥 BLOCO CORRIGIDO
    root.insertAdjacentHTML(
      "beforeend",
      createSection(
        "Parecer profissional",
        `
          <textarea id="parecer-input" class="parecer-input no-print">${parecerAtual}</textarea>

          <button id="salvar-parecer-btn" class="btn no-print">
            Salvar parecer
          </button>

          <div 
            id="parecer-profissional-view"
            class="parecer-render"
            style="${parecerAtual ? "" : "display:none;"}"
          >${parecerAtual}</div>
        `
      )
    );
  }

  function bindParecer() {
    const btn = document.getElementById("salvar-parecer-btn");
    const input = document.getElementById("parecer-input");
    const view = document.getElementById("parecer-profissional-view");

    btn?.addEventListener("click", () => {
      const texto = input.value.trim();

      salvarParecerProfissional(texto);

      if (texto) {
        view.textContent = texto;
        view.style.display = "block";
      }

      alert("Parecer salvo.");
    });
  }

  function bindPrint() {
    document.getElementById("print-report-btn")
      ?.addEventListener("click", () => window.print());
  }

  function render() {
    renderHeader();
    renderBody();
    bindParecer();
    bindPrint();
  }

  function init() {
    registroId = getQueryParam("id");
    registro = getRegistroById(registroId);

    if (!registro) return;

    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZARelatorioCliente.init();
});