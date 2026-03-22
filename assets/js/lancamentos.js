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

  function renderSessao() {
    const sessao = cliente?.sessao || {};

    document.getElementById("sessao-data").value = sessao.data || "";
    document.getElementById("sessao-tipo").value = sessao.tipo || "";
    document.getElementById("sessao-protocolo").value = sessao.protocolo || "";

    const updatedEl = document.getElementById("sessao-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.sessaoUpdatedAt ? formatDate(cliente.sessaoUpdatedAt) : "—"}`;
    }
  }

  function saveSessao() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      sessao: {
        data: document.getElementById("sessao-data")?.value || "",
        tipo: document.getElementById("sessao-tipo")?.value || "",
        protocolo: document.getElementById("sessao-protocolo")?.value || "",
      },
      sessaoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Sessão salva.");
    renderSessao();
  }

  function calcularAvaliacao() {
    const peso = parseFloat(document.getElementById("peso")?.value || "");
    const altura = parseFloat(document.getElementById("altura")?.value || "");
    const cintura = parseFloat(document.getElementById("cintura")?.value || "");
    const quadril = parseFloat(document.getElementById("quadril")?.value || "");

    const imcEl = document.getElementById("imc");
    const rcqEl = document.getElementById("rcq");

    if (imcEl) {
      imcEl.value = peso && altura ? (peso / (altura * altura)).toFixed(2) : "";
    }

    if (rcqEl) {
      rcqEl.value = cintura && quadril ? (cintura / quadril).toFixed(2) : "";
    }
  }

  function renderAvaliacao() {
    const avaliacao = cliente?.avaliacao || {};

    document.getElementById("peso").value = avaliacao.peso || "";
    document.getElementById("altura").value = avaliacao.altura || "";
    document.getElementById("cintura").value = avaliacao.cintura || "";
    document.getElementById("quadril").value = avaliacao.quadril || "";
    document.getElementById("imc").value = avaliacao.imc || "";
    document.getElementById("rcq").value = avaliacao.rcq || "";

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
        imc: document.getElementById("imc")?.value || "",
        rcq: document.getElementById("rcq")?.value || "",
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