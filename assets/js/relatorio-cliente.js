window.ZARelatorioCliente = (() => {
  let clienteId = null;
  let cliente = null;
  let radarChart = null;
  let evolucaoChart = null;

  const RADAR_LABELS = {
    movimento: "Movimento",
    alimentacao: "Alimentação",
    sono: "Sono",
    proposito: "Propósito",
    social: "Social",
    estresse: "Estresse"
  };

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function getClientes() {
    return window.ZAStorage?.getClientes?.() || [];
  }

  function getClienteById(id) {
    return getClientes().find((item) => String(item.id) === String(id)) || null;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "—";
    try {
      return new Date(dateValue).toLocaleDateString("pt-BR");
    } catch {
      return String(dateValue);
    }
  }

  function formatNumber(value, digits = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toFixed(digits).replace(".", ",");
  }

  function formatRaw(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  function getInitials(nome) {
    if (!nome) return "C";
    const parts = nome.trim().split(" ").filter(Boolean);
    return ((parts[0]?.[0] || "C") + (parts[1]?.[0] || "")).toUpperCase();
  }

  function firstFilled(...values) {
    for (const value of values) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
    return "";
  }

  function ensureHistorico(clienteObj) {
    const historico = clienteObj?.historico || {};
    return {
      avaliacoes: Array.isArray(historico.avaliacoes) ? historico.avaliacoes : [],
      radar: Array.isArray(historico.radar) ? historico.radar : []
    };
  }

  function getPrimeiraEUltimaAvaliacao() {
    const historico = ensureHistorico(cliente);
    const lista = historico.avaliacoes;

    if (!lista.length) {
      const fallback = cliente?.sessaoEAvaliacao;
      if (!fallback?.avaliacao) {
        return { inicial: null, atual: null };
      }

      const fake = {
        data: fallback?.sessao?.data || "",
        protocolo: fallback?.sessao?.protocolo || "",
        tipoSessao: fallback?.sessao?.tipo || "",
        avaliacao: {
          peso: fallback.avaliacao["peso"] || "",
          altura: fallback.avaliacao["altura"] || "",
          cintura: fallback.avaliacao["cintura"] || "",
          quadril: fallback.avaliacao["quadril"] || "",
          pescoco: fallback.avaliacao["pescoco"] || "",
          abdomenMarinha: fallback.avaliacao["abdomen-marinha"] || "",
          imc: fallback.avaliacao["imc"] || "",
          rcq: fallback.avaliacao["rcq"] || "",
          rce: fallback.avaliacao["rce"] || "",
          gorduraMarinha: fallback.avaliacao["gordura-marinha"] || "",
          gorduraDobras: fallback.avaliacao["gordura-dobras"] || "",
          perimetria: {
            torax: fallback.avaliacao["torax"] || "",
            abdomen: fallback.avaliacao["abdomen"] || "",
            bracoDireito: fallback.avaliacao["braco-direito"] || "",
            bracoEsquerdo: fallback.avaliacao["braco-esquerdo"] || "",
            coxaDireita: fallback.avaliacao["coxa-direita"] || "",
            coxaEsquerda: fallback.avaliacao["coxa-esquerda"] || "",
            panturrilha: fallback.avaliacao["panturrilha"] || ""
          }
        }
      };

      return { inicial: fake, atual: fake };
    }

    return {
      inicial: lista[0],
      atual: lista[lista.length - 1]
    };
  }

  function getPrimeiroEUltimoRadar() {
    const historico = ensureHistorico(cliente);
    const lista = historico.radar;

    if (!lista.length) {
      const atual = cliente?.analiseCaso?.radarRevisado || {};
      return {
        inicial: atual,
        atual
      };
    }

    return {
      inicial: lista[0]?.valores || {},
      atual: lista[lista.length - 1]?.valores || {}
    };
  }

  function getDiagnosticoAtual() {
    return cliente?.analiseCaso?.diagnosticoCompleto || {};
  }

  function getResumoObjetivo() {
    return firstFilled(
      cliente?.dadosBaseEditados?.objetivo,
      cliente?.preDiagnostico?.objetivo,
      cliente?.preDiagnostico?.objetivo_principal,
      cliente?.preDiagnostico?.objetivo_fisico,
      cliente?.objetivo
    ) || "—";
  }

  function deltaText(oldValue, newValue, suffix = "", invertPositive = false, digits = 2) {
    const oldNum = Number(oldValue);
    const newNum = Number(newValue);

    if (!Number.isFinite(oldNum) || !Number.isFinite(newNum)) {
      return { text: "Sem comparação", className: "delta-neutral" };
    }

    const delta = newNum - oldNum;
    const abs = Math.abs(delta).toFixed(digits).replace(".", ",");

    if (delta === 0) {
      return { text: "Sem variação", className: "delta-neutral" };
    }

    const improved = invertPositive ? delta < 0 : delta > 0;
    const sign = delta > 0 ? "+" : "-";

    return {
      text: `${sign}${abs}${suffix ? ` ${suffix}` : ""}`,
      className: improved ? "delta-positive" : "delta-negative"
    };
  }

  function metricCard(label, oldValue, newValue, options = {}) {
    const {
      suffix = "",
      invertPositive = false,
      digits = 2,
      raw = false
    } = options;

    const oldText = raw ? formatRaw(oldValue) : formatNumber(oldValue, digits);
    const newText = raw ? formatRaw(newValue) : formatNumber(newValue, digits);
    const delta = raw
      ? { text: "Comparação visual", className: "delta-neutral" }
      : deltaText(oldValue, newValue, suffix, invertPositive, digits);

    return `
      <div class="metric-card">
        <span class="metric-label">${label}</span>
        <div class="metric-main">
          <div class="metric-values">
            <div class="metric-old">
              <small>Inicial</small>
              <strong>${oldText}</strong>
            </div>
            <div class="metric-new">
              <small>Atual</small>
              <strong>${newText}</strong>
            </div>
          </div>
          <div class="metric-delta ${delta.className}">${delta.text}</div>
        </div>
      </div>
    `;
  }

  function renderHeader() {
    const nome = cliente?.nome || "Cliente";
    const email = cliente?.email || "—";
    const objetivo = getResumoObjetivo();

    setText("report-avatar", getInitials(nome));
    setText("report-nome", nome);
    setText("report-email", email);
    setText("report-meta", `Objetivo: ${objetivo}`);
    setText("report-data-geracao", `Gerado em ${formatDate(new Date().toISOString())}`);

    const voltar = document.getElementById("voltar-cliente-link");
    if (voltar && clienteId) {
      voltar.href = `../cliente/index.html?id=${encodeURIComponent(clienteId)}`;
    }
  }

  function renderResumo() {
    const d = getDiagnosticoAtual();
    setText("summary-objetivo", getResumoObjetivo());
    setText("summary-gargalo", d.gargalo || "—");
    setText("summary-prioridade", d.prioridade || "—");
  }

  function renderRadar() {
    const radar = getPrimeiroEUltimoRadar();
    const labels = Object.keys(RADAR_LABELS).map((key) => RADAR_LABELS[key]);

    const initialData = Object.keys(RADAR_LABELS).map((key) => Number(radar.inicial?.[key] ?? 0));
    const currentData = Object.keys(RADAR_LABELS).map((key) => Number(radar.atual?.[key] ?? 0));

    const ctx = document.getElementById("radar-chart");
    if (!ctx || typeof Chart === "undefined") return;

    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Inicial",
            data: initialData,
            backgroundColor: "rgba(255, 159, 64, 0.20)",
            borderColor: "rgba(255, 159, 64, 0.95)",
            pointBackgroundColor: "rgba(255, 159, 64, 0.95)",
            pointBorderColor: "#fff",
            borderWidth: 2
          },
          {
            label: "Atual",
            data: currentData,
            backgroundColor: "rgba(54, 162, 235, 0.20)",
            borderColor: "rgba(54, 162, 235, 0.95)",
            pointBackgroundColor: "rgba(54, 162, 235, 0.95)",
            pointBorderColor: "#fff",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
              color: "rgba(235,240,255,0.72)"
            },
            grid: {
              color: "rgba(255,255,255,0.12)"
            },
            angleLines: {
              color: "rgba(255,255,255,0.12)"
            },
            pointLabels: {
              color: "rgba(235,240,255,0.88)",
              font: {
                size: 13
              }
            }
          }
        }
      }
    });
  }

  function renderMetrics() {
    const { inicial, atual } = getPrimeiraEUltimaAvaliacao();
    const grid = document.getElementById("metrics-grid");
    if (!grid) return;

    if (!inicial || !atual) {
      grid.innerHTML = `<div class="report-empty">Nenhuma avaliação salva para comparação.</div>`;
      return;
    }

    const av0 = inicial.avaliacao || {};
    const av1 = atual.avaliacao || {};

    const gorduraInicial = firstFilled(av0.gorduraDobras, av0.gorduraMarinha);
    const gorduraAtual = firstFilled(av1.gorduraDobras, av1.gorduraMarinha);

    grid.innerHTML = [
      metricCard("Peso (kg)", av0.peso, av1.peso, { invertPositive: true, digits: 1 }),
      metricCard("IMC", av0.imc, av1.imc, { invertPositive: true }),
      metricCard("RCQ", av0.rcq, av1.rcq, { invertPositive: true }),
      metricCard("RCE", av0.rce, av1.rce, { invertPositive: true }),
      metricCard("% Gordura", gorduraInicial, gorduraAtual, { suffix: "p.p.", invertPositive: true }),
      metricCard("Protocolo", inicial.protocolo, atual.protocolo, { raw: true }),
      metricCard("Data inicial", inicial.data, atual.data, { raw: true }),
      metricCard("Tipo de sessão", inicial.tipoSessao, atual.tipoSessao, { raw: true })
    ].join("");
  }

  function renderPerimetria() {
    const { inicial, atual } = getPrimeiraEUltimaAvaliacao();
    const grid = document.getElementById("perimetria-grid");
    if (!grid) return;

    if (!inicial || !atual) {
      grid.innerHTML = `<div class="report-empty">Nenhuma perimetria salva para comparação.</div>`;
      return;
    }

    const p0 = inicial.avaliacao?.perimetria || {};
    const p1 = atual.avaliacao?.perimetria || {};

    grid.innerHTML = [
      metricCard("Cintura", inicial.avaliacao?.cintura, atual.avaliacao?.cintura, { suffix: "cm", invertPositive: true, digits: 1 }),
      metricCard("Quadril", inicial.avaliacao?.quadril, atual.avaliacao?.quadril, { suffix: "cm", invertPositive: true, digits: 1 }),
      metricCard("Tórax", p0.torax, p1.torax, { suffix: "cm", digits: 1 }),
      metricCard("Abdômen", p0.abdomen, p1.abdomen, { suffix: "cm", invertPositive: true, digits: 1 }),
      metricCard("Braço direito", p0.bracoDireito, p1.bracoDireito, { suffix: "cm", digits: 1 }),
      metricCard("Braço esquerdo", p0.bracoEsquerdo, p1.bracoEsquerdo, { suffix: "cm", digits: 1 }),
      metricCard("Coxa direita", p0.coxaDireita, p1.coxaDireita, { suffix: "cm", digits: 1 }),
      metricCard("Coxa esquerda", p0.coxaEsquerda, p1.coxaEsquerda, { suffix: "cm", digits: 1 }),
      metricCard("Panturrilha", p0.panturrilha, p1.panturrilha, { suffix: "cm", digits: 1 })
    ].join("");
  }

  function renderDiagnostico() {
    const d = getDiagnosticoAtual();
    const foco = firstFilled(
      d?.focoMes1?.gap,
      d?.focoMes1?.habito,
      d?.focoMes1?.ambiente
    );

    setText("diagnostico-leitura", d.leitura || "—");
    setText("diagnostico-sintese", d.sintese || "—");
    setText("diagnostico-foco", foco || "—");
  }

  function renderTimeline() {
    const root = document.getElementById("timeline-list");
    if (!root) return;

    const itens = Array.isArray(cliente?.acompanhamentos) ? cliente.acompanhamentos : [];

    if (!itens.length) {
      root.innerHTML = `<div class="report-empty">Nenhum acompanhamento registrado até o momento.</div>`;
      return;
    }

    root.innerHTML = itens
      .slice(-3)
      .reverse()
      .map((item) => `
        <article class="timeline-item">
          <div class="timeline-item-top">
            <strong>${item.data ? formatDate(item.data) : "Sem data"}</strong>
            <span>${item.aderencia || "Sem aderência informada"}</span>
          </div>
          <p><strong>Evolução:</strong> ${item.evolucao || "—"}</p>
          <p><strong>Dificuldades:</strong> ${item.dificuldades || "—"}</p>
          <p><strong>Ajustes:</strong> ${item.ajustes || "—"}</p>
        </article>
      `)
      .join("");
  }

  function getHistoricoIndicadores() {
    const historico = ensureHistorico(cliente).avaliacoes;

    const labels = [];
    const gordura = [];
    const rcq = [];
    const rce = [];

    historico.forEach((item, index) => {
      const av = item.avaliacao || {};

      labels.push(`A${index + 1}`);

      const gorduraValor = Number(firstFilled(av.gorduraDobras, av.gorduraMarinha, 0));
      const rcqValor = Number(av.rcq);
      const rceValor = Number(av.rce);

      gordura.push(Number.isFinite(gorduraValor) && gorduraValor !== 0 ? gorduraValor : null);
      rcq.push(Number.isFinite(rcqValor) ? rcqValor : null);
      rce.push(Number.isFinite(rceValor) ? rceValor : null);
    });

    return { labels, gordura, rcq, rce };
  }

  function renderEvolucaoGrafico() {
    const ctx = document.getElementById("evolucao-chart");
    if (!ctx || typeof Chart === "undefined") return;

    const data = getHistoricoIndicadores();

    if (!data.labels.length) {
      const container = ctx.parentElement;
      if (container) {
        container.innerHTML = `<div class="report-empty">Ainda não há avaliações suficientes para exibir a evolução dos indicadores.</div>`;
      }
      return;
    }

    if (evolucaoChart) evolucaoChart.destroy();

    evolucaoChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "% Gordura",
            data: data.gordura,
            borderColor: "rgba(255, 99, 132, 0.95)",
            backgroundColor: "rgba(255, 99, 132, 0.18)",
            pointBackgroundColor: "rgba(255, 99, 132, 0.95)",
            pointBorderColor: "#fff",
            borderWidth: 3,
            tension: 0.32,
            spanGaps: true
          },
          {
            label: "RCQ",
            data: data.rcq,
            borderColor: "rgba(54, 162, 235, 0.95)",
            backgroundColor: "rgba(54, 162, 235, 0.18)",
            pointBackgroundColor: "rgba(54, 162, 235, 0.95)",
            pointBorderColor: "#fff",
            borderWidth: 2,
            tension: 0.32,
            spanGaps: true
          },
          {
            label: "RCE",
            data: data.rce,
            borderColor: "rgba(255, 206, 86, 0.95)",
            backgroundColor: "rgba(255, 206, 86, 0.18)",
            pointBackgroundColor: "rgba(255, 206, 86, 0.95)",
            pointBorderColor: "#fff",
            borderWidth: 2,
            tension: 0.32,
            spanGaps: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: "#ffffff"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "rgba(235,240,255,0.75)"
            },
            grid: {
              color: "rgba(255,255,255,0.08)"
            }
          },
          y: {
            ticks: {
              color: "rgba(235,240,255,0.75)"
            },
            grid: {
              color: "rgba(255,255,255,0.08)"
            }
          }
        }
      }
    });
  }

  function bindEvents() {
    document.getElementById("print-report-btn")?.addEventListener("click", () => {
      window.print();
    });
  }

  function render() {
    renderHeader();
    renderResumo();
    renderRadar();
    renderMetrics();
    renderPerimetria();
    renderDiagnostico();
    renderTimeline();
    renderEvolucaoGrafico();
    bindEvents();
  }

  function showNotFound() {
    document.getElementById("relatorio-page")?.classList.add("hidden");
    document.getElementById("relatorio-not-found")?.classList.remove("hidden");
  }

  function showPage() {
    document.getElementById("relatorio-page")?.classList.remove("hidden");
    document.getElementById("relatorio-not-found")?.classList.add("hidden");
  }

  async function init() {
    clienteId = getQueryParam("id");

    if (!clienteId) {
      showNotFound();
      return;
    }

    await window.ZAStorage.init({ force: true });
    cliente = getClienteById(clienteId);

    if (!cliente) {
      showNotFound();
      return;
    }

    showPage();
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", async () => {
  await window.ZARelatorioCliente.init();
});