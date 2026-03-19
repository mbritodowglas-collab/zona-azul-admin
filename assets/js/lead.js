document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const email = (params.get("email") || "").trim().toLowerCase();

  const nomeEl = document.getElementById("lead-nome");
  const emailEl = document.getElementById("lead-email");
  const resumoEl = document.getElementById("lead-resumo");

  const relatorioBtn = document.getElementById("btn-relatorio");
  const converterBtn = document.getElementById("btn-converter");
  const arquivarBtn = document.getElementById("btn-arquivar");
  const excluirBtn = document.getElementById("btn-excluir");

  if (!email) {
    if (resumoEl) resumoEl.innerHTML = `<p class="muted">Lead não informado na URL.</p>`;
    return;
  }

  const leads = window.ZAStorage.getLeads();
  const lead = leads.find((item) => (item.email || "").trim().toLowerCase() === email);

  if (!lead) {
    if (resumoEl) resumoEl.innerHTML = `<p class="muted">Lead não encontrado.</p>`;
    return;
  }

  // preenche cabeçalho
  if (nomeEl) nomeEl.textContent = lead.nome || "Lead";
  if (emailEl) emailEl.textContent = lead.email || "";

  // preenche resumo
  if (resumoEl) {
    resumoEl.innerHTML = `
      <div class="lead-resumo-box">
        <h4>Identificação</h4>
        <p><strong>Nome:</strong> ${lead.nome}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Origem:</strong> ${lead.origem || "-"}</p>
        <p><strong>Idade:</strong> ${lead.idade || "-"}</p>
      </div>

      <div class="lead-resumo-box">
        <h4>Radar</h4>
        <p><strong>Média geral:</strong> ${lead.media_geral ?? "-"}</p>
        <p><strong>Pilar mais baixo:</strong> ${window.ZACalculos?.pillarLabels?.[lead.pilar_mais_baixo] || "-"}</p>
      </div>

      <div class="lead-resumo-box">
        <h4>Contexto</h4>
        <p><strong>Por que parou:</strong> ${lead.por_que_parou || "-"}</p>
        <p><strong>Desafio atual:</strong> ${lead.desafio_atual || "-"}</p>
        <p><strong>Meta 6 meses:</strong> ${lead.meta_6_meses || "-"}</p>
      </div>
    `;
  }

  // RELATÓRIO
  if (relatorioBtn) {
    relatorioBtn.href = `../relatorio/index.html?email=${encodeURIComponent(lead.email)}`;
    relatorioBtn.target = "_blank";
  }

  // CONVERTER
  if (converterBtn) {
    converterBtn.onclick = () => {
      const ok = confirm(`Converter ${lead.nome} em cliente?`);
      if (!ok) return;

      window.ZAStorage.convertLeadToCliente(lead.email);
      window.location.href = "../clientes/";
    };
  }

  // ARQUIVAR
  if (arquivarBtn) {
    arquivarBtn.onclick = () => {
      const ok = confirm(`Arquivar ${lead.nome}?`);
      if (!ok) return;

      window.ZAStorage.archiveLead(lead.email);
      window.location.href = "../pre-diagnostico/";
    };
  }

  // EXCLUIR
  if (excluirBtn) {
    excluirBtn.onclick = () => {
      const ok = confirm(`Excluir ${lead.nome}?`);
      if (!ok) return;

      window.ZAStorage.removeLead(lead.email);
      window.location.href = "../pre-diagnostico/";
    };
  }
});