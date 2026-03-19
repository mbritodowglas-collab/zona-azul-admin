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
  if (!gaps.length) {
    return `<p><strong>Top 3 gaps:</strong> Nenhum gap prioritário.</p>`;
  }

  const chips = gaps
    .map((gap) => {
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

function setupActions(lead) {
  const relatorioBtn = document.getElementById("btn-relatorio");
  const converterBtn = document.getElementById("btn-converter");
  const arquivarBtn = document.getElementById("btn-arquivar");
  const excluirBtn = document.getElementById("btn-excluir");

  if (relatorioBtn) {
    relatorioBtn.href = `../relatorio/?email=${encodeURIComponent(lead.email)}`;
    relatorioBtn.target = "_blank";
  }

  if (converterBtn) {
    converterBtn.onclick = () => {
      window.ZAStorage.convertLeadToCliente(lead.email);
      window.location.href = "../clientes/";
    };
  }

  if (arquivarBtn) {
    arquivarBtn.onclick = () => {
      const ok = confirm(`Deseja arquivar ${lead.nome}?`);
      if (!ok) return;

      window.ZAStorage.archiveLead(lead.email);
      window.location.href = "../pre-diagnostico/";
    };
  }

  if (excluirBtn) {
    excluirBtn.onclick = () => {
      const ok = confirm(`Deseja excluir ${lead.nome}?`);
      if (!ok) return;

      window.ZAStorage.removeLead(lead.email);
      window.location.href = "../pre-diagnostico/";
    };
  }
}

function loadLead() {
  const email = getEmailFromURL();

  if (!email) {
    alert("Email do lead não informado na URL.");
    return;
  }

  const leads = window.ZAStorage.getLeads();
  const lead = leads.find((l) => (l.email || "").trim().toLowerCase() === email);

  if (!lead) {
    alert(`Lead não encontrado para o email: ${email}`);
    return;
  }

  const nomeEl = document.getElementById("lead-nome");
  const emailEl = document.getElementById("lead-email");
  const resumoEl = document.getElementById("lead-resumo");

  if (nomeEl) nomeEl.textContent = lead.nome;
  if (emailEl) emailEl.textContent = lead.email;

  if (resumoEl) {
    resumoEl.innerHTML = `
      <div class="lead-resumo-box">
        <h4>Identificação</h4>
        <p><strong>Nome:</strong> ${lead.nome}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Origem:</strong> ${lead.origem || "-"}</p>
        <p><strong>Idade:</strong> ${lead.idade || "-"}</p>
        <p><strong>Data de preenchimento:</strong> ${formatDateBR(lead.created_at)}</p>
        <p><strong>Enviado:</strong> ${timeAgo(lead.created_at)}</p>
      </div>

      <div class="lead-resumo-box">
        <h4>Resumo do radar</h4>
        <p><strong>Média geral:</strong> ${lead.media_geral ?? "-"}</p>
        <p><strong>Pilar mais baixo:</strong> ${formatPillarLabel(lead.pilar_mais_baixo)}</p>
        ${renderTopGaps(lead)}
      </div>

      <div class="lead-resumo-box">
        <h4>Histórico</h4>
        <p><strong>Experiência com personal:</strong> ${lead.exp_personal || "-"}</p>
        <p><strong>Experiência com emagrecimento:</strong> ${lead.exp_emagrecimento || "-"}</p>
        <p><strong>O que já funcionou:</strong> ${lead.o_que_funcionou || "-"}</p>
        <p><strong>Por que parou:</strong> ${lead.por_que_parou || "-"}</p>
      </div>

      <div class="lead-resumo-box">
        <h4>Contexto final</h4>
        <p><strong>Desafio atual:</strong> ${lead.desafio_atual || "-"}</p>
        <p><strong>Meta para 6 meses:</strong> ${lead.meta_6_meses || "-"}</p>
        <p><strong>Status:</strong> ${lead.status || "novo"}</p>
      </div>
    `;
  }

  setupActions(lead);
}

loadLead();