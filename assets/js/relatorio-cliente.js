document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  const printBtn = document.getElementById("print-report-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  if (window.ZAStorage?.init) {
    await window.ZAStorage.init({ force: true });
  }

  const notFoundEl = document.getElementById("relatorio-not-found");
  const relatorioPage = document.getElementById("relatorio-page");

  function showNotFound() {
    notFoundEl?.classList.remove("hidden");
    relatorioPage?.classList.add("hidden");
  }

  if (!clienteId) {
    showNotFound();
    return;
  }

  const clientes =
    window.ZAStorage?.getClientes?.() ||
    JSON.parse(localStorage.getItem("za_clientes") || "[]");

  const leads =
    window.ZAStorage?.getLeads?.() ||
    JSON.parse(localStorage.getItem("za_leads") || "[]");

  const cliente = clientes.find((c) => String(c.id) === String(clienteId));
  const leadRelacionado =
    leads.find((l) => String(l.clienteId) === String(clienteId)) ||
    leads.find((l) => String(l.id) === String(clienteId)) ||
    null;

  if (!cliente) {
    showNotFound();
    return;
  }

  const pre = cliente.preDiagnostico || leadRelacionado || {};
  const planejamento = cliente.planejamento || {};
  const relatorioCompleto = cliente.relatorioCompleto || {};
  const base = cliente.dadosBaseEditados || {};
  const estrategia = planejamento.estrategia || {};
  const diagnostico = planejamento.diagnostico || {};
  const metricasPlanejamento = planejamento.metricas || {};
  const habitos = planejamento.habitos || {};
  const treino = planejamento.treino || {};
  const cardio = planejamento.cardio || {};
  const nutricional = planejamento.nutricional || {};
  const radarPlanejamento = planejamento.radar || {};
  const perimetriaPlanejamento = planejamento.perimetria || {};
  const examesPlanejamento = planejamento.exames || {};
  const profissionalPlanejamento = planejamento.profissional || {};

  const PROFISSIONAIS = {
    marcio: {
      nome: "Márcio Dowglas",
      cref: "003918-G/AM"
    },
    filipe: {
      nome: "Filipe Oliveira",
      cref: "008318-G/AM"
    }
  };

  function getProfissionalAtual() {
    const key = (localStorage.getItem("profissional_ativo") || "marcio").toLowerCase();
    return PROFISSIONAIS[key] || PROFISSIONAIS.marcio;
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value === 0) return value;
      if (value === false) return value;
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "—";
  }

  function hasContent(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "number") return true;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return String(value).trim() !== "" && String(value).trim() !== "—";
  }

  function asNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === "") return fallback;
    const cleaned = String(value).replace(",", ".").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatDateBR(value) {
    if (!value) return new Date().toLocaleDateString("pt-BR");
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("pt-BR");
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
  }

  function initials(name) {
    return String(name || "C").trim().charAt(0).toUpperCase();
  }

  function toTitle(value) {
    if (!value || value === "—") return "—";
    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function createEmptyBox(texto = "Ainda não há lançamentos para este bloco.") {
    return `<div class="empty-box">${texto}</div>`;
  }

  function metricCard(label, atual, anterior, suffix = "") {
    const atualNum = asNumber(atual, 0);
    const anteriorNum = asNumber(anterior, 0);
    const delta = atualNum - anteriorNum;

    let deltaClass = "delta-neutral";
    if (delta > 0) deltaClass = "delta-positive";
    if (delta < 0) deltaClass = "delta-negative";

    const deltaText = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${suffix}`;

    return `
      <div class="metric-card">
        <span class="metric-label">${label}</span>
        <div class="metric-values">
          <div>
            <small>Atual</small>
            <strong>${atualNum}${suffix}</strong>
          </div>
          <div>
            <small>Anterior</small>
            <strong>${anteriorNum}${suffix}</strong>
          </div>
        </div>
        <div class="metric-delta ${deltaClass}">
          Δ ${deltaText}
        </div>
      </div>
    `;
  }

  function perimetriaCard(label, value) {
    return `
      <div class="perimetria-item">
        <span>${label}</span>
        <strong>${String(value).includes("cm") ? value : `${value} cm`}</strong>
      </div>
    `;
  }

  function exameCard(label, valor, referencia = "—", observacao = "—") {
    return `
      <div class="summary-item">
        <span class="summary-label">${label}</span>
        <div class="summary-value">${valor}</div>
        <div style="margin-top:10px; color:#64748b; font-size:13px; line-height:1.6;">
          Referência: ${referencia}<br>
          Observação: ${observacao}
        </div>
      </div>
    `;
  }

  function getLegacyPrePilares() {
    return {
      movimento: asNumber(firstFilled(pre.score_movimento, pre.movimento, pre.radar?.movimento, pre.radar?.treino, 0), 0),
      alimentacao: asNumber(firstFilled(pre.score_alimentacao, pre.alimentacao, pre.radar?.alimentacao, pre.radar?.dieta, 0), 0),
      sono: asNumber(firstFilled(pre.score_sono, pre.sono, pre.radar?.sono, 0), 0),
      proposito: asNumber(firstFilled(pre.score_proposito, pre.proposito, pre.radar?.proposito, pre.radar?.disciplina, 0), 0),
      social: asNumber(firstFilled(pre.score_social, pre.social, pre.radar?.social, 0), 0),
      estresse: asNumber(firstFilled(pre.score_estresse, pre.estresse, pre.radar?.estresse, pre.radar?.mental, 0), 0)
    };
  }

  function getLegacyAtualPilares() {
    return {
      movimento: asNumber(firstFilled(radarPlanejamento.movimento, radarPlanejamento.treino, pre.score_movimento, 0), 0),
      alimentacao: asNumber(firstFilled(radarPlanejamento.alimentacao, radarPlanejamento.dieta, pre.score_alimentacao, 0), 0),
      sono: asNumber(firstFilled(radarPlanejamento.sono, pre.score_sono, 0), 0),
      proposito: asNumber(firstFilled(radarPlanejamento.proposito, radarPlanejamento.disciplina, pre.score_proposito, 0), 0),
      social: asNumber(firstFilled(radarPlanejamento.social, pre.score_social, 0), 0),
      estresse: asNumber(firstFilled(radarPlanejamento.estresse, radarPlanejamento.mental, pre.score_estresse, 0), 0)
    };
  }

  function normalizeAvaliacao(raw = {}, fallbackTipo = "reavaliacao") {
    const pilares = raw.pilares || raw.radar || {};
    const metricas = raw.metricas || {};
    const analise = raw.analise || {};
    const direcao = raw.direcionamento || raw.proximoCiclo || {};
    const perimetria = raw.perimetria || {};
    const exames = raw.exames || {};
    const testes = Array.isArray(raw.testes) ? raw.testes : [];

    return {
      id: raw.id || null,
      tipo: raw.tipo || fallbackTipo,
      data: raw.data || raw.createdAt || raw.updatedAt || null,
      titulo: raw.titulo || null,
      protocolo: raw.protocolo || raw.protocoloFisico || raw.protocolo_fisico || "",
      resumo: raw.resumo || raw.descricao || null,

      objetivo: firstFilled(raw.objetivo, raw.objetivo_principal, raw.objetivo_fisico),
      fase: firstFilled(raw.fase, raw.fase_atual, raw.fase_nome),

      pilares: {
        movimento: asNumber(firstFilled(pilares.movimento, pilares.treino, raw.score_movimento, raw.movimento, 0), 0),
        alimentacao: asNumber(firstFilled(pilares.alimentacao, pilares.dieta, raw.score_alimentacao, raw.alimentacao, 0), 0),
        sono: asNumber(firstFilled(pilares.sono, raw.score_sono, raw.sono, 0), 0),
        proposito: asNumber(firstFilled(pilares.proposito, pilares.disciplina, raw.score_proposito, raw.proposito, 0), 0),
        social: asNumber(firstFilled(pilares.social, raw.score_social, raw.social, 0), 0),
        estresse: asNumber(firstFilled(pilares.estresse, pilares.mental, raw.score_estresse, raw.estresse, 0), 0)
      },

      metricas: {
        peso: firstFilled(metricas.peso, raw.peso),
        bf: firstFilled(metricas.bf, raw.bf, raw.percentual_gordura),
        massa_magra: firstFilled(metricas.massa_magra, metricas.massa, raw.massaMagra, raw.massa),
        cintura: firstFilled(metricas.cintura, raw.cintura),
        rcq: firstFilled(metricas.rcq, raw.rcq),
        rce: firstFilled(metricas.rce, raw.rce),
        altura: firstFilled(metricas.altura, raw.altura)
      },

      perimetria: {
        peito: firstFilled(perimetria.peito, raw.peito),
        cintura: firstFilled(perimetria.cintura, raw.cintura),
        abdome: firstFilled(perimetria.abdome, raw.abdome),
        quadril: firstFilled(perimetria.quadril, raw.quadril),
        braco: firstFilled(perimetria.braco, raw.braco),
        coxa: firstFilled(perimetria.coxa, raw.coxa),
        panturrilha: firstFilled(perimetria.panturrilha, raw.panturrilha)
      },

      analise: {
        leitura: firstFilled(analise.leitura, raw.leituraTecnica, raw.leitura),
        sintese: firstFilled(analise.sintese, raw.sinteseDiagnostica, raw.sintese),
        aderencia: firstFilled(analise.aderencia, raw.aderencia),
        ambiente: firstFilled(analise.ambiente, raw.ambiente),
        sabotadores: firstFilled(analise.sabotadores, raw.sabotadores, raw.maior_dificuldade),
        leitura_comportamental: firstFilled(analise.leitura_comportamental, raw.leituraComportamental),
        avanco_principal: firstFilled(analise.avanco_principal, raw.avancoPrincipal),
        gargalo_principal: firstFilled(analise.gargalo_principal, raw.gargaloPrincipal),
        prioridade: firstFilled(analise.prioridade, raw.prioridade, raw.foco)
      },

      direcionamento: {
        manter: firstFilled(direcao.manter, raw.manter),
        ajustar: firstFilled(direcao.ajustar, raw.ajustar),
        foco: firstFilled(direcao.foco, raw.focoProximoCiclo, raw.foco),
        meta: firstFilled(direcao.meta, raw.metaPrincipal, raw.meta)
      },

      exames,
      testes
    };
  }

  function buildAvaliacoesFromLegacy() {
    const legacyPre = normalizeAvaliacao({
      id: "legacy-pre",
      tipo: "pre_diagnostico",
      data: firstFilled(pre.created_at, cliente.createdAt, cliente.data_inicio),
      protocolo: pre.protocolo || "base",
      objetivo: firstFilled(pre.objetivo, pre.objetivo_principal, pre.objetivo_fisico, cliente.objetivo),
      fase: firstFilled(cliente.fase, cliente.fase_atual, cliente.fase_nome),
      score_movimento: pre.score_movimento,
      score_alimentacao: pre.score_alimentacao,
      score_sono: pre.score_sono,
      score_proposito: pre.score_proposito,
      score_social: pre.score_social,
      score_estresse: pre.score_estresse,
      peso: firstFilled(base.peso, pre.peso, cliente.peso),
      bf: firstFilled(base.bf, pre.bf, pre.percentual_gordura, cliente.bf),
      massaMagra: firstFilled(base.massaMagra, pre.massaMagra, cliente.massaMagra),
      cintura: firstFilled(base.cintura, pre.cintura, cliente.cintura),
      rcq: firstFilled(base.rcq, pre.rcq, cliente.rcq),
      rce: firstFilled(base.rce, pre.rce, cliente.rce),
      altura: firstFilled(base.altura, pre.altura, cliente.altura),
      ambiente: pre.ambiente,
      sabotadores: firstFilled(pre.sabotadores, pre.maior_dificuldade),
      aderencia: pre.aderencia,
      leituraComportamental: pre.leituraComportamental,
      leituraTecnica: pre.leituraTecnica,
      sinteseDiagnostica: pre.sinteseDiagnostica,
      avancoPrincipal: "Leitura inicial construída a partir do pré-diagnóstico.",
      gargaloPrincipal: firstFilled(pre.dificuldade_principal, pre.maior_dificuldade, pre.queixa_principal),
      prioridade: "Estruturar base inicial",
      manter: "Manter engajamento e observação inicial do caso.",
      ajustar: "Ajustar consistência e previsibilidade da rotina.",
      focoProximoCiclo: "Construir base comportamental",
      metaPrincipal: firstFilled(pre.meta_6_meses, cliente.objetivo),
      perimetria: {
        peito: firstFilled(base.peito, pre.peito),
        cintura: firstFilled(base.cintura, pre.cintura),
        abdome: firstFilled(base.abdome, pre.abdome),
        quadril: firstFilled(base.quadril, pre.quadril),
        braco: firstFilled(base.braco, pre.braco),
        coxa: firstFilled(base.coxa, pre.coxa),
        panturrilha: firstFilled(base.panturrilha, pre.panturrilha)
      }
    }, "pre_diagnostico");

    const legacyAtual = normalizeAvaliacao({
      id: "legacy-atual",
      tipo: "reavaliacao",
      data: firstFilled(cliente.updatedAt, new Date().toISOString()),
      protocolo: firstFilled(
        planejamento.protocoloFisico,
        diagnostico.protocolo_fisico,
        relatorioCompleto.protocoloFisico
      ),
      objetivo: firstFilled(estrategia.objetivo30d, base.objetivo, pre.objetivo, cliente.objetivo),
      fase: firstFilled(estrategia.fase, cliente.fase_nome, cliente.fase_atual, cliente.fase),
      pilares: getLegacyAtualPilares(),
      metricas: {
        peso: firstFilled(metricasPlanejamento.peso, base.peso, pre.peso, cliente.peso),
        bf: firstFilled(metricasPlanejamento.bf, base.bf, pre.bf, pre.percentual_gordura, cliente.bf),
        massa_magra: firstFilled(metricasPlanejamento.massa, base.massaMagra, pre.massaMagra, cliente.massaMagra),
        cintura: firstFilled(metricasPlanejamento.cintura, base.cintura, pre.cintura, cliente.cintura),
        rcq: firstFilled(metricasPlanejamento.rcq, base.rcq, pre.rcq, cliente.rcq),
        rce: firstFilled(metricasPlanejamento.rce, base.rce, pre.rce, cliente.rce),
        altura: firstFilled(base.altura, pre.altura, cliente.altura)
      },
      leituraTecnica: firstFilled(relatorioCompleto.leituraTecnica, diagnostico.leitura, planejamento.leituraTecnica),
      sinteseDiagnostica: firstFilled(relatorioCompleto.sinteseDiagnostica, diagnostico.sintese, planejamento.sinteseDiagnostica),
      aderencia: firstFilled(relatorioCompleto.aderencia, planejamento.aderencia, habitos.regraMinima),
      ambiente: firstFilled(relatorioCompleto.ambiente, habitos.ajusteAmbiente, planejamento.ambiente),
      sabotadores: firstFilled(relatorioCompleto.sabotadores, planejamento.sabotadores, pre.sabotadores),
      leituraComportamental: firstFilled(relatorioCompleto.leituraComportamental, planejamento.leituraComportamental),
      avancoPrincipal: firstFilled(relatorioCompleto.avancoPrincipal, estrategia.avancoPrincipal, diagnostico.avancoPrincipal),
      gargaloPrincipal: firstFilled(relatorioCompleto.gargaloPrincipal, estrategia.gargaloPrincipal, diagnostico.gargaloPrincipal),
      prioridade: firstFilled(relatorioCompleto.prioridade, estrategia.focoCentral, diagnostico.foco),
      manter: firstFilled(relatorioCompleto.manter, planejamento.manter, treino.frequencia),
      ajustar: firstFilled(relatorioCompleto.ajustar, planejamento.ajustar, cardio.frequencia, nutricional.regraMinima),
      focoProximoCiclo: firstFilled(relatorioCompleto.focoProximoCiclo, planejamento.focoProximoCiclo, estrategia.focoCentral),
      metaPrincipal: firstFilled(relatorioCompleto.metaPrincipal, planejamento.metaPrincipal, estrategia.objetivo30d, cliente.objetivo),
      perimetria: perimetriaPlanejamento,
      exames: examesPlanejamento || relatorioCompleto.exames || cliente.exames || {},
      testes: Array.isArray(planejamento.testes) ? planejamento.testes : []
    }, "reavaliacao");

    const legacyReavaliacoes = Array.isArray(cliente.reavaliacoes)
      ? cliente.reavaliacoes.map((item) =>
          normalizeAvaliacao(
            {
              ...item,
              tipo: item.tipo || "reavaliacao",
              data: item.data,
              titulo: item.titulo,
              resumo: item.resumo || item.descricao
            },
            "reavaliacao"
          )
        )
      : [];

    return [legacyPre, ...legacyReavaliacoes, legacyAtual]
      .filter(Boolean)
      .sort((a, b) => new Date(a.data || 0) - new Date(b.data || 0));
  }

  const avaliacoes = Array.isArray(cliente.avaliacoes) && cliente.avaliacoes.length
    ? cliente.avaliacoes
        .map((item) => normalizeAvaliacao(item, item?.tipo || "reavaliacao"))
        .sort((a, b) => new Date(a.data || 0) - new Date(b.data || 0))
    : buildAvaliacoesFromLegacy();

  const avaliacaoAtual = avaliacoes[avaliacoes.length - 1] || normalizeAvaliacao({}, "reavaliacao");

  let avaliacaoAnterior = avaliacoes.length > 1 ? avaliacoes[avaliacoes.length - 2] : null;

  const prePilares = getLegacyPrePilares();
  const hasPreRadar = Object.values(prePilares).some((v) => Number.isFinite(v) && v > 0);

  if (!avaliacaoAnterior && hasPreRadar) {
    avaliacaoAnterior = normalizeAvaliacao({
      id: "fallback-pre",
      tipo: "pre_diagnostico",
      data: firstFilled(pre.created_at, cliente.createdAt, cliente.data_inicio),
      pilares: prePilares,
      metricas: {
        peso: firstFilled(base.peso, pre.peso, cliente.peso),
        bf: firstFilled(base.bf, pre.bf, pre.percentual_gordura, cliente.bf),
        massa_magra: firstFilled(base.massaMagra, pre.massaMagra, cliente.massaMagra),
        cintura: firstFilled(base.cintura, pre.cintura, cliente.cintura),
        rcq: firstFilled(base.rcq, pre.rcq, cliente.rcq),
        rce: firstFilled(base.rce, pre.rce, cliente.rce)
      }
    }, "pre_diagnostico");
  }

  const acompanhamentos = Array.isArray(cliente.acompanhamentos) ? cliente.acompanhamentos : [];
  const timelineCliente = Array.isArray(cliente.timeline) ? cliente.timeline : [];

  const nomeCliente = firstFilled(cliente.nome, pre.nome, "Cliente");
  const emailCliente = firstFilled(cliente.email, pre.email, "");
  const objetivoCliente = firstFilled(
    avaliacaoAtual.objetivo,
    cliente.objetivo,
    pre.objetivo,
    pre.objetivo_principal,
    pre.objetivo_fisico
  );
  const faseCliente = firstFilled(
    avaliacaoAtual.fase,
    cliente.fase_nome,
    cliente.fase_atual,
    cliente.fase,
    "Fase não definida"
  );

  const profAtivo = getProfissionalAtual();
  const nomeProfissional = firstFilled(
    cliente.profissional?.nome,
    profissionalPlanejamento.nome,
    profAtivo.nome
  );
  const crefProfissional = firstFilled(
    cliente.profissional?.cref,
    profissionalPlanejamento.cref,
    profAtivo.cref
  );

  text("report-profissional-nome", nomeProfissional);
  text("report-profissional-cref", crefProfissional);
  text("report-nome", nomeCliente);
  text("report-email", emailCliente === "—" ? "" : emailCliente);

  const reportMeta = firstFilled(
    base.observacaoInicial,
    pre.rotina,
    pre.queixa_principal,
    pre.queixa,
    cliente.objetivo,
    ""
  );
  text("report-meta", reportMeta === "—" ? "" : reportMeta);

  const avatar = document.getElementById("report-avatar");
  if (avatar) avatar.textContent = initials(nomeCliente);

  text("report-data-geracao", formatDateBR(new Date()));
  text("report-fase-chip", `Fase atual: ${faseCliente}`);
  text("report-objetivo-chip", `Objetivo: ${objetivoCliente}`);
  text("report-cliente-meta-nome", nomeCliente);
  text("report-cliente-meta-objetivo", objetivoCliente);
  text("report-cliente-meta-fase", faseCliente);
  text("report-cliente-meta-fase-side", faseCliente);

  const voltarLink = document.getElementById("voltar-cliente-link");
  if (voltarLink) {
    voltarLink.href = `../cliente/index.html?id=${clienteId}`;
  }

  text("summary-objetivo", objetivoCliente);
  text(
    "summary-avanco",
    firstFilled(avaliacaoAtual.analise.avanco_principal, "Leitura do avanço ainda não registrada.")
  );
  text(
    "summary-gargalo",
    firstFilled(avaliacaoAtual.analise.gargalo_principal, "Gargalo principal ainda não registrado.")
  );
  text(
    "summary-prioridade",
    firstFilled(avaliacaoAtual.analise.prioridade, avaliacaoAtual.direcionamento.foco, "Prioridade do próximo ciclo ainda não definida.")
  );

  const protocoloFisico = String(firstFilled(avaliacaoAtual.protocolo, "")).toLowerCase();

  const pesoAnterior = firstFilled(avaliacaoAnterior?.metricas?.peso, 0);
  const pesoAtual = firstFilled(avaliacaoAtual.metricas.peso, 0);

  const bfAnterior = firstFilled(avaliacaoAnterior?.metricas?.bf, 0);
  const bfAtual = firstFilled(avaliacaoAtual.metricas.bf, 0);

  const massaAnterior = firstFilled(avaliacaoAnterior?.metricas?.massa_magra, 0);
  const massaAtual = firstFilled(avaliacaoAtual.metricas.massa_magra, 0);

  const cinturaAnterior = firstFilled(avaliacaoAnterior?.metricas?.cintura, 0);
  const cinturaAtual = firstFilled(avaliacaoAtual.metricas.cintura, 0);

  const rcqAnterior = firstFilled(avaliacaoAnterior?.metricas?.rcq, 0);
  const rcqAtual = firstFilled(avaliacaoAtual.metricas.rcq, 0);

  const rceAnterior = firstFilled(avaliacaoAnterior?.metricas?.rce, 0);
  const rceAtual = firstFilled(avaliacaoAtual.metricas.rce, 0);

  const mostrarMassaMagra =
    hasContent(massaAtual) &&
    asNumber(massaAtual, 0) > 0 &&
    !protocoloFisico.includes("marinha");

  const metricCards = [];

  if (hasContent(pesoAtual) && asNumber(pesoAtual, 0) > 0) {
    metricCards.push(metricCard("Peso", pesoAtual, pesoAnterior, " kg"));
  }

  if (hasContent(bfAtual) && asNumber(bfAtual, 0) > 0) {
    metricCards.push(metricCard("BF", bfAtual, bfAnterior, "%"));
  }

  if (mostrarMassaMagra) {
    metricCards.push(metricCard("Massa magra", massaAtual, massaAnterior, " kg"));
  }

  if (hasContent(cinturaAtual) && asNumber(cinturaAtual, 0) > 0) {
    metricCards.push(metricCard("Cintura", cinturaAtual, cinturaAnterior, " cm"));
  }

  if (hasContent(rcqAtual) && asNumber(rcqAtual, 0) > 0) {
    metricCards.push(metricCard("RCQ", rcqAtual, rcqAnterior, ""));
  }

  if (hasContent(rceAtual) && asNumber(rceAtual, 0) > 0) {
    metricCards.push(metricCard("RCE", rceAtual, rceAnterior, ""));
  }

  const metricsGrid = document.getElementById("metrics-grid");
  if (metricsGrid) {
    metricsGrid.innerHTML = metricCards.length ? metricCards.join("") : createEmptyBox();
  }

  const radarCanvas = document.getElementById("radar-chart");
  const radarAtual = avaliacaoAtual.pilares || {};
  const radarAnterior = avaliacaoAnterior?.pilares || null;

  const hasRadarAtual = Object.values(radarAtual).some((v) => Number.isFinite(v) && v > 0);
  const hasRadarAnterior = radarAnterior && Object.values(radarAnterior).some((v) => Number.isFinite(v) && v > 0);

  if (radarCanvas && typeof Chart !== "undefined" && hasRadarAtual) {
    const datasets = [];

    if (hasRadarAnterior) {
      datasets.push({
        label: avaliacaoAnterior?.tipo === "pre_diagnostico" ? "Base inicial" : "Última avaliação",
        data: [
          radarAnterior.movimento || 0,
          radarAnterior.alimentacao || 0,
          radarAnterior.sono || 0,
          radarAnterior.proposito || 0,
          radarAnterior.social || 0,
          radarAnterior.estresse || 0
        ],
        borderColor: "rgba(140, 156, 181, 0.95)",
        backgroundColor: "rgba(140, 156, 181, 0.14)",
        pointBackgroundColor: "rgba(140, 156, 181, 0.95)",
        pointBorderColor: "#ffffff",
        borderWidth: 2
      });
    }

    datasets.push({
      label: "Avaliação atual",
      data: [
        radarAtual.movimento || 0,
        radarAtual.alimentacao || 0,
        radarAtual.sono || 0,
        radarAtual.proposito || 0,
        radarAtual.social || 0,
        radarAtual.estresse || 0
      ],
      borderColor: "#47b8ff",
      backgroundColor: "rgba(71,184,255,0.20)",
      pointBackgroundColor: "#47b8ff",
      pointBorderColor: "#ffffff",
      borderWidth: 2
    });

    new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Movimento", "Alimentação", "Sono", "Propósito", "Social", "Estresse"],
        datasets
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { display: false },
            grid: { color: "rgba(16,24,40,0.12)" },
            angleLines: { color: "rgba(16,24,40,0.08)" },
            pointLabels: { color: "#334155" }
          }
        },
        plugins: {
          legend: {
            labels: { color: "#334155" }
          }
        }
      }
    });
  } else if (radarCanvas?.parentElement) {
    radarCanvas.parentElement.innerHTML = createEmptyBox();
  }

  const evolucaoCanvas = document.getElementById("evolucao-chart");
  const evolucao = avaliacoes
    .filter((av) => hasContent(av.metricas?.peso) && asNumber(av.metricas?.peso, 0) > 0)
    .map((av) => ({
      data: av.data,
      peso: asNumber(av.metricas?.peso, 0)
    }));

  if (evolucaoCanvas && typeof Chart !== "undefined" && evolucao.length) {
    new Chart(evolucaoCanvas, {
      type: "line",
      data: {
        labels: evolucao.map((e) => formatDateBR(e.data)),
        datasets: [{
          label: "Peso",
          data: evolucao.map((e) => asNumber(e.peso, 0)),
          borderColor: "#7cff5a",
          backgroundColor: "rgba(124,255,90,0.15)",
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: "#334155" } }
        },
        scales: {
          x: {
            ticks: { color: "#334155" },
            grid: { color: "rgba(16,24,40,0.06)" }
          },
          y: {
            ticks: { color: "#334155" },
            grid: { color: "rgba(16,24,40,0.06)" }
          }
        }
      }
    });
  } else if (evolucaoCanvas?.parentElement) {
    evolucaoCanvas.parentElement.innerHTML = createEmptyBox();
  }

  const perimetriaGrid = document.getElementById("perimetria-grid");
  if (perimetriaGrid) {
    const perimetriaAtual = avaliacaoAtual.perimetria || {};
    const items = Object.entries(perimetriaAtual).filter(([, value]) => value !== "—" && hasContent(value));

    if (!items.length) {
      perimetriaGrid.innerHTML = createEmptyBox();
    } else {
      perimetriaGrid.innerHTML = items
        .map(([key, value]) => perimetriaCard(toTitle(key), value))
        .join("");
    }
  }

  text(
    "diagnostico-leitura",
    firstFilled(avaliacaoAtual.analise.leitura, "Ainda não há leitura técnica registrada.")
  );

  text(
    "diagnostico-sintese",
    firstFilled(avaliacaoAtual.analise.sintese, "Ainda não há síntese diagnóstica.")
  );

  text(
    "behavior-aderencia",
    firstFilled(avaliacaoAtual.analise.aderencia, "—")
  );

  text(
    "behavior-ambiente",
    firstFilled(avaliacaoAtual.analise.ambiente, "—")
  );

  text(
    "behavior-sabotadores",
    firstFilled(avaliacaoAtual.analise.sabotadores, "—")
  );

  text(
    "behavior-leitura",
    firstFilled(avaliacaoAtual.analise.leitura_comportamental, "Ainda não há leitura comportamental registrada.")
  );

  text(
    "next-manter",
    firstFilled(avaliacaoAtual.direcionamento.manter, "Ainda não definido")
  );

  text(
    "next-ajustar",
    firstFilled(avaliacaoAtual.direcionamento.ajustar, "Ainda não definido")
  );

  text(
    "next-foco",
    firstFilled(avaliacaoAtual.direcionamento.foco, "Ainda não definido")
  );

  text(
    "next-meta",
    firstFilled(avaliacaoAtual.direcionamento.meta, "Ainda não definida")
  );

  const examesSection = document.getElementById("exames-section");
  const examesGrid = document.getElementById("exames-grid");
  const examesEntries = Object.entries(avaliacaoAtual.exames || {}).filter(([, value]) => hasContent(value));

  if (examesSection && examesGrid && examesEntries.length) {
    examesGrid.innerHTML = examesEntries.map(([key, value]) => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return exameCard(
          toTitle(key),
          firstFilled(value.valor, "—"),
          firstFilled(value.referencia, "—"),
          firstFilled(value.observacao, "Sem observação")
        );
      }
      return exameCard(toTitle(key), value, "—", "Sem observação");
    }).join("");
  }

  const timelineList = document.getElementById("timeline-list");
  if (timelineList) {
    const timelineAvaliacoes = avaliacoes.map((av) => ({
      titulo: firstFilled(av.titulo, toTitle(av.tipo), "Avaliação"),
      data: av.data,
      descricao: firstFilled(
        av.resumo,
        av.analise?.sintese,
        av.analise?.leitura,
        "Avaliação registrada no sistema."
      )
    }));

    const timelineAcompanhamentos = acompanhamentos.map((item) => ({
      titulo: item.titulo,
      data: item.data,
      descricao: item.descricao
    }));

    const timelineBase = timelineCliente.map((item) => ({
      titulo: firstFilled(item.tipo, "Registro"),
      data: item.data,
      descricao: item.descricao
    }));

    const timelineFinal = [...timelineAvaliacoes, ...timelineAcompanhamentos, ...timelineBase];

    if (!timelineFinal.length) {
      timelineFinal.push({
        titulo: "Entrada inicial do caso",
        data: firstFilled(cliente.data_inicio, cliente.updatedAt, cliente.createdAt, new Date().toISOString()),
        descricao: firstFilled(cliente.objetivo, "Cadastro inicial registrado no sistema.")
      });
    }

    timelineFinal.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

    timelineList.innerHTML = timelineFinal.map((item) => `
      <div class="timeline-item">
        <div class="timeline-item-top">
          <strong>${firstFilled(item.titulo, "Acompanhamento")}</strong>
          <span>${formatDateBR(item.data)}</span>
        </div>
        <p>${firstFilled(item.descricao, "Sem descrição registrada.")}</p>
      </div>
    `).join("");
  }

  const perimetriaSection = document.getElementById("perimetria-section");
  if (perimetriaSection) {
    const shouldShowPerimetria =
      !protocoloFisico.includes("marinha") &&
      Object.values(avaliacaoAtual.perimetria || {}).some(hasContent);

    perimetriaSection.classList.toggle("hidden", !shouldShowPerimetria);
  }

  if (examesSection) {
    examesSection.classList.toggle("hidden", !examesEntries.length);
  }
});