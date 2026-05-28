window.ZALeadWatch = (() => {
  const KEY = "trackion_last_lead_seen";

  function getClient() {
    return window.ZASupabase?.getClient?.() || null;
  }

  async function sendToWorker(row) {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active || navigator.serviceWorker.controller;
    if (!worker) return;

    const lead = row?.data || {};

    worker.postMessage({
      type: "TRACKION_NEW_LEAD",
      lead: {
        id: row?.id || Date.now(),
        nome: lead.nome || lead.nome_completo || "Novo lead"
      }
    });
  }

  function start() {
    const supabase = getClient();
    if (!supabase) return;

    supabase
      .channel("trackion-leads-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        async (payload) => {
          const row = payload?.new || null;
          if (!row?.id) return;

          const last = localStorage.getItem(KEY);
          if (String(last) === String(row.id)) return;

          localStorage.setItem(KEY, String(row.id));
          await sendToWorker(row);

          setTimeout(async () => {
            await window.ZAStorage?.init?.({ force: true });
            window.location.reload();
          }, 1500);
        }
      )
      .subscribe();
  }

  return { start };
})();

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => window.ZALeadWatch?.start?.(), 1800);
});