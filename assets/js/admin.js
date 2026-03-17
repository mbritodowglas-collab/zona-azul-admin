window.ZAAdmin = (() => {
  function getStatusClass(status) {
    if (status === "convertido") return "success";
    if (status === "perdido" || status === "sem_resposta") return "danger";
    return "warning";
  }

  function updateDashboard() {
    const leads = window.ZAStorage.getLeads();
    const leadsCount = document.getElementById("dashboardLeadsCount");
    const analiseCount = document.getElementById("dashboardAnaliseCount");
    const convertidosCount = document.getElementById("dashboardConvertidosCount");
    const mediaCount = document.getElementById("dashboardMediaCount");
    const publicLinkBox = document.getElementById("publicLinkBox");

    if (leadsCount) leadsCount.textContent = leads.length;
    if (analiseCount) analiseCount.textContent = leads.filter(lead => lead.status === "novo" || lead.status === "contatado" || lead.status === "follow_up").length;
    if (convertidosCount) convertidosCount.textContent = leads.filter(lead => lead.status === "convertido").length;

    const mediaGeral = leads.length
      ? (leads.reduce((acc, lead) => acc + Number(lead.media_geral || 0), 0) / leads.length).toFixed(1)
      : "0.0";

    if (mediaCount) mediaCount.textContent = mediaGeral;

    if (publicLinkBox) {
      publicLinkBox.textContent = window.location.origin + window.location.pathname + "#public-pre";
    }
  }

  function renderLeads() {
    const leads = window.ZAStorage.getLeads();
    const tableBody = document.getElementById("leadsTableBody");
    const emptyMessage = document.getElementById("noLeadsMessage");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!leads.length) {
      emptyMessage.classList.remove("hidden");
      updateDashboard();
      return;
    }

    emptyMessage.classList.add("hidden");

    leads
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach(lead => {
        const pilar = lead.pilar_mais_baixo ? window.ZACalculos.pillarLabels[lead.pilar_mais_baixo] : "ACIMA DA MÉDIA";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${lead.nome}</td>
          <td>${lead.email}</td>
          <td><span class="chip danger">${pilar}</span></td>
          <td>${lead.media_geral}</td>
          <td><span class="chip ${getStatusClass(lead.status)}">${lead.status}</span></td>
          <td>${lead.por_que_parou || "-"}</td>
          <td>
            <a class="btn secondary" href="#report/${encodeURIComponent(lead.email)}">Relatório</a>
          </td>
        `;
        tableBody.appendChild(row);
      });

    updateDashboard();
  }

  function setupAdminActions() {
    document.getElementById("clearLeadsBtn")?.addEventListener("click", () => {
      const ok = confirm("Deseja apagar todos os leads locais deste navegador?");
      if (!ok) return;
      window.ZAStorage.clearLeads();
      renderLeads();
    });
  }

  return {
    renderLeads,
    updateDashboard,
    setupAdminActions
  };
})();