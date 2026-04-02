document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("login-submit");
  const feedback = document.getElementById("login-feedback");

  if (!form) return;

  function setFeedback(message, isError = true) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.style.display = message ? "block" : "none";
    feedback.style.color = isError ? "#ffb0b0" : "#9dffd6";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value ?? "";

    if (!email || !password) {
      setFeedback("Preencha email e senha.");
      return;
    }

    if (!window.ZASupabase || typeof window.ZASupabase.signIn !== "function") {
      setFeedback("Supabase não carregado.");
      return;
    }

    submitBtn.disabled = true;
    setFeedback("");

    try {
      const { data, error } = await window.ZASupabase.signIn(email, password);

      if (error || !data?.session) {
        setFeedback(error?.message || "Não foi possível entrar.");
        submitBtn.disabled = false;
        return;
      }

      setFeedback("Login realizado com sucesso.", false);
      window.location.href = window.ZASupabase.getDashboardUrl();
    } catch (err) {
      console.error(err);
      setFeedback("Erro inesperado ao entrar.");
      submitBtn.disabled = false;
    }
  });
});