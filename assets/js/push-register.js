window.ZAPushRegister = (() => {
  const VAPID_PUBLIC_KEY = "BKrH2XjzC0S4lU9oR2vU5RMJBqFUs5X6wBw-Do_mHL_5KlmBcHK7qCYDQVl79pV14tTjyJ2Cn0uREzzCBAeMEMg";

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  async function register() {
    try {
      if (!("serviceWorker" in navigator)) {
        console.warn("[Push] Service Worker não suportado");
        return;
      }

      if (!("PushManager" in window)) {
        console.warn("[Push] Push não suportado");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.warn("[Push] Permissão negada");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      let sub = subscription;

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const json = sub.toJSON();

      const client = window.ZASupabase?.getClient?.();

      if (!client) {
        console.error("[Push] Supabase indisponível");
        return;
      }

      const { error } = await client
        .from("push_subscriptions")
        .upsert({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        });

      if (error) {
        console.error("[Push] Erro ao salvar:", error);
        return;
      }

      console.log("[Push] Celular registrado com sucesso");
      alert("Notificações do Trackion ativadas.");
    } catch (err) {
      console.error("[Push] Falha:", err);
    }
  }

  return { register };
})();