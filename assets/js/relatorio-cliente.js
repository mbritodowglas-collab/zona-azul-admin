const nomeProfissional =
  planejamento?.profissional?.nome ||
  planejamento?.profissionalNome ||
  "Márcio Dowglas";

const crefProfissional =
  planejamento?.profissional?.cref ||
  planejamento?.profissionalCref ||
  "—";

const elProfNome = document.getElementById("report-profissional-nome");
const elProfCref = document.getElementById("report-profissional-cref");

if (elProfNome) elProfNome.textContent = nomeProfissional;
if (elProfCref) elProfCref.textContent = crefProfissional;