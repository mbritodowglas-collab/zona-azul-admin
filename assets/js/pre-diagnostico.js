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

  function statusClass(status) {
    if (status === "convertido") return "success";
    if (status === "arquivado") return "warning";
    if (status === "perdido") return "danger";
    return "warning";
  }

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
        <td><span class="chip ${statusClass(lead.status)}">${lead.status}</span></td>
        <td>
          <div class="actions">
            <a class="btn secondary" href="../relatorio/?email=${encodeURIComponent(lead.email)}">Relatório</a>

            ${lead.status !== "arquivado" ? `
              <button class="btn secondary btn-archive" data-email="${lead.email}" data-nome="${lead.nome}">
                Arquivar
              </button>
            ` : ""}

            <button class="btn danger btn-delete" data-email="${lead.email}" data-nome="${lead.nome}">
              Excluir
            </button>

            ${lead.status !== "arquivado" ? `
              <button class="btn btn-convert" data-email="${lead.email}" data-nome="${lead.nome}">
                Converter
              </button>
            ` : ""}
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    bindLeadButtons();
  }

  function bindLeadButtons() {
    document.querySelectorAll(".btn-convert").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        openActionModal({
          title: "Converter lead em cliente",
          subtitle: "Essa ação move o lead do pré-diagnóstico para a área de clientes.",
          text: `Deseja converter ${nome} em cliente?`,
          confirmLabel: "Confirmar conversão",
          onConfirm: () => {
            window.ZAStorage.convertLeadToCliente(email);
            closeActionModal();
            renderLeads();
          }
        });
      });
    });

    document.querySelectorAll(".btn-archive").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        openActionModal({
          title: "Arquivar lead",
          subtitle: "O lead continuará salvo, mas sairá do fluxo ativo de triagem.",
          text: `Deseja arquivar ${nome}?`,
          confirmLabel: "Arquivar",
          onConfirm: () => {
            window.ZAStorage.archiveLead(email);
            closeActionModal();
            renderLeads();
          }
        });
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const nome = btn.dataset.nome;

        openActionModal({
          title: "Excluir lead",
          subtitle: "Essa ação remove permanentemente o lead do pré-diagnóstico.",
          text: `Deseja excluir ${nome}?`,
          confirmLabel: "Excluir",
          onConfirm: () => {
            window.ZAStorage.removeLead(email);
            closeActionModal();
            renderLeads();
          }
        });
      });
    });
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

  if (publicFormLinkBox) {
    const origin = window.location.origin;
    const repoBase = window.location.pathname.replace(/pre-diagnostico\/?$/, "");
    publicFormLinkBox.textContent = `${origin}${repoBase}formulario/`;
  }

  renderLeads();
})();