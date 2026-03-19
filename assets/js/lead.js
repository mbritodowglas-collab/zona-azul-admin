document.addEventListener("DOMContentLoaded", () => {
  const nomeEl = document.getElementById("lead-nome");
  const emailEl = document.getElementById("lead-email");
  const resumoEl = document.getElementById("lead-resumo");

  const relatorioBtn = document.getElementById("btn-relatorio");
  const converterBtn = document.getElementById("btn-converter");
  const arquivarBtn = document.getElementById("btn-arquivar");
  const excluirBtn = document.getElementById("btn-excluir");

  function getEmailFromURL() {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    return email ? decodeURIComponent(email).trim().toLowerCase() : null;
  }

  function formatPillarLabel(key) {
    if (!key) return "-";
    return window.ZACalculos?.pillarLabels?.[key] || key;
  }

  function formatDateBR(isoString) {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleDateString("pt-BR");
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