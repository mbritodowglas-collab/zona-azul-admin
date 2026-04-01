document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logout-btn");

  if (!btn) return;

  const supabase = window.supabase.createClient(
    "https://qrwzzgnyzsomugranmnu.supabase.co",
    "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M"
  );

  btn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Erro ao sair");
      return;
    }

    window.location.href = "./login/";
  });
});