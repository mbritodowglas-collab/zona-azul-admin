window.ZAPreDiagnostico = (() => {
  let pendingAction = null;

  function getElements() {
    return {
      tableBody: document.getElementById("leads-table-body"),
      emptyLeads: document.getElementById("empty-leads"),
      publicFormLinkBox: document.getElementById("public-form-link-box"),
      actionModal: document.getElementById("action-modal"),
      actionModalTitle: document.getElementById("action-modal-title"),
      actionModalSubtitle: document.getElementById("action-modal-subtitle"),
      actionModalText: document.getElementById("action-modal-text"),
      cancelActionBtn: document.getElementById("cancel-action-btn"),
      confirmActionBtn: document.getElementById("confirm-action-btn"),
    };
  }

  function openActionModal({ title, subtitle, text, confirmLabel = "Confirmar", onConfirm }) {
    const {
      actionModal,
      actionModalTitle,
      actionModalSubtitle,
      actionModalText,
      confirmActionBtn,
    } = getElements();

    if (!actionModal || !confirmActionBtn) return;

    pendingAction = onConfirm;
    if (actionModalTitle) actionModalTitle.textContent = title;
    if (actionModalSubtitle) actionModalSubtitle.textContent = subtitle;
    if (actionModalText) actionModalText.textContent = text;
    confirmActionBtn.textContent = confirmLabel;
    actionModal.classList.remove("hidden");
  }

  function closeActionModal() {
    const { actionModal } = getElements();
    pendingAction = null;
    actionModal?.classList.add("hidden");
  }

  function renderLeads() {
    const { tableBody, emptyLeads } = getElements();
    if (!tableBody || !emptyLeads) return;

    const leads = window.ZAStorage
      .getLeads()
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

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
              window.alert("Não foi possível converter este lead.");
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
              window.alert("Não foi possível excluir este lead.");
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
    const { publicFormLinkBox } = getElements();
    if (!publicFormLinkBox) return;

    const origin = window.location.origin;
    const basePath = window.location.pathname.split("/pre-diagnostico")[0];

    publicFormLinkBox.textContent = `${origin}${basePath}/formulario-publico/`;
  }

  function bindModalEvents() {
    const { cancelActionBtn, confirmActionBtn, actionModal } = getElements();

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
  }

  function init() {
    bindModalEvents();
    setPublicLink();
    renderLeads();
  }

  return {
    init
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAStorage.init();
  window.ZAPreDiagnostico.init();
});