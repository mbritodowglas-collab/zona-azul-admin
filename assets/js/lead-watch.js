window.ZALeadWatch = (() => {
  const KEY = "trackion_last_lead_seen";
  const INTERVAL = 15000;

  function getClient() {
    return window.ZASupabase?.getClient?.() || null;
  }

  async function notifyLead(row) {
    const lead = row?.data || {};
    const nome = lead.nome || lead.nome_completo || "Novo lead";

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔥 Novo lead no Trackion", {
        body: `${nome} acabou de preencher o pré-diagnóstico.`,
        icon: "./assets/img/trackion-logo.png",
        tag: `trackion-lead-${row.id}`
      });
    } else {
      alert(`Novo lead no Trackion: ${nome}`);
    }
  }

  async function checkLatestLead({ silent = false } = {}) {
    const supabase = getClient();
    if (!supabase) {
      console.warn("[LeadWatch] Supabase não encontrado.");
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .select("id, data, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[LeadWatch] Erro ao buscar leads:", error);
      return;
    }

    const latest = data?.[0];
    if (!latest?.id) return;

    const currentKey = `${latest.id}:${latest.updated_at || ""}`;
    const lastKey = localStorage.getItem(KEY);

    if (!lastKey) {
      localStorage.setItem(KEY, currentKey);
      console.log("[LeadWatch] Lead base registrado:", currentKey);
      return;
    }

    if (currentKey !== lastKey) {
      localStorage.setItem(KEY, currentKey);

      if (!silent) {
        await notifyLead(latest);

        setTimeout(async () => {
          await window.ZAStorage?.init?.({ force: true });
          window.location.reload();
        }, 1200);
      }
    }
  }

  function start() {
    console.log("[LeadWatch] Monitoramento por polling iniciado.");

    checkLatestLead({ silent: true });

    setInterval(() => {
      checkLatestLead();
    }, INTERVAL);
  }

  return { start, checkLatestLead };
})();

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => window.ZALeadWatch?.start?.(), 1800);
});