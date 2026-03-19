(() => {
  const tableBody = document.getElementById("leads-table-body");
  const emptyLeads = document.getElementById("empty-leads");
  const publicFormLinkBox = document.getElementById("public-form-link-box");

  const actionModal = document.getElementById("action-modal");
  const actionModalTitle = document.getElementById("action-modal-title");
  const actionModalSubtitle = document.getElementById("action-modal-subtitle");
  const actionModalText = document.getElementById("action-modal-text");
  const cancelActionBtn = document.getElementById("cancel-action-btn");
  const confirmActionBtn = document.getElementById("confirm-action-btn");

  let pendingAction = null;

  function openActionModal({ title, subtitle, text, confirmLabel = "Confirmar", onConfirm }) {
    pendingAction = onConfirm;
    actionModalTitle.textContent = title;
    actionModalSubtitle.textContent = subtitle;
    actionModalText.textContent = text;
    confirmActionBtn.textContent = confirmLabel;
    actionModal.classList.remove("hidden");
  }

  function closeActionModal() {
    pendingAction = null;
    actionModal.classList.add("hidden");
  }

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
              <a
                class="btn small secondary"
                href="../relatorio/index.html?id=${encodeURIComponent(lead.id)}"
                target="_blank"
              >
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

        openActionModal({
          title: "Converter lead em cliente",
          subtitle: "Esse lead sairá do pré-diagnóstico e entrará na área de clientes.",
          text: `Deseja converter ${nome} em cliente?`,
          confirmLabel: "Converter",
          onConfirm: () => {
            const converted = window.ZAStorage.convertLeadToCliente(email);

            if (!converted) {
              closeActionModal();
              alert("Não foi possível converter este lead.");
              return;
            }

            closeActionModal();
            renderLeads();
          }
        });
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        openActionModal({
          title: "Excluir lead",
          subtitle: "Essa ação remove o lead permanentemente.",
          text: `Deseja excluir ${nome}?`,
          confirmLabel: "Excluir",
          onConfirm: () => {
            const removed = window.ZAStorage.removeLead(email);

            if (!removed) {
              closeActionModal();
              alert("Não foi possível excluir este lead.");
              return;
            }

            closeActionModal();
            renderLeads();
          }
        });
      });
    });
  }

  function setPublicLink() {
    if (!publicFormLinkBox) return;

    const origin = window.location.origin;
    const basePath = window.location.pathname.split("/pre-diagnostico")[0];

    publicFormLinkBox.textContent = `${origin}${basePath}/formulario/`;
  }

  cancelActionBtn?.addEventListener("click", closeActionModal);

  confirmActionBtn?.addEventListener("click", () => {
    if (typeof pendingAction === "function") {
      pendingAction();
    }
  });

  actionModal?.addEventListener("click", (event) => {
    if (event.target === actionModal) {
      closeActionModal();
    }
  });

  setPublicLink();
  renderLeads();
})();