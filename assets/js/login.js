document.addEventListener("DOMContentLoaded", () => {
  console.log("login.js carregado");

  const form = document.getElementById("login-form");
  const msg = document.getElementById("msg");

  function setMsg(text, ok = false) {
    msg.textContent = text;
    msg.style.color = ok ? "#86efac" : "#fda4af";
  }

  const supabase = window.supabase.createClient(
    "https://qrwzzgnyzsomugranmnu.supabase.co",
    "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M"
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    setMsg("Tentando login...");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("senha").value;

    if (!email || !password) {
      setMsg("Preencha email e senha");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMsg("Erro: " + error.message);
      return;
    }

    setMsg("Login OK", true);

    setTimeout(() => {
      window.location.href = "../";
    }, 800);
  });
});