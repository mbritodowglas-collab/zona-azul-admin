window.ZARelatorio = (() => {
  function getLeadByEmail(email) {
    const leads = window.ZAStorage.getLeads();
    return leads.find(
      (lead) =>
        (lead.email || "").trim().toLowerCase() ===
        (email || "").trim().toLowerCase()
    );
  }

  function getProfileByMedia(media) {
    if (media >= 7) {
      return { label: "ACIMA DA MÉDIA", color: "#4CAF7D" };
    }
    if (media >= 4) {
      return { label: "EM DESENVOLVIMENTO", color: "#E8A020" };
    }
    return { label: "ATENÇÃO PRIORITÁRIA", color: "#E05252" };
  }

  function getPillarTexts() {
    return {
      score_movimento:
        "Nas Zonas Azuis, as pessoas mais longevas não frequentam academias. Elas se movem naturalmente ao longo do dia. O que sustenta a longevidade não é a intensidade do exercício, mas a consistência do movimento diário.",
      score_alimentacao:
        "A alimentação das Zonas Azuis é predominantemente baseada em plantas. Poucas regras rígidas, muito senso de proporção e ritmo. Janelas alimentares respeitadas e prazer sem culpa são parte do padrão.",
      score_sono:
        "O sono é o maior regenerador do organismo humano. Qualidade e consistência de horário impactam diretamente metabolismo, humor e longevidade. O descanso é tratado como prioridade, não como o que sobra quando tudo termina.",
      score_proposito:
        "Ter um senso de propósito claro está diretamente associado à longevidade. Os japoneses chamam de Ikigai — a razão pela qual você acorda de manhã. Não precisa ser grandioso. Precisa ser genuíno e orientar escolhas cotidianas.",
      score_social:
        "Relações sociais profundas e senso de pertencimento são preditores robustos de longevidade. Não é sobre ter muitos contatos — é sobre ter conexões significativas com pessoas que se apoiam mutuamente.",
      score_estresse:
        "O estresse crônico acelera o envelhecimento celular e sabota todos os outros pilares. Pequenas rotinas diárias de descompressão têm efeito desproporcional na qualidade de vida."
    };
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

    return pillars
      .map((p) => {
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
      })
      .join("");
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

    return pillars
      .map((p) => {
        const status = window.ZACalculos.statusPorScore(Number(p.score));
        return `
          <div class="pillar-card">
            <h4>${p.label} — <span style="color:${status.color};">${p.score}/10 · ${status.label}</span></h4>
            <p>${texts[p.key] || ""}</p>
          </div>
        `;
      })
      .join("");
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

  function renderReport(email) {
    const lead = getLeadByEmail(email);
    const reportContent = document.getElementById("reportContent");

    if (!reportContent) return;

    if (!lead) {
      reportContent.innerHTML = `
        <div class="report-head">
          <h1>Relatório não encontrado</h1>
          <p>Não achei esse lead neste navegador.</p>
        </div>
      `;
      return;
    }

    const profile = getProfileByMedia(Number(lead.media_geral));
    const gaps = Array.isArray(lead.top_3_gaps) ? lead.top_3_gaps : [];
    const pillarTexts = getPillarTexts();

    const pilarMaisBaixo = lead.pilar_mais_baixo
      ? {
          key: lead.pilar_mais_baixo,
          label: window.ZACalculos.pillarLabels[lead.pilar_mais_baixo],
          score: lead[lead.pilar_mais_baixo],
          text: pillarTexts[lead.pilar_mais_baixo]
        }
      : null;

    const introText =
      "As Zonas Azuis são regiões do mundo onde as pessoas vivem mais e melhor. Em comum, elas compartilham padrões consistentes de movimento, alimentação, propósito, vínculos sociais, sono e manejo do estresse.";

    reportContent.innerHTML = `
      <div class="report-head">
        <h1>Relatório Vida Azul</h1>
        <p><strong>${lead.nome}</strong> · ${new Date().toLocaleDateString("pt-BR")}</p>
        <p style="margin-top:10px;">${introText}</p>
      </div>

      <div class="report-body">
        <div class="report-section">
          <h3>Visão Geral</h3>
          <div class="report-grid three">
            <div class="report-kpi">
              <span>Média geral</span>
              <strong>${lead.media_geral}</strong>
            </div>
            <div class="report-kpi">
              <span>Perfil geral</span>
              <strong style="color:${profile.color};">${profile.label}</strong>
            </div>
            <div class="report-kpi">
              <span>Maior ponto de alavanca</span>
              <strong>${pilarMaisBaixo ? pilarMaisBaixo.label : "MANUTENÇÃO"}</strong>
            </div>
          </div>
        </div>

        <div class="report-section">
          <h3>Radar Vida Azul</h3>
          <canvas id="reportRadarCanvas" width="400" height="400" style="max-width:100%; background:transparent;"></canvas>
        </div>

        <div class="report-section">
          <h3>Pontuação por Pilar</h3>
          <div class="score-list">
            ${renderScoreBars(lead)}
          </div>
        </div>

        <div class="report-section">
          <h3>Top 3 gaps</h3>
          ${
            gaps.length
              ? `<div class="report-grid three">
                  ${gaps
                    .slice(0, 3)
                    .map((g) => {
                      const status = window.ZACalculos.statusPorScore(Number(g.score));
                      return `
                        <div class="report-kpi">
                          <span>${window.ZACalculos.pillarLabels[g.key]}</span>
                          <strong style="color:${status.color};">${g.score}/10</strong>
                        </div>
                      `;
                    })
                    .join("")}
                </div>`
              : `<p>Seu perfil está acima da média. O foco será manutenção e aprofundamento.</p>`
          }
        </div>

        <div class="report-section">
          <h3>Análise dos Pilares</h3>
          <div class="report-grid two">
            ${renderPillarAnalysis(lead)}
          </div>
        </div>

        <div class="report-section">
          <h3>Maior ponto de alavanca</h3>
          ${
            pilarMaisBaixo
              ? `<div class="highlight-box">
                  <p><strong>${pilarMaisBaixo.label}</strong> foi o pilar com menor pontuação no seu radar atual.</p>
                  <p style="margin:10px 0 0;">${pilarMaisBaixo.text}</p>
                </div>`
              : `<p>Seu radar não apresentou gaps críticos. O foco ideal é manutenção e aprofundamento.</p>`
          }
        </div>

        <div class="report-section">
          <h3>Seu contexto hoje</h3>
          <div class="report-grid two">
            <div class="pillar-card">
              <h4>Maior desafio atual</h4>
              <p>${lead.desafio_atual || "-"}</p>
            </div>
            <div class="pillar-card">
              <h4>Meta para 6 meses</h4>
              <p>${lead.meta_6_meses || "-"}</p>
            </div>
          </div>
          <div class="pillar-card" style="margin-top:16px;">
            <h4>Por que você parou antes?</h4>
            <p>${lead.por_que_parou || "-"}</p>
          </div>
        </div>

        <div class="report-section">
          <h3>Próximo passo</h3>
          <p>O próximo nível desse processo é o <strong>Diagnóstico Completo Vida Azul</strong>, onde aprofundamos os padrões do seu caso, definimos prioridades de atuação e estruturamos um plano mais preciso para saúde, qualidade de vida e longevidade.</p>
        </div>
      </div>
    `;

    setTimeout(() => drawRadar("reportRadarCanvas", lead), 50);
  }

  return {
    renderReport
  };
})();