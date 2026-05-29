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

  function timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Service Worker demorou demais")), ms)
      )
    ]);
  }

  async function register() {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker não suportado.");
    }

    if (!("PushManager" in window)) {
      throw new Error("Push não suportado.");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Permissão de notificação não concedida.");
    }

    const registration = await navigator.serviceWorker.register("./sw.js", {
      scope: "./",
      updateViaCache: "none"
    });

    await registration.update().catch(() => null);

    const readyRegistration = await timeout(navigator.serviceWorker.ready, 8000);

    const oldSub = await readyRegistration.pushManager.getSubscription();

    if (oldSub) {
      await oldSub.unsubscribe().catch(() => null);
    }

    const sub = await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const json = sub.toJSON();
    const client = window.ZASupabase?.getClient?.();

    if (!client) {
      throw new Error("Supabase indisponível.");
    }

    const { error } = await client
      .from("push_subscriptions")
      .upsert({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth
      });

    if (error) {
      throw new Error(error.message || "Erro ao salvar push.");
    }

    alert("Notificações do Trackion ativadas.");
    return true;
  }

  return { register };
})();