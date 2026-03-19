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