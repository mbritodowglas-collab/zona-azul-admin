window.ZACalculos = (() => {
  const tiePriority = [
    "score_sono",
    "score_estresse",
    "score_proposito",
    "score_alimentacao",
    "score_movimento",
    "score_social"
  ];

  const pillarLabels = {
    score_movimento: "MOVIMENTO",
    score_alimentacao: "ALIMENTAÇÃO",
    score_sono: "SONO",
    score_proposito: "PROPÓSITO",
    score_social: "ESTILO SOCIAL",
    score_estresse: "ESTRESSE"
  };

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nascimento = new Date(dataNascimento + "T00:00:00");

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }

  function mediaGeral(scores) {
    const values = [
      Number(scores.score_movimento),
      Number(scores.score_alimentacao),
      Number(scores.score_sono),
      Number(scores.score_proposito),
      Number(scores.score_social),
      Number(scores.score_estresse)
    ];

    const media = values.reduce((acc, value) => acc + value, 0) / 6;
    return Number(media.toFixed(1));
  }

  function statusPorScore(score) {
    if (score >= 7) return { label: "BOM", color: "#4CAF7D", className: "success" };
    if (score >= 4) return { label: "ATENÇÃO", color: "#E8A020", className: "warning" };
    return { label: "CRÍTICO", color: "#E05252", className: "danger" };
  }

  function getPilares(scores) {
    return [
      { key: "score_movimento", score: Number(scores.score_movimento) },
      { key: "score_alimentacao", score: Number(scores.score_alimentacao) },
      { key: "score_sono", score: Number(scores.score_sono) },
      { key: "score_proposito", score: Number(scores.score_proposito) },
      { key: "score_social", score: Number(scores.score_social) },
      { key: "score_estresse", score: Number(scores.score_estresse) }
    ];
  }

  function gerarGaps(scores) {
    const pilares = getPilares(scores);

    return pilares
      .filter((item) => item.score < 6)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return tiePriority.indexOf(a.key) - tiePriority.indexOf(b.key);
      });
  }

  function pilarMaisBaixo(scores) {
    const pilares = getPilares(scores);
    const media = mediaGeral(scores);
    const menor = Math.min(...pilares.map((item) => item.score));

    if (media >= 8 && menor >= 7) {
      return null;
    }

    const gaps = gerarGaps(scores);

    if (!gaps.length) {
      const ordenados = [...pilares].sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return tiePriority.indexOf(a.key) - tiePriority.indexOf(b.key);
      });

      return ordenados.length ? ordenados[0].key : null;
    }

    return gaps[0].key;
  }

  function validarFormulario(payload) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!payload.nome || !payload.email || !payload.data_nascimento || !payload.origem) {
      return "Preencha os dados de identificação.";
    }

    if (!payload.genero || !payload.cidade) {
      return "Preencha gênero e cidade.";
    }

    if (!emailRegex.test(payload.email)) {
      return "Digite um email válido.";
    }

    const idade = calcularIdade(payload.data_nascimento);
    if (idade === null || idade < 1 || idade > 120) {
      return "Digite uma data de nascimento válida.";
    }

    const scoreFields = [
      "score_movimento",
      "score_alimentacao",
      "score_sono",
      "score_proposito",
      "score_social",
      "score_estresse"
    ];

    for (const field of scoreFields) {
      const value = Number(payload[field]);
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        return "Todos os scores devem estar entre 1 e 10.";
      }
    }

    if (!payload.urgencia || payload.comprometimento === "" || !payload.investimento || !payload.sabotagem || !payload.objetivo_fisico) {
      return "Preencha a etapa de perfil comportamental.";
    }

    const comprometimento = Number(payload.comprometimento);
    if (Number.isNaN(comprometimento) || comprometimento < 0 || comprometimento > 10) {
      return "O comprometimento deve estar entre 0 e 10.";
    }

    if (!payload.por_que_parou || !payload.desafio_atual || !payload.meta_6_meses) {
      return "Preencha os campos qualitativos obrigatórios.";
    }

    return null;
  }

  function criarLead(payload) {
    const media = mediaGeral(payload);
    const pilar = pilarMaisBaixo(payload);
    const gaps = gerarGaps(payload).slice(0, 3);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
      nome: payload.nome.trim(),
      email: payload.email.toLowerCase().trim(),
      data_nascimento: payload.data_nascimento,
      idade: calcularIdade(payload.data_nascimento),

      genero: payload.genero,
      cidade: payload.cidade.trim(),
      origem: payload.origem,

      exp_personal: payload.exp_personal,
      exp_emagrecimento: payload.exp_emagrecimento,
      o_que_funcionou: payload.o_que_funcionou?.trim() || "",
      limitacoes_atuais: payload.limitacoes_atuais?.trim() || "",
      por_que_parou: payload.por_que_parou.trim(),

      urgencia: payload.urgencia,
      comprometimento: Number(payload.comprometimento),
      investimento: payload.investimento,
      sabotagem: payload.sabotagem,
      objetivo_fisico: payload.objetivo_fisico,

      desafio_atual: payload.desafio_atual.trim(),
      meta_6_meses: payload.meta_6_meses.trim(),

      peso: payload.peso ? Number(payload.peso) : null,
      altura: payload.altura ? Number(payload.altura) : null,

      score_movimento: Number(payload.score_movimento),
      score_alimentacao: Number(payload.score_alimentacao),
      score_sono: Number(payload.score_sono),
      score_proposito: Number(payload.score_proposito),
      score_social: Number(payload.score_social),
      score_estresse: Number(payload.score_estresse),

      media_geral: media,
      pilar_mais_baixo: pilar,
      top_3_gaps: gaps,

      status: "novo",
      historico_contato: []
    };
  }

  return {
    pillarLabels,
    calcularIdade,
    mediaGeral,
    statusPorScore,
    gerarGaps,
    pilarMaisBaixo,
    validarFormulario,
    criarLead
  };
})();