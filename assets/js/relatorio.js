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
        const status = window.ZACalculos.statusPor