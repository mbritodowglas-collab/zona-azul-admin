(() => {
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");

  function setAdminPage(pageId) {
    navLinks.forEach(item => item.classList.remove("active"));
    document.querySelector(`.nav-link[data-page="${pageId}"]`)?.classList.add("active");

    pages.forEach(page => page.classList.add("hidden"));
    document.getElementById(pageId)?.classList.remove("hidden");

    document.getElementById("adminApp").classList.remove("hidden");
    document.getElementById("publicPrePage").classList.add("hidden");
    document.getElementById("reportPage").classList.add("hidden");
  }

  function setupAdminNav() {
    navLinks.forEach(link => {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        setAdminPage(this.dataset.page);
      });
    });
  }

  function routeApp() {
    const hash = window.location.hash || "";
    const adminApp = document.getElementById("adminApp");
    const publicPrePage = document.getElementById("publicPrePage");
    const reportPage = document.getElementById("reportPage");

    if (hash === "#public-pre") {
      adminApp.classList.add("hidden");
      reportPage.classList.add("hidden");
      publicPrePage.classList.remove("hidden");
      return;
    }

    if (hash.startsWith("#report/")) {
      const email = decodeURIComponent(hash.replace("#report/", ""));
      adminApp.classList.add("hidden");
      publicPrePage.classList.add("hidden");
      reportPage.classList.remove("hidden");
      window.ZARelatorio.renderReport(email);
      return;
    }

    adminApp.classList.remove("hidden");
    publicPrePage.classList.add("hidden");
    reportPage.classList.add("hidden");
  }

  setupAdminNav();
  window.ZAAdmin.setupAdminActions();
  window.ZAPublico.setupPreForm();
  window.ZAAdmin.renderLeads();
  window.ZAAdmin.updateDashboard();
  routeApp();

  window.addEventListener("hashchange", routeApp);

  document.getElementById("printReportBtn")?.addEventListener("click", () => {
    window.print();
  });
})();