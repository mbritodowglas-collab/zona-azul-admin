window.ZALancamentos = (() => {
  let clienteId = null;
  let cliente = null;

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function setClientes(clientes) {
    return window.ZAStorage?.setClientes?.(clientes);
  }

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function val(id) {
    return document.getElementById(id)?.value?.trim?.() ?? document.getElementById(id)?.value ?? "";
  }

  function num(id) {
    const raw = document.getElementById(id)?.value;
    if (raw === undefined || raw === null || raw === "") return NaN;
    const parsed = Number(String(raw).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
  }

  function setChecked(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = !!value;
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return dateValue;
    }
  }

  function formatDateForInput(dateValue) {
    if (!dateValue) return "";
    try {
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return "";
    }
  }

  function calculateAgeFromDate(dateStr) {
    if (!dateStr) return "";
    const birth = new Date(dateStr);
    if (Number.isNaN(birth.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const diffMonth = today.getMonth() - birth.getMonth();

    if (diffMonth < 0 || (diffMonth === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? String(age) : "";
  }

  function normalizeSex(sex) {
    const s = String(sex || "").toLowerCase().trim();
    if (s.includes("f")) return "feminino";
    if (s.includes("m")) return "masculino";
    return "";
  }

  function ensureFeedbackModal() {
    if (document.getElementById("za-feedback-overlay")) return;

    const style = document.createElement("style");
    style.id = "za-feedback-style";
    style.textContent = `
      .za-feedback-overlay {
        position: fixed;
        inset: 0;
        background: rgba(6, 10, 24, 0.72);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 9999;
      }
      .za-feedback-overlay.hidden { display: none; }
      .za-feedback-modal {
        width: min(100%, 420px);
        background: linear-gradient(180deg, rgba(25,31,56,0.98), rgba(15,20,39,0.98));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        padding: 22px 20px 18px;
        color: #f5f7ff;
      }
      .za-feedback-head {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .za-feedback-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: rgba(120, 130, 255, 0.16);
        border: 1px solid rgba(138, 147, 255, 0.25);
      }
      .za-feedback-title {
        margin: 0;
        font-size: 20px;
        line-height: 1.2;
        font-weight: 700;
        color: #ffffff;
      }
      .za-feedback-message {
        margin: 10px 0 0;
        color: rgba(230,235,255,0.88);
        font-size: 16px;
        line-height: 1.55;
      }
      .za-feedback-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 18px;
      }
      .za-feedback-btn {
        border: 0;
        border-radius: 14px;
        padding: 12px 18px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        color: #ffffff;
        background: linear-gradient(135deg, #6d73ff, #8d72ff);
        box-shadow: 0 10px 24px rgba(109,115,255,0.25);
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "za-feedback-overlay";
    overlay.className = "za-feedback-overlay hidden";
    overlay.innerHTML = `
      <div class="za-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="za-feedback-title">
        <div class="za-feedback-head">
          <div class="za-feedback-icon" id="za-feedback-icon">✓</div>
          <h3 class="za-feedback-title" id="za-feedback-title">Tudo certo</h3>
        </div>
        <p class="za-feedback-message" id="za-feedback-message"></p>
        <div class="za-feedback-actions">
          <button type="button" class="za-feedback-btn" id="za-feedback-ok">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) hideFeedback();
    });

    document.getElementById("za-feedback-ok")?.addEventListener("click", hideFeedback);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideFeedback();
    });
  }

  function showFeedback(message, title = "Tudo certo", icon = "✓") {
    ensureFeedbackModal();
    setText("za-feedback-title", title);
    setText("za-feedback-icon", icon);
    setText("za-feedback-message", message);
    document.getElementById("za-feedback-overlay")?.classList.remove("hidden");
  }

  function hideFeedback() {
    document.getElementById("za-feedback-overlay")?.classList.add("hidden");
  }

  function initTabs() {
    const tabs = Array.from(document.querySelectorAll(".tab"));
    if (!tabs.length) return;

    const STORAGE_KEY = "za_lancamentos_tab_aberta";

    function openTab(targetTab) {
      tabs.forEach((tab) => {
        const isTarget = tab === targetTab;
        tab.classList.toggle("active", isTarget);
      });

      const index = tabs.indexOf(targetTab);
      if (index >= 0) localStorage.setItem(STORAGE_KEY, String(index));
    }

    tabs.forEach((tab, index) => {
      const header = tab.querySelector(".tab-header");
      if (!header) return;

      header.addEventListener("click", () => {
        const isActive = tab.classList.contains("active");
        if (isActive) {
          tab.classList.remove("active");
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        openTab(tab);
      });

      tab.classList.remove("active");
    });

    const savedIndex = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(savedIndex) && tabs[savedIndex]) {
      tabs[savedIndex].classList.add("active");
    } else {
      tabs[0].classList.add("active");
    }
  }

  function getPreData() {
    const pre = cliente?.preDiagnostico || {};
    const dadosBase = cliente?.dadosBaseEditados || {};

    return {
      nome: firstFilled(dadosBase.nome, pre.nome, cliente?.nome),
      email: firstFilled(dadosBase.email, pre.email, cliente?.email),
      telefone: firstFilled(dadosBase.telefone, pre.telefone, cliente?.telefone),
      sexo: firstFilled(dadosBase.sexo, pre.sexo, pre.genero, cliente?.sexo),
      dataNascimento: firstFilled(
        dadosBase.dataNascimento,
        pre.dataNascimento,
        pre.data_nascimento,
        pre.nascimento
      ),
      idade: firstFilled(dadosBase.idade, pre.idade),
      objetivoInicial: firstFilled(
        dadosBase.objetivoInicial,
        pre.objetivo_inicial,
        pre.objetivo,
        pre.objetivo_fisico,
        cliente?.objetivo
      )
    };
  }

  function renderCabecalho() {
    setText("cliente-nome-topo", cliente?.nome || "Lançamentos");
    setText("cliente-subtitulo", "Registro técnico do caso.");
    setText("cliente-nome", cliente?.nome || "Cliente");
    setText("cliente-email", cliente?.email || "—");
    setText("cliente-objetivo", cliente?.objetivo || "Objetivo principal");
    setText("cliente-avatar", "MD");

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar && clienteId) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderBasePre() {
    const pre = getPreData();

    setValue("nome", pre.nome || "");
    setValue("email", pre.email || "");
    setValue("telefone", pre.telefone || "");
    setValue("sexo", pre.sexo || "");
    setValue("dataNascimento", formatDateForInput(pre.dataNascimento));
    setValue("idade", pre.idade || calculateAgeFromDate(pre.dataNascimento));
    setValue("objetivoInicial", pre.objetivoInicial || "");
  }

  function renderSessaoEAvaliacao() {
    const sessao = cliente?.sessaoEAvaliacao || {};
    const av = sessao.avaliacao || {};

    setValue("tipoSessao", sessao.tipoSessao || "");
    setValue("obsSessao", sessao.obsSessao || "");

    setValue("peso", av.peso || "");
    setValue("altura", av.altura || "");
    setValue("cintura", av.cintura || "");
    setValue("quadril", av.quadril || "");
    setValue("abdomen", av.abdomen || "");

    setValue("imc", av.imc || "");
    setValue("rcq", av.rcq || "");
    setValue("rce", av.rce || "");
    setValue("percGordura", av.percGordura || "");
  }

  function renderAnaliseCaso() {
    const analise = cliente?.analiseCaso || {};
    const radar = analise.radar || {};
    const diag = analise.diagnostico || {};

    setValue("radarMovimento", radar.movimento || "");
    setValue("radarAlimentacao", radar.alimentacao || "");
    setValue("radarSono", radar.sono || "");
    setValue("radarEstresse", radar.estresse || "");
    setValue("radarSocial", radar.social || "");
    setValue("radarProposito", radar.proposito || "");

    setValue("gargalo", diag.gargalo || "");
    setValue("perfilEntrada", diag.perfilEntrada || "");
    setValue("prioridade", diag.prioridade || "");
    setValue("leituraCaso", diag.leituraCaso || "");
    setValue("sintese", diag.sintese || "");
  }

  function renderAcompanhamentos() {
    setValue("dataAcompanhamento", formatDateForInput(new Date()));

    const lista = document.getElementById("acompanhamentos-lista");
    if (!lista) return;

    const itens = Array.isArray(cliente?.acompanhamentos) ? cliente.acompanhamentos : [];

    if (!itens.length) {
      lista.innerHTML = `<div class="cliente-placeholder-box">Nenhum acompanhamento salvo ainda.</div>`;
      return;
    }

    lista.innerHTML = itens
      .slice()
      .reverse()
      .map((item) => {
        return `
          <div class="acomp-item">
            <div class="acomp-item-top">
              <strong>${formatDate(item.data)}</strong>
              <span>${item.aderencia || "Sem aderência"}</span>
            </div>
            <p><strong>Evolução:</strong> ${item.evolucao || "—"}</p>
            <p><strong>Dificuldades:</strong> ${item.dificuldades || "—"}</p>
            <p><strong>Ajustes:</strong> ${item.ajustes || "—"}</p>
          </div>
        `;
      })
      .join("");
  }

  function salvarBasePre() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      dadosBaseEditados: {
        nome: val("nome"),
        email: val("email"),
        telefone: val("telefone"),
        sexo: val("sexo"),
        dataNascimento: val("dataNascimento"),
        idade: val("idade"),
        objetivoInicial: val("objetivoInicial")
      },
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    showFeedback("Base do pré-diagnóstico salva com sucesso.", "Base atualizada", "📝");
  }

  function calcularAvaliacao() {
    const sexo = normalizeSex(val("sexo"));
    const peso = num("peso");
    const alturaCm = num("altura");
    const cintura = num("cintura");
    const quadril = num("quadril");
    const abdomen = num("abdomen");

    if (!Number.isFinite(peso) || peso <= 0) {
      showFeedback("Informe um peso válido.", "Campo obrigatório", "⚠");
      return;
    }

    if (!Number.isFinite(alturaCm) || alturaCm <= 0) {
      showFeedback("Informe uma altura válida.", "Campo obrigatório", "⚠");
      return;
    }

    if (!Number.isFinite(cintura) || cintura <= 0) {
      showFeedback("Informe uma cintura válida.", "Campo obrigatório", "⚠");
      return;
    }

    if (!Number.isFinite(quadril) || quadril <= 0) {
      showFeedback("Quadril é obrigatório para cálculo de RCQ.", "Campo obrigatório", "⚠");
      return;
    }

    if (!Number.isFinite(abdomen) || abdomen <= 0) {
      showFeedback("Abdômen é obrigatório para o cálculo do percentual de gordura.", "Campo obrigatório", "⚠");
      return;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    const rcq = cintura / quadril;
    const rce = cintura / alturaCm;

    let percGordura = NaN;

    if (sexo === "masculino") {
      const diff = abdomen - cintura;
      // para manter teu fluxo simples, vou usar cintura como referência do pescoço ausente?
      // não — sem pescoço não dá pra usar Marinha. então aqui assumimos que esse HTML simplificado não calcula marinha real.
      // Como o HTML final simplificado não tem pescoço, usamos uma estimativa baseada em RCE? Não é ideal.
      // Melhor ser honesto e não inventar fórmula.
    }

    setValue("imc", Number.isFinite(imc) ? imc.toFixed(2) : "");
    setValue("rcq", Number.isFinite(rcq) ? rcq.toFixed(2) : "");
    setValue("rce", Number.isFinite(rce) ? rce.toFixed(2) : "");

    // Observação honesta: esse HTML simplificado não tem pescoço.
    if (!document.getElementById("pescoco")) {
      setValue("percGordura", "Nec. pescoço");
    } else {
      const pescoco = num("pescoco");
      if (sexo === "feminino") {
        const altura = alturaM;
        const v =
          163.205 * Math.log10(abdomen + quadril - pescoco) -
          97.684 * Math.log10(altura * 100) -
          78.387;
        percGordura = v;
      } else {
        const altura = alturaM;
        const v =
          86.01 * Math.log10(abdomen - pescoco) -
          70.041 * Math.log10(altura * 100) +
          36.76;
        percGordura = v;
      }
      setValue("percGordura", Number.isFinite(percGordura) ? percGordura.toFixed(2) : "");
    }

    showFeedback("Cálculos atualizados com sucesso.", "Avaliação calculada", "📊");
  }

  function salvarSessaoEAvaliacao() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      sessaoEAvaliacao: {
        tipoSessao: val("tipoSessao"),
        obsSessao: val("obsSessao"),
        avaliacao: {
          peso: val("peso"),
          altura: val("altura"),
          cintura: val("cintura"),
          quadril: val("quadril"),
          abdomen: val("abdomen"),
          imc: val("imc"),
          rcq: val("rcq"),
          rce: val("rce"),
          percGordura: val("percGordura")
        }
      },
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    showFeedback("Sessão e avaliação salvas com sucesso.", "Bloco salvo", "📌");
  }

  function salvarAnaliseCaso() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      analiseCaso: {
        radar: {
          movimento: val("radarMovimento"),
          alimentacao: val("radarAlimentacao"),
          sono: val("radarSono"),
          estresse: val("radarEstresse"),
          social: val("radarSocial"),
          proposito: val("radarProposito")
        },
        diagnostico: {
          gargalo: val("gargalo"),
          perfilEntrada: val("perfilEntrada"),
          prioridade: val("prioridade"),
          leituraCaso: val("leituraCaso"),
          sintese: val("sintese")
        }
      },
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    showFeedback("Análise do caso salva com sucesso.", "Bloco salvo", "🧠");
  }

  function salvarAcompanhamento() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const novo = {
      data: val("dataAcompanhamento"),
      aderencia: val("aderencia"),
      evolucao: val("evolucao"),
      dificuldades: val("dificuldades"),
      ajustes: val("ajustes"),
      createdAt: new Date().toISOString()
    };

    const acompanhamentos = Array.isArray(clientes[index].acompanhamentos)
      ? clientes[index].acompanhamentos
      : [];

    acompanhamentos.push(novo);

    clientes[index] = {
      ...clientes[index],
      acompanhamentos,
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];

    setValue("aderencia", "");
    setValue("evolucao", "");
    setValue("dificuldades", "");
    setValue("ajustes", "");

    renderAcompanhamentos();
    showFeedback("Acompanhamento salvo com sucesso.", "Acompanhamento atualizado", "📅");
  }

  function bindSaveButtons() {
    // Se quiser usar botões separados no HTML depois, já está pronto.
    document.getElementById("btnSalvarBase")?.addEventListener("click", salvarBasePre);
    document.getElementById("btnSalvarSessaoAvaliacao")?.addEventListener("click", salvarSessaoEAvaliacao);
    document.getElementById("btnSalvarAnalise")?.addEventListener("click", salvarAnaliseCaso);
    document.getElementById("btnSalvarAcompanhamento")?.addEventListener("click", salvarAcompanhamento);

    // Compatibilidade com os botões inline do HTML simplificado
    window.calcularAvaliacao = calcularAvaliacao;
    window.salvarAcompanhamento = salvarAcompanhamento;
  }

  function bindAutoAge() {
    document.getElementById("dataNascimento")?.addEventListener("change", () => {
      setValue("idade", calculateAgeFromDate(val("dataNascimento")));
    });
  }

  function init() {
    ensureFeedbackModal();
    initTabs();

    clienteId = getQueryParam("id");
    if (!clienteId) return;

    cliente = getClienteById(clienteId);
    if (!cliente) return;

    renderCabecalho();
    renderBasePre();
    renderSessaoEAvaliacao();
    renderAnaliseCaso();
    renderAcompanhamentos();

    bindSaveButtons();
    bindAutoAge();
  }

  return {
    init,
    calcularAvaliacao,
    salvarAcompanhamento,
    salvarBasePre,
    salvarSessaoEAvaliacao,
    salvarAnaliseCaso
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZALancamentos.init();
});