window.ZAStorage = (() => {
  let clientes = [];
  let leads = [];
  let initialized = false;

  const SUPABASE = window.ZASupabase;

  function generateId(prefix = "id") {
    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  }

  async function init({ force = false } = {}) {
    if (initialized && !force) return;

    try {
      const { data: clientesData } = await SUPABASE
        .from("clientes")
        .select("*");

      const { data: leadsData } = await SUPABASE
        .from("leads")
        .select("*");

      clientes = (clientesData || []).map(item => ({
        id: item.id,
        ...item.data
      }));

      leads = (leadsData || []).map(item => ({
        id: item.id,
        ...item.data
      }));

      localStorage.setItem("za_clientes", JSON.stringify(clientes));
      localStorage.setItem("za_leads", JSON.stringify(leads));

      initialized = true;

    } catch (err) {
      console.warn("Fallback localStorage", err);

      clientes = JSON.parse(localStorage.getItem("za_clientes") || "[]");
      leads = JSON.parse(localStorage.getItem("za_leads") || "[]");

      initialized = true;
    }
  }

  function getClientes() {
    return clientes;
  }

  function getLeads() {
    return leads;
  }

  function getClienteById(id) {
    return clientes.find(c => String(c.id) === String(id));
  }

  function getLeadByEmail(email) {
    return leads.find(l => l.email === email);
  }

  async function saveLead(leadData) {
    const id = leadData.id || generateId("lead");

    const lead = {
      id,
      ...leadData
    };

    leads.push(lead);

    await SUPABASE.from("leads").upsert({
      id,
      email: lead.email,
      data: lead,
      updated_at: new Date().toISOString()
    });

    localStorage.setItem("za_leads", JSON.stringify(leads));

    return lead;
  }

  async function saveCliente(clienteData) {
    const id = clienteData.id || generateId("cli");

    const cliente = {
      id,
      ...clienteData
    };

    const index = clientes.findIndex(c => c.id === id);

    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.push(cliente);
    }

    await SUPABASE.from("clientes").upsert({
      id,
      email: cliente.email || null,
      data: cliente,
      updated_at: new Date().toISOString()
    });

    localStorage.setItem("za_clientes", JSON.stringify(clientes));

    return cliente;
  }

  async function convertLeadToCliente(email) {
    const lead = getLeadByEmail(email);

    if (!lead) return null;

    const cliente = await saveCliente({
      ...lead,
      convertidoEm: new Date().toISOString()
    });

    leads = leads.filter(l => l.email !== email);

    await SUPABASE.from("leads").delete().eq("email", email);

    localStorage.setItem("za_leads", JSON.stringify(leads));

    return cliente;
  }

  async function syncNow() {
    await init({ force: true });
  }

  return {
    init,
    getClientes,
    getLeads,
    getClienteById,
    saveLead,
    saveCliente,
    convertLeadToCliente,
    syncNow
  };
})();