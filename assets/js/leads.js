(() => {
  const tableBody = document.getElementById("leads-table-body");
  const emptyState = document.getElementById("empty-state");
  const tableWrap = document.getElementById("table-wrap");
  const clearBtn = document.getElementById("clear-leads-btn");

  function statusClass(status) {
    if (status === "convertido") return "success";
    if (status === "perdido") return "danger";
    return "warning";
  }

  function render() {
    const leads = window.ZAStorage.getLeads()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    tableBody.innerHTML = "";

    if (!leads.length) {
      emptyState.classList.remove("hidden");
      tableWrap.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    tableWrap.classList.remove("hidden");

    leads.forEach(lead => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${lead.nome}</td>
        <td>${lead.email}</td>
        <td>${lead.origem || "-"}</td>
        <td>${window.ZACalculos.pillarLabels[lead.pilar_mais_baixo] || "ACIMA DA MÉDIA"}</td>
        <td>${lead.media_geral}</td>
        <td><span class="chip ${statusClass(lead.status)}">${lead.status}</span></td>
        <td>${new Date(lead.created_at).toLocaleDateString("pt-BR")}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  clearBtn?.addEventListener("click", () => {
    const ok = confirm("Deseja apagar todos os leads locais deste navegador?");
    if (!ok) return;
    window.ZAStorage.clearLeads();
    render();
  });

  render();
})();