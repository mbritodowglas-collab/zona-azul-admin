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
  const dobrasPlanejamento = planejamento.dobras || {};
  const testesPlanejamento = planejamento.testes || [];

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

  function metricCardEmpty(label, message = "Ainda não lançado") {
    return `
      <div class="metric-card is-empty">
        <span class="metric-label">${label}</span>
        <div class="metric-values is-single">
          <div class="metric-empty-text">${message}</div>
        </div>
        <div class="metric-helper">Aguardando preenchimento para comparação.</div>
      </div>
    `;
  }

  function metricCardNotApplicable(label, message = "Não aplicável a este protocolo") {
    return `
      <div class="metric-card is-na">
        <span class="metric-label">${label}</span>
        <div class="metric-values is-single">
          <div class="metric-empty-text">${message}</div>
        </div>
        <div class="metric-helper">Este indicador não entra na leitura do protocolo atual.</div>
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

  function perimetriaCard(label, value) {
    return `
      <div class="perimetria-item">
        <span>${label}</span>
        <strong>${String(value).includes("cm") ? value : `${value} cm`}</strong>
      </div>
    `;
  }

  function getProtocolDisplayName(protocolo) {
    const p = String(protocolo || "").trim().toUpperCase();

    if (!p) return "Não definido";
    if (p === "A") return "Protocolo A — Online (Marinha)";
    if (p === "B") return "Protocolo B — Presencial sem dobras";
    if (p === "C") return "Protocolo C — Presencial com dobras";

    const lower = p.toLowerCase();
    if (lower.includes("marinha")) return "Marinha";
    if (lower.includes("perimetria")) return "Perimetria";
    if (lower.includes("completo")) return "Avaliação completa";
    if (lower.includes("dobras")) return "Dobras cutâneas";
    if (lower.includes("funcional")) return "Funcional";

    return protocolo;
  }

  function countFilledIndicadores(indicadores) {
    return indicadores.filter((item) => item.status === "filled").length;
  }

  function buildLeituraFisicaAutomatica({
    pesoAtual,
    bfAtual,
    cinturaAtual,
    rcqAtual,
    rceAtual,
    protocoloFisico,
    filledCount,
    totalCount
  }) {
    const protocolo = String(protocoloFisico || "").trim().toUpperCase();

    if (filledCount === 0) {
      return "Ainda não há dados físicos lançados para gerar leitura automática deste bloco.";
    }

    const partes = [];

    if (asNumber(pesoAtual, 0) > 0) partes.push("Já existe registro de peso no relatório");
    if (asNumber(cinturaAtual, 0) > 0) partes.push("há medida de cintura lançada");
    if (asNumber(rcqAtual, 0) > 0 || asNumber(rceAtual, 0) > 0) {
      partes.push("e já há base inicial para leitura de distribuição corporal");
    }

    let abertura = partes.length
      ? `${partes.join(", ")}.`
      : "Há dados físicos parciais registrados no sistema.";

    let fechamento = " A leitura comparativa completa dependerá do lançamento progressivo dos demais indicadores do protocolo atual.";

    if (protocolo === "A" || protocolo === "B") {
      fechamento = " Como o protocolo atual segue a lógica da Marinha, os indicadores mais coerentes para acompanhamento aqui são peso, cintura, RCQ, RCE e percentual de gordura quando disponível.";
    }

    if (protocolo === "C") {
      fechamento = " Como o protocolo atual inclui dobras e composição corporal ampliada, a leitura física pode ficar mais robusta conforme os marcadores forem sendo preenchidos.";
    }

    if (filledCount >= Math.ceil(totalCount / 2)) {
      fechamento = " O bloco já começa a oferecer uma leitura comparativa útil, mas ainda pode ganhar mais precisão conforme novos dados forem lançados.";
    }

    if (filledCount === totalCount) {
      fechamento = " O conjunto atual de indicadores já permite uma leitura física mais completa dentro do protocolo utilizado.";
    }

    return abertura + fechamento;
  }

  function buildSimpleStatusHTML(title, filledCount, totalCount, protocolo, extra = "") {
    const comparativo = filledCount >= 2 ? "Parcial" : "Muito limitado";

    return `
      <div class="status-list">
        <div class="status-row">
          <span>Protocolo usado</span>
          <strong>${getProtocolDisplayName(protocolo)}</strong>
        </div>
        <div class="status-row">
          <span>${title}</span>
          <strong>${filledCount} de ${totalCount}</strong>
        </div>
        <div class="status-row">
          <span>Comparativo disponível</span>
          <strong>${comparativo}</strong>
        </div>
        <div class="status-row">
          <span>Leitura do bloco</span>
          <strong>${extra || "Em construção"}</strong>
        </div>
      </div>
    `;
  }

  function buildSimpleReading(filledCount, totalCount, baseText) {
    if (filledCount === 0) {
      return "Ainda não há lançamentos suficientes para leitura automática deste bloco.";
    }
    if (filledCount < totalCount) {
      return `${baseText} O bloco já possui dados parciais, mas ainda depende de novos lançamentos para uma leitura comparativa mais robusta.`;
    }
    return `${baseText} O conjunto de dados atual já permite uma leitura mais consistente deste bloco.`;
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
    const dobras = raw.dobras || {};
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

      dobras: {
        tricipital: firstFilled(dobras.tricipital, raw.tricipital),
        subescapular: firstFilled(dobras.subescapular, raw.subescapular),
        peitoral: firstFilled(dobras.peitoral, raw.peitoral),
        axilar_media: firstFilled(dobras.axilar_media, raw.axilar_media),
        suprailiaca: firstFilled(dobras.suprailiaca, raw.suprailiaca),
        abdominal: firstFilled(dobras.abdominal, raw.abdominal),
        coxa: firstFilled(dobras.coxa, raw.coxa_dobra, raw.coxa),
        panturrilha: firstFilled(dobras.panturrilha, raw.panturrilha_dobra, raw.panturrilha)
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
      dobras: dobrasPlanejamento,
      exames: examesPlanejamento || relatorioCompleto.exames || cliente.exames || {},
      testes: Array.isArray(testesPlanejamento) ? testesPlanejamento : []
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

  const hoje = formatDateBR(new Date());
  text("report-data-geracao", hoje);
  text("report-data-geracao-2", hoje);
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
  text("summary-avanco", firstFilled(avaliacaoAtual.analise.avanco_principal, "Leitura do avanço ainda não registrada."));
  text("summary-gargalo", firstFilled(avaliacaoAtual.analise.gargalo_principal, "Gargalo principal ainda não registrado."));
  text("summary-prioridade", firstFilled(avaliacaoAtual.analise.prioridade, avaliacaoAtual.direcionamento.foco, "Prioridade do próximo ciclo ainda não definida."));

  const protocoloCode = String(firstFilled(avaliacaoAtual.protocolo, "")).trim().toUpperCase();

  const isProtocoloA = protocoloCode === "A";
  const isProtocoloB = protocoloCode === "B";
  const isProtocoloC = protocoloCode === "C";

  const usesPerimetria = isProtocoloB || isProtocoloC;
  const usesDobras = isProtocoloC;
  const usesTestes = isProtocoloB || isProtocoloC;
  const usesMassaMagra = isProtocoloC;

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

  const indicadores = [
    {
      label: "Peso",
      status: asNumber(pesoAtual, 0) > 0 ? "filled" : "empty",
      html: asNumber(pesoAtual, 0) > 0 ? metricCard("Peso", pesoAtual, pesoAnterior, " kg") : metricCardEmpty("Peso")
    },
    {
      label: "BF",
      status: asNumber(bfAtual, 0) > 0 ? "filled" : "empty",
      html: asNumber(bfAtual, 0) > 0 ? metricCard("BF", bfAtual, bfAnterior, "%") : metricCardEmpty("BF")
    },
    {
      label: "Cintura",
      status: asNumber(cinturaAtual, 0) > 0 ? "filled" : "empty",
      html: asNumber(cinturaAtual, 0) > 0 ? metricCard("Cintura", cinturaAtual, cinturaAnterior, " cm") : metricCardEmpty("Cintura")
    },
    {
      label: "RCQ",
      status: asNumber(rcqAtual, 0) > 0 ? "filled" : "empty",
      html: asNumber(rcqAtual, 0) > 0 ? metricCard("RCQ", rcqAtual, rcqAnterior, "") : metricCardEmpty("RCQ")
    },
    {
      label: "RCE",
      status: asNumber(rceAtual, 0) > 0 ? "filled" : "empty",
      html: asNumber(rceAtual, 0) > 0 ? metricCard("RCE", rceAtual, rceAnterior, "") : metricCardEmpty("RCE")
    },
    {
      label: "Massa magra",
      status: !usesMassaMagra ? "na" : (asNumber(massaAtual, 0) > 0 ? "filled" : "empty"),
      html: !usesMassaMagra
        ? metricCardNotApplicable("Massa magra")
        : (asNumber(massaAtual, 0) > 0
            ? metricCard("Massa magra", massaAtual, massaAnterior, " kg")
            : metricCardEmpty("Massa magra"))
    }
  ];

  const metricsGrid = document.getElementById("metrics-grid");
  if (metricsGrid) {
    metricsGrid.innerHTML = indicadores.map((item) => item.html).join("");
  }

  const coletaStatusContent = document.getElementById("coleta-status-content");
  if (coletaStatusContent) {
    const preenchidos = countFilledIndicadores(indicadores);
    const comparativoDisponivel = preenchidos >= 2 ? "Parcial" : "Muito limitado";
    const proximaColeta = preenchidos >= 4 ? "Reavaliação estratégica" : "Completar indicadores físicos";

    coletaStatusContent.innerHTML = `
      <div class="status-list">
        <div class="status-row">
          <span>Protocolo usado</span>
          <strong>${getProtocolDisplayName(protocoloCode)}</strong>
        </div>
        <div class="status-row">
          <span>Indicadores lançados</span>
          <strong>${preenchidos} de ${indicadores.length}</strong>
        </div>
        <div class="status-row">
          <span>Comparativo disponível</span>
          <strong>${comparativoDisponivel}</strong>
        </div>
        <div class="status-row">
          <span>Próxima coleta sugerida</span>
          <strong>${proximaColeta}</strong>
        </div>
      </div>
    `;
  }

  const leituraFisicaContent = document.getElementById("leitura-fisica-content");
  if (leituraFisicaContent) {
    leituraFisicaContent.innerHTML = `
      <div class="auto-reading-text">
        ${buildLeituraFisicaAutomatica({
          pesoAtual,
          bfAtual,
          cinturaAtual,
          rcqAtual,
          rceAtual,
          protocoloFisico: protocoloCode,
          filledCount: countFilledIndicadores(indicadores),
          totalCount: indicadores.length
        })}
      </div>
    `;
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
    evolucaoCanvas.parentElement.innerHTML = createEmptyBox("Ainda não há histórico suficiente para este gráfico.");
  }

  const perimetriaSection = document.getElementById("perimetria-section");
  const perimetriaGrid = document.getElementById("perimetria-grid");
  if (perimetriaSection && perimetriaGrid) {
    const perimetriaAtual = avaliacaoAtual.perimetria || {};
    const items = Object.entries(perimetriaAtual).filter(([, value]) => value !== "—" && hasContent(value));

    if (usesPerimetria) {
      perimetriaSection.classList.remove("hidden");
      perimetriaGrid.innerHTML = items.length
        ? items.map(([key, value]) => perimetriaCard(toTitle(key), value)).join("")
        : createEmptyBox();
    } else {
      perimetriaSection.classList.add("hidden");
    }
  }

  const dobrasSection = document.getElementById("dobras-section");
  const dobrasGrid = document.getElementById("dobras-grid");
  const dobrasStatusContent = document.getElementById("dobras-status-content");
  const dobrasReadingContent = document.getElementById("dobras-reading-content");

  const dobrasMap = [
    { key: "tricipital", label: "Tricipital" },
    { key: "subescapular", label: "Subescapular" },
    { key: "peitoral", label: "Peitoral" },
    { key: "axilar_media", label: "Axilar média" },
    { key: "suprailiaca", label: "Suprailíaca" },
    { key: "abdominal", label: "Abdominal" },
    { key: "coxa", label: "Coxa" },
    { key: "panturrilha", label: "Panturrilha" }
  ];

  if (dobrasSection && dobrasGrid && dobrasStatusContent && dobrasReadingContent) {
    if (usesDobras) {
      dobrasSection.classList.remove("hidden");

      const dobrasAtual = avaliacaoAtual.dobras || {};
      const dobrasAnterior = avaliacaoAnterior?.dobras || {};

      const dobrasCards = dobrasMap.map((item) => {
        const atual = firstFilled(dobrasAtual[item.key], 0);
        const anterior = firstFilled(dobrasAnterior[item.key], 0);

        if (asNumber(atual, 0) > 0) {
          return {
            status: "filled",
            html: metricCard(item.label, atual, anterior, " mm")
          };
        }

        return {
          status: "empty",
          html: metricCardEmpty(item.label)
        };
      });

      dobrasGrid.innerHTML = dobrasCards.map((item) => item.html).join("");

      const dobrasFilled = countFilledIndicadores(dobrasCards);
      dobrasStatusContent.innerHTML = buildSimpleStatusHTML(
        "Dobras lançadas",
        dobrasFilled,
        dobrasCards.length,
        protocoloCode,
        dobrasFilled >= 4 ? "Parcial" : "Inicial"
      );

      dobrasReadingContent.innerHTML = `
        <div class="auto-reading-text">
          ${buildSimpleReading(
            dobrasFilled,
            dobrasCards.length,
            "As dobras cutâneas já começam a fornecer uma base de leitura da composição corporal."
          )}
        </div>
      `;
    } else {
      dobrasSection.classList.add("hidden");
    }
  }

  const testesSection = document.getElementById("testes-section");
  const testesGrid = document.getElementById("testes-grid");
  const testesStatusContent = document.getElementById("testes-status-content");
  const testesReadingContent = document.getElementById("testes-reading-content");

  const testesBase = Array.isArray(avaliacaoAtual.testes) && avaliacaoAtual.testes.length
    ? avaliacaoAtual.testes
    : [];

  if (testesSection && testesGrid && testesStatusContent && testesReadingContent) {
    if (usesTestes) {
      testesSection.classList.remove("hidden");

      const testesCards = testesBase.length
        ? testesBase.map((item) => {
            const valor = firstFilled(item.valor, item.resultado, item.descricao, "");
            return {
              status: hasContent(valor) ? "filled" : "empty",
              html: hasContent(valor)
                ? `
                  <div class="metric-card">
                    <span class="metric-label">${firstFilled(item.nome, item.titulo, "Teste")}</span>
                    <div class="metric-values is-single">
                      <div>
                        <small>Resultado</small>
                        <strong>${valor}</strong>
                      </div>
                    </div>
                    <div class="metric-helper">${firstFilled(item.classificacao, item.observacao, "Teste registrado")}</div>
                  </div>
                `
                : metricCardEmpty(firstFilled(item.nome, item.titulo, "Teste"))
            };
          })
        : [
            { status: "empty", html: metricCardEmpty("Teste funcional") },
            { status: "empty", html: metricCardEmpty("Flexibilidade") },
            { status: "empty", html: metricCardEmpty("Resistência muscular") },
            { status: "empty", html: metricCardEmpty("Capacidade cardiorrespiratória") }
          ];

      testesGrid.innerHTML = testesCards.map((item) => item.html).join("");

      const testesFilled = countFilledIndicadores(testesCards);
      testesStatusContent.innerHTML = buildSimpleStatusHTML(
        "Testes lançados",
        testesFilled,
        testesCards.length,
        protocoloCode,
        testesFilled >= 2 ? "Parcial" : "Inicial"
      );

      testesReadingContent.innerHTML = `
        <div class="auto-reading-text">
          ${buildSimpleReading(
            testesFilled,
            testesCards.length,
            "Os testes físicos já começam a oferecer uma leitura funcional complementar do caso."
          )}
        </div>
      `;
    } else {
      testesSection.classList.add("hidden");
    }
  }

  text("diagnostico-leitura", firstFilled(avaliacaoAtual.analise.leitura, "Ainda não há leitura técnica registrada."));
  text("diagnostico-sintese", firstFilled(avaliacaoAtual.analise.sintese, "Ainda não há síntese diagnóstica."));
  text("behavior-aderencia", firstFilled(avaliacaoAtual.analise.aderencia, "—"));
  text("behavior-ambiente", firstFilled(avaliacaoAtual.analise.ambiente, "—"));
  text("behavior-sabotadores", firstFilled(avaliacaoAtual.analise.sabotadores, "—"));
  text("behavior-leitura", firstFilled(avaliacaoAtual.analise.leitura_comportamental, "Ainda não há leitura comportamental registrada."));
  text("next-manter", firstFilled(avaliacaoAtual.direcionamento.manter, "Ainda não definido"));
  text("next-ajustar", firstFilled(avaliacaoAtual.direcionamento.ajustar, "Ainda não definido"));
  text("next-foco", firstFilled(avaliacaoAtual.direcionamento.foco, "Ainda não definido"));
  text("next-meta", firstFilled(avaliacaoAtual.direcionamento.meta, "Ainda não definida"));

  const examesSection = document.getElementById("exames-section");
  const examesGrid = document.getElementById("exames-grid");
  const examesEntries = Object.entries(avaliacaoAtual.exames || {}).filter(([, value]) => hasContent(value));

  if (examesSection && examesGrid) {
    if (examesEntries.length) {
      examesSection.classList.remove("hidden");
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
    } else {
      examesSection.classList.add("hidden");
    }
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
      titulo: "Acompanhamento",
      data: item.data || item.createdAt,
      descricao: [
        item.aderencia ? `Aderência: ${item.aderencia}` : "",
        item.evolucao ? `Evolução: ${item.evolucao}` : "",
        item.dificuldades ? `Dificuldades: ${item.dificuldades}` : "",
        item.ajustes ? `Ajustes: ${item.ajustes}` : ""
      ].filter(Boolean).join(" | ")
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
});