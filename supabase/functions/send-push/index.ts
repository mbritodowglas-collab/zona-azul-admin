import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  "mailto:trackion@email.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const payload = await req.json().catch(() => ({}));
    const leadData = payload?.record?.data || payload?.record || {};
    const nome = leadData?.nome || leadData?.nome_completo || "Novo lead";

    const response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`
      }
    });

    const subscriptions = await response.json();

    for (const sub of subscriptions) {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        JSON.stringify({
          title: "🔥 Novo lead no Trackion",
          body: `${nome} acabou de preencher o pré-diagnóstico.`
        })
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});