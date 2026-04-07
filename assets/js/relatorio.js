window.ZARelatorioCliente = (() => {
  let registroId = null;
  let registro = null;
  let radarChart = null;

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

  const RADAR_LABELS = {
    score_movimento: "Movimento",
    score_alimentacao: "Alimentação",
    score_sono: "Sono",
    score_proposito: "Propósito",
    score_social: "Social",
    score_estresse: "Estresse"
  };

  function getProfissionalAtual() {
    const key = (localStorage.getItem("profissional_ativo") || "marcio").toLowerCase();
    return PROFISSIONAIS[key] || PROFISSIONAIS.marcio;
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getLeads() {
    return window.ZAStorage?.getLeads?.() || [];
  }

  function getRegistroById(id) {
    const clientes = getClientes();
    const leads = getLeads();

    return (
      clientes.find((item) => String(item.id) === String(id)) ||
      leads.find((item) => String(item.id) === String(id)) ||
      null
    );
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

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
  }

  function formatDate(dateValue) {
    if (!dateValue) return new Date().toLocaleDateString("pt-BR");
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return String(dateValue);
    }
  }

  function formatRaw(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  function getPre() {
    return registro?.preDiagnostico || registro || {};
  }

  function getNome() {
    return firstFilled(registro?.nome, getPre()?.nome, "Cliente");
  }

  function getEmail() {
    return firstFilled(registro?.email, getPre()?.email, "—");
  }

  function getObjetivo() {
    return firstFilled(
      registro?.objetivo,
      registro?.dadosBaseEditados?.objetivo,
      getPre()?.objetivo,
      getPre()?.objetivo_principal,
      getPre()?.objetivo_fisico
    );
  }

  function getCidade() {
    return firstFilled(registro?.cidade, getPre()?.cidade);
  }

  function getOrigem() {
    return firstFilled(registro?.origem, getPre()?.origem);
  }

  function getUrgencia() {
    return firstFilled(registro?.urgencia, getPre()?.urgencia);
  }

  function getComprometimento() {
    return firstFilled(registro?.comprometimento, getPre()?.comprometimento);
  }

  function getSabotagem() {
    return firstFilled(registro?.sabotagem, getPre()?.sabotagem);
  }

  function getDesafioAtual() {
    return firstFilled(registro?.desafio_atual, getPre()?.desafio_atual);
  }

  function getMeta6Meses() {
    return firstFilled(registro?.meta_6_meses, getPre()?.meta_6_meses);
  }

  function getPeso() {
    return firstFilled(
      registro?.peso,
      registro?.dadosBaseEditados?.peso,
      getPre()?.peso
    );
  }

  function getAltura() {
    return firstFilled(
      registro?.altura,
      registro?.dadosBaseEditados?.altura,
      getPre()?.altura
    );
  }

  function getNascimento() {
    return firstFilled(registro?.data_nascimento, getPre()?.data_nascimento);
  }

  function getGenero() {
    return firstFilled(registro?.genero, getPre()?.genero);
  }

  function getParecerProfissional() {
    return firstFilled(
      registro?.parecerProfissional,
      getPre()?.parecerProfissional,
      ""
    );
  }

  function getScore(key) {
    const value = firstFilled(registro?.[key], getPre()?.[key], 0);
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function getRadarData() {
    return Object.keys(RADAR_LABELS).map((key) => getScore(key));
  }

  function getRadarAverage() {
    const values = getRadarData().filter((v) => Number.isFinite(v) && v > 0);
    if (!values.length) return "—";
    const avg = values.reduce((acc, n) => acc + n, 0) / values.length;
    return avg.toFixed(1).replace(".", ",");
  }

  function getPilarStatus(score) {
    if (score <= 3) return "Crítico";
    if (score <= 6) return "Atenção";
    return "Base boa";
  }

  function getSortedPillars() {
    return Object.entries(RADAR_LABELS)
      .map(([key, label]) => ({ key, label, score: getScore(key) }))
      .sort((a, b) => a.score - b.score);
  }

  function getTopGaps(limit = 3) {
    return getSortedPillars().slice(0, limit);
  }

  function getPerfilTexto() {
    const avgText = getRadarAverage();
    const avg = Number(String(avgText).replace(",", ".")) || 0;
    const sabotagem = String(getSabotagem()).toLowerCase();

    if (avg <= 4) {
      return "Seu perfil atual mostra baixa sustentação geral de rotina. O foco inicial não deve ser intensidade, mas sim organização, consistência e redução de sabotadores.";
    }

    if (sabotagem.includes("emocional")) {
      return "Seu perfil sugere que a barreira principal não está só na execução prática, mas também na forma como o estado emocional influencia suas decisões ao longo da rotina.";
    }

    if (sabotagem.includes("tempo")) {
      return "Seu caso sugere que o problema não é apenas falta de vontade, mas uma estrutura de rotina que hoje não favorece constância e previsibilidade.";
    }

    if (avg <= 6) {
      return "Você já apresenta alguns pilares com base razoável, mas ainda existe instabilidade suficiente para travar a evolução de forma consistente.";
    }

    return "Seu perfil mostra uma base inicial positiva. O foco agora é corrigir pontos de fragilidade e transformar intenção em consistência.";
  }

  function getGapReason(label) {
    const reasons = {
      Movimento: "Baixa frequência ou pouca constância no corpo em ação.",
      Alimentação: "Escolhas alimentares ainda instáveis ou sem estrutura previsível.",
      Sono: "Recuperação insuficiente e rotina de descanso fragilizada.",
      Propósito: "Baixa clareza de direção e motivação sustentável.",
      Social: "Pouco apoio, conexão ou ambiente social favorável.",
      Estresse: "Sobrecarga que interfere em energia, foco e disciplina."
    };
    return reasons[label] || "Pilar com baixa sustentação no momento.";
  }

  function getGapAction(label) {
    const actions = {
      Movimento: "Começar com uma meta mínima de movimento semanal simples e executável.",
      Alimentação: "Padronizar refeições-base e reduzir decisões impulsivas no dia a dia.",
      Sono: "Criar um horário de desaceleração e dormir com mais previsibilidade.",
      Propósito: "Definir uma meta clara de curto prazo com sentido pessoal.",
      Social: "Buscar apoio e reduzir contextos que drenam constância.",
      Estresse: "Inserir pausas de regulação e reduzir o ruído da rotina."
    };
    return actions[label] || "Definir uma primeira ação simples e sustentável.";
  }

  function getPlanoMes1() {
    const topGap = getTopGaps(1)[0];

    if (!topGap) {
      return {
        foco: "Estruturar base inicial",
        ambiente: "Organizar contexto mínimo da rotina",
        habito: "Criar um hábito simples e repetível"
      };
    }

    const planos = {
      Movimento: {
        foco: "Construir regularidade de movimento",
        ambiente: "Deixar horário e local de treino pré-definidos",
        habito: "Executar sessões mínimas semanais"
      },
      Alimentação: {
        foco: "Organizar padrão alimentar base",
        ambiente: "Facilitar acesso a refeições e opções melhores",
        habito: "Padronizar 2 refeições por dia"
      },
      Sono: {
        foco: "Melhorar recuperação e consistência noturna",
        ambiente: "Reduzir estímulos antes de dormir",
        habito: "Estabelecer horário de desligamento"
      },
      Propósito: {
        foco: "Gerar clareza e direção prática",
        ambiente: "Eliminar distrações e excesso de ruído",
        habito: "Revisar meta semanalmente"
      },
      Social: {
        foco: "Criar suporte e contexto favorável",
        ambiente: "Aproximar-se de relações que apoiem mudança",
        habito: "Fazer check-in com alguém de confiança"
      },
      Estresse: {
        foco: "Reduzir sobrecarga e recuperar controle",
        ambiente: "Criar pausas reais na rotina",
        habito: "Executar regulação diária breve"
      }
    };

    return planos[topGap.label] || {
      foco: "Consolidar base inicial",
      ambiente: "Ajustar ambiente imediato",
      habito: "Criar hábito âncora"
    };
  }

  function salvarParecerProfissional(texto) {
    if (!registro) return;

    registro.parecerProfissional = texto;

    if (registro?.preDiagnostico) {
      registro.preDiagnostico.parecerProfissional = texto;
    }

    const clientes = getClientes();
    const leads = getLeads();

    const clienteIndex = clientes.findIndex(item => String(item.id) === String(registro.id));
    const leadIndex = leads.findIndex(item => String(item.id) === String(registro.id));

    if (clienteIndex >= 0) {
      clientes[clienteIndex].parecerProfissional = texto;
      if (clientes[clienteIndex].preDiagnostico) {
        clientes[clienteIndex].preDiagnostico.parecerProfissional = texto;
      }
      localStorage.setItem("za_clientes", JSON.stringify(clientes));
    }

    if (leadIndex >= 0) {
      leads[leadIndex].parecerProfissional = texto;
      localStorage.setItem("za_leads", JSON.stringify(leads));
    }
  }

  function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function renderHeader() {
    const prof = getProfissionalAtual();

    setText("report-lead-name", getNome());
    setText("report-date", formatDate(new Date().toISOString()));
    setText("report-profissional", prof.nome);
    setText("report-cref", prof.cref);
  }

  function createSection(title, content) {
    return `
      <section class="report-section">
        <h2>${title}</h2>
        ${content}
      </section>
    `;
  }

  function renderRadarSection() {
    return `
      <section class="report-section">
        <h2>Radar inicial de condição</h2>
        <div class="report-text-block">
          <p>Esse radar mostra sua condição percebida hoje nos 6 pilares centrais do processo. Ele funciona como ponto de partida para entender onde estão seus maiores gargalos e onde existe base melhor construída.</p>
        </div>
        <div class="report-chart-wrap">
          <canvas id="pre-radar-chart"></canvas>
        </div>
      </section>
    `;
  }

  function renderRadar() {
    const ctx = document.getElementById("pre-radar-chart");
    if (!ctx || typeof Chart === "undefined") return;

    if (radarChart) {
      radarChart.destroy();
      radarChart = null;
    }

    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.values(RADAR_LABELS),
        datasets: [
          {
            label: "Perfil atual",
            data: getRadarData(),
            borderColor: "rgba(71, 184, 255, 0.95)",
            backgroundColor: "rgba(71, 184, 255, 0.20)",
            pointBackgroundColor: "rgba(71, 184, 255, 0.95)",
            pointBorderColor: "#ffffff",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
              backdropColor: "transparent",
              color: "rgba(16,36,61,0.72)"
            },
            grid: { color: "rgba(16,36,61,0.12)" },
            angleLines: { color: "rgba(16,36,61,0.12)" },
            pointLabels: {
              color: "rgba(16,36,61,0.88)",
              font: { size: 13 }
            }
          }
        }
      }
    });
  }

  function renderBody() {
    const root = document.getElementById("report-body");
    if (!root) return;

    const objetivo = getObjetivo();
    const mediaRadar = getRadarAverage();
    const gaps = getTopGaps(3);
    const planoMes1 = getPlanoMes1();
    const parecerAtual = getParecerProfissional();

    root.innerHTML = `
      ${createSection(
        "Identificação",
        `
          <div class="report-grid cols-2">
            <div class="report-info-card"><span>Nome</span><strong>${formatRaw(getNome())}</strong></div>
            <div class="report-info-card"><span>E-mail</span><strong>${formatRaw(getEmail())}</strong></div>
            <div class="report-info-card"><span>Cidade</span><strong>${formatRaw(getCidade())}</strong></div>
            <div class="report-info-card"><span>Origem</span><strong>${formatRaw(getOrigem())}</strong></div>
            <div class="report-info-card"><span>Data de nascimento</span><strong>${formatRaw(getNascimento())}</strong></div>
            <div class="report-info-card"><span>Gênero</span><strong>${formatRaw(getGenero())}</strong></div>
          </div>
        `
      )}

      ${createSection(
        "Condição atual",
        `
          <div class="report-grid cols-2">
            <div class="report-info-card"><span>Objetivo principal</span><strong>${formatRaw(objetivo)}</strong></div>
            <div class="report-info-card"><span>Média geral do radar</span><strong>${formatRaw(mediaRadar)}</strong></div>
            <div class="report-info-card"><span>Urgência</span><strong>${formatRaw(getUrgencia())}</strong></div>
            <div class="report-info-card"><span>Comprometimento</span><strong>${formatRaw(getComprometimento())}</strong></div>
            <div class="report-info-card"><span>Principal sabotador</span><strong>${formatRaw(getSabotagem())}</strong></div>
            <div class="report-info-card"><span>Contexto físico</span><strong>Peso: ${formatRaw(getPeso())} | Altura: ${formatRaw(getAltura())}</strong></div>
          </div>

          <div class="report-text-block">
            <h3>Maior desafio atual</h3>
            <p>${formatRaw(getDesafioAtual())}</p>
          </div>

          <div class="report-text-block">
            <h3>Meta para 6 meses</h3>
            <p>${formatRaw(getMeta6Meses())}</p>
          </div>
        `
      )}

      ${renderRadarSection()}

      ${createSection(
        "Leitura automática inicial",
        `
          <div class="report-text-block">
            <p>${getPerfilTexto()}</p>
          </div>
        `
      )}

      ${createSection(
        "Gaps prioritários",
        `
          <div class="report-grid cols-3">
            ${gaps.map((gap, index) => `
              <div class="report-info-card">
                <span>${index + 1}º gap</span>
                <strong>${gap.label} — ${gap.score}/10</strong>
                <p class="report-mini-text"><strong>Causa provável:</strong> ${getGapReason(gap.label)}</p>
                <p class="report-mini-text"><strong>Ação inicial:</strong> ${getGapAction(gap.label)}</p>
                <p class="report-mini-text"><strong>Status:</strong> ${getPilarStatus(gap.score)}</p>
              </div>
            `).join("")}
          </div>
        `
      )}

      ${createSection(
        "Soluções propostas",
        `
          <div class="report-grid cols-3">
            <div class="report-info-card">
              <span>Solução imediata</span>
              <strong>${getGapAction(gaps[0]?.label || "Base")}</strong>
            </div>
            <div class="report-info-card">
              <span>Solução de ambiente</span>
              <strong>${planoMes1.ambiente}</strong>
            </div>
            <div class="report-info-card">
              <span>Solução de processo</span>
              <strong>${planoMes1.habito}</strong>
            </div>
          </div>
        `
      )}

      ${createSection(
        "Plano inicial do mês 1",
        `
          <div class="report-grid cols-3">
            <div class="report-info-card">
              <span>Foco principal</span>
              <strong>${planoMes1.foco}</strong>
            </div>
            <div class="report-info-card">
              <span>Ajuste de ambiente</span>
              <strong>${planoMes1.ambiente}</strong>
            </div>
            <div class="report-info-card">
              <span>Hábito âncora</span>
              <strong>${planoMes1.habito}</strong>
            </div>
          </div>
          <div class="report-text-block">
            <p>O objetivo deste primeiro momento não é complexidade. É criar base, reduzir ruído e gerar tração suficiente para que o processo se torne sustentável.</p>
          </div>
        `
      )}

      <section class="report-section">
        <h2>Parecer profissional</h2>

        <div class="parecer-editor no-pdf">
          <textarea
            id="parecer-profissional-input"
            class="parecer-input"
            placeholder="Cole aqui sua análise profissional..."
          >${parecerAtual === "—" ? "" : parecerAtual}</textarea>

          <div class="parecer-actions no-pdf">
            <button class="btn" id="salvar-parecer-btn" type="button">Salvar parecer</button>
          </div>
        </div>

        <div
          id="parecer-profissional-view"
          class="report-text-block parecer-render"
          style="${parecerAtual && parecerAtual !== "—" ? "" : "display:none;"}"
        >${parecerAtual === "—" ? "" : parecerAtual}</div>
      </section>
    `;

    renderRadar();

    const parecerInput = document.getElementById("parecer-profissional-input");
    if (parecerInput) {
      autoResizeTextarea(parecerInput);
      parecerInput.addEventListener("input", () => autoResizeTextarea(parecerInput));
    }
  }

  function bindEvents() {
    const salvarBtn = document.getElementById("salvar-parecer-btn");
    const input = document.getElementById("parecer-profissional-input");
    const view = document.getElementById("parecer-profissional-view");

    salvarBtn?.addEventListener("click", () => {
      const texto = input?.value?.trim() || "";

      salvarParecerProfissional(texto);

      if (view) {
        view.textContent = texto;
        view.style.display = texto ? "" : "none";
      }

      autoResizeTextarea(input);
      alert("Parecer profissional salvo.");
    });
  }

  function showNotFound() {
    const body = document.getElementById("report-body");
    if (body) {
      body.innerHTML = `
        <section class="report-section">
          <h2>Registro não encontrado</h2>
          <div class="report-text-block">
            <p>Não foi possível localizar este lead/cliente no armazenamento atual.</p>
          </div>
        </section>
      `;
    }
  }

  function render() {
    renderHeader();
    renderBody();
    bindEvents();
  }

  async function init() {
    registroId = getQueryParam("id");

    await window.ZAStorage.init({ force: true });
    registro = getRegistroById(registroId);

    if (!registroId || !registro) {
      showNotFound();
      return;
    }

    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZARelatorioCliente.init();
});