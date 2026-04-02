document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = document.querySelectorAll("#logout-btn, #logout-btn-sidebar");

  if (!logoutButtons.length) return;

  async function executarLogout() {
    try {
      if (
        window.ZASupabase &&
        typeof window.ZASupabase.signOut === "function"
      ) {
        await window.ZASupabase.signOut();
      } else if (
        window.supabase &&
        typeof window.supabase.auth?.signOut === "function"
      ) {
        await window.supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("Erro ao sair da sessão:", error);
    }

    try {
      sessionStorage.removeItem("za_user");
      sessionStorage.removeItem("za_session");
      localStorage.removeItem("za_user");
      localStorage.removeItem("za_session");
    } catch (error) {
      console.warn("Erro ao limpar storage:", error);
    }

    if (window.ZASupabase && typeof window.ZASupabase.getLoginUrl === "function") {
      window.location.href = window.ZASupabase.getLoginUrl();
      return;
    }

    window.location.href = "/login/";
  }

  logoutButtons.forEach((button) => {
    button.addEventListener("click", executarLogout);
  });
});