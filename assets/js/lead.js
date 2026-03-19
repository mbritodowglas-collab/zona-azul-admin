document.addEventListener("DOMContentLoaded", () => {
  console.log("LEAD JS OK");

  const nomeEl = document.getElementById("lead-nome");
  const emailEl = document.getElementById("lead-email");
  const resumoEl = document.getElementById("lead-resumo");

  const relatorioBtn = document.getElementById("btn-relatorio");
  const converterBtn = document.getElementById("btn-converter");
  const arquivarBtn = document.getElementById("btn-arquivar");
  const excluirBtn = document.getElementById("btn-excluir");

  function getEmailFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("email");
  }

  function safeGetLeads() {
    try {
      if (!window.ZAStorage) throw new Error("ZAStorage não existe");
      return window.ZAStorage.getLeads();
    } catch (e) {
      console.error("Erro ao acessar storage:", e);
      return [];
    }
  }

  function loadLead() {
    const email = getEmailFromURL();

    console.log("EMAIL DA URL:", email);

    if (!email) {
      alert("Email não veio na URL");
      return;
    }

    const leads = safeGetLeads();
    console.log("LEADS:", leads);

    const lead = leads.find(l => l.email === email);

    if (!lead) {
      alert("Lead não encontrado");
      return;
    }

    console.log("LEAD ENCONTRADO:", lead);

    nomeEl.textContent = lead.nome;
    emailEl.textContent = lead.email;

    resumoEl.innerHTML = `<p>Lead carregado com sucesso.</p>`;

    setupActions(lead);
  }

  function setupActions(lead) {
    console.log("SETUP ACTIONS");

    if (relatorioBtn) {
      relatorioBtn.href = `../relatorio/?email=${encodeURIComponent(lead.email)}`;
      relatorioBtn.target = "_blank";
    }

    if (converterBtn) {
      converterBtn.onclick = () => {
        console.log("CLICOU CONVERTER");
        window.ZAStorage.convertLeadToCliente(lead.email);
        window.location.href = "../clientes/";
      };
    }

    if (arquivarBtn) {
      arquivarBtn.onclick = () => {
        console.log("CLICOU ARQUIVAR");
      };
    }

    if (excluirBtn) {
      excluirBtn.onclick = () => {
        console.log("CLICOU EXCLUIR");
      };
    }
  }

  loadLead();
});