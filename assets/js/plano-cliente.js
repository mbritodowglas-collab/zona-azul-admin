document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clienteId = urlParams.get("id");

  if (!clienteId) return;

  const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
  const planejamentos = JSON.parse(localStorage.getItem("planejamentos") || "[]");

  const cliente = clientes.find(c => c.id === clienteId);
  const planejamento = planejamentos.find(p => p.clienteId === clienteId);

  if (!cliente || !planejamento) return;

  // =========================
  // DADOS BÁSICOS
  // =========================
  document.getElementById("cliente-nome").textContent = cliente.nome || "Cliente";
  document.getElementById("cliente-meta").textContent = cliente.objetivo || "";

  // =========================
  // RESUMO
  // =========================
  document.getElementById("plano-objetivo").textContent =
    planejamento.estrategia?.objetivo30d || "";

  document.getElementById("plano-foco").textContent =
    planejamento.estrategia?.focoCentral || "";

  // =========================
  // HÁBITOS (TRADUÇÃO)
  // =========================
  const habitos = planejamento.habitos || {};

  const habitosTexto = `
Vamos focar em pequenas ações consistentes:

• Hábito principal: ${habitos.habitoAncora || "-"}
• Ajuste de ambiente: ${habitos.ajusteAmbiente || "-"}
• Sono: ${habitos.metaSono || "-"}
• Hidratação: ${habitos.metaHidratacao || "-"}
• Movimento diário: ${habitos.metaPassos || "-"}
• Regra mínima: ${habitos.regraMinima || "-"}
  `;

  document.getElementById("plano-habitos").textContent = habitosTexto;

  // =========================
  // TREINO
  // =========================
  const treino = planejamento.treino || {};

  const treinoTexto = `
Frequência: ${treino.frequencia || "-"}
Duração: ${treino.duracao || "-"}
Estrutura: ${treino.divisao || "-"}

Plano do mês:
${treino.mes1Programa || ""}
  `;

  document.getElementById("plano-treino").textContent = treinoTexto;

  // =========================
  // CARDIO
  // =========================
  const cardio = planejamento.cardio || {};

  const cardioTexto = `
Modalidade: ${cardio.modalidade || "-"}
Frequência: ${cardio.frequencia || "-"}
Duração: ${cardio.duracao || "-"}
Intensidade: ${cardio.intensidade || "-"}
  `;

  document.getElementById("plano-cardio").textContent = cardioTexto;

  // =========================
  // NUTRIÇÃO
  // =========================
  const nutri = planejamento.nutricional || {};

  const nutriTexto = `
Foco principal: ${nutri.focoPrincipal || "-"}
Regra mínima: ${nutri.regraMinima || "-"}
Refeições prioritárias: ${nutri.refeicoesPrioritarias || "-"}
Estratégia fim de semana: ${nutri.fimSemana || "-"}
  `;

  document.getElementById("plano-nutri").textContent = nutriTexto;

  // =========================
  // REGRAS DO JOGO
  // =========================
  const regrasTexto = `
• Não precisa perfeição, precisa consistência
• Se falhar, retoma no próximo bloco
• Priorizar o básico antes de avançar
  `;

  document.getElementById("plano-regras").textContent = regrasTexto;

  // =========================
  // MENSAGEM FINAL
  // =========================
  const mensagem = planejamento.observacoes?.mensagemInterna || "";

  document.getElementById("plano-mensagem").textContent = mensagem;
});