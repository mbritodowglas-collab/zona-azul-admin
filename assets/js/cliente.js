function renderDiagnosticoActions(cliente) {
  return `
    <div class="card">
      <div class="card-header">
        <h3>Diagnóstico completo</h3>
      </div>
      <div class="card-body">
        <p><strong>Status:</strong> ${cliente.diagnosticoCompleto?.status || "nao_iniciado"}</p>
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