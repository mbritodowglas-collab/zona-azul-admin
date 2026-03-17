window.ZAStorage = (() => {
  const leadsStorageKey = "zonaAzulLeadsV2";

  function getLeads() {
    const data = localStorage.getItem(leadsStorageKey);
    return data ? JSON.parse(data) : [];
  }

  function saveLeads(leads) {
    localStorage.setItem(leadsStorageKey, JSON.stringify(leads));
  }

  function upsertLead(lead) {
    const leads = getLeads();
    const existingIndex = leads.findIndex(item => item.email === lead.email);

    if (existingIndex >= 0) {
      leads[existingIndex] = {
        ...leads[existingIndex],
        ...lead,
        id: leads[existingIndex].id,
        created_at: leads[existingIndex].created_at
      };
    } else {
      leads.unshift(lead);
    }

    saveLeads(leads);
  }

  function clearLeads() {
    localStorage.removeItem(leadsStorageKey);
  }

  function findLeadByEmail(email) {
    return getLeads().find(lead => lead.email === decodeURIComponent(email).toLowerCase());
  }

  return {
    getLeads,
    saveLeads,
    upsertLead,
    clearLeads,
    findLeadByEmail
  };
})();