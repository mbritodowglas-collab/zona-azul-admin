(() => {
  const form = document.getElementById("public-pre-form");
  const tableBody = document.getElementById("leads-table-body");
  const emptyLeads = document.getElementById("empty-leads");
  const detailCard = document.getElementById("lead-detail-card");
  const detailBody = document.getElementById("lead-detail-body");
  const togglePublicFormBtn = document.getElementById("toggle-public-form-btn");
  const publicFormCard = document.getElementById("public-form-card");
  const clearAllBtn = document.getElementById("clear-all-btn");

  function statusClass(status) {
    if (status === "convertido") return "success";
    if (status === "perdido") return "danger";
    return "warning";
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
            <button class="btn secondary btn-view" data-email="${lead.email}">Ver</button>
            ${lead.status !== "convertido" ? `<button class="btn btn-convert" data-email="${lead.email}">Converter</button>` : ""}
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    bindLeadButtons();
  }

  function bindLeadButtons() {
    document.querySelectorAll(".btn-view").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const lead = window.ZAStorage.getLeads().find(item => item.email === email);
        if (!lead) return;
        renderLeadDetail(lead);
      });
    });

    document.querySelectorAll(".btn-convert").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const ok = confirm("Converter este lead em cliente?");
        if (!ok) return;

        window.ZAStorage.convertLeadToCliente(email);
        renderLeads();

        const lead = window.ZAStorage.getLeads().find(item => item.email === email);
        if (lead) renderLeadDetail(lead);
      });
    });
  }

  function renderLeadDetail(lead) {
    detailCard.classList.remove("hidden");

    const gapsHtml = (lead.top_3_gaps || [])
      .map(item => `<span class="chip warning">${window.ZACalculos.pillarLabels[item.key]} (${item.score})</span>`)
      .join(" ");

    detailBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-box">
          <h4>Identificação</h4>
          <p><strong>Nome:</strong> ${lead.nome}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Faixa etária:</strong> ${lead.faixa_etaria}</p>
          <p><strong>Origem:</strong> ${lead.origem}</p>
        </div>

        <div class="detail-box">
          <h4>Resumo do Radar</h4>
          <p><strong>Média geral:</strong> ${lead.media_geral}</p>
          <p><strong>Pilar mais baixo:</strong> ${window.ZACalculos.pillarLabels[lead.pilar_mais_baixo] || "—"}</p>
          <p><strong>Top 3 gaps:</strong><br>${gapsHtml || "Nenhum gap prioritário."}</p>
        </div>

        <div class="detail-box">
          <h4>Histórico</h4>
          <p><strong>Exp. com personal:</strong> ${lead.exp_personal}</p>
          <p><strong>Exp. com emagrecimento:</strong> ${lead.exp_emagrecimento}</p>
          <p><strong>O que funcionou:</strong> ${lead.o_que_funcionou || "-"}</p>
          <p><strong>Por que parou:</strong> ${lead.por_que_parou}</p>
        </div>

        <div class="detail-box">
          <h4>Contexto final</h4>
          <p><strong>Desafio atual:</strong> ${lead.desafio_atual}</p>
          <p><strong>Meta 6 meses:</strong> ${lead.meta_6_meses}</p>
          <p><strong>Status:</strong> ${lead.status}</p>
        </div>
      </div>
    `;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      faixa_etaria: document.getElementById("faixa_etaria").value,
      origem: document.getElementById("origem").value,
      exp_personal: document.getElementById("exp_personal").value,
      exp_emagrecimento: document.getElementById("exp_emagrecimento").value,
      o_que_funcionou: document.getElementById("o_que_funcionou").value,
      por_que_parou: document.getElementById("por_que_parou").value,
      desafio_atual: document.getElementById("desafio_atual").value,
      meta_6_meses: document.getElementById("meta_6_meses").value,
      score_movimento: document.getElementById("score_movimento").value,
      score_alimentacao: document.getElementById("score_alimentacao").value,
      score_sono: document.getElementById("score_sono").value,
      score_proposito: document.getElementById("score_proposito").value,
      score_social: document.getElementById("score_social").value,
      score_estresse: document.getElementById("score_estresse").value
    };

    const erro = window.ZACalculos.validarFormulario(payload);
    if (erro) {
      alert(erro);
      return;
    }

    const lead = window.ZACalculos.criarLead(payload);
    window.ZAStorage.upsertLead(lead);
    form.reset();
    publicFormCard.classList.add("hidden");
    renderLeads();
    renderLeadDetail(lead);
    alert("Pré-diagnóstico salvo com sucesso.");
  });

  togglePublicFormBtn?.addEventListener("click", () => {
    publicFormCard.classList.toggle("hidden");
  });

  clearAllBtn?.addEventListener("click", () => {
    const ok = confirm("Isso apaga leads e clientes locais. Deseja continuar?");
    if (!ok) return;
    window.ZAStorage.clearAll();
    location.reload();
  });

  renderLeads();
})();