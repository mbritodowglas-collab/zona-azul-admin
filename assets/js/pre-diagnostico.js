(() => {
  const tableBody = document.getElementById("leads-table-body");
  const emptyLeads = document.getElementById("empty-leads");
  const publicFormLinkBox = document.getElementById("public-form-link-box");

  function statusClass(status) {
    if (status === "convertido") return "success";
    if (status === "arquivado") return "warning";
    if (status === "perdido") return "danger";
    return "warning";
  }

  function renderLeads() {
    const leads = window.ZAStorage
      .getLeads()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    tableBody.innerHTML = "";

    if (!leads.length) {
      emptyLeads.classList.remove("hidden");
      return;
    }

    emptyLeads.classList.add("hidden");

    leads.forEach((lead) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${lead.nome}</td>
        <td>${lead.email}</td>
        <td>${lead.origem || "-"}</td>
        <td>${window.ZACalculos.pillarLabels[lead.pilar_mais_baixo] || "—"}</td>
        <td>${lead.media_geral}</td>
        <td>
          <span class="chip ${statusClass(lead.status)}">
            ${lead.status || "novo"}
          </span>
        </td>
        <td>
          <a class="btn" href="../lead/?email=${encodeURIComponent(lead.email)}">
            Abrir
          </a>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  // 🔧 Correção do link público (resolve bug do index.htmlformulario)
  function setPublicLink() {
    if (!publicFormLinkBox) return;

    const origin = window.location.origin;

    // remove qualquer coisa depois de /pre-diagnostico/
    const basePath = window.location.pathname.split("/pre-diagnostico")[0];

    publicFormLinkBox.textContent = `${origin}${basePath}/formulario/`;
  }

  setPublicLink();
  renderLeads();
})();