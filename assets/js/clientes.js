(() => {
  const tableBody = document.getElementById("clientes-table-body");
  const emptyClientes = document.getElementById("empty-clientes");
  const detailCard = document.getElementById("cliente-detail-card");
  const detailBody = document.getElementById("cliente-detail-body");

  function statusClass(status) {
    if (status === "ativo") return "success";
    if (status === "cancelado") return "danger";
    return "warning";
  }

  function renderClientes() {
    const clientes = window.ZAStorage.getClientes().sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));
    tableBody.innerHTML = "";

    if (!clientes.length) {
      emptyClientes.classList.remove("hidden");
      return;
    }

    emptyClientes.classList.add("hidden");

    clientes.forEach((cliente) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.email}</td>
        <td>${cliente.plano || "-"}</td>
        <td>${cliente.fase_nome || "-"}</td>
        <td><span class="chip ${statusClass(cliente.status)}">${cliente.status}</span></td>
        <td>${new Date(cliente.data_inicio).toLocaleDateString("pt-BR")}</td>
        <td><button class="btn secondary btn-open-cliente" data-email="${cliente.email}">Ver</button></td>
      `;
      tableBody.appendChild(tr);
    });

    bindClienteButtons();
  }

  function bindClienteButtons() {
    document.querySelectorAll(".btn-open-cliente").forEach(btn => {
      btn.addEventListener("click", () => {
        const email = btn.dataset.email;
        const cliente = window.ZAStorage.getClientes().find(item => item.email === email);
        if (!cliente) return;
        renderClienteDetail(cliente);
      });
    });
  }

  function renderClienteDetail(cliente) {
    detailCard.classList.remove("hidden");

    detailBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-box">
          <h4>Resumo</h4>
          <p><strong>Nome:</strong> ${cliente.nome}</p>
          <p><strong>Email:</strong> ${cliente.email}</p>
          <p><strong>Data de nascimento:</strong> ${new Date(cliente.data_nascimento + "T00:00:00").toLocaleDateString("pt-BR")}</p>
          <p><strong>Idade:</strong> ${cliente.idade}</p>
          <p><strong>Status:</strong> ${cliente.status}</p>
          <p><strong>Plano:</strong> ${cliente.plano || "-"}</p>
          <p><strong>Fase atual:</strong> ${cliente.fase_nome}</p>
        </div>

        <div class="detail-box">
          <h4>Dados herdados do pré-diagnóstico</h4>
          <p><strong>Média geral:</strong> ${cliente.preDiagnostico.media_geral}</p>
          <p><strong>Pilar mais baixo:</strong> ${window.ZACalculos ? window.ZACalculos.pillarLabels[cliente.preDiagnostico.pilar_mais_baixo] || "-" : cliente.preDiagnostico.pilar_mais_baixo}</p>
          <p><strong>Desafio atual:</strong> ${cliente.preDiagnostico.desafio_atual}</p>
          <p><strong>Meta 6 meses:</strong> ${cliente.preDiagnostico.meta_6_meses}</p>
        </div>

        <div class="detail-box">
          <h4>Diagnóstico completo</h4>
          <p>Em breve.</p>
        </div>

        <div class="detail-box">
          <h4>Planejamento / Periodização / Check-ins / Histórico</h4>
          <p>Em breve.</p>
        </div>
      </div>
    `;
  }

  renderClientes();
})();