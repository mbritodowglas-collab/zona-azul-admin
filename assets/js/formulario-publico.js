(() => {
  const form = document.getElementById("public-pre-form");
  const formCard = document.getElementById("form-card");
  const successCard = document.getElementById("success-card");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      idade: document.getElementById("idade").value,
      origem: document.getElementById("origem").value,
      exp_personal: document.getElementById("exp_personal").value,
      exp_emagrecimento: document.getElementById("exp_emagrecimento").value,
      o_que_funcionou: document.getElementById("o_que_funcionou").value,
      por_que_parou: document.getElementById("por_que_parou").value,
      desafio_atual: document.getElementById("desafio_atual").value,
      meta_6_meses: document.getElementById("meta_6_meses").value,
      score_movimento: document.getElementById("score_movimento").value,
      score_alimentacao: document.getElementById("score_alimentacao").value,
      score_sono: document.getElementById("score_sono").value,
      score_proposito: document.getElementById("score_proposito").value,
      score_social: document.getElementById("score_social").value,
      score_estresse: document.getElementById("score_estresse").value
    };

    const erro = window.ZACalculos.validarFormulario(payload);
    if (erro) {
      alert(erro);
      return;
    }

    const lead = window.ZACalculos.criarLead(payload);
    window.ZAStorage.upsertLead(lead);

    form.reset();
    formCard.classList.add("hidden");
    successCard.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();