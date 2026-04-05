window.ZARelatorioCliente = (() => {
  let registroId = null;
  let registro = null;

  const RADAR_LABELS = {
    score_movimento: "Movimento",
    score_alimentacao: "Alimentação",
    score_sono: "Sono",
    score_proposito: "Propósito",
    score_social: "Social",
    score_estresse: "Estresse"
  };

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

  function getNome() {
    return registro?.nome || "Lead";
  }

  function getEmail() {
    return registro?.email || "—";
  }

  function getObjetivo() {
    return (
      registro?.objetivo ||
      registro?.objetivo_principal ||
      registro?.objetivo_fisico ||
      registro?.dadosBaseEditados?.objetivo ||
      registro?.preDiagnostico?.objetivo ||
      registro?.preDiagnostico?.objetivo_principal ||
      registro?.preDiagnostico?.objetivo_fisico ||
      "—"
    );
  }

  function getCidade() {
    return (
      registro?.cidade ||
      registro?.preDiagnostico?.cidade ||
      "—"
    );
  }

  function getOrigem() {
    return (
      registro?.origem ||
      registro?.preDiagnostico?.origem ||
      "—"
    );
  }

  function getUrgencia() {
    return (
      registro?.urgencia ||
      registro?.preDiagnostico?.urgencia ||
      "—"
    );
  }

  function getComprometimento() {
    return (
      registro?.comprometimento ||
      registro?.preDiagnostico?.comprometimento ||
      "—"
    );
  }

  function getSabotagem() {
    return (
      registro?.sabotagem ||
      registro?.preDiagnostico?.sabotagem ||
      "—"
    );
  }

  function getDesafioAtual() {
    return (
      registro?.desafio_atual ||
      registro?.preDiagnostico?.desafio_atual ||
      "—"
    );
  }

  function getMeta6Meses() {
    return (
      registro?.meta_6_meses ||
      registro?.preDiagnostico?.meta_6_meses ||
      "—"
    );
  }

  function getPeso() {
    return (
      registro?.peso ||
      registro?.dadosBaseEditados?.peso ||
      registro?.preDiagnostico?.peso ||
      "—"
    );
  }

  function getAltura() {
    return (
      registro?.altura ||
      registro?.dadosBaseEditados?.altura ||
      registro?.preDiagnostico?.altura ||
      "—"
    );
  }

  function getNascimento() {
    return (
      registro?.data_nascimento ||
      registro?.preDiagnostico?.data_nascimento ||
      "—"
    );
  }

  function getGenero() {
    return (
      registro?.genero ||
      registro?.preDiagnostico?.genero ||
      "—"
    );
  }

  function getScore(key) {
    const value =
      registro?.[key] ??
      registro?.preDiagnostico?.[key] ??
      0;

    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function getRadarData() {
    return Object.keys(RADAR_LABELS).map((key) => getScore(key));
  }

  function getRadarAverage() {
    const values = getRadarData().filter(v => Number.isFinite(v) && v > 0);
    if (!values.length) return "—";
    const avg = values.reduce((acc, n) => acc + n, 0) / values.length;
    return avg.toFixed(1).replace(".", ",");
  }

  function getPerfilTexto() {
    const urgencia = String(getUrgencia()).toLowerCase();
    const comprometimento = Number(getComprometimento());
    const sabotagem = String(getSabotagem()).toLowerCase();

    if (urgencia.includes("alta") && comprometimento >= 8) {
      return "Perfil com alta prontidão para mudança, mostrando urgência elevada e boa disposição para iniciar um processo estruturado.";
    }

    if (sabotagem.includes("emocional")) {
      return "O perfil sugere que fatores emocionais podem ter peso importante no processo, exigindo uma condução mais estratégica e sustentável.";
    }

    if (sabotagem.includes("tempo")) {
      return "A principal barreira parece estar na gestão da rotina e do tempo, o que indica a necessidade de um plano simples, executável e adaptável.";
    }

    return "O perfil mostra espaço real para evolução, com necessidade de organização progressiva dos hábitos e construção de consistência.";
  }

  function renderHeader() {
    setText("report-lead-name", getNome());
    setText("report-date", formatDate(new Date().toISOString()));
  }

  function createSection(title, content) {
    return `
      <section class="report-section">
        <h2>${title}</h2>
        ${content}
      </section>
    `;
  }

  function renderBody() {
    const root = document.getElementById("report-body");
    if (!root) return;

    const objetivo = getObjetivo();
    const mediaRadar = getRadarAverage();

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
        "Leitura inicial do caso",
        `
          <div class="report-grid cols-2">
            <div class="report-info-card"><span>Objetivo principal</span><strong>${formatRaw(objetivo)}</strong></div>
            <div class="report-info-card"><span>Urgência</span><strong>${formatRaw(getUrgencia())}</strong></div>
            <div class="report-info-card"><span>Comprometimento</span><strong>${formatRaw(getComprometimento())}</strong></div>
            <div class="report-info-card"><span>Principal sabotador</span><strong>${formatRaw(getSabotagem())}</strong></div>
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

      ${createSection(
        "Contexto físico inicial",
        `
          <div class="report-grid cols-2">
            <div class="report-info-card"><span>Peso</span><strong>${formatRaw(getPeso())}</strong></div>
            <div class="report-info-card"><span>Altura</span><strong>${formatRaw(getAltura())}</strong></div>
          </div>
        `
      )}

      ${createSection(
        "Radar de longevidade",
        `
          <div class="report-grid cols-3">
            <div class="report-info-card"><span>Movimento</span><strong>${getScore("score_movimento") || "—"}</strong></div>
            <div class="report-info-card"><span>Alimentação</span><strong>${getScore("score_alimentacao") || "—"}</strong></div>
            <div class="report-info-card"><span>Sono</span><strong>${getScore("score_sono") || "—"}</strong></div>
            <div class="report-info-card"><span>Propósito</span><strong>${getScore("score_proposito") || "—"}</strong></div>
            <div class="report-info-card"><span>Social</span><strong>${getScore("score_social") || "—"}</strong></div>
            <div class="report-info-card"><span>Estresse</span><strong>${getScore("score_estresse") || "—"}</strong></div>
          </div>

          <div class="report-highlight-card">
            <span>Média geral do radar</span>
            <strong>${mediaRadar}</strong>
          </div>
        `
      )}

      ${createSection(
        "Síntese automática inicial",
        `
          <div class="report-text-block">
            <p>${getPerfilTexto()}</p>
          </div>
        `
      )}
    `;
  }

  function bindEvents() {
    document.getElementById("print-report-btn")?.addEventListener("click", () => {
      window.print();
    });
  }

  function render() {
    renderHeader();
    renderBody();
    bindEvents();
  }

  function initStylesFallback() {
    const root = document.getElementById("report-body");
    if (!root) return;

    if (!document.getElementById("za-report-inline-styles")) {
      const style = document.createElement("style");
      style.id = "za-report-inline-styles";
      style.textContent = `
        .report-section {
          margin-top: 22px;
          padding: 22px;
          border-radius: 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .report-section h2 {
          margin: 0 0 14px;
          color: #fff;
          font-size: 22px;
        }
        .report-section h3 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 16px;
        }
        .report-grid {
          display: grid;
          gap: 14px;
        }
        .report-grid.cols-2 {
          grid-template-columns: repeat(2, minmax(0,1fr));
        }
        .report-grid.cols-3 {
          grid-template-columns: repeat(3, minmax(0,1fr));
        }
        .report-info-card,
        .report-highlight-card,
        .report-text-block {
          padding: 16px;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .report-info-card span,
        .report-highlight-card span {
          display: block;
          margin-bottom: 8px;
          color: rgba(226,232,240,0.7);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .report-info-card strong,
        .report-highlight-card strong {
          color: #fff;
          font-size: 20px;
        }
        .report-text-block p {
          margin: 0;
          color: rgba(226,232,240,0.88);
          line-height: 1.7;
        }
        @media (max-width: 720px) {
          .report-grid.cols-2,
          .report-grid.cols-3 {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }
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

  async function init() {
    registroId = getQueryParam("id");

    if (!registroId) {
      initStylesFallback();
      showNotFound();
      return;
    }

    await window.ZAStorage.init({ force: true });
    registro = getRegistroById(registroId);

    initStylesFallback();

    if (!registro) {
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