// assets/js/storage.js

window.ZAStorage = (() => {
  const KEY = "zonaAzulSistemaV1";
  const EMPTY_DATA = {
    leads: [],
    clientes: []
  };

  let memoryData = null;
  let initialized = false;
  let initPromise = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeData(data) {
    return {
      leads: Array.isArray(data?.leads) ? data.leads : [],
      clientes: Array.isArray(data?.clientes) ? data.clientes : []
    };
  }

  function readLocalData() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return clone(EMPTY_DATA);
      return normalizeData(JSON.parse(raw));
    } catch (err) {
      console.warn("[ZAStorage] Erro ao ler localStorage:", err);
      return clone(EMPTY_DATA);
    }
  }

  function writeLocalData(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(normalizeData(data)));
    } catch (err) {
      console.warn("[ZAStorage] Erro ao salvar localStorage:", err);
    }
  }

  function getMemoryData() {
    if (!memoryData) {
      memoryData = readLocalData();
    }
    return memoryData;
  }

  function setMemoryData(data) {
    memoryData = normalizeData(data);
    writeLocalData(memoryData);
  }

  function getSupabaseClient() {
    return window.ZASupabase?.getClient?.() || null;
  }

  function isSupabaseAvailable() {
    return !!getSupabaseClient();
  }

  function getLeadRowId(lead) {
    const email = String(lead?.email || "").trim().toLowerCase();
    if (email) return `lead:${email}`;

    const id = String(lead?.id || "").trim();
    if (id) return `lead-id:${id}`;

    return `lead-generated:${Date.now()}`;
  }

  function getClienteRowId(cliente) {
    const id = String(cliente?.id || "").trim();
    if (id) return id;

    const email = String(cliente?.email || "").trim().toLowerCase();
    if (email) return `cliente:${email}`;

    return `cliente-generated:${Date.now()}`;
  }

  function buildSupabaseRows(data) {
    const rows = [];

    for (const lead of data.leads || []) {
      rows.push({
        id: getLeadRowId(lead),
        tipo: "lead",
        data: lead,
        updated_at: new Date().toISOString()
      });
    }

    for (const cliente of data.clientes || []) {
      rows.push({
        id: getClienteRowId(cliente),
        tipo: "cliente",
        data: cliente,
        updated_at: new Date().toISOString()
      });
    }

    return rows;
  }

  async function fetchRemoteData() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { ok: false, data: clone(getMemoryData()), error: "Supabase indisponível." };
    }

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, tipo, data, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        return { ok: false, data: clone(getMemoryData()), error: error.message || String(error) };
      }

      const nextData = {
        leads: [],
        clientes: []
      };

      for (const row of data || []) {
        if (row?.tipo === "lead") {
          nextData.leads.push(row.data);
        } else if (row?.tipo === "cliente") {
          nextData.clientes.push(row.data);
        }
      }

      return { ok: true, data: normalizeData(nextData) };
    } catch (err) {
      return { ok: false, data: clone(getMemoryData()), error: err?.message || String(err) };
    }
  }

  async function pushAllToSupabase(data) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { ok: false, error: "Supabase indisponível." };
    }

    try {
      const rows = buildSupabaseRows(data);

      const { error: deleteError } = await supabase
        .from("clientes")
        .delete()
        .neq("id", "__never__");

      if (deleteError) {
        return { ok: false, error: deleteError.message || String(deleteError) };
      }

      if (!rows.length) {
        return { ok: true };
      }

      const { error: insertError } = await supabase
        .from("clientes")
        .upsert(rows, { onConflict: "id" });

      if (insertError) {
        return { ok: false, error: insertError.message || String(insertError) };
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  async function syncNow() {
    const data = clone(getMemoryData());
    return pushAllToSupabase(data);
  }

  async function init(options = {}) {
    if (initialized && !options.force) {
      return clone(getMemoryData());
    }

    if (initPromise && !options.force) {
      return initPromise;
    }

    initPromise = (async () => {
      const localData = readLocalData();
      setMemoryData(localData);

      if (!isSupabaseAvailable()) {
        initialized = true;
        return clone(getMemoryData());
      }

      const remote = await fetchRemoteData();

      if (remote.ok) {
        const hasRemoteContent =
          (remote.data?.leads?.length || 0) > 0 ||
          (remote.data?.clientes?.length || 0) > 0;

        const hasLocalContent =
          (localData?.leads?.length || 0) > 0 ||
          (localData?.clientes?.length || 0) > 0;

        if (hasRemoteContent) {
          setMemoryData(remote.data);
        } else if (hasLocalContent) {
          await pushAllToSupabase(localData);
          setMemoryData(localData);
        }
      }

      initialized = true;
      return clone(getMemoryData());
    })();

    try {
      return await initPromise;
    } finally {
      initPromise = null;
    }
  }

  function getData() {
    return clone(getMemoryData());
  }

  function saveData(data) {
    setMemoryData(data);
    void syncNow();
  }

  function getLeads() {
    return clone(getMemoryData().leads || []);
  }

  function getClientes() {
    return clone(getMemoryData().clientes || []);
  }

  function upsertLead(lead) {
    const data = getMemoryData();
    const email = String(lead?.email || "").toLowerCase().trim();
    const index = data.leads.findIndex(
      (item) => String(item?.email || "").toLowerCase().trim() === email
    );

    if (index >= 0) {
      data.leads[index] = {
        ...data.leads[index],
        ...lead,
        email
      };
    } else {
      data.leads.unshift({
        ...lead,
        email
      });
    }

    saveData(data);
    return true;
  }

  function convertLeadToCliente(email) {
    const data = getMemoryData();
    const emailNormalized = String(email || "").toLowerCase().trim();
    const leadIndex = data.leads.findIndex(
      (item) => String(item?.email || "").toLowerCase().trim() === emailNormalized
    );

    if (leadIndex < 0) return false;

    const lead = data.leads[leadIndex];
    const clienteExists = data.clientes.find(
      (item) => String(item?.email || "").toLowerCase().trim() === emailNormalized
    );

    if (clienteExists) {
      data.leads.splice(leadIndex, 1);
      saveData(data);
      return true;
    }

    const cliente = {
      id: lead.id,
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
      data_inicio: new Date().toISOString(),
      preDiagnostico: { ...lead },
      diagnosticoCompleto: {},
      relatorioCompleto: {},
      planejamento: {},
      periodizacao: [],
      checkins: [],
      historico: [],
      timeline: [
        {
          tipo: "conversao",
          data: new Date().toISOString(),
          descricao: "Lead convertido em cliente."
        }
      ]
    };

    data.clientes.unshift(cliente);
    data.leads.splice(leadIndex, 1);
    saveData(data);
    return true;
  }

  function archiveLead(email) {
    const data = getMemoryData();
    const emailNormalized = String(email || "").toLowerCase().trim();
    const leadIndex = data.leads.findIndex(
      (item) => String(item?.email || "").toLowerCase().trim() === emailNormalized
    );

    if (leadIndex < 0) return false;

    data.leads[leadIndex].status = "arquivado";
    saveData(data);
    return true;
  }

  function removeLead(email) {
    const data = getMemoryData();
    const emailNormalized = String(email || "").toLowerCase().trim();

    data.leads = data.leads.filter(
      (item) => String(item?.email || "").toLowerCase().trim() !== emailNormalized
    );

    saveData(data);
    return true;
  }

  function archiveCliente(id) {
    const data = getMemoryData();
    const cliente = (data.clientes || []).find(
      (item) => String(item.id) === String(id)
    );

    if (!cliente) return false;

    cliente.status = "arquivado";

    if (!Array.isArray(cliente.timeline)) {
      cliente.timeline = [];
    }

    cliente.timeline.unshift({
      tipo: "arquivamento",
      data: new Date().toISOString(),
      descricao: "Cliente arquivado."
    });

    saveData(data);
    return true;
  }

  function reactivateCliente(id) {
    const data = getMemoryData();
    const cliente = (data.clientes || []).find(
      (item) => String(item.id) === String(id)
    );

    if (!cliente) return false;

    cliente.status = "ativo";

    if (!Array.isArray(cliente.timeline)) {
      cliente.timeline = [];
    }

    cliente.timeline.unshift({
      tipo: "reativacao",
      data: new Date().toISOString(),
      descricao: "Cliente reativado."
    });

    saveData(data);
    return true;
  }

  function updateCliente(updatedCliente) {
    const data = getMemoryData();
    const index = (data.clientes || []).findIndex(
      (item) => String(item.id) === String(updatedCliente.id)
    );

    if (index < 0) return false;

    data.clientes[index] = updatedCliente;
    saveData(data);
    return true;
  }

  function clearAll() {
    memoryData = clone(EMPTY_DATA);
    initialized = false;
    localStorage.removeItem(KEY);
    void syncNow();
  }

  return {
    init,
    syncNow,
    getData,
    saveData,
    getLeads,
    getClientes,
    upsertLead,
    convertLeadToCliente,
    archiveLead,
    removeLead,
    archiveCliente,
    reactivateCliente,
    updateCliente,
    clearAll
  };
})();