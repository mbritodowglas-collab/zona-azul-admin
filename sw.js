const TRACKION_CACHE = "trackion-pwa-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./login/",
  "./clientes/",
  "./cliente/",
  "./pre-diagnostico/",
  "./formulario-publico/",
  "./trackion/",
  "./assets/css/global.css",
  "./assets/js/supabase.js",
  "./assets/js/guard.js",
  "./assets/js/storage.js",
  "./assets/js/dashboard.js",
  "./assets/js/logout.js",
  "./assets/img/trackion-logo.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(TRACKION_CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== TRACKION_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", async (event) => {
  const data = event.data || {};

  if (data.type !== "TRACKION_NEW_LEAD") return;

  const lead = data.lead || {};
  const nome = lead.nome || "Novo lead";

  try {
    await self.registration.showNotification(
      "🔥 Novo lead no Trackion",
      {
        body: `${nome} acabou de preencher o pré-diagnóstico.`,
        icon: "./assets/img/trackion-logo.png",
        badge: "./assets/img/trackion-logo.png",
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: `trackion-lead-${lead.id || Date.now()}`,
        renotify: true,
        data: {
          url: "./pre-diagnostico/",
          leadId: lead.id || null
        }
      }
    );

    console.log("[SW] Notificação enviada");
  } catch (err) {
    console.error("[SW] Falha na notificação:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification?.data?.url || "./clientes/", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/zona-azul-admin/") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }

      return null;
    })
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(TRACKION_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(TRACKION_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
