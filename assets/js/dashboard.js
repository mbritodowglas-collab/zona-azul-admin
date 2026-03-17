(() => {
  const data = window.ZAStorage.getData();
  const leads = data.leads || [];
  const clientes = data.clientes || [];

  const total = leads.length;
  const novos = leads.filter(lead => lead.status === "novo").length;
  const convertidos = leads.filter(lead => lead.status === "convertido").length;
  const clientesAtivos = clientes.filter(cliente => cliente.status === "ativo").length;

  document.getElementById("stat-leads").textContent = total;
  document.getElementById("stat-novos").textContent = novos;
  document.getElementById("stat-convertidos").textContent = convertidos;
  document.getElementById("stat-clientes").textContent = clientesAtivos;

  const basePath = window.location.origin + window.location.pathname.replace("index.html", "");
  document.getElementById("public-link-box").textContent = `${basePath}pre-diagnostico/`;
})();