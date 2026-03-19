document.addEventListener("DOMContentLoaded", function () {
  const nomeEl = document.getElementById("lead-nome");
  const emailEl = document.getElementById("lead-email");
  const resumoEl = document.getElementById("lead-resumo");

  const relatorioBtn = document.getElementById("btn-relatorio");
  const converterBtn = document.getElementById("btn-converter");
  const arquivarBtn = document.getElementById("btn-arquivar");
  const excluirBtn = document.getElementById("btn-excluir");

  function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? decodeURIComponent(id).trim() : null;
  }

  function formatPillarLabel(key) {
    if (!key) return "-";
    return window.ZACalculos?.pillarLabels?.[key] || key;
  }

  function formatDateBR(isoString) {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("pt-BR");
  }

  function timeAgo(isoString) {
    if (!isoString) return "-";
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now - date;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) return "hoje";
    if (days === 1) return "há 1 dia";
    return `há ${days} dias`;
  }

  function renderTopGaps(lead) {
    const gaps = Array.isArray(lead.top_3_gaps) ? lead.top_3_gaps : [];
    if (!gaps.length) {
      return `<p><strong>Top 3 gaps:</strong> Nenhum gap prioritário.</p>`;
    }

    return `
      <p><strong>Top 3 gaps:</strong></p>
      <div class="actions">
        ${gaps.map((gap) => {
          const label = formatPillarLabel(gap.key || gap.pilar);
          const score = gap.score ?? "-";
          return `<span class="chip warning">${label} (${score})</span>`;
        }).join(" ")}
      </div>
    `;
  }

  function renderError(message) {
    if (nomeEl) nomeEl.textContent = "Lead";
    if (emailEl) emailEl.textContent = "";
    if (resumoEl) resumoEl.innerHTML = `<p class="muted">${message}</p>`;
  }

  const id = getIdFromURL();

  if (!id) {
    renderError("ID do lead não informado na URL.");
    return;
  }

  if (!window.ZAStorage || typeof window.ZAStorage.getLeads !== "function") {
    renderError("Storage não carregado.");
    return;
  }

  const leads = window.ZAStorage.getLeads();
  const lead = leads.find((item) => String(item.id).trim() === String(id));

  if (!lead) {
    renderError(`Lead não encontrado para o id: ${id}`);
    return;
  }

  if (nomeEl) nomeEl.textContent = lead.nome || "Lead";
  if (emailEl) emailEl.textContent = lead.email || "";

  if (resumoEl) {
    resumoEl.innerHTML = `
      <div class="lead-resumo-box">
        <h4>Identificação</h