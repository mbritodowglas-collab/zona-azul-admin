window.ZACliente = (() => {
  let clienteId = null;
  let cliente = null;
  let dadosPessoaisOpen = false;
  let preDiagnosticoOpen = false;

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

  function getStatusBadge(status) {
    const safeStatus = status || "ativo";

    const map = {
      ativo: "bg-emerald-100 text-emerald-700",
      arquivado: "bg-slate-200 text-slate-700",
      pausado: "bg-amber-100 text-amber-700",
      finalizado: "bg-blue-100 text-blue-700",
    };

    const classes = map[safeStatus] || "bg-slate-100 text-slate-700";

    return `
      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}">
        ${safeStatus}
      </span>
    `;
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

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function renderHubStatus(idBase, updatedAt, hasContent = false) {
    const statusEl = document.getElementById(`status-${idBase}`);
    const updatedEl = document.getElementById(`updated-${idBase}`);

    if (statusEl) {
      statusEl.textContent = hasContent ? "Atualizado" : "Pendente";
      statusEl.classList.toggle("is-complete", hasContent);
    }

    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${updatedAt ? formatDate(updatedAt) : "—"}`;
    }
  }

  function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }

  function getPreDiagnosticoLink() {
    return `${window.location.origin}/zona-azul-admin/formulario/?cliente=${clienteId}`;
  }

  function getAcompanhamentoLink() {
    return `${window.location.origin}/zona-azul-admin/acompanhamento/?cliente=${clienteId}`;
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      alert(successMessage);
    } catch (error) {
      prompt("Copie o link abaixo:", text);
    }
  }

  function fillDadosPessoaisForm() {
    const map = {
      "dp-nome": cliente.nome || "",
      "dp-email": cliente.email || "",
      "dp-telefone": cliente.telefone || "",
      "dp-plano": cliente.plano || "",
      "dp-fase": cliente.faseAtual || cliente.fase_atual || "",
      "dp-data": formatDateForInput(cliente.dataInicio || cliente.createdAt || cliente.created_at),
      "dp-objetivo": cliente.objetivo || cliente.objetivo_principal || "",
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });
  }

  function updateDadosPessoaisUI() {
    const wrap = document.getElementById("dados-pessoais-form-wrap");
    const toggleBtn = document.getElementById("toggle-dados-pessoais-btn");

    if (!wrap || !toggleBtn) return;

    wrap.classList.toggle("hidden", !dadosPessoaisOpen);
    toggleBtn.textContent = dadosPessoaisOpen ? "Fechar" : "Editar";
  }

  function renderDadosPessoaisCard() {
    setText("dp-nome-view", cliente.nome || "—");
    setText("dp-email-view", cliente.email || "—");
    setText("dp-telefone-view", cliente.telefone || "—");
    setText("dp-plano-view", cliente.plano || "—");
    setText("dp-fase-view", cliente.faseAtual || cliente.fase_atual || "—");
    setText("dp-data-view", formatDate(cliente.dataInicio || cliente.createdAt || cliente.created_at));

    fillDadosPessoaisForm();
    updateDadosPessoaisUI();
  }

  function toggleDadosPessoais() {
    dadosPessoaisOpen = !dadosPessoaisOpen;
    updateDadosPessoaisUI();
  }

  function cancelDadosPessoais() {
    fillDadosPessoaisForm();
    dadosPessoaisOpen = false;
    updateDadosPessoaisUI();
  }

  function saveDadosPessoais() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const nome = document.getElementById("dp-nome")?.value.trim() || "";
    const email = document.getElementById("dp-email")?.value.trim() || "";
    const telefone = document.getElementById("dp-telefone")?.value.trim() || "";
    const plano = document.getElementById("dp-plano")?.value.trim() || "";
    const fase = document.getElementById("dp-fase")?.value.trim() || "";
    const dataInicio = document.getElementById("dp-data")?.value || "";
    const objetivo = document.getElementById("dp-objetivo")?.value.trim() || "";

    clientes[index] = {
      ...clientes[index],
      nome,
      email,
      telefone,
      plano,
      faseAtual: fase,
      dataInicio: dataInicio || clientes[index].dataInicio || "",
      objetivo_principal: objetivo,
      objetivo,
      updatedAt: new Date().toISOString(),
      dadosPessoaisUpdatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    dadosPessoaisOpen = false;
    alert("Dados pessoais salvos.");
    renderCliente();
  }

  function updatePreDiagnosticoUI() {
    const wrap = document.getElementById("pre-diagnostico-expand");
    const toggleBtn = document.getElementById("toggle-pre-btn");

    if (!wrap || !toggleBtn) return;

    wrap.classList.toggle("hidden", !preDiagnosticoOpen);
    toggleBtn.textContent = preDiagnosticoOpen ? "Fechar" : "Abrir";
  }

  function togglePreDiagnostico() {
    preDiagnosticoOpen = !preDiagnosticoOpen;
    updatePreDiagnosticoUI();
  }

  function closePreDiagnostico() {
    preDiagnosticoOpen = false;
    updatePreDiagnosticoUI();
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

  function getRadarResumo(pre) {
    if (!pre) return "Sem radar disponível.";

    const radar =
      pre.radar ||
      pre.radarInicial ||
      pre.scores ||
      pre.pilares ||
      null;

    if (!radar || typeof radar !== "object") {
      return "Sem radar disponível.";
    }

    const entries = Object.entries(radar)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${value}`);

    return entries.length ? entries.join(" | ") : "Sem radar disponível.";
  }

  function renderPreDiagnosticoCard() {
    const pre = getPreDataFromCliente(cliente);

    setText("pre-nome-view", pre?.nome || cliente?.nome || "—");
    setText("pre-email-view", pre?.email || cliente?.email || "—");
    setText("pre-telefone-view", pre?.telefone || cliente?.telefone || "—");

    const objetivoEl = document.getElementById("pre-objetivo");
    const resumoEl = document.getElementById("pre-resumo");
    const updatedEl = document.getElementById("pre-updated-readonly");
    const linkEl = document.getElementById("pre-link-readonly");

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

    if (updatedEl) {
      const dt =
        pre?.updatedAt ||
        pre?.updated_at ||
        pre?.createdAt ||
        pre?.created_at;

      updatedEl.value = dt ? formatDate(dt) : "—";
    }

    if (linkEl) {
      linkEl.value = getPreDiagnosticoLink();
    }

    updatePreDiagnosticoUI();
  }

  function saveObservacoes() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      observacoes: document.getElementById("cliente-observacoes")?.value.trim() || "",
      updatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Observações salvas.");
    renderCliente();
  }

  function archiveCliente() {
    const ok = window.confirm("Deseja arquivar este cliente?");
    if (!ok) return;

    const result = window.ZAStorage?.archiveCliente?.(clienteId);
    if (!result) {
      alert("Erro ao arquivar cliente.");
      return;
    }

    cliente = getClienteById(clienteId);
    renderCliente();
  }

  function reactivateCliente() {
    const ok = window.confirm("Deseja reativar este cliente?");
    if (!ok) return;

    const result = window.ZAStorage?.reactivateCliente?.(clienteId);
    if (!result) {
      alert("Erro ao reativar cliente.");
      return;
    }

    cliente = getClienteById(clienteId);
    renderCliente();
  }

  function openSection(section) {
    if (section === "pre-diagnostico") {
      togglePreDiagnostico();
      return;
    }

    const map = {
      "diagnostico": "Aqui vamos abrir a seção de Diagnóstico completo.",
      "acompanhamento": "Aqui vamos abrir a seção de Acompanhamento.",
      "planejamento": "Aqui vamos abrir a seção de Planejamento geral.",
      "treinos": "Aqui vamos abrir a seção de Programação de treinos.",
      "relatorio": "Aqui vamos abrir/gerar o Relatório final.",
    };

    alert(map[section] || "Seção em construção.");
  }

  function generateReport() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      relatorioUpdatedAt: new Date().toISOString(),
    };

    setClientes(clientes);
    cliente = clientes[index];
    alert("Relatório preparado para geração.");
    renderCliente();
  }

  function renderCliente() {
    if (!cliente) return;

    const nome = cliente.nome || "Cliente";
    const email = cliente.email || "email@cliente.com";
    const objetivo = cliente.objetivo || cliente.objetivo_principal || "Objetivo principal";
    const status = cliente.status || "ativo";

    setText("cliente-nome-topo", nome);
    setText("cliente-subtitulo", "Hub operacional do caso.");
    setText("cliente-nome", nome);
    setText("cliente-email", email);
    setText("cliente-objetivo", objetivo);

    const avatar = document.getElementById("cliente-avatar");
    if (avatar) avatar.textContent = getInitials(nome);

    const badge = document.getElementById("cliente-status-badge");
    if (badge) badge.innerHTML = getStatusBadge(status);

    const lead = cliente.leadId ? getLeadById(cliente.leadId) : null;

    renderHubStatus(
      "dados-pessoais",
      cliente.dadosPessoaisUpdatedAt || cliente.updatedAt || cliente.updated_at,
      hasValue(cliente.nome || cliente.email || cliente.telefone)
    );

    renderHubStatus(
      "pre-diagnostico",
      lead?.updatedAt ||
        lead?.updated_at ||
        lead?.createdAt ||
        lead?.created_at ||
        cliente?.preDiagnostico?.updatedAt ||
        cliente?.preDiagnostico?.updated_at,
      !!getPreDataFromCliente(cliente)
    );

    renderHubStatus(
      "diagnostico",
      cliente.diagnosticoUpdatedAt,
      hasValue(cliente.diagnostico || cliente.condutaInicial)
    );

    renderHubStatus(
      "acompanhamento",
      cliente.acompanhamentoUpdatedAt,
      Array.isArray(cliente.acompanhamentos) && cliente.acompanhamentos.length > 0
    );

    renderHubStatus(
      "planejamento",
      cliente.planejamentoUpdatedAt,
      hasValue(cliente.objetivoCentral || cliente.direcaoComportamental || cliente.direcaoFisica)
    );

    renderHubStatus(
      "treinos",
      cliente.treinosUpdatedAt,
      Array.isArray(cliente.periodizacoes) && cliente.periodizacoes.length > 0
    );

    const relatorioUpdatedEl = document.getElementById("updated-relatorio");
    if (relatorioUpdatedEl) {
      relatorioUpdatedEl.textContent = `Última geração: ${cliente.relatorioUpdatedAt ? formatDate(cliente.relatorioUpdatedAt) : "—"}`;
    }

    const observacoes = document.getElementById("cliente-observacoes");
    if (observacoes) observacoes.value = cliente.observacoes || "";

    renderDadosPessoaisCard();
    renderPreDiagnosticoCard();

    const arquivarBtn = document.getElementById("arquivar-cliente");
    const reativarBtn = document.getElementById("reativar-cliente");

    if (cliente.status === "arquivado") {
      arquivarBtn?.classList.add("hidden");
      reativarBtn?.classList.remove("hidden");
    } else {
      arquivarBtn?.classList.remove("hidden");
      reativarBtn?.classList.add("hidden");
    }
  }

  function bindEvents() {
    document.getElementById("salvar-observacoes")?.addEventListener("click", saveObservacoes);
    document.getElementById("arquivar-cliente")?.addEventListener("click", archiveCliente);
    document.getElementById("reativar-cliente")?.addEventListener("click", reactivateCliente);
    document.getElementById("gerar-relatorio-btn")?.addEventListener("click", generateReport);

    document.getElementById("toggle-dados-pessoais-btn")?.addEventListener("click", toggleDadosPessoais);
    document.getElementById("cancelar-dados-pessoais-btn")?.addEventListener("click", cancelDadosPessoais);
    document.getElementById("salvar-dados-pessoais-btn")?.addEventListener("click", saveDadosPessoais);

    document.getElementById("toggle-pre-btn")?.addEventListener("click", togglePreDiagnostico);
    document.getElementById("fechar-pre-btn")?.addEventListener("click", closePreDiagnostico);

    document.querySelectorAll("[data-open-section]").forEach((button) => {
      button.addEventListener("click", () => {
        openSection(button.dataset.openSection);
      });
    });

    document.querySelectorAll("[data-copy-link]").forEach((button) => {
      button.addEventListener("click", () => {
        const type = button.dataset.copyLink;

        if (type === "pre") {
          copyText(getPreDiagnosticoLink(), "Link do pré-diagnóstico copiado.");
          return;
        }

        if (type === "acompanhamento") {
          copyText(getAcompanhamentoLink(), "Link do acompanhamento copiado.");
        }
      });
    });
  }

  function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      document.getElementById("cliente-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("cliente-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    bindEvents();
    renderCliente();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZACliente.init();
});