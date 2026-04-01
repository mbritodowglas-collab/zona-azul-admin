window.ZAStorage = (() => {
  const LS_CLIENTES = "za_clientes";
  const LS_LEADS = "za_leads";

  let clientes = [];
  let leads = [];
  let initialized = false;
  let initPromise = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function generateId(prefix = "id") {
    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  function getSupabaseClient() {
    return window.ZASupabase?.getClient?.() || null;
  }

  function isSupabaseReady() {
    return !!getSupabaseClient();
  }

  function writeLocal() {
    localStorage.setItem(LS_CLIENTES, JSON.stringify(clientes));
    localStorage.setItem(LS_LEADS, JSON.stringify(leads));
  }

  function readLocal() {
    try {
      clientes = JSON.parse(localStorage.getItem(LS_CLIENTES) || "[]");
      leads = JSON.parse(localStorage.getItem(LS_LEADS) || "[]");
    } catch (err) {
      console.warn("[ZAStorage] Falha ao ler localStorage:", err);
      clientes = [];
      leads = [];
    }
  }

  async function fetchRemoteClientes() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      ...(row.data || {})
    }));
  }

  async function fetchRemoteLeads() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      ...(row.data || {})
    }));
  }

  async function init({ force = false } = {}) {
    if (initialized && !force) {
      return getData();
    }

    if (initPromise && !force) {
      return initPromise;
    }

    initPromise = (async () => {
      readLocal();

      if (!isSupabaseReady()) {
        initialized = true;
        return getData();
      }

      try {
        const [remoteClientes, remoteLeads] = await Promise.all([
          fetchRemoteClientes(),
          fetchRemoteLeads()
        ]);

        const hasRemoteData = remoteClientes.length > 0 || remoteLeads.length > 0;
        const hasLocalData = clientes.length > 0 || leads.length > 0;

        if (hasRemoteData) {
          clientes = remoteClientes;
          leads = remoteLeads;
          writeLocal();
        } else if (hasLocalData) {
          await syncNow();
        }

        initialized = true;
        return getData();
      } catch (err) {
        console.warn("[ZAStorage] Falha ao inicializar com Supabase, usando localStorage:", err);
        initialized = true;
        return getData();
      } finally {
        initPromise = null;
      }
    })();

    return initPromise;
  }

  function getClientes() {
    return clone(clientes);
  }

  function getLeads() {
    return clone(leads);
  }

  function getData() {
    return {
      clientes: getClientes(),
      leads: getLeads()
    };
  }

  function getClienteById(id) {
    return clone(clientes.find((item) => String(item.id) === String(id)) || null);
  }

  function getLeadById(id) {
    return clone(leads.find((item) => String(item.id) === String(id)) || null);
  }

  function getLeadByEmail(email) {
    const normalized = normalizeEmail(email);
    return clone(leads.find((item) => normalizeEmail(item.email) === normalized) || null);
  }

  async function upsertLeadRow(lead) {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Supabase indisponível." };

    const row = {
      id: lead.id,
      email: normalizeEmail(lead.email) || null,
      data: lead,
      updated_at: nowIso()
    };

    const { error } = await supabase
      .from("leads")
      .upsert(row, { onConflict: "id" });

    if (error) {
      return { ok: false, error: error.message || String(error) };
    }

    return { ok: true };
  }

  async function upsertClienteRow(cliente) {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Supabase indisponível." };

    const row = {
      id: cliente.id,
      tipo: "cliente",
      data: cliente,
      updated_at: nowIso()
    };

    const { error } = await supabase
      .from("clientes")
      .upsert(row, { onConflict: "id" });

    if (error) {
      return { ok: false, error: error.message || String(error) };
    }

    return { ok: true };
  }

  async function deleteLeadRowById(id) {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Supabase indisponível." };

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message || String(error) };
    }

    return { ok: true };
  }

  async function deleteClienteRowById(id) {
    const supabase = getSupabaseClient();
    if (!supabase) return { ok: false, error: "Supabase indisponível." };

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      return { ok: false, error: error.message || String(error) };
    }

    return { ok: true };
  }

  function saveLead(leadData) {
    const email = normalizeEmail(leadData?.email);
    const existingIndex = leads.findIndex(
      (item) => normalizeEmail(item.email) === email
    );

    let action = "created";
    let lead;

    if (existingIndex >= 0) {
      lead = {
        ...leads[existingIndex],
        ...leadData,
        id: leads[existingIndex].id,
        email,
        updated_at: nowIso()
      };
      leads[existingIndex] = lead;
      action = "updated";
    } else {
      lead = {
        id: leadData?.id || generateId("lead"),
        ...leadData,
        email,
        created_at: leadData?.created_at || nowIso(),
        updated_at: nowIso()
      };
      leads.unshift(lead);
      action = "created";
    }

    writeLocal();

    return {
      ok: true,
      action,
      lead: clone(lead)
    };
  }

  function upsertLead(leadData) {
    return saveLead(leadData);
  }

  function saveCliente(clienteData) {
    const id = clienteData?.id || generateId("cli");
    const index = clientes.findIndex((item) => String(item.id) === String(id));

    const cliente = {
      ...clienteData,
      id,
      updatedAt: nowIso()
    };

    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.unshift(cliente);
    }

    writeLocal();
    return clone(cliente);
  }

  function updateCliente(updatedCliente) {
    if (!updatedCliente?.id) return false;

    const index = clientes.findIndex(
      (item) => String(item.id) === String(updatedCliente.id)
    );

    if (index < 0) return false;

    clientes[index] = {
      ...updatedCliente,
      updatedAt: nowIso()
    };

    writeLocal();
    return true;
  }

  function removeLead(email) {
    const normalized = normalizeEmail(email);
    const before = leads.length;

    leads = leads.filter(
      (item) => normalizeEmail(item.email) !== normalized
    );

    writeLocal();
    return leads.length !== before;
  }

  function archiveLead(email) {
    const normalized = normalizeEmail(email);
    const lead = leads.find(
      (item) => normalizeEmail(item.email) === normalized
    );

    if (!lead) return false;

    lead.status = "arquivado";
    lead.updated_at = nowIso();
    writeLocal();
    return true;
  }

  function archiveCliente(id) {
    const cliente = clientes.find((item) => String(item.id) === String(id));
    if (!cliente) return false;

    cliente.status = "arquivado";

    if (!Array.isArray(cliente.timeline)) {
      cliente.timeline = [];
    }

    cliente.timeline.unshift({
      tipo: "arquivamento",
      data: nowIso(),
      descricao: "Cliente arquivado."
    });

    cliente.updatedAt = nowIso();
    writeLocal();
    return true;
  }

  function reactivateCliente(id) {
    const cliente = clientes.find((item) => String(item.id) === String(id));
    if (!cliente) return false;

    cliente.status = "ativo";

    if (!Array.isArray(cliente.timeline)) {
      cliente.timeline = [];
    }

    cliente.timeline.unshift({
      tipo: "reativacao",
      data: nowIso(),
      descricao: "Cliente reativado."
    });

    cliente.updatedAt = nowIso();
    writeLocal();
    return true;
  }

  function convertLeadToCliente(email) {
    const normalized = normalizeEmail(email);
    const leadIndex = leads.findIndex(
      (item) => normalizeEmail(item.email) === normalized
    );

    if (leadIndex < 0) return false;

    const lead = leads[leadIndex];
    const existingCliente = clientes.find(
      (item) => normalizeEmail(item.email) === normalized
    );

    if (existingCliente) {
      leads.splice(leadIndex, 1);
      writeLocal();
      return true;
    }

    const cliente = {
      id: lead.id || generateId("cli"),
      nome: lead.nome,
      email: lead.email,
      origem: lead.origem,
      data_nascimento: lead.data_nascimento,
      idade: lead.idade,
      genero: lead.genero || "",
      cidade: lead.cidade || "",
      status: "ativo",
      plano: "",
      fase_atual: 1,
      fase_nome: "Diagnóstico completo",
      data_inicio: nowIso(),
      preDiagnostico: { ...lead },
      diagnosticoCompleto: {},
      relatorioCompleto: {},
      planejamento: {},
      planejamentosArquivados: [],
      periodizacao: [],
      checkins: [],
      historico: [],
      acompanhamentos: [],
      timeline: [
        {
          tipo: "conversao",
          data: nowIso(),
          descricao: "Lead convertido em cliente."
        }
      ],
      updatedAt: nowIso()
    };

    clientes.unshift(cliente);
    leads.splice(leadIndex, 1);
    writeLocal();
    return true;
  }

  async function syncNow() {
    if (!isSupabaseReady()) {
      return { ok: false, error: "Supabase indisponível." };
    }

    try {
      const remoteClientes = await fetchRemoteClientes();
      const remoteLeads = await fetchRemoteLeads();

      const localClienteIds = clientes.map((item) => String(item.id));
      const localLeadIds = leads.map((item) => String(item.id));

      for (const cliente of clientes) {
        const result = await upsertClienteRow(cliente);
        if (!result.ok) return result;
      }

      for (const lead of leads) {
        const result = await upsertLeadRow(lead);
        if (!result.ok) return result;
      }

      const remoteClienteIdsToDelete = remoteClientes
        .map((item) => String(item.id))
        .filter((id) => !localClienteIds.includes(id));

      const remoteLeadIdsToDelete = remoteLeads
        .map((item) => String(item.id))
        .filter((id) => !localLeadIds.includes(id));

      for (const id of remoteClienteIdsToDelete) {
        const result = await deleteClienteRowById(id);
        if (!result.ok) return result;
      }

      for (const id of remoteLeadIdsToDelete) {
        const result = await deleteLeadRowById(id);
        if (!result.ok) return result;
      }

      return { ok: true };
    } catch (err) {
      console.error("[ZAStorage] syncNow falhou:", err);
      return { ok: false, error: err?.message || String(err) };
    }
  }

  function clearAll() {
    clientes = [];
    leads = [];
    initialized = false;
    localStorage.removeItem(LS_CLIENTES);
    localStorage.removeItem(LS_LEADS);
  }

  return {
    init,
    syncNow,
    getData,
    getClientes,
    getLeads,
    getClienteById,
    getLeadById,
    getLeadByEmail,
    saveLead,
    upsertLead,
    saveCliente,
    updateCliente,
    removeLead,
    archiveLead,
    archiveCliente,
    reactivateCliente,
    convertLeadToCliente,
    clearAll
  };
})();