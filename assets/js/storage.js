window.ZAStorage = (() => {
  const KEY = "zonaAzulSistemaV1";

  function getData() {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);

    return {
      leads: [],
      clientes: []
    };
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getLeads() {
    return getData().leads || [];
  }

  function getClientes() {
    return getData().clientes || [];
  }

  function upsertLead(lead) {
    const data = getData();
    const email = (lead.email || "").toLowerCase().trim();
    const index = data.leads.findIndex(item => (item.email || "").toLowerCase().trim() === email);

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
  }

  function convertLeadToCliente(email) {
    const data = getData();
    const emailNormalized = (email || "").toLowerCase().trim();
    const leadIndex = data.leads.findIndex(item => (item.email || "").toLowerCase().trim() === emailNormalized);

    if (leadIndex < 0) return false;

    const lead = data.leads[leadIndex];
    const clienteExists = data.clientes.find(item => (item.email || "").toLowerCase().trim() === emailNormalized);

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
    const data = getData();
    const emailNormalized = (email || "").toLowerCase().trim();
    const leadIndex = data.leads.findIndex(item => (item.email || "").toLowerCase().trim() === emailNormalized);

    if (leadIndex < 0) return false;

    data.leads[leadIndex].status = "arquivado";
    saveData(data);
    return true;
  }

  function removeLead(email) {
    const data = getData();
    const emailNormalized = (email || "").toLowerCase().trim();
    data.leads = data.leads.filter(item => (item.email || "").toLowerCase().trim() !== emailNormalized);
    saveData(data);
    return true;
  }

  function archiveCliente(id) {
    const data = getData();
    const cliente = (data.clientes || []).find(item => String(item.id) === String(id));

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
    const data = getData();
    const cliente = (data.clientes || []).find(item => String(item.id) === String(id));

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
    const data = getData();
    const index = (data.clientes || []).findIndex(item => String(item.id) === String(updatedCliente.id));

    if (index < 0) return false;

    data.clientes[index] = updatedCliente;
    saveData(data);
    return true;
  }

  function clearAll() {
    localStorage.removeItem(KEY);
  }

  return {
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