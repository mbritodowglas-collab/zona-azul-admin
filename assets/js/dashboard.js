(() => {
  const leads = window.ZAStorage.getLeads();

  const total = leads.length;
  const novos = leads.filter(lead => lead.status === "novo").length;
  const convertidos = leads.filter(lead => lead.status === "convertido").length;
  const media = total
    ? (leads.reduce((acc, lead) => acc + Number(lead.media_geral || 0), 0) / total).toFixed(1)
    : "0.0";

  const leadsEl = document.getElementById("stat-leads");
  const novosEl = document.getElementById("stat-novos");
  const convertidosEl = document.getElementById("stat-convertidos");
  const mediaEl = document.getElementById("stat-media");
  const linkEl = document.getElementById("public-link-box");

  if (leadsEl) leadsEl.textContent = total;
  if (novosEl) novosEl.textContent = novos;
  if (convertidosEl) convertidosEl.textContent = convertidos;
  if (mediaEl) mediaEl.textContent = media;
  if (linkEl) linkEl.textContent = `${window.location.origin}${window.location.pathname.replace("index.html", "")}pre-diagnostico/`;
})();