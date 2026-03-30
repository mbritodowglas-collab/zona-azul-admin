// assets/js/supabase.js

const SUPABASE_URL = "https://qrwzzgnyzsomugranmnu.supabase.co";
const SUPABASE_KEY = "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M";

window.ZASupabase = (() => {
  let client = null;

  function isReady() {
    return typeof window.supabase !== "undefined";
  }

  function getClient() {
    if (!isReady()) {
      console.warn("[ZASupabase] SDK do Supabase não carregado.");
      return null;
    }

    if (!client) {
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log("[ZASupabase] Cliente criado.");
    }

    return client;
  }

  async function testConnection() {
    const supabaseClient = getClient();
    if (!supabaseClient) {
      return { ok: false, error: "Supabase SDK não disponível." };
    }

    try {
      const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, tipo")
        .limit(1);

      if (error) {
        console.error("[ZASupabase] Falha no teste:", error);
        return { ok: false, error: error.message || String(error) };
      }

      console.log("[ZASupabase] Conexão OK.", data);
      return { ok: true, data };
    } catch (err) {
      console.error("[ZASupabase] Exceção no teste:", err);
      return { ok: false, error: err?.message || String(err) };
    }
  }

  return {
    getClient,
    testConnection
  };
})();