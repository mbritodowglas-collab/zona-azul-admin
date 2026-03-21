window.ZACliente = (() => {
  let clienteId = null;
  let cliente = null;

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
    return getClientes().find((item) => item.id === id) || null;
  }

  function getLeadById(id) {
    const data = window.ZAStorage?.getData?.() || {};
    const leads = data.leads || [];
    return leads.find((item) => item.id === id) || null;
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
    return `${window.location.origin}/zona-azul-admin/pre-diagnostico/?cliente=${clienteId}`;
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

    setText("info-nome", nome);
    setText("info-email", email);
    setText("info-telefone", cliente.telefone || "-");
    setText("info-plano", cliente.plano || "-");
    setText("info-fase", cliente.faseAtual || cliente.fase_atual || "-");
    setText("info-data-inicio", formatDate(cliente.dataInicio || cliente.createdAt || cliente.created_at));

    const lead = cliente.leadId ? getLeadById(cliente.leadId) : null;

    renderHubStatus(
      "dados-pessoais",
      cliente.updatedAt || cliente.updated_at,
      hasValue(cliente.nome || cliente.email || cliente.telefone)
    );

    renderHubStatus(
      "pre-diagnostico",
      lead?.updatedAt || lead?.updated_at || lead?.createdAt || lead?.created_at,
      !!lead
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

  function saveObservacoes() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => item.id === clienteId);
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
    const map = {
      "dados-pessoais": "Aqui vamos abrir a seção de Dados pessoais.",
      "pre-diagnostico": "Aqui vamos abrir a seção de Pré-diagnóstico inicial.",
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
    const index = clientes.findIndex((item) => item.id === clienteId);
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

  function bindEvents() {
    document.getElementById("salvar-observacoes")?.addEventListener("click", saveObservacoes);
    document.getElementById("arquivar-cliente")?.addEventListener("click", archiveCliente);
    document.getElementById("reativar-cliente")?.addEventListener("click", reactivateCliente);
    document.getElementById("gerar-relatorio-btn")?.addEventListener("click", generateReport);

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