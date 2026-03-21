document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const clientes = ZAStorage.getClientes();
  const cliente = clientes.find(c => String(c.id) === String(id));

  if (!cliente) {
    alert("Cliente não encontrado");
    return;
  }

  document.getElementById("cliente-nome").textContent = cliente.nome;
  document.getElementById("cliente-objetivo").textContent =
    cliente.objetivo || "Sem objetivo definido";

  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.open;

      if (tipo === "lancamentos") {
        alert("Abrir área de lançamentos");
      }

      if (tipo === "relatorio") {
        alert("Abrir relatório completo");
      }

      if (tipo === "planejamento") {
        alert("Abrir planejamento do treinador");
      }
    });
  });

  document.getElementById("voltar-btn").onclick = () => {
    window.location.href = "../clientes/";
  };
});