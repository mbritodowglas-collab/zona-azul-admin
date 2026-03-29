// 🔗 Configuração Supabase
const SUPABASE_URL = "https://qrwzzgnyzsomugranmnu.supabase.co";
const SUPABASE_KEY = "sb_publishable_CvVEHAvdmjmT-TlrUybIDQ_BOkIOB1M";

// 🚀 Inicializa cliente
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// 🧪 Teste rápido (opcional)
window.testSupabase = async () => {
  const { data, error } = await supabaseClient
    .from("clientes")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
};