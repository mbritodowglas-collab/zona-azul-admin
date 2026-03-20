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
    const map = {
      masculino: "Masculino",
      feminino: "Feminino",
      nao_informar: "Prefere não informar"
    };
    return map[value] || value || "-";
  }

  function formatExpPersonal(value) {
    const map = {
      nunca: "Nunca",
      fez_nao_manteve: "Já fiz, mas não mantive",
      faz_atualmente: "Faço atualmente",
      fez_manteve: "Já fiz e mantive"
    };
    return map[value] || value || "-";
  }

  function formatExpEmagrecimento(value) {
    const map = {
      nunca: "Nunca",
      nao_funcionou: "Já tentei, mas não funcionou",
      funcionou_nao_manteve: "Funcionou, mas não mantive",
      em_processo: "Estou em processo"
    };
    return map[value] || value || "-";
  }

  function formatUrgencia(value) {
    const map = {
      alta: "Alta — quer começar agora",
      media: "Média — quer começar em breve",
      baixa: "Baixa — está apenas avaliando"
    };
    return map[value] || value || "-";
  }

  function formatInvestimento(value) {
    const map = {
      sim: "Sim",
      depende: "Depende do valor",
      nao: "Prefere tentar sozinho"
    };
    return map[value] || value || "-";
  }

  function formatSabotagem(value) {
    const map = {
      tempo: "Falta de tempo",
      disciplina: "Falta de disciplina",
      emocional: "Ansiedade / emocional",
      cansaco: "Cansaço",
      direcao: "Falta de direção",
      outro: "Outro"
    };
    return map[value] || value || "-";
  }

  function formatObjetivo(value) {
    const map = {
      emagrecimento: "Emagrecimento",
      massa: "Ganho de massa",
      saude: "Melhorar saúde",
      energia: "Mais energia / disposição"
    };
    return map[value] || value || "-";
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
            <p><strong>Personal/Nutricionista:</strong> ${formatExpPersonal(lead.exp_personal)}</p>
            <p><strong>Processo de emagrecimento:</strong> ${formatExpEmagrecimento(lead.exp_emagrecimento)}</p>
          </div>
        </div>
      </section>
    `;
  }

  function renderBehaviorSection(lead) {
    return `
      <section class="report-section">
        <div class="section-bar">■ PERFIL COMPORTAMENTAL</div>

        <div class="report-grid two">
          <div class="pillar-card">
            <h4>Nível de urgência</h4>
            <p>${formatUrgencia(lead.urgencia)}</p>
          </div>

          <div class="pillar-card">
            <h4>Comprometimento</h4>
            <p>${lead.comprometimento ?? "-"}/10</p>
          </div>

          <div class="pillar-card">
            <h4>Disponibilidade para investir</h4>
            <p>${formatInvestimento(lead.investimento)}</p>
          </div>

          <div class="pillar-card">
            <h4>Principal sabotador</h4>
            <p>${formatSabotagem(lead.sabotagem)}</p>
          </div>

          <div class="pillar-card">
            <h4>Objetivo físico</h4>
            <p>${formatObjetivo(lead.objetivo_fisico)}</p>
          </div>
        </div>
      </section>
    `;
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
            <h4>Dores, lesões ou condições atuais</