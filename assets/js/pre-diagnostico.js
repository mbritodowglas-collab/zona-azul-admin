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
              <a class="btn small secondary" href="../relatorio/index.html?id=${encodeURIComponent(lead.id)}" target="_blank">
                Relatório
              </a>

              <button
                class="btn small btn-convert"
                data-email="${lead.email}"
                data-nome="${lead.nome}"
                type="button"
              >
                Converter
              </button>

              <button
                class="btn small secondary btn-archive"
                data-email="${lead.email}"
                data-nome="${lead.nome}"
                type="button"
              >
                Arquivar
              </button>

              <button
                class="btn-icon danger btn-delete"
                data-email="${lead.email}"
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

    bindActionButtons();
  }

  function bindActionButtons() {
    document.querySelectorAll(".btn-convert").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        const ok = confirm(`Converter ${nome} em cliente?`);
        if (!ok) return;

        const converted = window.ZAStorage.convertLeadToCliente(email);

        if (!converted) {
          alert("Não foi possível converter este lead.");
          return;
        }

        renderLeads();
      });
    });

    document.querySelectorAll(".btn-archive").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        const ok = confirm(`Arquivar ${nome}?`);
        if (!ok) return;

        const archived = window.ZAStorage.archiveLead(email);

        if (!archived) {
          alert("Não foi possível arquivar este lead.");
          return;
        }

        renderLeads();
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        const ok = confirm(`Deseja excluir ${nome}?`);
        if (!ok) return;

        const removed = window.ZAStorage.removeLead(email);

        if (!removed) {
          alert("Não foi possível excluir este lead.");
          return;
        }

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
