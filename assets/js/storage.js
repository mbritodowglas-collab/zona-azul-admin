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
    const email = lead.email.toLowerCase().trim();
    const index = data.leads.findIndex(item => item.email === email);

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
    const emailNormalized = email.toLowerCase().trim();
    const leadIndex = data.leads.findIndex(item => item.email === emailNormalized);

    if (leadIndex < 0) return false;

    const lead = data.leads[leadIndex];
    const clienteExists = data.clientes.find(item => item.email === emailNormalized);

    if (clienteExists) return true;

    const cliente = {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      origem: lead.origem,
      faixa_etaria: lead.faixa_etaria,
      status: "ativo",
      plano: "",
      fase_atual: 1,
      fase_nome: "Consciência e Reset",
      data_inicio: new Date().toISOString(),
      preDiagnostico: { ...lead },
      diagnosticoCompleto: {},
      relatorioCompleto: {},
      planejamento: {},
      periodizacao: [],
      checkins: [],
      historico: []
    };

    data.clientes.unshift(cliente);
    data.leads[leadIndex].status = "convertido";
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
    clearAll
  };
})();