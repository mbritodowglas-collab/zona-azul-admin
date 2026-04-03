(function () {
  const SUPABASE_URL = "https://qrwzzgnyzsomugranmnu.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M";

  function getProjectBasePath() {
    const pathParts = window.location.pathname.split("/").filter(Boolean);

    const internalFolders = [
      "cliente",
      "clientes",
      "pre-diagnostico",
      "login",
      "lead",
      "formulario",
      "relatorio",
      "assets"
    ];

    const parts = [...pathParts];
    const last = parts[parts.length - 1];
    const isFile = last && last.includes(".");

    if (isFile) {
      parts.pop();
    }

    if (internalFolders.includes(parts[parts.length - 1])) {
      parts.pop();
    }

    return parts.length ? `/${parts.join("/")}` : "";
  }

  function getLoginUrl() {
    return `${window.location.origin}${getProjectBasePath()}/login/`;
  }

  function getDashboardUrl() {
    return `${window.location.origin}${getProjectBasePath()}/index.html`;
  }

  if (!window.supabase || !window.supabase.createClient) {
    console.error("Supabase CDN não carregado.");
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.ZASupabase = {
    client,

    getClient() {
      return client;
    },

    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    getProjectBasePath,
    getLoginUrl,
    getDashboardUrl,

    async getSession() {
      return client.auth.getSession();
    },

    async signIn(email, password) {
      return client.auth.signInWithPassword({ email, password });
    },

    async signOut() {
      return client.auth.signOut();
    }
  };
})();