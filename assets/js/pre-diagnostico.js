(() => {
  const tableBody = document.getElementById("leads-table-body");
  const emptyLeads = document.getElementById("empty-leads");
  const publicFormLinkBox = document.getElementById("public-form-link-box");

  function renderLeads() {
    if (!tableBody || !emptyLeads) return;

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
        <td>
          <div class="lead-row">
            <span class="lead-name">${lead.nome}</span>

            <div class="lead-actions-inline">
              <a class="btn small" href="../lead/index.html?id=${encodeURIComponent(lead.id)}">
                Abrir
              </a>

              <button
                class="btn-icon danger btn-delete"
                data-id="${lead.id}"
                data-nome="${lead.nome}"
                title="Excluir lead"
                aria-label="Excluir lead"
                type="button"
              >
                🗑
              </button>
            </div>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    bindDeleteButtons();
  }

  function bindDeleteButtons() {
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const nome = btn.dataset.nome;

        const ok = confirm(`Deseja excluir ${nome}?`);
        if (!ok) return;

        const leads = window.ZAStorage.getLeads();
        const lead = leads.find((item) => String(item.id).trim() === String(id).trim());

        if (!lead) {
          alert("Lead não encontrado para exclusão.");
          return;
        }

        window.ZAStorage.removeLead(lead.email);
        renderLeads();
      });
    });
  }

  function setPublicLink() {
    if (!publicFormLinkBox) return;

    const origin = window.location.origin;
    const basePath = window.location.pathname.split("/pre-diagnostico")[0];

    publicFormLinkBox.textContent = `${origin}${basePath}/formulario/`;
  }

  setPublicLink();
  renderLeads();
})();