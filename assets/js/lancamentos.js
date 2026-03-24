window.ZALancamentos = (() => {
  let clienteId = null;
  let cliente = null;

  const RADAR_KEYS = [
    "movimento",
    "alimentacao",
    "sono",
    "proposito",
    "social",
    "estresse"
  ];

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

  function getLeadById(id) {
    const data = window.ZAStorage?.getData?.() || {};
    const leads = data.leads || [];
    return leads.find((item) => String(item.id) === String(id)) || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "—";
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
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
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }

  function calculateAgeFromParts(day, month, year) {
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if (!d || !m || !y) return "";
    const birth = new Date(y, m - 1, d);
    if (Number.isNaN(birth.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const diffMonth = today.getMonth() - birth.getMonth();

    if (diffMonth < 0 || (diffMonth === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? String(age) : "";
  }

  function calculateAgeFromDate(dateStr) {
    if (!dateStr) return "";
    const birth = new Date(dateStr);
    if (Number.isNaN(birth.getTime())) return "";
    return calculateAgeFromParts(
      birth.getDate(),
      birth.getMonth() + 1,
      birth.getFullYear()
    );
  }

  function getInitials(nome) {
    if (!nome) return "C";
    const parts = nome.trim().split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "")).toUpperCase();
  }

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
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

      .za-feedback-overlay.hidden {
        display: none;
      }

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

      .za-feedback-btn:active {
        transform: scale(0.98);
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

    const overlay = document.getElementById("za-feedback-overlay");
    const titleEl = document.getElementById("za-feedback-title");
    const iconEl = document.getElementById("za-feedback-icon");
    const messageEl = document.getElementById("za-feedback-message");

    if (titleEl) titleEl.textContent = title;
    if (iconEl) iconEl.textContent = icon;
    if (messageEl) messageEl.textContent = message;
    overlay?.classList.remove("hidden");
  }

  function hideFeedback() {
    document.getElementById("za-feedback-overlay")?.classList.add("hidden");
  }

  function getPreDataFromCliente(clienteAtual) {
    if (!clienteAtual) return {};

    if (isObject(clienteAtual.preDiagnostico)) {
      return clienteAtual.preDiagnostico;
    }

    if (clienteAtual.leadId) {
      const lead = getLeadById(clienteAtual.leadId);
      if (!lead) return {};

      const base = isObject(lead) ? lead : {};
      const respostas = isObject(lead.respostas) ? lead.respostas : {};
      const formData = isObject(lead.formData) ? lead.formData : {};
      const dados = isObject(lead.dados) ? lead.dados : {};
      const payload = isObject(lead.payload) ? lead.payload : {};

      return {
        ...base,
        ...dados,
        ...payload,
        ...formData,
        ...respostas
      };
    }

    return {};
  }

  function getDadosBaseEditados() {
    return cliente?.dadosBaseEditados || {};
  }

  function getRadarData(pre) {
    return (
      pre?.radar ||
      pre?.radarInicial ||
      pre?.scores ||
      pre?.pilares || {
        movimento: firstFilled(pre?.score_movimento, pre?.movimento),
        alimentacao: firstFilled(pre?.score_alimentacao, pre?.alimentacao),
        sono: firstFilled(pre?.score_sono, pre?.sono),
        proposito: firstFilled(pre?.score_proposito, pre?.proposito),
        social: firstFilled(pre?.score_social, pre?.social),
        estresse: firstFilled(pre?.score_estresse, pre?.estresse)
      }
    );
  }

  function getRadarResumo(pre) {
    const radar = getRadarData(pre);
    if (!radar || typeof radar !== "object") return "Sem radar disponível.";

    const labels = {
      movimento: "Movimento",
      alimentacao: "Alimentação",
      sono: "Sono",
      proposito: "Propósito",
      social: "Social",
      estresse: "Estresse"
    };

    const entries = Object.entries(radar)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => `${labels[key] || key}: ${value}`);

    return entries.length ? entries.join(" | ") : "Sem radar disponível.";
  }

  function getBirthPartsFromPre(pre) {
    if (!pre) return { dia: "", mes: "", ano: "" };

    const dia = firstFilled(
      pre?.nascimento_dia,
      pre?.birth_day,
      pre?.dia_nascimento
    );

    const mes = firstFilled(
      pre?.nascimento_mes,
      pre?.birth_month,
      pre?.mes_nascimento
    );

    const ano = firstFilled(
      pre?.nascimento_ano,
      pre?.birth_year,
      pre?.ano_nascimento
    );

    if (dia || mes || ano) {
      return {
        dia: dia ? String(dia) : "",
        mes: mes ? String(mes) : "",
        ano: ano ? String(ano) : ""
      };
    }

    const rawDate = firstFilled(
      pre?.dataNascimento,
      pre?.data_nascimento,
      pre?.nascimento,
      pre?.birthDate
    );

    if (rawDate) {
      const normalized = formatDateForInput(rawDate);
      if (normalized) {
        const [yyyy, mm, dd] = normalized.split("-");
        return {
          dia: dd || "",
          mes: String(Number(mm || "")) || "",
          ano: yyyy || ""
        };
      }
    }

    return { dia: "", mes: "", ano: "" };
  }

  function getReferenceSex(pre) {
    const editados = getDadosBaseEditados();
    const valorEditado = editados.sexoReferencia || document.getElementById("pre-sexo-ref")?.value?.trim();

    if (valorEditado) return String(valorEditado).toLowerCase();

    return String(
      firstFilled(
        pre?.sexo,
        pre?.genero,
        pre?.sex,
        pre?.gender
      )
    ).toLowerCase();
  }

  function getReferenceAge(pre) {
    const editados = getDadosBaseEditados();
    const nascimentoPre = getBirthPartsFromPre(pre);

    const dia = firstFilled(editados.nascimentoDia, document.getElementById("pre-nascimento-dia")?.value, nascimentoPre.dia);
    const mes = firstFilled(editados.nascimentoMes, document.getElementById("pre-nascimento-mes")?.value, nascimentoPre.mes);
    const ano = firstFilled(editados.nascimentoAno, document.getElementById("pre-nascimento-ano")?.value, nascimentoPre.ano);

    return calculateAgeFromParts(dia, mes, ano);
  }

  function getObjetivoInicial(pre, editados) {
    return firstFilled(
      editados.objetivo,
      pre?.objetivo,
      pre?.objetivo_principal,
      pre?.objetivo_fisico,
      cliente?.objetivo
    );
  }

  function getResumoInicial(pre, editados) {
    if (editados.resumo) return editados.resumo;

    const blocos = [];

    const restricoes = firstFilled(
      pre?.limitacoes_atuais,
      pre?.restricoes_medicas,
      pre?.restricoes,
      pre?.lesoes,
      pre?.condicoes_saude
    );

    const desafio = firstFilled(
      pre?.desafio_atual,
      pre?.maior_desafio,
      pre?.desafio
    );

    const meta = firstFilled(
      pre?.meta_6_meses,
      pre?.meta,
      pre?.metas
    );

    const parou = firstFilled(pre?.por_que_parou);
    const funcionou = firstFilled(pre?.o_que_funcionou);
    const sabotagem = firstFilled(pre?.sabotagem);
    const urgencia = firstFilled(pre?.urgencia);
    const investimento = firstFilled(pre?.investimento);

    if (desafio) blocos.push(`Desafio atual: ${desafio}`);
    if (meta) blocos.push(`Meta em 6 meses: ${meta}`);
    if (restricoes) blocos.push(`Restrições / limitações: ${restricoes}`);
    if (parou) blocos.push(`Por que parou: ${parou}`);
    if (funcionou) blocos.push(`O que já funcionou: ${funcionou}`);
    if (sabotagem) blocos.push(`Principal sabotagem: ${sabotagem}`);
    if (urgencia) blocos.push(`Urgência percebida: ${urgencia}`);
    if (investimento) blocos.push(`Investimento em acompanhamento: ${investimento}`);

    if (!blocos.length) {
      const fallback = firstFilled(
        pre?.resumoPrediagnostico,
        pre?.resumo_pre_diagnostico,
        pre?.rotina,
        pre?.maior_dificuldade
      );
      if (fallback) blocos.push(fallback);
    }

    const radar = getRadarResumo(pre);
    if (radar && radar !== "Sem radar disponível.") {
      blocos.push(`Radar: ${radar}`);
    }

    return blocos.join("\n\n");
  }

  function renderCabecalho() {
    setText("cliente-nome-topo", cliente?.nome || "Lançamentos");
    setText("cliente-subtitulo", "Registro técnico do caso.");
    setText("cliente-nome", cliente?.nome || "Cliente");
    setText("cliente-email", cliente?.email || "—");
    setText("cliente-objetivo", cliente?.objetivo || cliente?.objetivo_principal || "Objetivo principal");

    const avatar = document.getElementById("cliente-avatar");
    if (avatar) avatar.textContent = getInitials(cliente?.nome || "Cliente");

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderPre() {
    const pre = getPreDataFromCliente(cliente);
    const editados = getDadosBaseEditados();
    const nascimentoPre = getBirthPartsFromPre(pre);

    const nome = firstFilled(editados.nome, pre?.nome, cliente?.nome);
    const email = firstFilled(editados.email, pre?.email, cliente?.email);
    const telefone = firstFilled(editados.telefone, pre?.telefone, cliente?.telefone);
    const sexo = firstFilled(editados.sexoReferencia, pre?.sexo, pre?.genero);
    const dia = firstFilled(editados.nascimentoDia, nascimentoPre.dia);
    const mes = firstFilled(editados.nascimentoMes, nascimentoPre.mes);
    const ano = firstFilled(editados.nascimentoAno, nascimentoPre.ano);
    const idade = calculateAgeFromParts(dia, mes, ano);
    const objetivo = getObjetivoInicial(pre, editados);
    const resumo = getResumoInicial(pre, editados);

    setValue("pre-nome-edit", nome);
    setValue("pre-email-edit", email);
    setValue("pre-telefone-edit", telefone);
    setValue("pre-sexo-ref", sexo);
    setValue("pre-nascimento-dia", dia);
    setValue("pre-nascimento-mes", mes);
    setValue("pre-nascimento-ano", ano);
    setValue("pre-idade", idade);
    setValue("pre-objetivo", objetivo);
    setValue("pre-resumo", resumo);

    const updatedEl = document.getElementById("dados-base-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.dadosBaseUpdatedAt ? formatDate(cliente.dadosBaseUpdatedAt) : "—"}`;
    }
  }

  function saveDadosBase() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      dadosBaseEditados: {
        nome: document.getElementById("pre-nome-edit")?.value?.trim() || "",
        email: document.getElementById("pre-email-edit")?.value?.trim() || "",
        telefone: document.getElementById("pre-telefone-edit")?.value?.trim() || "",
        sexoReferencia: document.getElementById("pre-sexo-ref")?.value?.trim() || "",
        nascimentoDia: document.getElementById("pre-nascimento-dia")?.value || "",
        nascimentoMes: document.getElementById("pre-nascimento-mes")?.value || "",
        nascimentoAno: document.getElementById("pre-nascimento-ano")?.value || "",
        objetivo: document.getElementById("pre-objetivo")?.value?.trim() || "",
        resumo: document.getElementById("pre-resumo")?.value?.trim() || ""
      },
      dadosBaseUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderPre();
    showFeedback("Dados base salvos com sucesso.", "Base atualizada", "📝");
  }

  function updateIdadeFromBirthInputs() {
    const dia = document.getElementById("pre-nascimento-dia")?.value || "";
    const mes = document.getElementById("pre-nascimento-mes")?.value || "";
    const ano = document.getElementById("pre-nascimento-ano")?.value || "";
    setValue("pre-idade", calculateAgeFromParts(dia, mes, ano));
  }

  function applyProtocolVisibility() {
    const tipo = document.getElementById("sessao-tipo")?.value || "";
    const protocoloEl = document.getElementById("sessao-protocolo");
    const protocolo = protocoloEl?.value || "";

    const blocoPresencial = document.getElementById("bloco-presencial");
    const blocoAvancado = document.getElementById("bloco-avancado");
    const regraTexto = document.getElementById("sessao-regra-texto");
    const fieldAbdomenMarinha = document.getElementById("field-abdomen-marinha");
    const fieldGorduraMarinha = document.getElementById("field-gordura-marinha");
    const fieldGorduraDobras = document.getElementById("field-gordura-dobras");

    if (tipo === "online") {
      if (protocoloEl) {
        protocoloEl.value = "essencial";
        protocoloEl.disabled = true;
      }

      blocoPresencial?.classList.add("hidden");
      blocoAvancado?.classList.add("hidden");
      fieldAbdomenMarinha?.classList.remove("hidden");
      fieldGorduraMarinha?.classList.remove("hidden");
      fieldGorduraDobras?.classList.add("hidden");

      if (regraTexto) {
        regraTexto.textContent = "Online usa Marinha. Presencial essencial usa Marinha sem dobras. Presencial avançado usa dobras.";
      }
      return;
    }

    if (protocoloEl) protocoloEl.disabled = false;

    if (tipo === "presencial" && protocolo === "essencial") {
      blocoPresencial?.classList.remove("hidden");
      blocoAvancado?.classList.add("hidden");
      fieldAbdomenMarinha?.classList.remove("hidden");
      fieldGorduraMarinha?.classList.remove("hidden");
      fieldGorduraDobras?.classList.add("hidden");

      if (regraTexto) {
        regraTexto.textContent = "Presencial essencial usa Marinha + perimetria + testes, sem dobras.";
      }
      return;
    }

    if (tipo === "presencial" && protocolo === "avancado") {
      blocoPresencial?.classList.remove("hidden");
      blocoAvancado?.classList.remove("hidden");
      fieldAbdomenMarinha?.classList.add("hidden");
      fieldGorduraMarinha?.classList.add("hidden");
      fieldGorduraDobras?.classList.remove("hidden");

      if (regraTexto) {
        regraTexto.textContent = "Presencial avançado usa dobras + perimetria + testes.";
      }
      return;
    }

    blocoPresencial?.classList.add("hidden");
    blocoAvancado?.classList.add("hidden");
    fieldAbdomenMarinha?.classList.remove("hidden");
    fieldGorduraMarinha?.classList.remove("hidden");
    fieldGorduraDobras?.classList.add("hidden");

    if (regraTexto) {
      regraTexto.textContent = "Selecione o tipo da sessão para liberar o protocolo.";
    }
  }

  function renderSessao() {
    const sessao = cliente?.sessao || {};

    setValue("sessao-data", sessao.data || "");
    setValue("sessao-tipo", sessao.tipo || "");
    setValue("sessao-protocolo", sessao.protocolo || "");
    applyProtocolVisibility();

    const updatedEl = document.getElementById("sessao-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.sessaoUpdatedAt ? formatDate(cliente.sessaoUpdatedAt) : "—"}`;
    }
  }

  function saveSessao() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const tipo = document.getElementById("sessao-tipo")?.value || "";
    const protocoloSelecionado = document.getElementById("sessao-protocolo")?.value || "";
    const protocoloFinal = tipo === "online" ? "essencial" : protocoloSelecionado;

    clientes[index] = {
      ...clientes[index],
      sessao: {
        data: document.getElementById("sessao-data")?.value || "",
        tipo,
        protocolo: protocoloFinal
      },
      sessaoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderSessao();
    showFeedback("Sessão salva com sucesso.", "Sessão atualizada", "📌");
  }

  function calculateMarineBodyFat(heightM, neckCm, waistCm, hipCm, sexRef) {
    const heightCm = heightM * 100;
    if (!heightCm || !neckCm || !waistCm) return "";

    if (sexRef.includes("f")) {
      if (!hipCm) return "";
      const v =
        163.205 * Math.log10(waistCm + hipCm - neckCm) -
        97.684 * Math.log10(heightCm) -
        78.387;
      return Number.isFinite(v) ? v.toFixed(2) : "";
    }

    const diff = waistCm - neckCm;
    if (diff <= 0) return "";
    const v =
      86.01 * Math.log10(diff) -
      70.041 * Math.log10(heightCm) +
      36.76;
    return Number.isFinite(v) ? v.toFixed(2) : "";
  }

  function calculateDobrasBodyFat(sumDobras, age, sexRef) {
    if (!sumDobras || !age) return "";

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) return "";

    let densidade = null;

    if (sexRef.includes("f")) {
      densidade =
        1.0970 -
        0.00046971 * sumDobras +
        0.00000056 * Math.pow(sumDobras, 2) -
        0.00012828 * ageNum;
    } else {
      densidade =
        1.112 -
        0.00043499 * sumDobras +
        0.00000055 * Math.pow(sumDobras, 2) -
        0.00028826 * ageNum;
    }

    if (!Number.isFinite(densidade) || densidade <= 0) return "";

    const gordura = (495 / densidade) - 450;
    return Number.isFinite(gordura) ? gordura.toFixed(2) : "";
  }

  function calcularAvaliacao() {
    const tipo = document.getElementById("sessao-tipo")?.value || "";
    const protocolo = document.getElementById("sessao-protocolo")?.value || "";

    const peso = parseFloat(document.getElementById("peso")?.value || "");
    const altura = parseFloat(document.getElementById("altura")?.value || "");
    const cintura = parseFloat(document.getElementById("cintura")?.value || "");
    const quadril = parseFloat(document.getElementById("quadril")?.value || "");
    const pescoco = parseFloat(document.getElementById("pescoco")?.value || "");
    const abdomenMarinha = parseFloat(document.getElementById("abdomen-marinha")?.value || "");

    const pre = getPreDataFromCliente(cliente);
    const sexoRef = getReferenceSex(pre);
    const idadeRef = getReferenceAge(pre);

    if (peso && altura) {
      setValue("imc", (peso / (altura * altura)).toFixed(2));
    } else {
      setValue("imc", "");
    }

    if (cintura && quadril) {
      setValue("rcq", (cintura / quadril).toFixed(2));
    } else {
      setValue("rcq", "");
    }

    if (cintura && altura) {
      setValue("rce", (cintura / (altura * 100)).toFixed(2));
    } else {
      setValue("rce", "");
    }

    const usaMarinha =
      tipo === "online" || (tipo === "presencial" && protocolo === "essencial");

    if (usaMarinha) {
      setValue(
        "gordura-marinha",
        calculateMarineBodyFat(altura, pescoco, abdomenMarinha || cintura, quadril, sexoRef)
      );
    } else {
      setValue("gordura-marinha", "");
    }

    const idsDobras = [
      "dobra-peitoral",
      "dobra-axilar",
      "dobra-triceps",
      "dobra-subescapular",
      "dobra-abdominal",
      "dobra-suprailiaca",
      "dobra-coxa"
    ];

    const somaDobras = idsDobras.reduce((acc, id) => {
      const n = parseFloat(document.getElementById(id)?.value || "");
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

    setValue("dobras-soma", somaDobras > 0 ? somaDobras.toFixed(1) : "");

    if (tipo === "presencial" && protocolo === "avancado") {
      setValue("gordura-dobras", calculateDobrasBodyFat(somaDobras, idadeRef, sexoRef));
    } else {
      setValue("gordura-dobras", "");
    }
  }

  function renderAvaliacao() {
    const a = cliente?.avaliacao || {};

    [
      "peso","altura","cintura","quadril","pescoco","abdomen-marinha","imc","rcq","rce",
      "gordura-marinha","gordura-dobras","torax","abdomen","braco-direito","braco-esquerdo",
      "coxa-direita","coxa-esquerda","panturrilha","dobra-peitoral","dobra-axilar",
      "dobra-triceps","dobra-subescapular","dobra-abdominal","dobra-suprailiaca",
      "dobra-coxa","dobras-soma","teste-overhead","teste-thomas","teste-sentar-alcancar",
      "teste-step-fc","teste-step-borg","teste-step-classificacao"
    ].forEach((id) => setValue(id, a[id] || ""));

    const updatedEl = document.getElementById("avaliacao-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.avaliacaoUpdatedAt ? formatDate(cliente.avaliacaoUpdatedAt) : "—"}`;
    }
  }

  function saveAvaliacao() {
    calcularAvaliacao();

    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const ids = [
      "peso","altura","cintura","quadril","pescoco","abdomen-marinha","imc","rcq","rce",
      "gordura-marinha","gordura-dobras","torax","abdomen","braco-direito","braco-esquerdo",
      "coxa-direita","coxa-esquerda","panturrilha","dobra-peitoral","dobra-axilar",
      "dobra-triceps","dobra-subescapular","dobra-abdominal","dobra-suprailiaca",
      "dobra-coxa","dobras-soma","teste-overhead","teste-thomas","teste-sentar-alcancar",
      "teste-step-fc","teste-step-borg","teste-step-classificacao"
    ];

    const avaliacao = {};
    ids.forEach((id) => {
      avaliacao[id] = document.getElementById(id)?.value || "";
    });

    clientes[index] = {
      ...clientes[index],
      avaliacao,
      avaliacaoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderAvaliacao();
    showFeedback("Avaliação salva com sucesso.", "Avaliação atualizada", "📊");
  }

  function renderRadar() {
    const pre = getPreDataFromCliente(cliente);
    const radarPre = getRadarData(pre);
    const radarRevisado = cliente?.radarRevisado || {};

    RADAR_KEYS.forEach((key) => {
      setText(`radar-pre-${key}`, radarPre?.[key] ?? "—");
      setValue(`radar-revisado-${key}`, radarRevisado?.[key] ?? "");
    });

    const updatedEl = document.getElementById("radar-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.radarRevisadoUpdatedAt ? formatDate(cliente.radarRevisadoUpdatedAt) : "—"}`;
    }
  }

  function saveRadar() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const radarRevisado = {};
    RADAR_KEYS.forEach((key) => {
      const raw = document.getElementById(`radar-revisado-${key}`)?.value;
      radarRevisado[key] = raw === "" ? null : Number(raw);
    });

    clientes[index] = {
      ...clientes[index],
      radarRevisado,
      radarRevisadoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderRadar();
    showFeedback("Radar revisado salvo com sucesso.", "Radar atualizado", "🧠");
  }

  function renderDiagnostico() {
    setValue("diag-gargalo", cliente?.diagnosticoGargalo || "");
    setValue("diag-perfil", cliente?.diagnosticoPerfil || "");
    setValue("diag-triagem", cliente?.diagnosticoTriagem || "");
    setValue("diag-prioridade", cliente?.diagnosticoPrioridade || "");
    setValue("diag-leitura", cliente?.diagnosticoLeitura || "");
    setValue("diag-sintese", cliente?.diagnosticoSintese || "");
    setValue("diag-conduta", cliente?.condutaInicial || "");

    const updatedEl = document.getElementById("diag-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.diagnosticoUpdatedAt ? formatDate(cliente.diagnosticoUpdatedAt) : "—"}`;
    }
  }

  function saveDiagnostico() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    clientes[index] = {
      ...clientes[index],
      diagnosticoGargalo: document.getElementById("diag-gargalo")?.value.trim() || "",
      diagnosticoPerfil: document.getElementById("diag-perfil")?.value.trim() || "",
      diagnosticoTriagem: document.getElementById("diag-triagem")?.value.trim() || "",
      diagnosticoPrioridade: document.getElementById("diag-prioridade")?.value.trim() || "",
      diagnosticoLeitura: document.getElementById("diag-leitura")?.value.trim() || "",
      diagnosticoSintese: document.getElementById("diag-sintese")?.value.trim() || "",
      condutaInicial: document.getElementById("diag-conduta")?.value.trim() || "",
      diagnosticoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderDiagnostico();
    showFeedback("Diagnóstico salvo com sucesso.", "Diagnóstico atualizado", "🩺");
  }

  function renderAcompanhamentos() {
    const lista = document.getElementById("acompanhamentos-lista");
    if (!lista) return;

    const acompanhamentos = Array.isArray(cliente?.acompanhamentos) ? cliente.acompanhamentos : [];

    const updatedEl = document.getElementById("acomp-updated");
    if (updatedEl) {
      updatedEl.textContent = `Última atualização: ${cliente?.acompanhamentoUpdatedAt ? formatDate(cliente.acompanhamentoUpdatedAt) : "—"}`;
    }

    if (!acompanhamentos.length) {
      lista.innerHTML = `<div class="cliente-placeholder-box">Nenhum acompanhamento salvo ainda.</div>`;
      return;
    }

    lista.innerHTML = acompanhamentos
      .slice()
      .reverse()
      .map((item) => `
        <div class="acomp-item">
          <div class="acomp-item-top">
            <strong>${item.data ? formatDate(item.data) : "Sem data"}</strong>
            <span>${item.aderencia || "Sem aderência informada"}</span>
          </div>
          <p><strong>Evolução:</strong> ${item.evolucao || "—"}</p>
          <p><strong>Dificuldades:</strong> ${item.dificuldades || "—"}</p>
          <p><strong>Ajustes:</strong> ${item.ajustes || "—"}</p>
        </div>
      `)
      .join("");
  }

  function resetFormAcompanhamento() {
    const hoje = new Date();
    setValue("acomp-data", formatDateForInput(hoje));
    setValue("acomp-aderencia", "");
    setValue("acomp-evolucao", "");
    setValue("acomp-dificuldades", "");
    setValue("acomp-ajustes", "");
  }

  function saveAcompanhamento() {
    const clientes = getClientes();
    const index = clientes.findIndex((item) => String(item.id) === String(clienteId));
    if (index === -1) return;

    const novo = {
      data: document.getElementById("acomp-data")?.value || "",
      aderencia: document.getElementById("acomp-aderencia")?.value.trim() || "",
      evolucao: document.getElementById("acomp-evolucao")?.value.trim() || "",
      dificuldades: document.getElementById("acomp-dificuldades")?.value.trim() || "",
      ajustes: document.getElementById("acomp-ajustes")?.value.trim() || "",
      createdAt: new Date().toISOString()
    };

    const acompanhamentos = Array.isArray(clientes[index].acompanhamentos)
      ? clientes[index].acompanhamentos
      : [];

    acompanhamentos.push(novo);

    clientes[index] = {
      ...clientes[index],
      acompanhamentos,
      acompanhamentoUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientes(clientes);
    cliente = clientes[index];
    renderAcompanhamentos();
    resetFormAcompanhamento();
    showFeedback("Acompanhamento salvo com sucesso.", "Acompanhamento atualizado", "📅");
  }

  function bindEvents() {
    document.getElementById("sessao-tipo")?.addEventListener("change", applyProtocolVisibility);
    document.getElementById("sessao-protocolo")?.addEventListener("change", applyProtocolVisibility);

    document.getElementById("pre-nascimento-dia")?.addEventListener("input", updateIdadeFromBirthInputs);
    document.getElementById("pre-nascimento-mes")?.addEventListener("change", updateIdadeFromBirthInputs);
    document.getElementById("pre-nascimento-ano")?.addEventListener("input", updateIdadeFromBirthInputs);

    document.getElementById("salvar-dados-base-btn")?.addEventListener("click", saveDadosBase);
    document.getElementById("salvar-sessao-btn")?.addEventListener("click", saveSessao);
    document.getElementById("calcular-btn")?.addEventListener("click", calcularAvaliacao);
    document.getElementById("salvar-avaliacao-btn")?.addEventListener("click", saveAvaliacao);
    document.getElementById("salvar-radar-btn")?.addEventListener("click", saveRadar);
    document.getElementById("salvar-diagnostico-btn")?.addEventListener("click", saveDiagnostico);
    document.getElementById("salvar-acompanhamento-btn")?.addEventListener("click", saveAcompanhamento);
  }

  function init() {
    clienteId = getQueryParam("id");
    ensureFeedbackModal();

    if (!clienteId) {
      document.getElementById("lancamentos-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    cliente = getClienteById(clienteId);

    if (!cliente) {
      document.getElementById("lancamentos-page")?.classList.add("hidden");
      document.getElementById("cliente-not-found")?.classList.remove("hidden");
      return;
    }

    renderCabecalho();
    renderPre();
    renderSessao();
    renderAvaliacao();
    renderRadar();
    renderDiagnostico();
    renderAcompanhamentos();
    resetFormAcompanhamento();
    bindEvents();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZALancamentos.init();
});