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
    score_social: "SOCIAL",
    score_estresse: "ESTRESSE"
  };

  function mediaGeral(scores) {
    const values = [
      Number(scores.score_movimento),
      Number(scores.score_alimentacao),
      Number(scores.score_sono),
      Number(scores.score_proposito),
      Number(scores.score_social),
      Number(scores.score_estresse),
    ];

    const media = values.reduce((acc, value) => acc + value, 0) / 6;
    return Number(media.toFixed(1));
  }

  function statusPorScore(score) {
    if (score >= 7) return { label: "BOM", color: "#4CAF7D", className: "success" };
    if (score >= 4) return { label: "ATENÇÃO", color: "#E8A020", className: "warning" };
    return { label: "CRÍTICO", color: "#E05252", className: "danger" };
  }

  function gerarGaps(scores) {
    const pilares = [
      { key: "score_movimento", score: Number(scores.score_movimento) },
      { key: "score_alimentacao", score: Number(scores.score_alimentacao) },
      { key: "score_sono", score: Number(scores.score_sono) },
      { key: "score_proposito", score: Number(scores.score_proposito) },
      { key: "score_social", score: Number(scores.score_social) },
      { key: "score_estresse", score: Number(scores.score_estresse) },
    ];

    return pilares
      .filter(item => item.score < 6)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return tiePriority.indexOf(a.key) - tiePriority.indexOf(b.key);
      });
  }

  function pilarMaisBaixo(scores) {
    const gaps = gerarGaps(scores);
    return gaps.length ? gaps[0].key : null;
  }

  function validarFormulario(payload) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!payload.nome || !payload.email || !payload.faixa_etaria || !payload.origem) {
      return "Preencha os dados de identificação.";
    }

    if (!emailRegex.test(payload.email)) {
      return "Digite um email válido.";
    }

    const scoreFields = [
      "score_movimento",
      "score_alimentacao",
      "score_sono",
      "score_proposito",
      "score_social",
      "score_estresse",
    ];

    for (const field of scoreFields) {
      const value = Number(payload[field]);
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        return "Todos os scores devem estar entre 1 e 10.";
      }
    }

    if (!payload.por_que_parou || !payload.desafio_atual || !payload.meta_6_meses) {
      return "Preencha os campos qualitativos obrigatórios.";
    }

    return null;
  }

  function criarLead(payload) {
    const media_geral = mediaGeral(payload);
    const pilar_mais_baixo = pilarMaisBaixo(payload);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
      nome: payload.nome.trim(),
      email: payload.email.toLowerCase().trim(),
      faixa_etaria: payload.faixa_etaria,
      origem: payload.origem,
      exp_personal: payload.exp_personal,
      exp_emagrecimento: payload.exp_emagrecimento,
      o_que_funcionou: payload.o_que_funcionou?.trim() || "",
      por_que_parou: payload.por_que_parou.trim(),
      desafio_atual: payload.desafio_atual.trim(),
      meta_6_meses: payload.meta_6_meses.trim(),
      score_movimento: Number(payload.score_movimento),
      score_alimentacao: Number(payload.score_alimentacao),
      score_sono: Number(payload.score_sono),
      score_proposito: Number(payload.score_proposito),
      score_social: Number(payload.score_social),
      score_estresse: Number(payload.score_estresse),
      media_geral,
      pilar_mais_baixo,
      status: "novo",
    };
  }

  return {
    pillarLabels,
    mediaGeral,
    statusPorScore,
    gerarGaps,
    pilarMaisBaixo,
    validarFormulario,
    criarLead,
  };
})();