document.addEventListener("DOMContentLoaded", async () => {
  if (!window.ZASupabase || !window.ZASupabase.client) {
    console.warn("ZASupabase não carregado");
    return;
  }

  const publicPaths = [
    "/login/",
    "/login/index.html"
  ];

  function isPublicPage() {
    const currentPath = window.location.pathname;
    return publicPaths.some((path) => currentPath.endsWith(path));
  }

  if (isPublicPage()) return;

  try {
    const { data, error } = await window.ZASupabase.getSession();

    if (error || !data?.session) {
      window.location.href = window.ZASupabase.getLoginUrl();
      return;
    }

    window.ZA_AUTH_SESSION = data.session;
  } catch (err) {
    console.error("Erro no guard:", err);
    window.location.href = window.ZASupabase.getLoginUrl();
  }
});