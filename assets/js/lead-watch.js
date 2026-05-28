window.ZALeadWatch = (() => {
  const KEY = "trackion_last_lead_seen";

  function getClient() {
    return window.ZASupabase?.getClient?.() || null;
  }

  async function notifyLead(row) {
    const lead = row?.data || {};
    const nome = lead.nome || lead.nome_completo || "Novo lead";

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔥 Novo lead no Trackion", {
        body: `${nome} acabou de preencher o pré-diagnóstico.`,
        icon: "./assets/img/trackion-logo.png",
        tag: `trackion-lead-${row?.id || Date.now()}`
      });
    }

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active || navigator.serviceWorker.controller;

      worker?.postMessage({
        type: "TRACKION_NEW_LEAD",
        lead: {
          id: row?.id || Date.now(),
          nome
        }
      });
    }
  }

  function start() {
    const supabase = getClient();
    if (!supabase) {
      console.warn("[LeadWatch] Supabase não encontrado.");
      return;
    }

    console.log("[LeadWatch] Iniciando monitoramento de leads...");

    supabase
      .channel("trackion-leads-watch-v2")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        async (payload) => {
          console.log("[LeadWatch] Evento recebido:", payload);

          if (!["INSERT", "UPDATE"].includes(payload.eventType)) return;

          const row = payload?.new || null;
          if (!row?.id) return;

          const uniqueKey = `${payload.eventType}:${row.id}:${row.updated_at || ""}`;
          const last = localStorage.getItem(KEY);

          if (String(last) === String(uniqueKey)) return;

          localStorage.setItem(KEY, String(uniqueKey));
          await notifyLead(row);

          setTimeout(async () => {
            await window.ZAStorage?.init?.({ force: true });
            window.location.reload();
          }, 1500);
        }
      )
      .subscribe((status) => {
        console.log("[LeadWatch] Status realtime:", status);
      });
  }

  return { start };
})();

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => window.ZALeadWatch?.start?.(), 1800);
});