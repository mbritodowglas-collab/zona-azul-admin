const CONFIG_PROFISSIONAL = {
  nome: "Márcio Dowglas",
  cref: "CREF XXXXX-G/XX"
};

document.addEventListener("DOMContentLoaded", async () => {
  let cliente = null;

  // 1. tenta pegar do localStorage
  const clienteId = localStorage.getItem("clienteId");

  if (clienteId) {
    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    cliente = clientes.find(c => c.id == clienteId);
  }

  // 2. fallback supabase
  if (!cliente && window.supabase) {
    const { data } = await supabase.from("clientes").select("*").limit(1);
    cliente = data?.[0];
  }

  if (!cliente) {
    console.warn("Cliente não encontrado");
    return;
  }

  preencherHeader(cliente);
  renderRadar(cliente);
});

// ======================
// HEADER
// ======================

function preencherHeader(cliente) {
  setText("cliente-nome", cliente.nome || "—");
  setText("cliente-objetivo", cliente.objetivo || "—");
  setText("cliente-fase", cliente.fase || "—");

  setText("profissional-nome", CONFIG_PROFISSIONAL.nome);
  setText("profissional-cref", CONFIG_PROFISSIONAL.cref);
}

// ======================
// RADAR
// ======================

function renderRadar(cliente) {
  const ctx = document.getElementById("radarChart");

  if (!ctx) return;

  const dados = cliente.respostas || {};

  const labels = [
    "Sono",
    "Treino",
    "Alimentação",
    "Estresse",
    "Consistência",
    "Ambiente"
  ];

  const valores = [
    dados.sono || 3,
    dados.treino || 3,
    dados.alimentacao || 3,
    dados.estresse || 3,
    dados.consistencia || 3,
    dados.ambiente || 3
  ];

  new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Perfil atual",
        data: valores,
        backgroundColor: "rgba(71,184,255,0.2)",
        borderColor: "#47b8ff",
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          ticks: {
            color: "#fff"
          },
          grid: {
            color: "rgba(255,255,255,0.1)"
          },
          pointLabels: {
            color: "#fff"
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      }
    }
  });
}

// ======================
// HELPERS
// ======================

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}