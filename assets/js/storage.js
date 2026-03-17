window.ZAStorage = (() => {
  const LEADS_KEY = "zonaAzulLeadsV3";

  function getLeads() {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveLeads(leads) {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }

  function upsertLead(lead) {
    const leads = getLeads();
    const email = lead.email.toLowerCase().trim();
    const index = leads.findIndex(item => item.email === email);

    if (index >= 0) {
      leads[index] = {
        ...leads[index],
        ...lead,
        email,
      };
    } else {
      leads.unshift({
        ...lead,
        email,
      });
    }

    saveLeads(leads);
  }

  function clearLeads() {
    localStorage.removeItem(LEADS_KEY);
  }

  return {
    getLeads,
    saveLeads,
    upsertLead,
    clearLeads,
  };
})();