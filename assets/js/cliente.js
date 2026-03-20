window.ZACliente = (() => {
  function getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id ? decodeURIComponent(id).trim() : null;
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getClienteById(id) {
    const clientes = getClientes();
    return clientes.find((cliente) => String(cliente.id).trim() === String(id).trim());
  }

  function ensureClienteStructure(cliente) {
    if (!cliente.preDiagnostico) {
      cliente.preDiagnostico = {};
    }

    const pre = cliente.preDiagnostico;

    if (!pre.scores) {
      pre.scores = {
        movimento: Number(pre.score_movimento || 0),
        alimentacao: Number(pre.score_alimentacao || 0),
        sono: Number(pre.score_sono || 0),
        proposito: Number(pre.score_proposito || 0),
        social: Number(pre.score_social || 0),
        estresse: Number(pre.score_estresse || 0)
      };
    }

    if (!cliente.diagnosticoCompleto) {
      cliente.diagnosticoCompleto = {};
    }

    const dc = cliente.diagnosticoCompleto;

    if (!dc.status) dc.status = "nao_iniciado";
    if (!dc.modoPreenchimento) dc.modoPreenchimento = "";
    if (!dc.dataInicio) dc.dataInicio = "";
    if (!dc.dataConclusao) dc.dataConclusao = "";

    if (!dc.radarRevisado) {
      dc.radarRevisado = {
        movimento: null,
        alimentacao: null,
        sono: null,
        proposito: null,
        social: null,
        estresse: null
      };
    }

    if (!dc.pilares) {
      dc.pilares = {
        movimento: { notas: "", ajustes: "" },
        alimentacao: { notas: "", ajustes: "" },
        sono: { notas: "", ajustes: "" },
        proposito: { notas: "", ajustes: "" },
        social: { notas: "", ajustes: "" },
        estresse: { notas: "", ajustes: "" }
      };
    }

    if (!dc.anamnese) {
      dc.anamnese = {
        rotina: "",
        trabalho: "",
        sonoDetalhado: "",
        alimentacaoDetalhada: "",
        historicoSaude: ""
      };
    }

    if (!dc.comportamento) {
      dc.comportamento = {
        adesao: "",
        recaidas: "",
        gatilhos: "",
        ambiente: "",
        apoioSocial: ""
      };
    }

    if (!dc.avaliacaoFisica) {
      dc.avaliacaoFisica = {
        protocolo: "",
        peso: "",
        altura: "",
        imc: "",
        rcq: "",
        rce: "",
        testes: "",
        observacoes: ""
      };
    }

    if (!cliente.planejamento) {
      cliente.planejamento = {
        objetivoCentral: "",
        focoMes1: "",
        gapsPrioritarios: [],
        estrategia: "",
        observacoes: "",
        planoTreino: {
          nome: "",
          objetivo: "",
          fase: "",
          status: "rascunho",
          dataPrevista: "",
          linkMfit: "",
          observacoes: ""
        }
      };
    }

    if (!cliente.timeline) {
      cliente.timeline = [];
    }

    if (!cliente.checkins) {
      cliente.checkins = [];
    }

    return cliente;
  }

  function saveCliente(updatedCliente) {
    const data = window.ZAStorage.getData();
    const clientes = data.clientes || [];
    const index = clientes.findIndex((item) => String(item.id) === String(updatedCliente.id));

    if (index >= 0) {
      clientes[index] = updatedCliente;
      data.clientes = clientes;
      window.ZAStorage.saveData(data);
    }
  }

  function setDeepValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i += 1) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  function getRadarAtual(cliente) {
    const base = cliente.preDiagnostico.scores;
    const revisado = cliente.diagnosticoCompleto.radarRevisado;

    return {
      movimento: revisado.movimento ?? base.movimento,
      alimentacao: revisado.alimentacao ?? base.alimentacao,
      sono: revisado.sono ?? base.sono,
      proposito: revisado.proposito ?? base.proposito,
      social: revisado.social ?? base.social,
      estresse: revisado.estresse ?? base.estresse
    };
  }

  function formatDateBR(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("pt-BR");
  }

  function formatPilarLabel(key) {
    const map = {
      movimento: "Movimento",
      alimentacao: "Alimentação",
      sono: "Sono",
      proposito: "Propósito",
      social: "Social",
      estresse: "Estresse"
    };

    return map[key] || key || "-";
  }

  function formatStatusDiagnostico(status) {
    const map = {
      nao_iniciado: "Não iniciado",
      em_andamento: "Em andamento",
      concluido: "Concluído"
    };

    return map[status] || status || "-";
  }

  function getPilarMaisBaixo(scores) {
    const entries = Object.entries(scores || {});
    if (!entries.length) return "-";

    entries.sort((a, b) => Number(a[1]) - Number(b[1]));
    return entries[0][0];
  }

  function renderRadarCards(scores, title = "Radar atual") {
    return `
      <div class="card">
        <div class="card-header">
          <h3>${title}</h3>
        </div>
        <div class="card-body">
          <div class="report-grid two">
            ${Object.entries(scores)
              .map(
                ([key, value]) => `
                  <div class="pillar-card">
                    <h4>${formatPilarLabel(key)}</h4>
                    <p><strong>${Number(value) || 0}/10</strong></p>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderDiagnosticoActions(cliente) {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Diagnóstico completo</h3>
        </div>
        <div class="card-body">
          <p><strong>Status:</strong> ${formatStatusDiagnostico(cliente.diagnosticoCompleto?.status)}</p>
          <p><strong>Modo:</strong> ${cliente.diagnosticoCompleto?.modoPreenchimento || "-"}</p>
          <p><strong>Conclusão:</strong> ${formatDateBR(cliente.diagnosticoCompleto?.dataConclusao)}</p>

          <div class="actions">
            <a class="btn" href="../diagnostico-completo/?id=${encodeURIComponent(cliente.id)}&modo=professor">
              Preencher agora
            </a>
            <a class="btn secondary" target="_blank" href="../diagnostico-completo/?id=${encodeURIComponent(cliente.id)}&modo=cliente">
              Enviar para o cliente
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function renderVisaoGeral(cliente) {
    const pre = cliente.preDiagnostico || {};
    const scores = getRadarAtual(cliente);
    const pilarMaisBaixo = getPilarMaisBaixo(scores);

    return `
      ${renderDiagnosticoActions(cliente)}

      <div class="card">
        <div class="card-header">
          <h3>Resumo do pré-diagnóstico</h3>
        </div>
        <div class="card-body">
          <div class="report-grid two">
            <div class="pillar-card">
              <h4>Dados principais</h4>
              <p><strong>Nome:</strong> ${cliente.nome || "-"}</p>
              <p><strong>Email:</strong> ${cliente.email || "-"}</p>
              <p><strong>Origem:</strong> ${cliente.origem || "-"}</p>
              <p><strong>Data de entrada:</strong> ${formatDateBR(cliente.data_inicio || cliente.created_at)}</p>
            </div>

            <div class="pillar-card">
              <h4>Leitura inicial</h4>
              <p><strong>Média geral:</strong> ${pre.media_geral ?? "-"}</p>
              <p><strong>Pilar mais baixo:</strong> ${formatPilarLabel(pre.pilar_mais_baixo || pilarMaisBaixo)}</p>
              <p><strong>Status:</strong> ${cliente.status || "-"}</p>
              <p><strong>Fase:</strong> ${cliente.fase_nome || "Diagnóstico completo"}</p>
            </div>

            <div class="pillar-card">
              <h4>Contexto atual</h4>
              <p><strong>Desafio atual:</strong> ${pre.desafio_atual || "-"}</p>
              <p><strong>Meta para 6 meses:</strong> ${pre.meta_6_meses || "-"}</p>
              <p><strong>Objetivo físico:</strong> ${pre.objetivo_fisico || "-"}</p>
              <p><strong>Sabotador principal:</strong> ${pre.sabotagem || "-"}</p>
            </div>

            <div class="pillar-card">
              <h4>Histórico</h4>
              <p><strong>O que funcionou:</strong> ${pre.o_que_funcionou || "-"}</p>
              <p><strong>Por que parou:</strong> ${pre.por_que_parou || "-"}</p>
              <p><strong>Dores/limitações:</strong> ${pre.limitacoes_atuais || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      ${renderRadarCards(scores, "Radar base / atual")}
    `;
  }

  function renderDiagnosticoCompleto(cliente) {
    const base = cliente.preDiagnostico.scores;
    const rev = cliente.diagnosticoCompleto.radarRevisado;
    const pilares = cliente.diagnosticoCompleto.pilares;

    const fields = [
      { key: "movimento", label: "Movimento" },
      { key: "alimentacao", label: "Alimentação" },
      { key: "sono", label: "Sono" },
      { key: "proposito", label: "Propósito" },
      { key: "social", label: "Social" },
      { key: "estresse", label: "Estresse" }
    ];

    return `
      <div class="card">
        <div class="card-header">
          <h3>Radar do pré-diagnóstico — revisão e validação</h3>
        </div>
        <div class="card-body">
          <div class="report-grid two">
            ${fields
              .map(
                (item) => `
                  <div class="pillar-card">
                    <h4>${item.label}</h4>
                    <p><strong>Pré-diag:</strong> ${base[item.key] ?? 0}/10</p>

                    <label class="field-label" for="rev_${item.key}">Revisado</label>
                    <input
                      id="rev_${item.key}"
                      type="number"
                      min="0"
                      max="10"
                      value="${rev[item.key] ?? ""}"
                      data-save="diagnosticoCompleto.radarRevisado.${item.key}"
                    />

                    <label class="field-label" for="notas_${item.key}">Notas</label>
                    <textarea
                      id="notas_${item.key}"
                      data-save="diagnosticoCompleto.pilares.${item.key}.notas"
                    >${pilares[item.key]?.notas || ""}</textarea>

                    <label class="field-label" for="ajustes_${item.key}">Ajustes / observações</label>
                    <textarea
                      id="ajustes_${item.key}"
                      data-save="diagnosticoCompleto.pilares.${item.key}.ajustes"
                    >${pilares[item.key]?.ajustes || ""}</textarea>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>

      ${renderRadarCards(getRadarAtual(cliente), "Radar validado")}
    `;
  }

  function renderAvaliacaoFisica(cliente) {
    const fis = cliente.avaliacaoFisica;

    return `
      <div class="card">
        <div class="card-header">
          <h3>Avaliação física</h3>
        </div>
        <div class="card-body">
          <div class="report-grid two">
            <div class="pillar-card">
              <h4>Triagem física</h4>

              <label class="field-label" for="protocolo">Protocolo</label>
              <input id="protocolo" type="text" value="${fis.protocolo || ""}" data-save="avaliacaoFisica.protocolo" />

              <label class="field-label" for="peso">Peso</label>
              <input id="peso" type="number" step="0.1" value="${fis.peso || ""}" data-save="avaliacaoFisica.peso" />

              <label class="field-label" for="altura">Altura (cm)</label>
              <input id="altura" type="number" step="1" value="${fis.altura || ""}" data-save="avaliacaoFisica.altura" />

              <label class="field-label" for="imc">IMC</label>
              <input id="imc" type="text" value="${fis.imc || ""}" data-save="avaliacaoFisica.imc" />

              <label class="field-label" for="rcq">RCQ</label>
              <input id="rcq" type="text" value="${fis.rcq || ""}" data-save="avaliacaoFisica.rcq" />

              <label class="field-label" for="rce">RCE</label>
              <input id="rce" type="text" value="${fis.rce || ""}" data-save="avaliacaoFisica.rce" />
            </div>

            <div class="pillar-card">
              <h4>Observações</h4>

              <label class="field-label" for="testes">Testes / observações físicas</label>
              <textarea id="testes" data-save="avaliacaoFisica.testes">${fis.testes || ""}</textarea>

              <label class="field-label" for="observacoes_fisicas">Observações do professor</label>
              <textarea id="observacoes_fisicas" data-save="avaliacaoFisica.observacoes">${fis.observacoes || ""}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderPlanejamento(cliente) {
    const plan = cliente.planejamento;
    const treino = plan.planoTreino || {};

    return `
      <div class="card">
        <div class="card-header">
          <h3>Planejamento geral do professor</h3>
        </div>
        <div class="card-body">
          <div class="report-grid two">
            <div class="pillar-card">
              <h4>Direção do caso</h4>

              <label class="field-label" for="objetivoCentral">Objetivo central</label>
              <textarea id="objetivoCentral" data-save="planejamento.objetivoCentral">${plan.objetivoCentral || ""}</textarea>

              <label class="field-label" for="focoMes1">Foco do mês 1</label>
              <textarea id="focoMes1" data-save="planejamento.focoMes1">${plan.focoMes1 || ""}</textarea>

              <label class="field-label" for="estrategia">Estratégia</label>
              <textarea id="estrategia" data-save="planejamento.estrategia">${plan.estrategia || ""}</textarea>

              <label class="field-label" for="observacoesPlanejamento">Observações</label>
              <textarea id="observacoesPlanejamento" data-save="planejamento.observacoes">${plan.observacoes || ""}</textarea>
            </div>

            <div class="pillar-card">
              <h4>Plano de treino projetado</h4>

              <label class="field-label" for="treino_nome">Nome do plano</label>
              <input id="treino_nome" type="text" value="${treino.nome || ""}" data-save="planejamento.planoTreino.nome" />

              <label class="field-label" for="treino_objetivo">Objetivo</label>
              <input id="treino_objetivo" type="text" value="${treino.objetivo || ""}" data-save="planejamento.planoTreino.objetivo" />

              <label class="field-label" for="treino_fase">Fase</label>
              <input id="treino_fase" type="text" value="${treino.fase || ""}" data-save="planejamento.planoTreino.fase" />

              <label class="field-label" for="treino_status">Status</label>
              <input id="treino_status" type="text" value="${treino.status || "rascunho"}" data-save="planejamento.planoTreino.status" />

              <label class="field-label" for="treino_dataPrevista">Data prevista</label>
              <input id="treino_dataPrevista" type="date" value="${treino.dataPrevista || ""}" data-save="planejamento.planoTreino.dataPrevista" />

              <label class="field-label" for="treino_linkMfit">Link do MFit</label>
              <input id="treino_linkMfit" type="text" value="${treino.linkMfit || ""}" data-save="planejamento.planoTreino.linkMfit" />

              <label class="field-label" for="treino_observacoes">Observações do treino</label>
              <textarea id="treino_observacoes" data-save="planejamento.planoTreino.observacoes">${treino.observacoes || ""}</textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindAutoSave(cliente) {
    document.querySelectorAll("[data-save]").forEach((field) => {
      field.addEventListener("change", () => {
        const path = field.dataset.save;
        let value = field.value;

        if (field.type === "number") {
          value = value === "" ? null : Number(value);
        }

        setDeepValue(cliente, path, value);
        saveCliente(cliente);
      });
    });
  }

  function activateTabs() {
    const buttons = document.querySelectorAll("[data-tab]");
    const panes = document.querySelectorAll(".tab-pane");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;

        buttons.forEach((b) => {
          b.classList.remove("active");
          b.classList.add("secondary");
        });

        panes.forEach((pane) => pane.classList.add("hidden"));

        btn.classList.add("active");
        btn.classList.remove("secondary");
        document.getElementById(`tab-${target}`)?.classList.remove("hidden");
      });
    });
  }

  function renderPage(cliente) {
    const nomeEl = document.getElementById("cliente-nome");
    const subtituloEl = document.getElementById("cliente-subtitulo");
    const visaoEl = document.getElementById("tab-visao");
    const diagnosticoEl = document.getElementById("tab-diagnostico");
    const fisicoEl = document.getElementById("tab-fisico");
    const planejamentoEl = document.getElementById("tab-planejamento");

    const btnRelatorioPre = document.getElementById("btn-relatorio-pre");
    const btnDcProfessor = document.getElementById("btn-dc-professor");
    const btnDcCliente = document.getElementById("btn-dc-cliente");

    if (nomeEl) nomeEl.textContent = cliente.nome || "Cliente";
    if (subtituloEl) {
      subtituloEl.textContent = `${cliente.email || "-"} • ${cliente.fase_nome || "Diagnóstico completo"}`;
    }

    if (btnRelatorioPre) {
      btnRelatorioPre.href = `../relatorio/?id=${encodeURIComponent(cliente.id)}`;
    }

    if (btnDcProfessor) {
      btnDcProfessor.href = `../diagnostico-completo/?id=${encodeURIComponent(cliente.id)}&modo=professor`;
    }

    if (btnDcCliente) {
      btnDcCliente.href = `../diagnostico-completo/?id=${encodeURIComponent(cliente.id)}&modo=cliente`;
    }

    if (visaoEl) visaoEl.innerHTML = renderVisaoGeral(cliente);
    if (diagnosticoEl) diagnosticoEl.innerHTML = renderDiagnosticoCompleto(cliente);
    if (fisicoEl) fisicoEl.innerHTML = renderAvaliacaoFisica(cliente);
    if (planejamentoEl) planejamentoEl.innerHTML = renderPlanejamento(cliente);

    bindAutoSave(cliente);
    activateTabs();
  }

  function renderError(message) {
    const nomeEl = document.getElementById("cliente-nome");
    const subtituloEl = document.getElementById("cliente-subtitulo");
    const visaoEl = document.getElementById("tab-visao");

    if (nomeEl) nomeEl.textContent = "Cliente";
    if (subtituloEl) subtituloEl.textContent = "";
    if (visaoEl) {
      visaoEl.innerHTML = `
        <div class="card">
          <div class="card-body">
            <p>${message}</p>
          </div>
        </div>
      `;
    }
  }

  function init() {
    const id = getIdFromURL();

    if (!id) {
      renderError("Cliente não informado na URL.");
      return;
    }

    const cliente = getClienteById(id);

    if (!cliente) {
      renderError("Cliente não encontrado.");
      return;
    }

    const clienteNormalizado = ensureClienteStructure(cliente);
    saveCliente(clienteNormalizado);
    renderPage(clienteNormalizado);
  }

  return {
    init,
    getRadarAtual
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.ZACliente.init();
});