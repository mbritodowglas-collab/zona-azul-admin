function getEmailFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("email");
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
  if (!gaps.length) {
    return `<p><strong>Top 3 gaps:</strong> Nenhum gap prioritário.</p>`;
  }

  const chips = gaps
    .map(gap => {
      const label = formatPillarLabel(gap.key || gap.pilar);
      const score = gap.score ?? "-";
      return `<span class="chip warning">${label} (${score})</span>`;
    })
    .join(" ");

  return `
    <p><strong>Top 3 gaps:</strong></p>
    <div class="actions">${chips}</div>
  `;
}

function loadLead() {
  const email = getEmailFromURL();
  if (!email) return;

  const leads = window.ZAStorage.getLeads();
  const lead = leads.find(l => l.email === email);

  if (!lead) {
    alert("Lead não encontrado");
    return;
  }

  document.getElementById("lead-nome").textContent = lead.nome;
  document.getElementById("lead-email").textContent = lead.email;

  document.getElementById("lead-resumo").