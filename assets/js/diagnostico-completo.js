window.ZADiagnosticoCompleto = (() => {
  function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get("id") ? decodeURIComponent(params.get("id")).trim() : null,
      modo: params.get("modo") ? decodeURIComponent(params.get("modo")).trim() : "professor"
    };
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getClienteById(id) {
    const clientes = getClientes();
    return clientes.find((cliente) => String(cliente.id).trim() === String(id).trim());
  }

  function ensureClienteStructure(cliente) {
    if (!cliente.preDiagnostico) {
      cliente.preDiagnostico = {};
    }

    if (!cliente.preDiagnostico.scores) {
      const pre = cliente.preDiagnostico;
      cliente.preDiagnostico.scores = {
        movimento: Number(pre.score_movimento || 0),
        alimentacao: Number(pre.score_alimentacao || 0),
        sono: Number(pre.score_sono || 0),
        proposito: Number(pre.score_proposito || 0),
        social: Number(pre.score_social || 0),
        estresse: Number(pre.score_estresse || 0)
      };
    }

    if (!cliente.diagnosticoCompleto) {
      cliente.diagnosticoCompleto = {};
    }

    const dc = cliente.diagnosticoCompleto;

    if (!dc.status) dc.status = "nao_iniciado";
    if (!dc.modoPreenchimento) dc.modoPreenchimento = "";
    if (!dc.dataInicio) dc.dataInicio = "";
    if (!dc.dataConclusao) dc.dataConclusao = "";

    if (!dc.radarRevisado) {
      dc.radarRevisado = {
        movimento: null,
        alimentacao: null,
        sono: null,
        proposito: null,
        social: null,
        estresse: null
      };
    }

    if (!dc.pilares) {
      dc.pilares = {
        movimento: { notas: "", ajustes: "" },
        alimentacao: { notas: "", ajustes: "" },
        sono: { notas: "", ajustes: "" },
        proposito: { notas: "", ajustes: "" },
        social: { notas: "", ajustes: "" },
        estresse: { notas: "", ajustes: "" }
      };
    }

    if (!dc.anamnese) {
      dc.anamnese = {
        rotina: "",
        trabalho: "",
        sonoDetalhado: "",
        alimentacaoDetalhada: "",
        historicoSaude: ""
      };
    }

    if (!dc.comportamento) {
      dc.comportamento = {
        adesao: "",
        recaidas: "",
        gatilhos: "",
        ambiente: "",
        apoioSocial: ""
      };
    }

    if (!dc.avaliacaoFisica) {
      dc.avaliacaoFisica = {
        protocolo: "",
        peso: "",
        altura: "",
        rcq: "",
        rce: "",
        testes: ""
      };
    }

    if (!dc.fechamentoTecnico) {
      dc.fechamentoTecnico = {
        prioridade1: "",
        prioridade2: "",
        prioridade3: "",
        focoMes1: "",
        observacoesProfessor: ""
      };
    }

    return cliente;
  }

  function saveCliente(updatedCliente) {
    const data = window.ZAStorage.getData();
    const clientes = data.clientes || [];
    const index = clientes.findIndex((item) => String(item.id) === String(updatedCliente.id));

    if (index >= 0) {
      clientes[index] = updatedCliente;
      data.clientes = clientes;
      window.ZAStorage.saveData(data);
    }
  }

  function renderRadarBase(cliente) {
    const base = cliente.preDiagnostico.scores;
    const container = document.getElementById("dc-radar-base");
    if (!container) return;

    const items = [
      ["movimento", "Movimento"],
      ["alimentacao", "Alimentação"],
      ["sono", "Sono"],
      ["proposito", "Propósito"],
      ["social", "Social"],
      ["estresse", "Estresse"]
    ];

    container.innerHTML = items
      .map(
        ([key, label]) => `
          <div class="pillar-card">
            <h4>${label}</h4>
            <p><strong>${base[key] ?? 0}/10</strong></p>
          </div>
        `
      )
      .join("");
  }

  function fillForm(cliente) {
    const dc = cliente.diagnosticoCompleto;

    const mapValues = {
      rev_movimento: dc.radarRevisado.movimento,
      rev_alimentacao: dc.radarRevisado.alimentacao,
      rev_sono: dc.radarRevisado.sono,
      rev_proposito: dc.radarRevisado.proposito,
      rev_social: dc.radarRevisado.social,
      rev_estresse: dc.radarRevisado.estresse,

      notas_movimento: dc.pilares.movimento.notas,
      notas_alimentacao: dc.pilares.alimentacao.notas,
      notas_sono: dc.pilares.sono.notas,
      notas_proposito: dc.pilares.proposito.notas,
      notas_social: dc.pilares.social.notas,
      notas_estresse: dc.pilares.estresse.notas,

      rotina: dc.anamnese.rotina,
      trabalho: dc.anamnese.trabalho,
      sono_detalhado: dc.anamnese.sonoDetalhado,
      alimentacao_detalhada: dc.anamnese.alimentacaoDetalhada,
      historico_saude: dc.anamnese.historicoSaude,

      adesao: dc.comportamento.adesao,
      recaidas: dc.comportamento.recaidas,
      gatilhos: dc.comportamento.gatilhos,
      ambiente: dc.comportamento.ambiente,
      apoio_social: dc.comportamento.apoioSocial,

      protocolo_fisico: dc.avaliacaoFisica.protocolo,
      peso: dc.avaliacaoFisica.peso,
      altura: dc.avaliacaoFisica.altura,
      rcq: dc.avaliacaoFisica.rcq,
      rce: dc.avaliacaoFisica.rce,
      testes_funcionais: dc.avaliacaoFisica.testes,

      prioridade1: dc.fechamentoTecnico.prioridade1,
      prioridade2: dc.fechamentoTecnico.prioridade2,
      prioridade3: dc.fechamentoTecnico.prioridade3,
      foco_mes1: dc.fechamentoTecnico.focoMes1,
      observacoes_professor: dc.fechamentoTecnico.observacoesProfessor
    };

    Object.entries(mapValues).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value !== null && value !== undefined) {
        el.value = value;
      }
    });
  }

  function collectFormData() {
    return {
      radarRevisado: {
        movimento: parseNumber("rev_movimento"),
        alimentacao: parseNumber("rev_alimentacao"),
        sono: parseNumber("rev_sono"),
        proposito: parseNumber("rev_proposito"),
        social: parseNumber("rev_social"),
        estresse: parseNumber("rev_estresse")
      },

      pilares: {
        movimento: { notas: getValue("notas_movimento"), ajustes: "" },
        alimentacao: { notas: getValue("notas_alimentacao"), ajustes: "" },
        sono: { notas: getValue("notas_sono"), ajustes: "" },
        proposito: { notas: getValue("notas_proposito"), ajustes: "" },
        social: { notas: getValue("notas_social"), ajustes: "" },
        estresse: { notas: getValue("notas_estresse"), ajustes: "" }
      },

      anamnese: {
        rotina: getValue("rotina"),
        trabalho: getValue("trabalho"),
        sonoDetalhado: getValue("sono_detalhado"),
        alimentacaoDetalhada: getValue("alimentacao_detalhada"),
        historicoSaude: getValue("historico_saude")
      },

      comportamento: {
        adesao: getValue("adesao"),
        recaidas: getValue("recaidas"),
        gatilhos: getValue("gatilhos"),
        ambiente: getValue("ambiente"),
        apoioSocial: getValue("apoio_social")
      },

      avaliacaoFisica: {
        protocolo: getValue("protocolo_fisico"),
        peso: parseNumber("peso"),
        altura: parseNumber("altura"),
        rcq: getValue("rcq"),
        rce: getValue("rce"),
        testes: getValue("testes_funcionais")
      },

      fechamentoTecnico: {
        prioridade1: getValue("prioridade1"),
        prioridade2: getValue("prioridade2"),
        prioridade3: getValue("prioridade3"),
        focoMes1: getValue("foco_mes1"),
        observacoesProfessor: getValue("observacoes_professor")
      }
    };
  }

  function getValue(id) {
    return document.getElementById(id)?.value?.trim?.() || "";
  }

  function parseNumber(id) {
    const value = document.getElementById(id)?.value;
    return value === "" || value == null ? null : Number(value);
  }

  function updateClienteWithForm(cliente, modo) {
    const data = collectFormData();
    const dc = cliente.diagnosticoCompleto;

    dc.status = "concluido";
    dc.modoPreenchimento = modo;
    dc.dataInicio = dc.dataInicio || new Date().toISOString();
    dc.dataConclusao = new Date().toISOString();

    dc.radarRevisado = data.radarRevisado;
    dc.pilares = data.pilares;
    dc.anamnese = data.anamnese;
    dc.comportamento = data.comportamento;
    dc.avaliacaoFisica = data.avaliacaoFisica;
    dc.fechamentoTecnico = data.fechamentoTecnico;

    saveCliente(cliente);
  }

  function validateCurrentStep(step, steps) {
    const currentFields = steps[step - 1].querySelectorAll("input, select, textarea");

    for (const field of currentFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  }

  function initSteps() {
    const steps = Array.from(document.querySelectorAll(".form-step"));
    const prevBtn = document.getElementById("dc-prev-btn");
    const nextBtn = document.getElementById("dc-next-btn");
    const submitBtn = document.getElementById("dc-submit-btn");
    const progressFill = document.getElementById("dc-progress-fill");
    const stepTitle = document.getElementById("dc-step-title");
    const stepSubtitle = document.getElementById("dc-step-subtitle");
    const stepIndicator = document.getElementById("dc-step-indicator");

    const meta = {
      1: ["Validação do Radar", "Vamos começar revisando a leitura inicial do pré-diagnóstico."],
      2: ["Anamnese", "Agora vamos aprofundar rotina, sono, alimentação e histórico."],
      3: ["Comportamento", "Vamos identificar padrões, gatilhos e fatores de adesão."],
      4: ["Avaliação Física", "Agora entram dados físicos, medidas e observações complementares."],
      5: ["Fechamento Técnico", "Por fim, definimos prioridades e foco do primeiro ciclo."]
    };

    let currentStep = 1;
    const totalSteps = steps.length;

    function showStep(step) {
      steps.forEach((el, index) => {
        el.classList.toggle("hidden", index !== step - 1);
      });

      prevBtn.classList.toggle("hidden", step === 1);
      nextBtn.classList.toggle("hidden", step === totalSteps);
      submitBtn.classList.toggle("hidden", step !== totalSteps);

      progressFill.style.width = `${(step / totalSteps) * 100}%`;
      stepTitle.textContent = meta[step][0];
      stepSubtitle.textContent = meta[step][1];
      stepIndicator.textContent = `Etapa ${step} de ${totalSteps}`;
    }

    nextBtn?.addEventListener("click", () => {
      if (!validateCurrentStep(currentStep, steps)) return;
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

    showStep(currentStep);
  }

  function init() {
    const { id, modo } = getParams();
    const form = document.getElementById("dc-form");
    const formCard = document.getElementById("dc-form-card");
    const successCard = document.getElementById("dc-success-card");
    const subtitle = document.getElementById("dc-subtitle");

    if (!id) {
      if (formCard) formCard.innerHTML = "<div class='card-body'><p>Cliente não informado.</p></div>";
      return;
    }

    const cliente = getClienteById(id);
    if (!cliente) {
      if (formCard) formCard.innerHTML = "<div class='card-body'><p>Cliente não encontrado.</p></div>";
      return;
    }

    ensureClienteStructure(cliente);

    if (subtitle) {
      subtitle.textContent =
        modo === "cliente"
          ? "Preencha com calma. Suas respostas vão aprofundar a leitura do seu caso e orientar o seu plano."
          : "Use este formulário para aprofundar o caso do cliente e organizar o fechamento técnico.";
    }

    renderRadarBase(cliente);
    fillForm(cliente);
    initSteps();

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      updateClienteWithForm(cliente, modo);

      formCard.classList.add("hidden");
      successCard.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZADiagnosticoCompleto.init();
});