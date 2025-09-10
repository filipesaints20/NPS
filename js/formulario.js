// 🔐 Link do Google Apps Script codificado em Base64
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
  const outrosDepartamentos = DEPARTAMENTOS.filter(dep => dep !== token).slice(0, 14);

  outrosDepartamentos.forEach(dep => {
    const depId = dep.replace(/\s+/g, "_").replace(/\//g, "_");
    const section = document.createElement("section");
    section.style.marginTop = "2rem";
    section.style.paddingBottom = "1.5rem";
    section.style.borderBottom = "1px solid #ccc";

    section.innerHTML = `
      <h2 style="font-size: 1.5rem; color: #000000ff; margin-bottom: 1rem;">${dep}</h2>

      <label style="font-weight: 600;">1. Em uma escala de 0 a 10, qual seu nível de satisfação com o departamento <strong>${dep}</strong>?</label>
      <div class="nps-scale" style="display: flex; flex-wrap: wrap; justify-content: space-between; margin: 1rem 0;">
        ${Array.from({ length: 11 }, (_, i) => `
          <label style="flex: 1 0 8%; text-align: center; font-size: 0.9rem;">
            ${i}<br>
            <input type="radio" name="nps_${depId}" value="${i}" ${i === 0 ? 'required' : ''}>
          </label>
        `).join("")}
      </div>

      <label for="comentario_${depId}" style="font-weight: 600;">2. Espaço para deixar elogios, sugestões e críticas sobre <strong>${dep}</strong>:</label>
      <textarea
        id="comentario_${depId}"
        name="comentario_${depId}"
        placeholder="Queremos te ouvir..."
        style="width: 100%; min-height: 120px; resize: vertical; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; margin-top: 0.5rem;"
      ></textarea>
    `;
    container.appendChild(section);
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



