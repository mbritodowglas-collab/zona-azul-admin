window.ZADashboard = (() => {
  let deferredPrompt = null;

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

    return `${origin}${basePath}formulario-publico/`;
  }

  function enablePWA() {

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission().then((permission) => {
    console.log("[Trackion] Permissão de notificação:", permission);
  });
}
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "./manifest.webmanifest";
      document.head.appendChild(manifest);
    }

    const theme = document.createElement("meta");
    theme.name = "theme-color";
    theme.content = "#020816";
    document.head.appendChild(theme);

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(console.error);
      });
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      showInstallButton();
    });
  }

  function showInstallButton() {
    if (document.getElementById("install-trackion-btn")) return;

    const target = document.querySelector(".hero-chips");
    if (!target) return;

    const button = document.createElement("button");
    button.id = "install-trackion-btn";
    button.className = "btn secondary";
    button.style.marginTop = "10px";
    button.textContent = "Instalar App";

    button.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        button.textContent = "App instalado";
      }

      deferredPrompt = null;
    });

    target.parentNode.appendChild(button);
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
    setText("insight-conversao", `${taxaConversao}%`);
    setText("insight-arquivados", String(clientesArquivados));
    setText("insight-aguardando", String(leadsNovos));
    setText("insight-base-clientes", String(baseTotalClientes));
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
    enablePWA();
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