window.ZAPublico = (() => {
  function setupPreForm() {
    const form = document.getElementById("preForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = {
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        faixa_etaria: document.getElementById("faixa_etaria").value,
        origem: document.getElementById("origem").value,
        exp_personal: document.getElementById("exp_personal").value,
        exp_emagrecimento: document.getElementById("exp_emagrecimento").value,
        o_que_funcionou: document.getElementById("o_que_funcionou").value.trim(),
        por_que_parou: document.getElementById("por_que_parou").value.trim(),
        score_movimento: document.getElementById("score_movimento").value,
        score_alimentacao: document.getElementById("score_alimentacao").value,
        score_sono: document.getElementById("score_sono").value,
        score_proposito: document.getElementById("score_proposito").value,
        score_social: document.getElementById("score_social").value,
        score_estresse: document.getElementById("score_estresse").value,
        desafio_atual: document.getElementById("desafio_atual").value.trim(),
        meta_6_meses: document.getElementById("meta_6_meses").value.trim()
      };

      const error = window.ZACalculos.validateFormData(formData);
      if (error) {
        alert(error);
        return;
      }

      const lead = window.ZACalculos.buildLeadObject(formData);
      window.ZAStorage.upsertLead(lead);
      window.ZAAdmin.renderLeads();

      location.hash = `#report/${encodeURIComponent(lead.email)}`;
    });
  }

  return {
    setupPreForm
  };
})();