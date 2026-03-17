window.ZACalculos = (() => {
  const pillarLabels = {
    score_movimento: "MOVIMENTO",
    score_alimentacao: "ALIMENTAÇÃO",
    score_sono: "SONO",
    score_proposito: "PROPÓSITO",
    score_social: "VIDA SOCIAL",
    score_estresse: "ESTRESSE"
  };

  const pillarTexts = {
    score_movimento: "Nas Zonas Azuis, as pessoas mais longevas não frequentam academias. Elas se movem naturalmente ao longo do dia. O que sustenta a longevidade não é a intensidade do exercício, mas a consistência do movimento diário.",
    score_alimentacao: "A alimentação das Zonas Azuis é predominantemente baseada em plantas. Poucas regras rígidas, muito senso de proporção e ritmo. Janelas alimentares respeitadas e prazer sem culpa são parte do padrão.",
    score_sono: "O sono é o maior regenerador do organismo humano. Qualidade e consistência de horário impactam diretamente metabolismo, humor e longevidade. O descanso é tratado como prioridade, não como o que sobra quando tudo termina.",
    score_proposito: "Ter um senso de propósito claro está diretamente associado à longevidade. Os japoneses chamam de Ikigai — a razão pela qual você acorda de manhã. Não precisa ser grandioso. Precisa ser genuíno e orientar escolhas cotidianas.",
    score_social: "Relações sociais profundas e senso de pertencimento são preditores robustos de longevidade. Não é sobre ter muitos contatos — é sobre ter conexões significativas com pessoas que se apoiam mutuamente.",
    score_estresse: "O estresse crônico acelera o envelhecimento celular e sabota todos os outros pilares. Pequenas rotinas diárias de descompressão têm efeito desproporcional na qualidade de vida."
  };

  const tiePriority = [
    "score_sono",
    "score_estresse",
    "score_proposito",
    "score_alimentacao",
    "score_movimento",
    "score_social"
  ];

  function statusLabel(score) {
    if (score >= 7) return { label: "BOM", className: "success", color: "#4CAF7D", perfil: "bom" };
    if (score >= 4) return { label: "ATENÇÃO", className: "warning", color: "#E8A020", perfil: "atencao" };
    return { label: "CRÍTICO", className: "danger", color: "#E05252", perfil: "critico" };
  }

  function averageScore(data) {
    const scores = [
      Number(data.score_movimento),
      Number(data.score_alimentacao),
      Number(data.score_sono),
      Number(data.score_proposito),
      Number(data.score_social),
      Number(data.score_estresse)
    ];
    const avg = scores.reduce((sum, s) => sum + s, 0) / 6;
    return Number(avg.toFixed(1));
  }

  function buildGaps(data) {
    const pillars = [
      { key: "score_movimento", label: "movimento", score: Number(data.score_movimento) },
      { key: "score_alimentacao", label: "alimentacao", score: Number(data.score_alimentacao) },
      { key: "score_sono", label: "sono", score: Number(data.score_sono) },
      { key: "score_proposito", label: "proposito", score: Number(data.score_proposito) },
      { key: "score_social", label: "social", score: Number(data.score_social) },
      { key: "score_estresse", label: "estresse", score: Number(data.score_estresse) }
    ];

    const gaps = pillars
      .filter(p => p.score < 6)
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return tiePriority.indexOf(a.key) - tiePriority.indexOf(b.key);
      });

    return gaps.map(g => {
      const s = statusLabel(g.score);
      return {
        pilar: g.label,
        key: g.key,
        score: g.score,
        status: s.perfil,
        status_label: s.label,
        cor: s.color,
        className: s.className
      };
    });
  }

  function getPilarMaisBaixo(data) {
    const gaps = buildGaps(data);
    return gaps.length ? gaps[0] : null;
  }

  function buildLeadObject(formData) {
    const media_geral = averageScore(formData);
    const gaps = buildGaps(formData);
    const pilarMaisBaixo = getPilarMaisBaixo(formData);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString(),
      nome: formData.nome,
      email: formData.email.toLowerCase().trim(),
      faixa_etaria: formData.faixa_etaria,
      origem: formData.origem,
      exp_personal: formData.exp_personal,
      exp_emagrecimento: formData.exp_emagrecimento,
      o_que_funcionou: formData.o_que_funcionou,
      por_que_parou: formData.por_que_parou,
      score_movimento: Number(formData.score_movimento),
      score_alimentacao: Number(formData.score_alimentacao),
      score_sono: Number(formData.score_sono),
      score_proposito: Number(formData.score_proposito),
      score_social: Number(formData.score_social),
      score_estresse: Number(formData.score_estresse),
      media_geral,
      pilar_mais_baixo: pilarMaisBaixo ? pilarMaisBaixo.key : null,
      desafio_atual: formData.desafio_atual,
      meta_6_meses: formData.meta_6_meses,
      status: "novo",
      data_contato: null,
      notas_followup: "",
      gaps
    };
  }

  function validateFormData(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.nome || !data.email || !data.faixa_etaria || !data.origem) {
      return "Preencha os dados de identificação.";
    }
    if (!emailRegex.test(data.email)) {
      return "Digite um e-mail válido.";
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
      const value = Number(data[field]);
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        return "Todos os scores devem estar entre 1 e 10.";
      }
    }

    if (!data.por_que_parou || !data.desafio_atual || !data.meta_6_meses) {
      return "Preencha os campos qualitativos obrigatórios.";
    }

    return null;
  }

  function profileLabelByMedia(media) {
    if (media >= 7) return { label: "ESTÁVEL", colorClass: "success" };
    if (media >= 4) return { label: "EM DESENVOLVIMENTO", colorClass: "warning" };
    return { label: "EM ALERTA", colorClass: "danger" };
  }

  return {
    pillarLabels,
    pillarTexts,
    statusLabel,
    averageScore,
    buildGaps,
    getPilarMaisBaixo,
    buildLeadObject,
    validateFormData,
    profileLabelByMedia
  };
})();