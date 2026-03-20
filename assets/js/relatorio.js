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
        className: "success",
        text: "Seu cenário atual mostra uma base relativamente estável. O foco agora é consolidar o que já funciona e elevar os pontos com maior potencial de alavanca."
      };
    }

    if (media >= 5) {
      return {
        label: "EM CONSTRUÇÃO",
        color: "#D1A93D",
        className: "warning",
        text: "Seu resultado mostra que já existe alguma estrutura, mas ainda sem consistência suficiente. O melhor movimento agora é ajustar prioridades e criar estabilidade nos pilares mais sensíveis."
      };
    }

    return {
      label: "ATENÇÃO PRIORITÁRIA",
      color: "#E05252",
      className: "danger",
      text: "Seu pré-diagnóstico indica um momento de maior vulnerabilidade estrutural. O foco ideal é sair da dispersão e começar pelas prioridades que podem gerar efeito cascata."
    };
  }

  function getPillarTexts() {
    return {
      score_movimento:
        "Seu corpo precisa de movimento consistente — não necessariamente intenso. Nas Zonas Azuis, as pessoas mais longevas se movem naturalmente ao longo do dia.",
      score_alimentacao:
        "A alimentação das Zonas Azuis é predominantemente simples, moderada e baseada em comida de verdade. Pequenos ajustes aqui costumam gerar impacto desproporcional.",
      score_sono:
        "O sono é um dos maiores regeneradores do organismo. Quando ele está desalinhado, energia, humor, clareza mental e adesão aos hábitos tendem a cair em cadeia.",
      score_proposito:
        "Ter clareza de propósito ajuda a organizar a direção da vida. Não precisa ser algo grandioso — precisa ser forte o bastante para orientar suas escolhas.",
      score_social:
        "Conexões humanas consistentes funcionam como fator protetor de saúde. Relações de apoio e pertencimento influenciam diretamente bem-estar e longevidade.",
      score_estresse:
        "O estresse crônico é um dos grandes sabotadores de saúde. Pequenas rotinas de regulação e descompressão têm um efeito maior do que parecem à primeira vista."
    };
  }

  function getStrategicReading(lead) {
    const media = Number(lead.media_geral || 0);
    const pilar = lead.pilar_mais_baixo;
    const pilarLabel = pilar
      ? window.ZACalculos.pillarLabels[pilar] || "MANUTENÇÃO"
      : "EQUILÍBRIO GERAL";

    if (!pilar) {
      return "Seu resultado mostra um nível alto de equilíbrio entre os pilares. O foco agora não está em corrigir um ponto crítico, mas em manter consistência, aprofundar hábitos saudáveis e evoluir de forma integrada.";
    }

    if (media >= 8) {
      return `Seu cenário atual sugere uma base funcional. O ganho mais inteligente agora está em aprofundar o pilar ${pilarLabel}, porque ele provavelmente representa o principal limitador da sua evolução global neste momento.`;
    }

    if (media >= 5) {
      return `Seu resultado mostra presença de base, mas ainda sem estabilidade suficiente. O pilar ${pilarLabel} aparece como o ponto com maior potencial de alavanca para melhorar energia, consistência e adesão.`;
    }

    return `Seu pré-diagnóstico indica um momento de atenção. O pilar ${pilarLabel} surge como prioridade estratégica, porque ele parece estar puxando o restante do sistema para baixo. Melhorar esse eixo tende a gerar o maior retorno inicial.`;
  }

  function formatDateBR(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
  }

  function formatGenero(value) {
    if (!value) return "-";
    if (value === "masculino") return "Masculino";
    if (value === "feminino") return "Feminino";
    if (value === "nao_informar") return "Prefere não informar";
    return value;
  }

  function getPillars(lead) {
    return [
      { key: "score_movimento", label: "MOVIMENTO", score: Number(lead.score_movimento) },
      { key: "score_alimentacao", label: "ALIMENTAÇÃO", score: Number(lead.score_alimentacao) },
      { key: "score_sono", label: "SONO", score: Number(lead.score_sono) },
      { key: "score_proposito", label: "PROPÓSITO", score: Number(lead.score_proposito) },
      { key: "score_social", label: "SOCIAL", score: Number(lead.score_social) },
      { key: "score_estresse", label: "ESTRESSE", score: Number(lead.score_estresse) }
    ];
  }

  function getPhysicalAnalysis(lead) {
    if (!lead.peso || !lead.altura) return null;

    const alturaM = Number(lead.altura) / 100;
    if (!alturaM || alturaM <= 0) return null;

    const imc = Number(lead.peso) / (alturaM * alturaM);
    const imcFormatado = imc.toFixed(1);

    let classificacao = "";
    if (imc < 18.5) classificacao = "abaixo do peso";
    else if (imc < 25) classificacao = "dentro da faixa considerada saudável";
    else if (imc < 30) classificacao = "em sobrepeso";
    else classificacao = "em faixa de obesidade";

    return {
      imc: imcFormatado,
      classificacao
    };
  }

  function renderPersonalSection(lead) {
    return `
      <section class="report-section">
        <div class="section-bar">■ DADOS INICIAIS</div>

        <div class="report-grid two">
          <div class="pillar-card">
            <h4>Identificação</h4>
            <p><strong>Nome:</strong> ${lead.nome || "-"}</p>
            <p><strong>Email:</strong> ${lead.email || "-"}</p>
            <p><strong>Idade:</strong> ${lead.idade || "-"}</p>
          </div>

          <div class="pillar-card">
            <h4>Contexto</h4>
            <p><strong>Gênero:</strong> ${formatGenero(lead.genero)}</p>
            <p><strong>Cidade:</strong> ${lead.cidade || "-"}</p>
            <p><strong>Origem:</strong> ${lead.origem || "-"}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderScoreLegend(lead) {
    return getPillars(lead)
      .map((pillar) => {
        const status = window.ZACalculos.statusPorScore(pillar.score);
        return `
          <div class="premium-score-item ${status.className}">
            <span class="premium-score-dot" style="background:${status.color};"></span>
            <span class="premium-score-label">${pillar.label}</span>
            <strong class="premium-score-value">${pillar.score}/10</strong>
            <span class="premium-score-status">${status.label}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderSummaryBox(lead, profile, gaps) {
    const gapsText = gaps.length
      ? gaps
          .slice(0, 3)
          .map((gap) => `${window.ZACalculos.pillarLabels[gap.key]} (${gap.score}/10)`)
          .join(", ")
      : "Nenhum gap crítico identificado.";

    return `
      <section class="report-section">
        <div class="section-bar">■ RESUMO DO SEU PERFIL</div>

        <div class="premium-summary-box">
          <div class="premium-summary-main">
            <span>Pontuação média geral</span>
            <strong>${lead.media_geral}/10</strong>
          </div>

          <div class="premium-summary-side">
            <span>Perfil atual</span>
            <strong style="color:${profile.color};">${profile.label}</strong>
          </div>

          <div class="premium-summary-gaps">
            <span>Principais gaps identificados:</span>
            <p>${gapsText}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderPillarCards(lead) {
    const texts = getPillarTexts();

    return getPillars(lead)
      .map((pillar) => {
        const status = window.ZACalculos.statusPorScore(pillar.score);

        return `
          <div class="premium-pillar-card ${status.className}">
            <div class="premium-pillar-top">
              <h4>${pillar.label}</h4>
              <span class="premium-pill-score" style="background:${status.color};">${pillar.score}/10</span>
            </div>
            <p>${texts[pillar.key]}</p>
          </div>
        `;
      })
      .join("");
  }

  function renderPhysicalSection(lead) {
    const analysis = getPhysicalAnalysis(lead);

    if (!lead.peso && !lead.altura && !lead.limitacoes_atuais) {
      return "";
    }

    return `
      <section class="report-section">
        <div class="section-bar">■ CONTEXTO FÍSICO</div>

        <div class="report-grid two">
          <div class="pillar-card">
            <h4>Informações corporais</h4>
            <p><strong>Peso:</strong> ${lead.peso ? `${lead.peso} kg` : "-"}</p>
            <p><strong>Altura:</strong> ${lead.altura ? `${lead.altura} cm` : "-"}</p>
            <p><strong>IMC estimado:</strong> ${analysis ? analysis.imc : "-"}</p>
          </div>

          <div class="pillar-card">
            <h4>Leitura inicial</h4>
            <p>
              ${
                analysis
                  ? `Com base nas informações fornecidas, seu IMC estimado sugere que você está atualmente <strong>${analysis.classificacao}</strong>. Esse dado não define sozinho sua saúde, mas ajuda a compor a leitura inicial do seu contexto físico.`
                  : "Você não informou peso e altura atuais, então essa leitura física inicial fica em aberto neste momento."
              }
            </p>
          </div>

          <div class="pillar-card">
            <h4>Dores, lesões ou condições atuais</h4>
            <p>${lead.limitacoes_atuais || "-"}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderContextSection(lead) {
    return `
      <section class="report-section">
        <div class="section-bar">■ LEITURA DO SEU CONTEXTO</div>

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

          <div class="pillar-card">
            <h4>Experiência com acompanhamento</h4>
            <p><strong>Personal/Nutricionista:</strong> ${lead.exp_personal || "-"}</p>
            <p><strong>Processo de emagrecimento:</strong> ${lead.exp_emagrecimento || "-"}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderOfferSection() {
    return `
      <section class="report-section">
        <div class="section-bar">■ COMO CONTINUAR A PARTIR DAQUI</div>

        <div class="premium-offer-box">

          <p class="premium-offer-text">
            O seu diagnóstico mostra com clareza onde estão seus principais pontos de ajuste.
            O próximo passo é transformar essa leitura em um plano estruturado, com direção prática,
            acompanhamento e evolução progressiva ao longo dos próximos meses.
          </p>

          <div class="premium-plans-grid">

            <div class="premium-plan-card">
              <h4>Diagnóstico + Mês 1</h4>
              <div class="plan-price">R$ 400</div>
              <span class="plan-sub">Pagamento único</span>
              <p>
                Indicado para quem quer viver a experiência inicial da metodologia,
                passar pela avaliação completa e entender como funciona o primeiro mês
                antes de decidir por um ciclo mais longo.
              </p>
            </div>

            <div class="premium-plan-card highlight">
              <div class="plan-badge">Mais escolhido</div>
              <h4>Protocolo Trimestral</h4>
              <div class="plan-price">R$ 1.800</div>
              <span class="plan-sub">3x de R$ 600</span>
              <p>
                Indicado para quem já decidiu mudar e quer continuidade com acompanhamento,
                check-ins, ajustes e evolução consistente nos pilares ao longo de 3 meses.
              </p>
            </div>

            <div class="premium-plan-card">
              <h4>Protocolo Semestral</h4>
              <div class="plan-price">R$ 3.000</div>
              <span class="plan-sub">6x de R$ 500</span>
              <p>
                Indicado para quem busca uma transformação mais profunda, com melhor lógica
                de investimento mensal e mais tempo para consolidar a mudança de estilo de vida.
              </p>
            </div>

          </div>

          <div class="premium-offer-note">
            Depois do Diagnóstico + Mês 1, a continuidade do processo acontece pelos ciclos
            do protocolo — trimestral ou semestral — de acordo com a decisão e o momento do cliente.
          </div>

          <div class="premium-offer-note">
            Clientes que concluem o protocolo e atingem os marcos de evolução entram na fase Vida Azul,
            um modelo de acompanhamento de longo prazo com mais autonomia.
          </div>

          <div class="premium-offer-cta">
            Responda esta mensagem ou utilize o link abaixo para agendar sua sessão de diagnóstico.
          </div>

        </div>
      </section>
    `;
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

    const labels = ["MOVIMENTO", "ALIMENTAÇÃO", "SONO", "PROPÓSITO", "SOCIAL", "ESTRESSE"];
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
      ctx.strokeStyle = "#d7d7d0";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    angles.forEach((angle, i) => {
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#d7d7d0";
      ctx.lineWidth = 1;
      ctx.stroke();

      const lx = cx + Math.cos(angle) * (radius + 34);
      const ly = cy + Math.sin(angle) * (radius + 34);

      ctx.fillStyle = "#173c57";
      ctx.font = "bold 12px Arial";
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
    ctx.fillStyle = "rgba(70, 151, 190, 0.18)";
    ctx.strokeStyle = "#3b89a8";
    ctx.lineWidth = 3;
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
      ctx.fillText(String(value), x, y - 15);
    });
  }

  function renderReportByLead(lead) {
    const reportBody = document.getElementById("report-body");
    const reportLeadName = document.getElementById("report-lead-name");
    const reportDate = document.getElementById("report-date");

    if (!reportBody || !reportLeadName || !reportDate) return;

    const profile = getProfileByMedia(Number(lead.media_geral));
    const gaps = Array.isArray(lead.top_3_gaps) ? lead.top_3_gaps : [];
    const pilarMaisBaixo = lead.pilar_mais_baixo
      ? window.ZACalculos.pillarLabels[lead.pilar_mais_baixo]
      : "EQUILÍBRIO GERAL";

    reportLeadName.textContent = lead.nome || "Lead";
    reportDate.textContent = formatDateBR(new Date());

    reportBody.innerHTML = `
      <section class="report-section">
        <p class="premium-intro-text">
          Com base nas suas respostas, identificamos como você está hoje nos 6 pilares centrais do estilo de vida das Zonas Azuis.
          Este é o seu ponto de partida para construir saúde, consistência e longevidade com mais clareza.
        </p>
      </section>

      ${renderPersonalSection(lead)}

      <section class="report-section">
        <div class="section-bar">■ SEU RADAR VIDA AZUL</div>

        <div class="premium-radar-layout">
          <div class="premium-radar-canvas-wrap">
            <canvas id="reportRadarCanvas" width="460" height="420"></canvas>
          </div>

          <div class="premium-radar-side">
            <h4>Pontuação por Pilar</h4>
            <div class="premium-score-list">
              ${renderScoreLegend(lead)}
            </div>
          </div>
        </div>
      </section>

      ${renderSummaryBox(lead, profile, gaps)}

      <section class="report-section">
        <div class="section-bar">■ O QUE SEUS NÚMEROS SIGNIFICAM</div>
        <div class="highlight-box" style="margin-top:18px;">
          <p>${profile.text}</p>
        </div>
      </section>

      <section class="report-section">
        <div class="section-bar">■ ANÁLISE DOS SEUS PILARES</div>
        <div class="premium-pillar-grid">
          ${renderPillarCards(lead)}
        </div>
      </section>

      <section class="report-section">
        <div class="section-bar">■ SEU MAIOR PONTO DE ALAVANCA</div>
        <div class="premium-leverage-box">
          <h4>Com base no seu radar, o ponto de maior alavanca hoje é ${pilarMaisBaixo}.</h4>
          <p>${getStrategicReading(lead)}</p>
        </div>
      </section>

      ${renderContextSection(lead)}
      ${renderPhysicalSection(lead)}
      ${renderOfferSection()}
    `;

    setTimeout(() => drawRadar("reportRadarCanvas", lead), 60);
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