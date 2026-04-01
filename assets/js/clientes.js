document.addEventListener("DOMContentLoaded", async () => {
  const tbody = document.getElementById("clientes-tbody");
  const emptyState = document.getElementById("clientes-empty");

  const filtroBusca = document.getElementById("filtro-busca");
  const filtroStatus = document.getElementById("filtro-status");
  const filtroFase = document.getElementById("filtro-fase");
  const limparFiltrosBtn = document.getElementById("limpar-filtros-btn");

  const heroTotalClientes = document.getElementById("hero-total-clientes");
  const heroTotalAtivos = document.getElementById("hero-total-ativos");
  const heroTotalArquivados = document.getElementById("hero-total-arquivados");

  const summaryTotal = document.getElementById("summary-total");
  const summaryAtivos = document.getElementById("summary-ativos");
  const summaryArquivados = document.getElementById("summary-arquivados");
  const summaryAndamento = document.getElementById("summary-andamento");

  let clientes = [];
  let clientesFiltrados = [];

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  }

  function getClienteStatus(cliente) {
    const status = normalize(cliente?.status);
    if (!status) return "ativo";
    return status;
  }

  function getClienteFase(cliente) {
    const fase = cliente?.fase_atual ?? cliente?.fase ?? "";
    return String(fase || "");
  }

  function getClienteFaseNome(cliente) {
    return cliente?.fase_nome || (getClienteFase(cliente) ? `Fase ${getClienteFase(cliente)}` : "—");
  }

  function getClienteObjetivo(cliente) {
    return (
      cliente?.objetivo ||
      cliente?.dadosBaseEditados?.objetivo ||
      cliente?.preDiagnostico?.objetivo ||
      cliente?.preDiagnostico?.objetivo_principal ||
      "—"
    );
  }

  function getClienteUpdatedAt(cliente) {
    return cliente?.updatedAt || cliente?.updated_at || cliente?.data_inicio || null;
  }

  function getClienteCidade(cliente) {
    return cliente?.cidade || cliente?.preDiagnostico?.cidade || "";
  }

  function getClienteEmail(cliente) {
    return cliente?.email || cliente?.preDiagnostico?.email || "";
  }

  function getClienteNome(cliente) {
    return cliente?.nome || cliente?.preDiagnostico?.nome || "Cliente sem nome";
  }

  function getStatusClass(status) {
    const normalized = normalize(status);
    if (normalized === "arquivado") return "arquivado";
    if (normalized === "inativo") return "inativo";
    return "ativo";
  }

  function getResumoCounts(base) {
    const total = base.length;
    const ativos = base.filter((c) => getClienteStatus(c) !== "arquivado").length;
    const arquivados = base.filter((c) => getClienteStatus(c) === "arquivado").length;
    const andamento = base.filter((c) => {
      const fase = Number(getClienteFase(c) || 0);
      return getClienteStatus(c) !== "arquivado" && fase > 0 && fase < 6;
    }).length;

    return { total, ativos, arquivados, andamento };
  }

  function updateResumo(base) {
    const { total, ativos, arquivados, andamento } = getResumoCounts(base);

    heroTotalClientes.textContent = `${total} clientes`;
    heroTotalAtivos.textContent = `${ativos} ativos`;
    heroTotalArquivados.textContent = `${arquivados} arquivados`;

    summaryTotal.textContent = total;
    summaryAtivos.textContent = ativos;
    summaryArquivados.textContent = arquivados;
    summaryAndamento.textContent = andamento;
  }

  function applyFilters() {
    const busca = normalize(filtroBusca.value);
    const status = filtroStatus.value;
    const fase = filtroFase.value;

    clientesFiltrados = clientes.filter((cliente) => {
      const nome = normalize(getClienteNome(cliente));
      const email = normalize(getClienteEmail(cliente));
      const cidade = normalize(getClienteCidade(cliente));
      const objetivo = normalize(getClienteObjetivo(cliente));
      const faseAtual = getClienteFase(cliente);
      const statusAtual = getClienteStatus(cliente);

      const matchBusca =
        !busca ||
        nome.includes(busca) ||
        email.includes(busca) ||
        cidade.includes(busca) ||
        objetivo.includes(busca);

      const matchStatus =
        status === "todos" ||
        statusAtual === status;

      const matchFase =
        fase === "todas" ||
        String(faseAtual) === String(fase);

      return matchBusca && matchStatus && matchFase;
    });
  }

  function renderEmptyState() {
    const hasItems = clientesFiltrados.length > 0;
    emptyState.style.display = hasItems ? "none" : "block";
  }

  function getActionButtons(cliente) {
    const status = getClienteStatus(cliente);
    const id = encodeURIComponent(cliente.id);

    const base = [
      `<a class="action-link" href="../cliente/index.html?id=${id}">Abrir</a>`
    ];

    if (status === "arquivado") {
      base.push(`<button class="action-btn" data-action="reativar" data-id="${escapeHtml(cliente.id)}" type="button">Reativar</button>`);
    } else {
      base.push(`<button class="action-btn" data-action="arquivar" data-id="${escapeHtml(cliente.id)}" type="button">Arquivar</button>`);
    }

    return base.join("");
  }

  function renderTable() {
    tbody.innerHTML = clientesFiltrados.map((cliente) => {
      const nome = escapeHtml(getClienteNome(cliente));
      const email = escapeHtml(getClienteEmail(cliente) || "Sem email");
      const status = getClienteStatus(cliente);
      const faseNome = escapeHtml(getClienteFaseNome(cliente));
      const objetivo = escapeHtml(getClienteObjetivo(cliente));
      const updatedAt = formatDate(getClienteUpdatedAt(cliente));

      return `
        <tr>
          <td>
            <div class="cliente-main">
              <strong>${nome}</strong>
              <span>${email}</span>
            </div>
          </td>
          <td>
            <span class="status-pill ${getStatusClass(status)}">${escapeHtml(status)}</span>
          </td>
          <td>${faseNome}</td>
          <td>${objetivo}</td>
          <td>${updatedAt}</td>
          <td>
            <div class="table-actions">
              ${getActionButtons(cliente)}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    renderEmptyState();
    bindRowActions();
  }

  async function syncAfterAction() {
    const result = await window.ZAStorage.syncNow();
    if (!result?.ok) {
      console.warn("Falha ao sincronizar clientes:", result?.error);
    }
  }

  async function arquivarCliente(id) {
    const confirmado = window.confirm("Deseja arquivar este cliente?");
    if (!confirmado) return;

    const ok = window.ZAStorage.archiveCliente(id);
    if (!ok) {
      alert("Não foi possível arquivar o cliente.");
      return;
    }

    await syncAfterAction();
    await reload();
  }

  async function reativarCliente(id) {
    const confirmado = window.confirm("Deseja reativar este cliente?");
    if (!confirmado) return;

    const ok = window.ZAStorage.reactivateCliente(id);
    if (!ok) {
      alert("Não foi possível reativar o cliente.");
      return;
    }

    await syncAfterAction();
    await reload();
  }

  function bindRowActions() {
    tbody.querySelectorAll("[data-action='arquivar']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await arquivarCliente(id);
      });
    });

    tbody.querySelectorAll("[data-action='reativar']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await reativarCliente(id);
      });
    });
  }

  function bindFilters() {
    filtroBusca.addEventListener("input", () => {
      applyFilters();
      renderTable();
    });

    filtroStatus.addEventListener("change", () => {
      applyFilters();
      renderTable();
    });

    filtroFase.addEventListener("change", () => {
      applyFilters();
      renderTable();
    });

    limparFiltrosBtn.addEventListener("click", () => {
      filtroBusca.value = "";
      filtroStatus.value = "todos";
      filtroFase.value = "todas";
      applyFilters();
      renderTable();
    });
  }

  async function reload() {
    await window.ZAStorage.init({ force: true });
    clientes = window.ZAStorage.getClientes() || [];

    clientes.sort((a, b) => {
      const dateA = new Date(getClienteUpdatedAt(a) || 0).getTime();
      const dateB = new Date(getClienteUpdatedAt(b) || 0).getTime();
      return dateB - dateA;
    });

    updateResumo(clientes);
    applyFilters();
    renderTable();
  }

  await reload();
  bindFilters();
});