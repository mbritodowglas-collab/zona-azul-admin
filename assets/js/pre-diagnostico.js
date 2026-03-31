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

  function getSortedLeads() {
    return window.ZAStorage
      .getLeads()
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
  }

  function renderLeads() {
    const { tableBody, emptyLeads } = getElements();
    if (!tableBody || !emptyLeads) return;

    const leads = getSortedLeads();
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
            <span class="lead-name">${lead.nome || "Sem nome"}</span>

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
                data-email="${lead.email || ""}"
                data-nome="${lead.nome || ""}"
                type="button"
              >
                Converter
              </button>

              <button
                class="btn-icon danger btn-delete"
                data-email="${lead.email || ""}"
                data-nome="${lead.nome || ""}"
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

  async function convertLead(email, nome) {
    if (!email) {
      alert("Lead sem email válido para conversão.");
      return;
    }

    const converted = window.ZAStorage.convertLeadToCliente(email);

    if (!converted) {
      alert("Não foi possível converter este lead.");
      return;
    }

    const syncResult = await window.ZAStorage.syncNow();

    if (!syncResult?.ok) {
      alert(`Lead convertido localmente, mas houve falha ao sincronizar com o banco: ${syncResult?.error || "erro desconhecido"}`);
      return;
    }

    closeActionModal();
    renderLeads();
    console.log("[Pré-diagnóstico] Lead convertido com sucesso:", nome || email);
  }

  async function deleteLead(email, nome) {
    if (!email) {
      alert("Lead sem email válido para exclusão.");
      return;
    }

    const removed = window.ZAStorage.removeLead(email);

    if (!removed) {
      alert("Não foi possível excluir este lead.");
      return;
    }

    const syncResult = await window.ZAStorage.syncNow();

    if (!syncResult?.ok) {
      alert(`Lead removido localmente, mas houve falha ao sincronizar com o banco: ${syncResult?.error || "erro desconhecido"}`);
      return;
    }

    closeActionModal();
    renderLeads();
    console.log("[Pré-diagnóstico] Lead excluído com sucesso:", nome || email);
  }

  function bindActionButtons() {
    document.querySelectorAll(".btn-convert").forEach((btn) => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        openActionModal({
          title: "Converter lead em cliente",
          subtitle: "Esse lead sairá do pré-diagnóstico e entrará na área de clientes.",
          text: `Deseja converter ${nome || email} em cliente?`,
          confirmLabel: "Converter",
          onConfirm: async () => {
            await convertLead(email, nome);
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
          text: `Deseja excluir ${nome || email}?`,
          confirmLabel: "Excluir",
          onConfirm: async () => {
            await deleteLead(email, nome);
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

    confirmActionBtn?.addEventListener("click", async () => {
      if (typeof pendingAction === "function") {
        await pendingAction();
      }
    });

    actionModal?.addEventListener("click", (event) => {
      if (event.target === actionModal) {
        closeActionModal();
      }
    });
  }

  async function init() {
    await window.ZAStorage.init({ force: true });
    bindModalEvents();
    setPublicLink();
    renderLeads();
  }

  return {
    init,
    renderLeads
  };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAPreDiagnostico.init();
});