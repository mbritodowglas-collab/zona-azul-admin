document.addEventListener("DOMContentLoaded", () => {
  const lead = Storage.getLeadAtual();

  if (!lead) {
    document.getElementById("report-body").innerHTML =
      "<p>Erro ao carregar dados do relatório.</p>";
    return;
  }

  document.getElementById("report-lead-name").textContent = lead.nome || "Lead";
  document.getElementById("report-date").textContent = new Date().toLocaleDateString("pt-BR");

  const respostas = lead.respostas || {};

  const scores = Calculos.calcularPilares(respostas);
  const pilarCritico = Calculos.pilarCritico(scores);

  const body = document.getElementById("report-body");

  body.innerHTML = `
    ${renderResumo(lead)}
    ${renderPilares(scores, pilarCritico)}
    ${renderDiagnosticoCompleto()}
    ${renderPlano()}
  `;
});

function renderResumo(lead) {
  return `
    <section class="premium-section">
      <h2>Resumo do seu perfil</h2>
      <p class="justify">
        A partir das suas respostas, foi possível identificar padrões importantes no seu estilo de vida atual.
        Esses padrões influenciam diretamente seus resultados — tanto físicos quanto mentais.
      </p>
    </section>
  `;
}

function renderPilares(scores, pilarCritico) {
  let html = `
    <section class="premium-section">
      <h2>Seus pilares</h2>
      <div class="pilares-grid">
  `;

  for (let pilar in scores) {
    html += `
      <div class="pilar-card ${pilar === pilarCritico ? "highlight" : ""}">
        <h4>${pilar}</h4>
        <p>${scores[pilar]} pts</p>
      </div>
    `;
  }

  html += `
      </div>
      <p class="justify destaque">
        O ponto que mais precisa de atenção no seu caso é: <strong>${pilarCritico}</strong>.
        Melhorar esse pilar tende a gerar impacto direto nos seus resultados.
      </p>
    </section>
  `;

  return html;
}

function renderDiagnosticoCompleto() {
  return `
    <section class="premium-section premium-box">
      <h2>O que acontece no seu diagnóstico completo</h2>

      <p class="justify">
        Com base nas suas respostas, o próximo passo não é apenas “te passar um treino”.
        É estruturar um plano que faça sentido pra sua realidade, respeitando seu momento atual
        e corrigindo os pontos que hoje estão travando seu progresso.
      </p>

      <ul class="premium-list">
        <li>✔️ Análise aprofundada dos seus hábitos e padrões atuais</li>
        <li>✔️ Identificação dos principais bloqueios de evolução</li>
        <li>✔️ Direcionamento claro de por onde começar</li>
        <li>✔️ Ajuste de rotina baseado na sua realidade</li>
        <li>✔️ Estratégia prática para manter consistência</li>
      </ul>

      <div class="premium-highlight">
        Você não recebe apenas um treino.<br>
        Você recebe um plano estruturado com direção, clareza e lógica.
      </div>
    </section>
  `;
}

function renderPlano() {
  return `
    <section class="premium-section premium-box destaque-final">

      <h2>Seu plano de treino personalizado</h2>

      <p class="justify">
        A partir dessa análise, é estruturado um plano de treino totalmente direcionado para você.
        Nada genérico. Nada pronto.
      </p>

      <p class="justify">
        Seu treino fica disponível dentro do aplicativo, com organização clara,
        progressão e acompanhamento — pra você saber exatamente o que fazer em cada etapa.
      </p>

      <div class="premium-highlight">
        Sem dúvida. Sem improviso.
      </div>

      <p class="justify destaque">
        Aqui não é sobre começar mais uma tentativa.<br>
        É sobre sair do ciclo de começar e parar e finalmente seguir um caminho com direção.
      </p>

      <div class="oferta-box">
        <h3>Planos disponíveis</h3>

        <div class="plano">
          <strong>Plano Trimestral</strong><br>
          R$ 600/mês
        </div>

        <div class="plano destaque">
          <strong>Plano Semestral</strong><br>
          R$ 500/mês
        </div>

        <p class="observacao">
          O plano de experiência pode ser liberado de forma estratégica,
          caso você ainda precise validar o processo antes de avançar.
        </p>
      </div>

    </section>
  `;
}