window.ZADashboard = (() => {
  function renderStats() {
    const data = window.ZAStorage.getData();
    const leads = data.leads || [];
    const clientes = data.clientes || [];

    const total = leads.length;
    const novos = leads.filter((lead) => lead.status === "novo").length;
    const convertidos = leads.filter((lead) => lead.status === "convertido").length;
    const clientesAtivos = clientes.filter((cliente) => cliente.status === "ativo").length;

    const statLeads = document.getElementById("stat-leads");
    const statNovos = document.getElementById("stat-novos");
    const statConvertidos = document.getElementById("stat-convertidos");
    const statClientes = document.getElementById("stat-clientes");

    if (statLeads) statLeads.textContent = total;
    if (statNovos) statNovos.textContent = novos;
    if (statConvertidos) statConvertidos.textContent = convertidos;
    if (statClientes) statClientes.textContent = clientesAtivos;
  }

  function renderPublicLink() {
    const publicLinkBox = document.getElementById("public-link-box");
    if (!publicLinkBox) return;

    const basePath = window.location.origin + window.location.pathname.replace("index.html", "");
    publicLinkBox.textContent = `${basePath}pre-diagnostico/`;
  }

  function init() {
    renderStats();
    renderPublicLink();
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAStorage.init();
  window.ZADashboard.init();
});