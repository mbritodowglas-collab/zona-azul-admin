(() => {
  const tableBody = document.getElementById("leads-table-body");
  const emptyLeads = document.getElementById("empty-leads");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const publicFormLinkBox = document.getElementById("public-form-link-box");

  const convertModal = document.getElementById("convert-modal");
  const convertModalText = document.getElementById("convert-modal-text");
  const cancelConvertBtn = document.getElementById("cancel-convert-btn");
  const confirmConvertBtn = document.getElementById("confirm-convert-btn");

  let leadEmailToConvert = null;

  function statusClass(status) {
    if (status === "convertido") return "success";
    if (status === "perdido") return "danger";
    return "warning";
  }

  function openConvertModal(email, nome) {
    leadEmailToConvert = email;
    convertModalText.textContent = `Deseja converter ${nome} em cliente?`;
    convertModal.classList.remove("hidden");
  }

  function closeConvertModal() {
    leadEmailToConvert = null;
    convertModal.classList.add("hidden");
  }

  function renderLeads() {
    const leads = window.ZAStorage.getLeads().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
            ${lead.status !== "convertido" ? `<button class="btn btn-convert" data-email="${lead.email}" data-nome="${lead.nome}">Converter</button>` : ""}
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
        openConvertModal(email, nome);
      });
    });
  }

  cancelConvertBtn?.addEventListener("click", closeConvertModal);

  confirmConvertBtn?.addEventListener("click", () => {
    if (!leadEmailToConvert) return;

    window.ZAStorage.convertLeadToCliente(leadEmailToConvert);
    closeConvertModal();
    renderLeads();
  });

  convertModal?.addEventListener("click", (event) => {
    if (event.target === convertModal) {
      closeConvertModal();
    }
  });

  clearAllBtn?.addEventListener("click", () => {
    const ok = confirm("Isso apaga leads e clientes locais. Deseja continuar?");
    if (!ok) return;
    window.ZAStorage.clearAll();
    location.reload();
  });

  if (publicFormLinkBox) {
    const base = window.location.origin + window.location.pathname.replace("pre-diagnostico/", "");
    publicFormLinkBox.textContent = `${base}formulario/`;
  }

  renderLeads();
})();