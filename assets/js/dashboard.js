window.ZADashboard = (() => {
  function getData() {
    return window.ZAStorage?.getData?.() || { leads: [], clientes: [] };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function getPublicLink() {
    const origin = window.location.origin;
    const pathname = window.location.pathname;

    const basePath = pathname.endsWith("index.html")
      ? pathname.replace(/index\.html$/, "")
      : pathname.endsWith("/")
        ? pathname
        : `${pathname}/`;

    return `${origin}${basePath}formulario/`;
  }

  function renderStats() {
    const data = getData();
    const leads = Array.isArray(data.leads) ? data.leads : [];
    const clientes = Array.isArray(data.clientes) ? data.clientes : [];

    const totalLeads = leads.length;
    const leadsNovos = leads.filter((lead) => {
      const status = String(lead?.status || "").toLowerCase();
      return !status || status === "novo" || status === "pendente";
    }).length;

    const leadsConvertidos = clientes.filter((cliente) => {
      const origem = String(cliente?.origem || "").toLowerCase();
      return origem.includes("lead") || origem.includes("pré") || origem.includes("pre");
    }).length;

    const clientesAtivos = clientes.filter((cliente) => {
      return String(cliente?.status || "ativo").toLowerCase() !== "arquivado";
    }).length;

    const clientesArquivados = clientes.filter((cliente) => {
      return String(cliente?.status || "").toLowerCase() === "arquivado";
    }).length;

    const baseTotalClientes = clientes.length;
    const taxaConversao = totalLeads > 0
      ? Math.round((baseTotalClientes / totalLeads) * 100)
      : 0;

    setText("stat-leads", String(totalLeads));
    setText("stat-novos", String(leadsNovos));
    setText("stat-convertidos", String(leadsConvertidos));
    setText("stat-clientes", String(clientesAtivos));

    setText("hero-total-clientes", `${baseTotalClientes} cliente${baseTotalClientes === 1 ? "" : "s"}`);
    setText("hero-total-leads", `${totalLeads} lead${totalLeads === 1 ? "" : "s"}`);

    setText(
      "stat-leads-meta",
      totalLeads === 0
        ? "Ainda não há leads cadastrados."
        : `Base atual com ${totalLeads} lead${totalLeads === 1 ? "" : "s"} registrado${totalLeads === 1 ? "" : "s"}.`
    );

    setText(
      "stat-novos-meta",
      leadsNovos === 0
        ? "Nenhum lead aguardando ação."
        : `${leadsNovos} lead${leadsNovos === 1 ? "" : "s"} aguardando revisão ou conversão.`
    );

    setText(
      "stat-convertidos-meta",
      leadsConvertidos === 0
        ? "Nenhuma conversão identificada ainda."
        : `${leadsConvertidos} convers${leadsConvertidos === 1 ? "ão" : "ões"} já consolidadas na base.`
    );

    setText(
      "stat-clientes-meta",
      clientesAtivos === 0
        ? "Nenhum cliente ativo no momento."
        : `${clientesAtivos} cliente${clientesAtivos === 1 ? "" : "s"} em operação ativa.`
    );

    setText("insight-conversao", `${taxaConversao}%`);
    setText("insight-arquivados", String(clientesArquivados));
    setText("insight-aguardando", String(leadsNovos));
    setText("insight-base-clientes", String(baseTotalClientes));

    renderStrategicNote({
      totalLeads,
      leadsNovos,
      leadsConvertidos,
      clientesAtivos,
      clientesArquivados,
      baseTotalClientes,
      taxaConversao
    });
  }

  function renderStrategicNote(stats) {
    const note = document.getElementById("dashboard-strategy-note");
    if (!note) return;

    let text = "";

    if (stats.totalLeads === 0 && stats.baseTotalClientes === 0) {
      text = "O sistema está limpo. O próximo movimento é alimentar a máquina: gerar entradas no formulário e começar a formar base.";
    } else if (stats.leadsNovos > 0) {
      text = `Você tem ${stats.leadsNovos} lead${stats.leadsNovos === 1 ? "" : "s"} aguardando ação. O melhor ROI agora é revisar o pré-diagnóstico e converter o que já está quente.`;
    } else if (stats.clientesAtivos > 0) {
      text = `A operação está rodando com ${stats.clientesAtivos} cliente${stats.clientesAtivos === 1 ? "" : "s"} ativo${stats.clientesAtivos === 1 ? "" : "s"}. O foco agora é manter aderência, histórico e planejamento bem atualizados.`;
    } else {
      text = "A base existe, mas está fria. Vale revisar clientes arquivados, reativar oportunidades e recolocar a esteira em movimento.";
    }

    note.textContent = text;
  }

  function renderPublicLink() {
    const publicLink = getPublicLink();
    setText("public-link-box", publicLink);

    const openBtn = document.getElementById("open-public-link-btn");
    if (openBtn) {
      openBtn.href = publicLink;
    }
  }

  async function copyPublicLink() {
    const publicLink = getPublicLink();
    const button = document.getElementById("copy-public-link-btn");
    const originalText = button?.textContent || "Copiar link";

    try {
      await navigator.clipboard.writeText(publicLink);
      if (button) {
        button.textContent = "Link copiado";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1400);
      }
    } catch {
      if (button) {
        button.textContent = "Copie manualmente";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1800);
      }
    }
  }

  function bindEvents() {
    document.getElementById("copy-public-link-btn")?.addEventListener("click", copyPublicLink);
  }

  function init() {
    renderStats();
    renderPublicLink();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZAStorage.init();
  window.ZADashboard.init();
});