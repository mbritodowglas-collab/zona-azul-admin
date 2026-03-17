function getEmailFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("email");
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

  document.getElementById("lead-resumo").innerHTML = `
    <p><strong>Média:</strong> ${lead.media_geral}</p>
    <p><strong>Pilar mais baixo:</strong> ${lead.pilar_mais_baixo}</p>
    <p><strong>Origem:</strong> ${lead.origem}</p>
  `;

  setupActions(lead);
}

function setupActions(lead) {
  document.getElementById("btn-relatorio").href =
    `../relatorio/?email=${encodeURIComponent(lead.email)}`;

  document.getElementById("btn-converter").onclick = () => {
    window.ZAStorage.convertLeadToCliente(lead.email);
    window.location.href = "../clientes/";
  };

  document.getElementById("btn-arquivar").onclick = () => {
    window.ZAStorage.archiveLead(lead.email);
    alert("Lead arquivado");
  };

  document.getElementById("btn-excluir").onclick = () => {
    const ok = confirm("Excluir lead?");
    if (!ok) return;

    window.ZAStorage.removeLead(lead.email);
    window.location.href = "../pre-diagnostico/";
  };
}

loadLead();