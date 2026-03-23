window.ZALancamentos = (() => {
  let clienteId = null;
  let cliente = null;

  const RADAR_KEYS = [
    "movimento",
    "alimentacao",
    "sono",
    "proposito",
    "social",
    "estresse"
  ];

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function setClientes(clientes) {
    return window.ZAStorage?.setClientes?.(clientes);
  }

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function getLeadById(id) {
    const data = window.ZAStorage?.getData?.() || {};
    const leads = data.leads || [];
    return leads.find((item) => String(item.id) === String(id)) || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch (error) {
      return dateValue;
    }
  }

  function formatDateForInput(dateValue) {
    if (!dateValue) return "";
    try {
      const d = new Date(dateValue);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  function getInitials(nome) {
    if (!nome) return "C";
    const parts = nome.trim().split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "")).toUpperCase();
  }

  function getPreDataFromCliente(clienteAtual) {
    if (!clienteAtual) return null;

    if (clienteAtual.preDiagnostico && typeof clienteAtual.preDiagnostico === "object") {
      return clienteAtual.preDiagnostico;
    }

    if (clienteAtual.leadId) {
      const lead = getLeadById(clienteAtual.leadId);
      if (lead) return lead;
    }

    return null;
  }

  function getRadarData(pre) {
    return pre?.radar || pre?.radarInicial || pre?.scores || pre?.pilares || {};
  }

  function getRadarResumo(pre) {
    const radar = getRadarData(pre);
    if (!radar || typeof radar !== "object") return "Sem radar disponível.";

    const entries = Object.entries(radar)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${value}`);

    return entries.length ? entries.join(" | ") : "Sem radar disponível.";
  }

  function renderCabecalho() {
    setText("cliente-nome-topo", cliente?.nome || "Lançamentos");
    setText("cliente-subtitulo", "Registro técnico do caso.");
    setText("cliente-nome", cliente?.nome || "Cliente");
    setText("cliente-email", cliente?.email || "—");
    setText("cliente-objetivo", cliente?.objetivo || cliente?.objetivo_principal || "Objetivo principal");

    const avatar = document.getElementById("cliente-avatar");
    if (avatar) avatar.textContent = getInitials(cliente?.nome || "Cliente");

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderPre() {
    const pre = getPreDataFromCliente(cliente);

    setText("pre-nome-view", pre?.nome || cliente?.nome || "—");
    setText("pre-email-view", pre?.email || cliente?.email || "—");
    setText("pre-telefone-view", pre?.telefone || cliente?.telefone || "—");

    const sexo = pre?.sexo || pre?.genero || "";
    const genero = pre?.genero || pre?.sexo || "";

    document.getElementById("pre-sexo").value = sexo;
    document.getElementById("pre-genero").value = genero;

    const objetivoEl = document.getElementById("pre-objetivo");
    const resumoEl = document.getElementById("pre-resumo");

    if (objetivoEl) {
      objetivoEl.value =
        pre?.objetivo ||
        pre?.objetivo_principal ||
        cliente?.objetivo ||
        cliente?.objetivo_principal ||
        "";
    }

    if (resumoEl) {
      const resumoBase =
        pre?.resumoPrediagnostico ||
        pre?.resumo_pre_diagnostico ||
        pre?.rotina ||
        pre?.maior_dificuldade ||
        "Sem resumo registrado no momento.";

      resumoEl.value = `${resumoBase}\n\nRadar: ${getRadarResumo(pre)}`;
    }
  }

  function applyProtocolVisibility() {
    const tipoEl = document.getElementById("sessao-tipo");
    const protocoloEl = document.getElementById("sessao-protocolo");
    const blocoPresencial = document.getElementById("bloco-presencial");
    const blocoAvancado = document.getElementById("bloco-avancado");
    const regraTexto = document.getElementById("sessao-regra-texto");
    const fieldAbdomenMarinha = document.getElementById("field-abdomen-marinha");
    const fieldGorduraMarinha = document.getElementById("field-gordura-marinha");

    if (!tipoEl || !protocoloEl || !blocoPresencial || !blocoAvancado) return;

    const tipo = tipoEl.value;
    let protocolo = protocoloEl.value;

    if (tipo === "online") {
      protocolo = "essencial";
      protocoloEl.value = "essencial";
      protocoloEl.disabled = true;

      blocoPresencial.classList.add("hidden");
      blocoAvancado.classList.add("hidden");

      fieldAbdomenMarinha?.classList.remove("hidden");
      fieldGorduraMarinha?.classList.remove("hidden");

      if (regraTexto) {
        regraTexto.textContent = "Online usa Marinha Americana + IMC + RCQ + RCE.";
      }
      return;
    }

    protocoloEl.disabled = false;

    if (tipo === "presencial") {
      blocoPresencial.classList.remove("hidden");
      fieldAbdomenMarinha?.classList.add("hidden");
      fieldGorduraMarinha?.classList.add("hidden");

      if (protocolo === "avancado") {
        blocoAvancado.classList.remove("hidden");
        if (regraTexto) {
          regraTexto.textContent = "Presencial avançado usa perimetria completa + dobras + testes.";
        }
      } else {
        blocoAvancado.classList.add("hidden");
        if (regraTexto) {
          regraTexto.textContent = "Presencial essencial usa perimetria completa + testes, sem dobras.";
        }
      }
      return;
    }

    protocoloEl.disabled = false;
    blocoPresencial.classList.add("hidden");
    blocoAvancado.classList.add("hidden");
    fieldAbdomenMarinha?.classList.remove("hidden");
    fieldGorduraMarinha?.classList.remove("hidden");

    if (regraTexto) {
      regraTexto.textContent = "Selecione o tipo da sessão para liberar o protocolo.";
    }
  }

  function renderSessao() {
    const sessao = cliente?.sessao || {};

    document.getElementById("sessao-data").value = sessao.data || "";
    document.getElementById("sessao-tipo").value = sessao.tipo || "";
    document.getElementById("sessao-protocolo").value = sessao.protocolo || "";

    applyProtocolVisibility();

    const updatedEl = document.getElementById("sessao-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.sessaoUpdatedAt ? formatDate(cliente.sessaoUpdatedAt) : "—"}`;
    }
  }

  function saveSessao() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const tipo = document.getElementById("sessao-tipo")?.value || "";
    const protocoloSelecionado = document.getElementById("sessao-protocolo")?.value || "";
    const protocoloFinal = tipo === "online" ? "essencial" : protocoloSelecionado;

    clientes[index] = {
      ...clientes[index],
      sessao: {
        data: document.getElementById("sessao-data")?.value || "",
        tipo,
        protocolo: protocoloFinal,
      },
      sessaoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    applyProtocolVisibility();
    alert("Sessão salva.");
    renderSessao();
  }

  function calcularAvaliacao() {
    const peso = parseFloat(document.getElementById("peso")?.value || "");
    const altura = parseFloat(document.getElementById("altura")?.value || "");
    const cintura = parseFloat(document.getElementById("cintura")?.value || "");
    const quadril = parseFloat(document.getElementById("quadril")?.value || "");
    const pescoco = parseFloat(document.getElementById("pescoco")?.value || "");
    const abdomenMarinha = parseFloat(document.getElementById("abdomen-marinha")?.value || "");

    const tipoSessao = document.getElementById("sessao-tipo")?.value || "";

    const sexoRef =
      (document.getElementById("pre-sexo")?.value || document.getElementById("pre-genero")?.value || "")
        .toLowerCase();

    const imcEl = document.getElementById("imc");
    const rcqEl = document.getElementById("rcq");
    const rceEl = document.getElementById("rce");
    const gorduraEl = document.getElementById("gordura-marinha");

    if (imcEl) {
      imcEl.value = peso && altura ? (peso / (altura * altura)).toFixed(2) : "";
    }

    if (rcqEl) {
      rcqEl.value = cintura && quadril ? (cintura / quadril).toFixed(2) : "";
    }

    if (rceEl) {
      const alturaCm = altura ? altura * 100 : 0;
      rceEl.value = cintura && alturaCm ? (cintura / alturaCm).toFixed(2) : "";
    }

    if (gorduraEl) {
      let gordura = "";

      if (tipoSessao === "online" && altura && pescoco && abdomenMarinha) {
        const alturaCm = altura * 100;

        if (sexoRef.includes("f")) {
          if (quadril) {
            const valor =
              163.205 * Math.log10(abdomenMarinha + quadril - pescoco) -
              97.684 * Math.log10(alturaCm) -
              78.387;
            if (Number.isFinite(valor)) gordura = valor.toFixed(2);
          }
        } else {
          const valor =
            86.01 * Math.log10(abdomenMarinha - pescoco) -
            70.041 * Math.log10(alturaCm) +
            36.76;
          if (Number.isFinite(valor)) gordura = valor.toFixed(2);
        }
      }

      gorduraEl.value = gordura;
    }

    const dobras = [
      "dobra-peitoral",
      "dobra-axilar",
      "dobra-triceps",
      "dobra-subescapular",
      "dobra-abdominal",
      "dobra-suprailiaca",
      "dobra-coxa"
    ];

    const soma = dobras.reduce((acc, id) => {
      const n = parseFloat(document.getElementById(id)?.value || "");
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

    const somaEl = document.getElementById("dobras-soma");
    if (somaEl) {
      somaEl.value = soma > 0 ? soma.toFixed(1) : "";
    }
  }

  function renderAvaliacao() {
    const avaliacao = cliente?.avaliacao || {};

    document.getElementById("peso").value = avaliacao.peso || "";
    document.getElementById("altura").value = avaliacao.altura || "";
    document.getElementById("cintura").value = avaliacao.cintura || "";
    document.getElementById("quadril").value = avaliacao.quadril || "";
    document.getElementById("pescoco").value = avaliacao.pescoco || "";
    document.getElementById("abdomen-marinha").value = avaliacao.abdomenMarinha || "";
    document.getElementById("imc").value = avaliacao.imc || "";
    document.getElementById("rcq").value = avaliacao.rcq || "";
    document.getElementById("rce").value = avaliacao.rce || "";
    document.getElementById("gordura-marinha").value = avaliacao.gorduraMarinha || "";

    document.getElementById("torax").value = avaliacao.torax || "";
    document.getElementById("abdomen").value = avaliacao.abdomen || "";
    document.getElementById("braco-direito").value = avaliacao.bracoDireito || "";
    document.getElementById("braco-esquerdo").value = avaliacao.bracoEsquerdo || "";
    document.getElementById("coxa-direita").value = avaliacao.coxaDireita || "";
    document.getElementById("coxa-esquerda").value = avaliacao.coxaEsquerda || "";
    document.getElementById("panturrilha").value = avaliacao.panturrilha || "";

    document.getElementById("dobra-peitoral").value = avaliacao.dobraPeitoral || "";
    document.getElementById("dobra-axilar").value = avaliacao.dobraAxilar || "";
    document.getElementById("dobra-triceps").value = avaliacao.dobraTriceps || "";
    document.getElementById("dobra-subescapular").value = avaliacao.dobraSubescapular || "";
    document.getElementById("dobra-abdominal").value = avaliacao.dobraAbdominal || "";
    document.getElementById("dobra-suprailiaca").value = avaliacao.dobraSuprailiaca || "";
    document.getElementById("dobra-coxa").value = avaliacao.dobraCoxa || "";
    document.getElementById("dobras-soma").value = avaliacao.dobrasSoma || "";

    document.getElementById("teste-overhead").value = avaliacao.testeOverhead || "";
    document.getElementById("teste-thomas").value = avaliacao.testeThomas || "";
    document.getElementById("teste-sentar-alcancar").value = avaliacao.testeSentarAlcancar || "";
    document.getElementById("teste-step-fc").value = avaliacao.testeStepFc || "";
    document.getElementById("teste-step-borg").value = avaliacao.testeStepBorg || "";
    document.getElementById("teste-step-classificacao").value = avaliacao.testeStepClassificacao || "";

    const updatedEl = document.getElementById("avaliacao-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.avaliacaoUpdatedAt ? formatDate(cliente.avaliacaoUpdatedAt) : "—"}`;
    }
  }

  function saveAvaliacao() {
    calcularAvaliacao();

    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      avaliacao: {
        peso: document.getElementById("peso")?.value || "",
        altura: document.getElementById("altura")?.value || "",
        cintura: document.getElementById("cintura")?.value || "",
        quadril: document.getElementById("quadril")?.value || "",
        pescoco: document.getElementById("pescoco")?.value || "",
        abdomenMarinha: document.getElementById("abdomen-marinha")?.value || "",
        imc: document.getElementById("imc")?.value || "",
        rcq: document.getElementById("rcq")?.value || "",
        rce: document.getElementById("rce")?.value || "",
        gorduraMarinha: document.getElementById("gordura-marinha")?.value || "",

        torax: document.getElementById("torax")?.value || "",
        abdomen: document.getElementById("abdomen")?.value || "",
        bracoDireito: document.getElementById("braco-direito")?.value || "",
        bracoEsquerdo: document.getElementById("braco-esquerdo")?.value || "",
        coxaDireita: document.getElementById("coxa-direita")?.value || "",
        coxaEsquerda: document.getElementById("coxa-esquerda")?.value || "",
        panturrilha: document.getElementById("panturrilha")?.value || "",

        dobraPeitoral: document.getElementById("dobra-peitoral")?.value || "",
        dobraAxilar: document.getElementById("dobra-axilar")?.value || "",
        dobraTriceps: document.getElementById("dobra-triceps")?.value || "",
        dobraSubescapular: document.getElementById("dobra-subescapular")?.value || "",
        dobraAbdominal: document.getElementById("dobra-abdominal")?.value || "",
        dobraSuprailiaca: document.getElementById("dobra-suprailiaca")?.value || "",
        dobraCoxa: document.getElementById("dobra-coxa")?.value || "",
        dobrasSoma: document.getElementById("dobras-soma")?.value || "",

        testeOverhead: document.getElementById("teste-overhead")?.value || "",
        testeThomas: document.getElementById("teste-thomas")?.value || "",
        testeSentarAlcancar: document.getElementById("teste-sentar-alcancar")?.value || "",
        testeStepFc: document.getElementById("teste-step-fc")?.value || "",
        testeStepBorg: document.getElementById("teste-step-borg")?.value || "",
        testeStepClassificacao: document.getElementById("teste-step-classificacao")?.value || "",
      },
      avaliacaoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Avaliação salva.");
    renderAvaliacao();
  }

  function renderRadar() {
    const pre = getPreDataFromCliente(cliente);
    const radarPre = getRadarData(pre);
    const radarRevisado = cliente?.radarRevisado || {};

    RADAR_KEYS.forEach((key) => {
      setText(`radar-pre-${key}`, radarPre?.[key] ?? "—");

      const input = document.getElementById(`radar-revisado-${key}`);
      if (input) {
        input.value =
          radarRevisado?.[key] !== undefined && radarRevisado?.[key] !== null
            ? radarRevisado[key]
            : "";
      }
    });

    const updatedEl = document.getElementById("radar-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.radarRevisadoUpdatedAt ? formatDate(cliente.radarRevisadoUpdatedAt) : "—"}`;
    }
  }

  function saveRadar() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const radarRevisado = {};

    RADAR_KEYS.forEach((key) => {
      const raw = document.getElementById(`radar-revisado-${key}`)?.value;
      radarRevisado[key] = raw === "" ? null : Number(raw);
    });

    clientes[index] = {
      ...clientes[index],
      radarRevisado,
      radarRevisadoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Radar revisado salvo.");
    renderRadar();
  }

  function renderDiagnostico() {
    document.getElementById("diag-gargalo").value = cliente?.diagnosticoGargalo || "";
    document.getElementById("diag-perfil").value = cliente?.diagnosticoPerfil || "";
    document.getElementById("diag-triagem").value = cliente?.diagnosticoTriagem || "";
    document.getElementById("diag-prioridade").value = cliente?.diagnosticoPrioridade || "";
    document.getElementById("diag-leitura").value = cliente?.diagnosticoLeitura || "";
    document.getElementById("diag-sintese").value = cliente?.diagnosticoSintese || "";
    document.getElementById("diag-conduta").value = cliente?.condutaInicial || "";

    const updatedEl = document.getElementById("diag-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.diagnosticoUpdatedAt ? formatDate(cliente.diagnosticoUpdatedAt) : "—"}`;
    }
  }

  function saveDiagnostico() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      diagnosticoGargalo: document.getElementById("diag-gargalo")?.value.trim() || "",
      diagnosticoPerfil: document.getElementById("diag-perfil")?.value.trim() || "",
      diagnosticoTriagem: document.getElementById("diag-triagem")?.value.trim() || "",
      diagnosticoPrioridade: document.getElementById("diag-prioridade")?.value.trim() || "",
      diagnosticoLeitura: document.getElementById("diag-leitura")?.value.trim() || "",
      diagnosticoSintese: document.getElementById("diag-sintese")?.value.trim() || "",
      condutaInicial: document.getElementById("diag-conduta")?.value.trim() || "",
      diagnosticoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Diagnóstico salvo.");
    renderDiagnostico();
  }

  function renderAcompanhamentos() {
    const lista = document.getElementById("acompanhamentos-lista");
    if (!lista) return;

    const acompanhamentos = Array.isArray(cliente?.acompanhamentos) ? cliente.acompanhamentos : [];

    const updatedEl = document.getElementById("acomp-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.acompanhamentoUpdatedAt ? formatDate(cliente.acompanhamentoUpdatedAt) : "—"}`;
    }

    if (!acompanhamentos.length) {
      lista.innerHTML = `<div class="cliente-placeholder-box">Nenhum acompanhamento salvo ainda.</div>`;
      return;
    }

    lista.innerHTML = acompanhamentos
      .slice()
      .reverse()
      .map((item) => {
        return `
          <div class="acomp-item">
            <div class="acomp-item-top">
              <strong>${item.data ? formatDate(item.data) : "Sem data"}</strong>
              <span>${item.aderencia || "Sem aderência informada"}</span>
            </div>
            <p><strong>Evolução:</strong> ${item.evolucao || "—"}</p>
            <p><strong>Dificuldades:</strong> ${item.dificuldades || "—"}</p>
            <p><strong>Ajustes:</strong> ${item.ajustes || "—"}</p>
          </div>
        `;
      })
      .join("");
  }

  function resetFormAcompanhamento() {
    const hoje = new Date();
    document.getElementById("acomp-data").value = formatDateForInput(hoje);
    document.getElementById("acomp-aderencia").value = "";
    document.getElementById("acomp-evolucao").value = "";
    document.getElementById("acomp-dificuldades").value = "";
    document.getElementById("acomp-ajustes").value = "";
  }

  function saveAcompanhamento() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const novo = {
      data: document.getElementById("acomp-data")?.value || "",
      aderencia: document.getElementById("acomp-aderencia")?.value.trim() || "",
      evolucao: document.getElementById("acomp-evolucao")?.value.trim() || "",
      dificuldades: document.getElementById("acomp-dificuldades")?.value.trim() || "",
      ajustes: document.getElementById("acomp-ajustes")?.value.trim() || "",
      createdAt: new Date().toISOString(),
    };

    const acompanhamentos = Array.isArray(clientes[index].acompanhamentos)
      ? clientes[index].acompanhamentos
      : [];

    acompanhamentos.push(novo);

    clientes[index] = {
      ...clientes[index],
      acompanhamentos,
      acompanhamentoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Acompanhamento salvo.");
    renderAcompanhamentos();
    resetFormAcompanhamento();
  }

  function bindEvents() {
    document.getElementById("sessao-tipo")?.addEventListener("change", applyProtocolVisibility);
    document.getElementById("sessao-protocolo")?.addEventListener("change", applyProtocolVisibility);

    document.getElementById("salvar-sessao-btn")?.addEventListener("click", saveSessao);
    document.getElementById("calcular-btn")?.addEventListener("click", calcularAvaliacao);
    document.getElementById("salvar-avaliacao-btn")?.addEventListener("click", saveAvaliacao);
    document.getElementById("salvar-radar-btn")?.addEventListener("click", saveRadar);
    document.getElementById("salvar-diagnostico-btn")?.addEventListener("click", saveDiagnostico);
    document.getElementById("salvar-acompanhamento-btn")?.addEventListener("click", saveAcompanhamento);
  }

  function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      document.getElementById("lancamentos-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("lancamentos-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    renderCabecalho();
    renderPre();
    renderSessao();
    renderAvaliacao();
    renderRadar();
    renderDiagnostico();
    renderAcompanhamentos();
    resetFormAcompanhamento();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZALancamentos.init();
});