function getEmailFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("email");
}

function formatDateBR(dateLike) {
  if (!dateLike) return "-";
  const date = new Date(dateLike);
  return date.toLocaleDateString("pt-BR");
}

function pillarLabel(key) {
  return window.ZACalculos?.pillarLabels?.[key] || key || "-";
}

function pillarStatus(score) {
  return window.ZACalculos.statusPorScore(score);
}

function getLeadByEmail(email) {
  const leads = window.ZAStorage.getLeads();
  return leads.find((item) => item.email === email);
}

function getTopGapsHtml(lead) {
  const gaps = Array.isArray(lead.top_3_gaps) ? lead.top_3_gaps : [];
  if (!gaps.length) {
    return `<p>Seu perfil está acima da média. O foco será manutenção e aprofundamento.</p>`;
  }

  return `
    <div class="actions">
      ${gaps.map(gap => {
        const label = pillarLabel(gap.key || gap.pilar);
        return `<span class="chip warning">${label} (${gap.score})</span>`;
      }).join("")}
    </div>
  `;
}

function getPillarAnalysis() {
  return {
    score_movimento: "Nas Zonas Azuis, as pessoas mais longevas não frequentam academias. Elas se movem naturalmente ao longo do dia. O que sustenta a longevidade não é a intensidade do exercício, mas a consistência do movimento diário.",
    score_alimentacao: "A alimentação das Zonas Azuis é predominantemente baseada em plantas. Poucas regras rígidas, muito senso de proporção e ritmo. Janelas alimentares respeitadas e prazer sem culpa são parte do padrão.",
    score_sono: "O sono é o maior regenerador do organismo humano. Qualidade e consistência de horário impactam diretamente metabolismo, humor e longevidade. O descanso é tratado como prioridade, não como o que sobra quando tudo termina.",
    score_proposito: "Ter um senso de propósito claro está diretamente associado à longevidade. Os japoneses chamam de Ikigai — a razão pela qual você acorda de manhã. Não precisa ser grandioso. Precisa ser genuíno e orientar escolhas cotidianas.",
    score_social: "Relações sociais profundas e senso de pertencimento são preditores robustos de longevidade. Não é sobre ter muitos contatos — é sobre ter conexões significativas com pessoas que se apoiam mutuamente.",
    score_estresse: "O estresse crônico acelera o envelhecimento celular e sabota todos os outros pilares. Pequenas rotinas diárias de descompressão têm efeito desproporcional na qualidade de vida."
  };
}

function buildScoreRows(lead) {
  const items = [
    { key: "score_movimento", label: "Movimento", score: lead.score_movimento },
    { key: "score_alimentacao", label: "Alimentação", score: lead.score_alimentacao },
    { key: "score_sono", label: "Sono", score: lead.score_sono },
    { key: "score_proposito", label: "Propósito", score: lead.score_proposito },
    { key: "score_social", label: "Vida social", score: lead.score_social },
    { key: "score_estresse", label: "Estresse", score: lead.score_estresse }
  ];

  return items.map(item => {
    const status = pillarStatus(item.score);
    return `
      <div class="score-row">
        <div><strong>${item.label}</strong></div>
        <div class="bar">
          <div class="bar-fill" style="width:${item.score * 10}%; background:${status.color};"></div>
        </div>
        <div><strong>${item.score}/10</strong></div>
        <div><span class="chip ${status.className}">${status.label}</span></div>
      </div>
    `;
  }).join("");
}

function buildPillarCards(lead) {
  const analysis = getPillarAnalysis();
  const items = [
    { key: "score_movimento", label: "Movimento", score: lead.score_movimento },
    { key: "score_alimentacao", label: "Alimentação", score: lead.score_alimentacao },
    { key: "score_sono", label: "Sono", score: lead.score_sono },
    { key: "score_proposito", label: "Propósito", score: lead.score_proposito },
    { key: "score_social", label: "Vida social", score: lead.score_social },
    { key: "score_estresse", label: "Estresse", score: lead.score_estresse }
  ];

  return items.map(item => {
    const status = pillarStatus(item.score);
    return `
      <div class="pillar-card">
        <h4>${item.label} · ${item.score}/10 · ${status.label}</h4>
        <p>${analysis[item.key]}</p>
      </div>
    `;
  }).join("");
}

function renderReport(lead) {
  const reportSubtitle = document.getElementById("report-subtitle");
  const reportBody = document.getElementById("report-body");

  reportSubtitle.textContent = `${lead.nome} · gerado em ${formatDateBR(new Date())}`;

  reportBody.innerHTML = `
    <section class="report-section">
      <h3>Resumo inicial</h3>
      <div class="report-grid two">
        <div class="report-kpi">
          <span>Média geral</span>
          <strong>${lead.media_geral ?? "-"}</strong>
        </div>
        <div class="report-kpi">
          <span>Pilar mais baixo</span>
          <strong>${pillarLabel(lead.pilar_mais_baixo)}</strong>
        </div>
      </div>
    </section>

    <section class="report-section">
      <h3>Radar de pontuação</h3>
      <div class="score-list">
        ${buildScoreRows(lead)}
      </div>
    </section>

    <section class="report-section">
      <h3>Principais gaps</h3>
      ${getTopGapsHtml(lead)}
    </section>

    <section class="report-section">
      <h3>Análise por pilar</h3>
      <div class="report-grid two">
        ${buildPillarCards(lead)}
      </div>
    </section>

    <section class="report-section">
      <h3>Contexto relatado</h3>
      <div class="report-grid two">
        <div class="pillar-card">
          <h4>Por que você parou?</h4>
          <p>${lead.por_que_parou || "-"}</p>
        </div>
        <div class="pillar-card">
          <h4>O que já funcionou</h4>
          <p>${lead.o_que_funcionou || "-"}</p>
        </div>
        <div class="pillar-card">
          <h4>Maior desafio atual</h4>
          <p>${lead.desafio_atual || "-"}</p>
        </div>
        <div class="pillar-card">
          <h4>Meta para 6 meses</h4>
          <p>${lead.meta_6_meses || "-"}</p>
        </div>
      </div>
    </section>

    <section class="report-section">
      <h3>Leitura inicial</h3>
      <div class="highlight-box">
        <strong>Principal ponto de atenção:</strong>
        ${pillarLabel(lead.pilar_mais_baixo)}.
        Esse é o ponto com maior potencial de alavanca dentro da sua rotina atual.
      </div>
    </section>

    <section class="report-section">
      <h3>Próximo passo</h3>
      <p>
        Este pré-diagnóstico é uma leitura inicial. O próximo nível é o diagnóstico completo,
        onde aprofundamos os aspectos físicos, comportamentais e ambientais para estruturar
        uma direção mais precisa dentro da Metodologia Vida Azul.
      </p>
    </section>
  `;
}

function initReport() {
  const email = getEmailFromURL();
  const reportBody = document.getElementById("report-body");

  if (!email) {
    reportBody.innerHTML = `<section class="report-section"><p>Lead não informado.</p></section>`;
    return;
  }

  const lead = getLeadByEmail(email);

  if (!lead) {
    reportBody.innerHTML = `<section class="report-section"><p>Lead não encontrado.</p></section>`;
    return;
  }

  renderReport(lead);
}

document.getElementById("print-report-btn")?.addEventListener("click", () => {
  window.print();
});

initReport();