document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabase) {
    console.warn("Supabase não carregado");
    return;
  }

  const supabase = window.supabase.createClient(
    "https://qrwzzgnyzsomugranmnu.supabase.co",
    "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M"
  );

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      window.location.href = "/login/";
    }
  } catch (err) {
    console.error("Erro no guard:", err);
    window.location.href = "/login/";
  }
});