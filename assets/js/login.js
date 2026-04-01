document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const loginBtn = document.getElementById("login-btn");
  const msg = document.getElementById("msg");

  function setMsg(text, ok = false) {
    msg.textContent = text;
    msg.style.color = ok ? "#86efac" : "#fda4af";
  }

  function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtn.textContent = isLoading ? "Entrando..." : "Entrar";
  }

  if (!window.supabase) {
    setMsg("SDK do Supabase não carregou.");
    return;
  }

  const supabase = window.supabase.createClient(
    "https://qrwzzgnyzsomugranmnu.supabase.co",
    "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M"
  );

  function goToApp() {
    window.location.href = "../index.html";
  }

  // Se já tiver sessão, não fica preso no login
  try {
    const { data, error } = await supabase.auth.getSession();

    if (!error && data?.session) {
      goToApp();
      return;
    }
  } catch (err) {
    console.error("[login.js] erro ao verificar sessão:", err);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = senhaInput.value;

    if (!email || !password) {
      setMsg("Preencha email e senha.");
      return;
    }

    setLoading(true);
    setMsg("Tentando login...", true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMsg("Erro: " + error.message);
        setLoading(false);
        return;
      }

      setMsg("Login OK", true);

      setTimeout(() => {
        goToApp();
      }, 500);
    } catch (err) {
      console.error("[login.js]", err);
      setMsg("Erro inesperado no login.");
      setLoading(false);
    }
  });
});