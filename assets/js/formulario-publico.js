(() => {
  const form = document.getElementById("public-pre-form");
  const formCard = document.getElementById("form-card");
  const successCard = document.getElementById("success-card");

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const prevBtn = document.getElementById("prev-step-btn");
  const nextBtn = document.getElementById("next-step-btn");
  const submitBtn = document.getElementById("submit-btn");
  const progressFill = document.getElementById("progress-fill");
  const stepTitle = document.getElementById("step-title");
  const stepSubtitle = document.getElementById("step-subtitle");
  const stepIndicator = document.getElementById("step-indicator");

  let currentStep = 1;
  const totalSteps = steps.length;

  const stepMeta = {
    1: {
      title: "Identificação",
      subtitle: "Vamos começar com seus dados básicos."
    },
    2: {
      title: "Histórico",
      subtitle: "Agora queremos entender sua jornada anterior e possíveis limitações atuais."
    },
    3: {
      title: "Radar Zona Azul — Parte 1",
      subtitle: "Avalie movimento, alimentação e sono."
    },
    4: {
      title: "Radar Zona Azul — Parte 2",
      subtitle: "Avalie propósito, vida social e estresse."
    },
    5: {
      title: "Contexto final",
      subtitle: "Conte seu maior desafio e sua meta para os próximos 6 meses."
    }
  };

  function setupOptionCards() {
    const groups = document.querySelectorAll(".option-group");

    groups.forEach(group => {
      const targetId = group.dataset.target;
      const hiddenInput = document.getElementById(targetId);
      const buttons = group.querySelectorAll(".option-card");

      buttons.forEach(button => {
        button.addEventListener("click", () => {
          buttons.forEach(btn => btn.classList.remove("selected"));
          button.classList.add("selected");
          hiddenInput.value = button.dataset.value;
        });
      });
    });
  }

  function setupScoreButtons() {
    const groups = document.querySelectorAll(".score-group");

    groups.forEach(group => {
      const targetId = group.dataset.target;
      const hiddenInput = document.getElementById(targetId);
      const buttons = group.querySelectorAll(".score-btn");

      buttons.forEach(button => {
        button.addEventListener("click", () => {
          buttons.forEach(btn => btn.classList.remove("selected"));
          button.classList.add("selected");
          hiddenInput.value = button.dataset.value;
        });
      });
    });
  }

  function showStep(step) {
    steps.forEach((el, index) => {
      el.classList.toggle("hidden", index !== step - 1);
    });

    prevBtn.classList.toggle("hidden", step === 1);
    nextBtn.classList.toggle("hidden", step === totalSteps);
    submitBtn.classList.toggle("hidden", step !== totalSteps);

    const progress = (step / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;

    stepTitle.textContent = stepMeta[step].title;
    stepSubtitle.textContent = stepMeta[step].subtitle;
    stepIndicator.textContent = `Etapa ${step} de ${totalSteps}`;
  }

  function validateCurrentStep(step) {
    const currentFields = steps[step - 1].querySelectorAll("input, select, textarea");

    for (const field of currentFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  }

  nextBtn?.addEventListener("click", () => {
    if (!validateCurrentStep(currentStep)) return;

    if (currentStep < totalSteps) {
      currentStep += 1;
      showStep(currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  prevBtn?.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep -= 1;
      showStep(currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const nascimentoDia = document.getElementById("nascimento_dia").value;
    const nascimentoMes = document.getElementById("nascimento_mes").value;
    const nascimentoAno = document.getElementById("nascimento_ano").value;

    const dataNascimento = (nascimentoDia && nascimentoMes && nascimentoAno)
      ? `${nascimentoAno}-${String(nascimentoMes).padStart(2, "0")}-${String(nascimentoDia).padStart(2, "0")}`
      : "";

    const payload = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      data_nascimento: dataNascimento,
      origem: document.getElementById("origem").value,
      exp_personal: document.getElementById("exp_personal").value,
      exp_emagrecimento: document.getElementById("exp_emagrecimento").value,
      o_que_funcionou: document.getElementById("o_que_funcionou").value,
      limitacoes_atuais: document.getElementById("limitacoes_atuais").value,
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
    document.querySelectorAll(".option-card").forEach(card => card.classList.remove("selected"));
    document.querySelectorAll(".score-btn").forEach(card => card.classList.remove("selected"));
    formCard.classList.add("hidden");
    successCard.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  setupOptionCards();
  setupScoreButtons();
  showStep(currentStep);
})();