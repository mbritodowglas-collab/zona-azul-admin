window.ZARelatorio = (() => {
  function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? decodeURIComponent(id).trim() : null;
  }

  function getLeadById(id) {
    const leads = window.ZAStorage.getLeads();
    return leads.find((lead) => String(lead.id).trim() === String(id).trim());
  }

  function getProfileByMedia(media) {
    if (media >= 8) {
      return {
        label: "BASE CONSISTENTE",
        color: "#4CAF7D",
        text: "Seu cenário atual mostra uma base relativamente estável. O foco agora é consolidar o que já funciona e elevar os pontos com maior potencial de alavanca."
      };
    }

    if (media >= 5) {
      return {
        label: "EM CONSTRUÇÃO",
        color: "#E8A020",
        text: "Seu resultado mostra que já existe algum nível de estrutura, mas ainda há pilares importantes pedindo consistência. O momento é de organização e ajuste fino."
      };
    }

    return {
      label: "ATENÇÃO PRIORITÁRIA",
      color: "#E05252",
      text: "Seu pré-diagnóstico indica que hoje existem pilares críticos impactando sua saúde e qualidade de vida. O foco ideal é começar com prioridades claras e ações simples, mas estratégicas."
    };
  }

  function getPillarTexts() {
    return {
      score_movimento:
        "Nas Zonas Azuis, as pessoas mais longevas não vivem presas a treinos perfeitos. Elas se movem com frequência ao longo do dia. O ponto aqui não é intensidade isolada, mas constância de movimento.",
      score_alimentacao:
        "A alimentação nas Zonas Azuis tende a ser mais simples, mais natural e mais regular. O objetivo não é perfeição rígida, mas criar uma base alimentar que sustente energia, composição corporal e longevidade.",
      score_sono:
        "Sono não é pausa improdutiva. É recuperação biológica de alto nível. Quando ele está comprometido, humor, fome, energia, clareza mental e adesão aos hábitos tendem a cair em cadeia.",
      score_proposito:
        "Ter clareza de propósito ajuda a organizar rotina, escolha e direção. Não precisa ser algo grandioso. Precisa ser forte o suficiente para dar sentido ao que você faz no dia a dia.",
      score_social:
        "Conexões humanas de qualidade têm impacto real sobre saúde e longevidade. Relações sólidas, pertencimento e apoio social funcionam como um fator protetor para corpo e mente.",
      score_estresse:
        "O estresse crônico drena energia, piora recuperação e sabota outros pilares. Não basta apenas 'aguentar'. É preciso criar mecanismos reais de regulação e descompressão."
    };
  }

  function getStrategicReading(lead) {
    const media = Number(lead.media_geral || 0);
    const pilar = lead.pilar_mais_baixo;
    const pilarLabel = window.ZACalculos.pillarLabels[pilar] || "MANUTENÇÃO";

    if (media >= 8) {
      return `Seu cenário atual sugere uma base relativamente funcional. O principal ganho agora não está em começar do zero, mas em corrigir de forma intencional o pilar ${pilarLabel}, porque ele provavelmente é o ponto que mais limita sua evolução global neste momento.`;
    }

    if (media >= 5) {
      return `Seu resultado mostra que existem bases presentes, mas ainda sem estabilidade suficiente. O pilar ${pilarLabel} aparece como o ponto com maior potencial de alavanca, porque melhorar esse eixo tende a facilitar adesão, energia e consistência nos demais.`;
    }

    return `Seu pré-diagnóstico indica um momento de maior vulnerabilidade estrutural. O pilar ${pilarLabel} aparece como prioridade, não porque ele seja o único problema, mas porque ele parece estar puxando os demais para baixo. A estratégia ideal aqui é começar simples, mas com foco absoluto nas prioridades.`;
  }

  function renderScoreBars(lead) {
    const pillars = [
      { key: "score_movimento", label: "MOVIMENTO", score: lead.score_movimento },
      { key: "score_alimentacao", label: "ALIMENTAÇÃO", score: lead.score_alimentacao },
      { key: "score_sono", label: "SONO", score: lead.score_sono },
      { key: "score_proposito", label: "PROPÓSITO", score: lead.score_proposito },
      { key: "score_social", label: "VIDA SOCIAL", score: lead.score_social },
      { key: "score_estresse", label: "ESTRESSE", score: lead.score_estresse }
    ];

    return pillars.map((p) => {
      const status = window.ZACalculos.statusPorScore(Number(p.score));
      return `
        <div class="score-row">
          <strong style="color:#0D2B3E;">${p.label}</strong>
          <div class="bar">
            <div class="bar-fill" style="width:${Number(p.score) * 10}%; background:${status.color};"></div>
          </div>
          <strong style="color:${status.color};">${p.score}/10</strong>
          <span class="chip ${status.className}" style="border-color:#e8edf3;">${status.label}</span>
        </div>
      `;
    }).join("");
  }

  function renderPillarAnalysis(lead) {
    const texts = getPillarTexts();

    const pillars = [
      { key: "score_movimento", label: "MOVIMENTO", score: lead.score_movimento },
      { key: "score_alimentacao", label: "ALIMENTAÇÃO", score: lead.score_alimentacao },
      { key: "score_sono", label: "SONO", score: lead.score_sono },
      { key: "score_proposito", label: "PROPÓSITO", score: lead.score_proposito },
      { key: "score_social", label: "VIDA SOCIAL", score: lead.score_social },
      { key: "score_estresse", label: "ESTRESSE", score: lead.score_estresse }
    ];

    return pillars.map((p) => {
      const status = window.ZACalculos.statusPorScore(Number(p.score));
      return `
        <div class="pillar-card">
          <h4>${p.label} — <span style="color:${status.color};">${p.score}/10 · ${status.label}</span></h4>
          <p>${texts[p.key]}</p>
        </div>
      `;
    }).join("");
  }

  function drawRadar(canvasId, lead) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !lead) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.33;

    const labels = [
      "MOVIMENTO",
      "ALIMENTAÇÃO",
      "SONO",
      "PROPÓSITO",
      "SOCIAL",
      "ESTRESSE"
    ];

    const values = [
      Number(lead.score_movimento),
      Number(lead.score_alimentacao),
      Number(lead.score_sono),
      Number(lead.score_proposito),
      Number(lead.score_social),
      Number(lead.score_estresse)
    ];

    const pointColors = values.map((v) => window.ZACalculos.statusPorScore(v).color);

    const angles = [
      -Math.PI / 2,
      -Math.PI / 6,
      Math.PI / 6,
      Math.PI / 2,
      (5 * Math.PI) / 6,
      (-5 * Math.PI) / 6
    ];

    [3.3, 6.6, 10].forEach((level) => {
      ctx.beginPath();
      angles.forEach((angle, i) => {
        const r = radius * (level / 10);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "#CBD5E0";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    angles.forEach((angle, i) => {
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#CBD5E0";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      const lx = cx + Math.cos(angle) * (radius + 28);
      const ly = cy + Math.sin(angle) * (radius + 28);

      ctx.fillStyle = "#0D2B3E";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], lx, ly);
    });

    ctx.beginPath();
    values.forEach((value, i) => {
      const r = radius * (value / 10);
      const x = cx + Math.cos(angles[i]) * r;
      const y = cy + Math.sin(angles[i]) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(46,134,171,0.25)";
    ctx.strokeStyle = "#2E86AB";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    values.forEach((value, i) => {
      const r = radius * (value / 10);
      const x = cx + Math.cos(angles[i]) * r;
      const y = cy + Math.sin(angles[i]) * r;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = pointColors[i];
      ctx.fill();

      ctx.fillStyle = pointColors[i];
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(String(value), x, y - 14);
    });
  }

  function renderReportByLead(lead) {
    const reportSubtitle = document.getElementById("report-subtitle");
    const reportBody = document.getElementById("report-body");

    if (!reportSubtitle || !reportBody) return;

    const profile = getProfileByMedia(Number(lead.media_geral));
    const gaps = Array.isArray(lead.top_3_gaps) ? lead.top_3_gaps : [];
    const pilarMaisBaixo = lead.pilar_mais_baixo
      ? {
          key: lead.pilar_mais_baixo,
          label: window.ZACalculos.pillarLabels[lead.pilar_mais_baixo],
          score: lead[lead.pilar_mais_baixo],
          text: getPillarTexts()[lead.pilar_mais_baixo]
        }
      : null;

    reportSubtitle.textContent = `${lead.nome} · gerado em ${new Date().toLocaleDateString("pt-BR")}`;

    reportBody.innerHTML = `
      <section class="report-section">
        <h3>Resumo inicial</h3>
        <div class="report-grid three">
          <div class="report-kpi">
            <span>Média geral</span>
            <strong>${lead.media_geral}</strong>
          </div>
          <div class="report-kpi">
            <span>Perfil atual</span>
            <strong style="color:${profile.color};">${profile.label}</strong>
          </div>
          <div class="report-kpi">
            <span>Pilar prioritário</span>
            <strong>${pilarMaisBaixo ? pilarMaisBaixo.label : "MANUTENÇÃO"}</strong>
          </div>
        </div>
        <div class="highlight-box" style="margin-top:16px;">
          <p>${profile.text}</p>
        </div>
      </section>

      <section class="report-section">
        <h3>Radar Vida Azul</h3>
        <canvas id="reportRadarCanvas" width="400" height="400" style="max-width:100%; background:transparent;"></canvas>
      </section>

      <section class="report-section">
        <h3>Pontuação por pilar</h3>
        <div class="score-list">
          ${renderScoreBars(lead)}
        </div>
      </section>

      <section class="report-section">
        <h3>Top 3 gaps</h3>
        ${
          gaps.length
            ? `<div class="report-grid three">
                ${gaps.slice(0, 3).map((g) => {
                  const status = window.ZACalculos.statusPorScore(Number(g.score));
                  return `
                    <div class="report-kpi">
                      <span>${window.ZACalculos.pillarLabels[g.key]}</span>
                      <strong style="color:${status.color};">${g.score}/10</strong>
                    </div>
                  `;
                }).join("")}
              </div>`
            : `<p>Seu radar atual não mostra gaps críticos relevantes. O foco, neste caso, é manutenção inteligente e refinamento.</p>`
        }
      </section>

      <section class="report-section">
        <h3>Análise dos pilares</h3>
        <div class="report-grid two">
          ${renderPillarAnalysis(lead)}
        </div>
      </section>

      <section class="report-section">
        <h3>Leitura estratégica do momento atual</h3>
        <div class="highlight-box">
          <p>${getStrategicReading(lead)}</p>
        </div>
      </section>

      <section class="report-section">
        <h3>Contexto relatado</h3>
        <div class="report-grid two">
          <div class="pillar-card">
            <h4>Maior desafio atual</h4>
            <p>${lead.desafio_atual || "-"}</p>
          </div>
          <div class="pillar-card">
            <h4>Meta para 6 meses</h4>
            <p>${lead.meta_6_meses || "-"}</p>
          </div>
          <div class="pillar-card">
            <h4>Por que você parou antes?</h4>
            <p>${lead.por_que_parou || "-"}</p>
          </div>
          <div class="pillar-card">
            <h4>O que já funcionou</h4>
            <p>${lead.o_que_funcionou || "-"}</p>
          </div>
        </div>
      </section>

      <section class="report-section">
        <h3>Próximo passo recomendado</h3>
        <p>Este relatório representa uma leitura inicial do seu cenário atual. O próximo passo ideal é aprofundar o diagnóstico para transformar essa leitura em um plano estruturado, com prioridades claras e direcionamento prático dentro da Metodologia Vida Azul.</p>
      </section>
    `;

    setTimeout(() => drawRadar("reportRadarCanvas", lead), 50);
  }

  function initReport() {
    const reportBody = document.getElementById("report-body");
    if (!reportBody) return;

    const id = getIdFromURL();

    if (!id) {
      reportBody.innerHTML = `<section class="report-section"><p>Lead não informado.</p></section>`;
      return;
    }

    const lead = getLeadById(id);

    if (!lead) {
      reportBody.innerHTML = `<section class="report-section"><p>Lead não encontrado.</p></section>`;
      return;
    }

    renderReportByLead(lead);
  }

  return {
    initReport,
    renderReportByLead
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("print-report-btn")?.addEventListener("click", () => {
    window.print();
  });

  window.ZARelatorio.initReport();
});