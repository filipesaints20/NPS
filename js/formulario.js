const encodedURL = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6UGswNnowekY2UjRZN1BpdTE5UnNOMmJXczRRWnpUcWgzTkp4SVNzQlFRR3g1aEpCanRWanhuX0JxMUIzTnp4WXpKdw==";
const WEB_APP_URL = atob(encodedURL);

const DEPARTAMENTOS = [
  "CEO", "DIRETORIA FINANCEIRA", "DIRETORIA DE OBRAS", "DIRETORIA DE SERVIÇOS",
  "FACILITIES", "SUPRIMENTOS", "PLANEJAMENTO", "RH", "FINANCEIRO",
  "DEPARTAMENTO DE QUALIDADE", "COMERCIAL", "ENGENHARIA", "SST", "COMUNICAÇÃO"
];

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(window.location.search);
  const token = qs.get("token")?.trim().toUpperCase() || "";
  document.getElementById("token").value = token;

  const form = document.getElementById("nps-form");
  const statusBox = document.getElementById("status");

  const preenchido = localStorage.getItem("nps_" + token);
  if (preenchido) {
    form.style.display = "none";
    statusBox.textContent = "Você já respondeu esta pesquisa. Obrigado!";
    statusBox.className = "success";
    return;
  }

  const container = document.getElementById("perguntas-container");
  const outrosDepartamentos = DEPARTAMENTOS.filter(dep => dep !== token);

  outrosDepartamentos.forEach(dep => {
    const depId = dep.replace(/\s+/g, "_").replace(/\//g, "_");
    const section = document.createElement("section");
    section.className = "departamento-section";

    const escalaHTML = [...Array(11).keys()].map(i => `
      <button type="button" class="nps-btn" data-value="${i}" style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #000;
        background-color: #fff;
        color: #000;
        font-size: 0.85rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2px;
        cursor: pointer;
      ">${i}</button>
    `).join("");

    section.innerHTML = `
      <h2>${dep}</h2>
      <label>1. Em uma escala de 0 a 10, qual seu nível de satisfação com o departamento <strong>${dep}</strong>?</label>
      <div class="nps-scale" data-dep="${depId}">${escalaHTML}</div>
      <label for="comentario_${depId}">2. Espaço para deixar elogios, sugestões e críticas sobre <strong>${dep}</strong>:</label>
      <textarea id="comentario_${depId}" name="comentario_${depId}" placeholder="Queremos te ouvir..."></textarea>
    `;
    container.appendChild(section);
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("nps-btn")) {
      const group = e.target.closest(".nps-scale");
      group.querySelectorAll(".nps-btn").forEach(btn => btn.style.backgroundColor = "#fff");
      e.target.style.backgroundColor = "#00ffd5";

      const name = "nps_" + group.dataset.dep;
      let input = document.querySelector(`input[name="${name}"]`);
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        group.appendChild(input);
      }
      input.value = e.target.dataset.value;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "Enviando...";
    statusBox.className = "";

    const fd = new FormData(form);
    const body = new URLSearchParams();
    for (const [k, v] of fd.entries()) body.append(k, v);

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: body.toString()
      });

      const data = await res.json();
      if (data.ok) {
        localStorage.setItem("nps_" + token, "respondido");
        window.location.href = "agradecimento.html";
      } else {
        statusBox.textContent = "⚠️ Erro: " + (data.error || "Falha desconhecida");
        statusBox.className = "error";
      }
    } catch (err) {
      statusBox.textContent = "❌ Erro ao enviar: " + err.message;
      statusBox.className = "error";
    }
  });
});
