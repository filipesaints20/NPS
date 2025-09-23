const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKocu1yHm2sE0YZSJ8D932JmqDs9wbM3xFBl1TCLEJ0ObH3-StWW9W1LUZGUlAy4ZF8A/exec"

// 🔹 Mapeamento de tokens simples para nomes completos
const TOKEN_MAP = {
  "CEO": "CEO",
  "CFO": "CFO Diretoria Financeira",
  "ADM": "ADM FACILITIES SUPRIMENTOS",
  "PLANEJAMENTO": "PLANEJAMENTO",
  "RH": "RH",
  "FINANCEIRO": "FINANCEIRO",
  "ENGENHARIA": "ENGENHARIA",
  "SST": "SST",
  "COMUNICACAO": "COMUNICAÇÃO",
  "SGI": "SGI",
  "COMERCIAL": "COMERCIAL",
  "GERENTESDECONTRATOS": "GERENTES DE CONTRATOS",
  "DIRETORIA": "DIRETORIA"
};

// 🔹 Departamentos que devem ser avaliados
const DEPARTAMENTOS_AVALIAVEIS = [
  "CEO",
  "CFO Diretoria Financeira",
  "ADM FACILITIES SUPRIMENTOS",
  "PLANEJAMENTO",
  "RH",
  "FINANCEIRO",
  "SST",
  "COMUNICAÇÃO",
  "SGI"
];

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script carregado");

  const qs = new URLSearchParams(window.location.search);
  const token = qs.get("token")?.trim().toUpperCase().replace(/[()|]/g, "").replace(/\s+/g, "") || "";
  console.log("🔑 Token recebido:", token);

  const nomeDepartamentoUsuario = TOKEN_MAP[token];
  if (!nomeDepartamentoUsuario) {
    alert("Token inválido. Verifique o link de acesso.");
    return;
  }

  const form = document.getElementById("nps-form");
  const statusBox = document.getElementById("status");
  const container = document.getElementById("perguntas-container");

  // Preenche o campo oculto com o token
  document.getElementById("token").value = token;

  // Filtra departamentos para avaliação (exclui o próprio)
  const outrosDepartamentos = DEPARTAMENTOS_AVALIAVEIS.filter(dep => dep !== nomeDepartamentoUsuario);
  console.log("📋 Departamentos a avaliar:", outrosDepartamentos);

  // Gera perguntas dinamicamente
  outrosDepartamentos.forEach(dep => {
    const depId = dep.replace(/\s+/g, "_").replace(/[|/]/g, "_").toUpperCase();

    const section = document.createElement("section");
    section.innerHTML = `
      <h2 style="font-size: 1.5rem; color: #050505ff; margin-bottom: 1rem;">${dep}</h2>

      <label style="font-weight: 600;">
        1. Em uma escala de 0 a 10, qual seu nível de satisfação com o <strong>${dep}</strong>?
      </label>
      <div class="nps-scale" style="display: flex; flex-wrap: wrap; justify-content: space-between; margin: 1rem 0;">
        ${Array.from({ length: 11 }, (_, i) => `
          <label style="flex: 1 0 8%; text-align: center; font-size: 0.9rem;">
            ${i}<br>
            <input type="radio" name="nps_${depId}" value="${i}" ${i === 0 ? 'required' : ''}>
          </label>
        `).join("")}
      </div>

      <label for="comentario_${depId}" style="font-weight: 600;">
        2. Espaço para deixar elogios, sugestões e críticas sobre <strong>${dep}</strong>:
      </label>
      <textarea
        id="comentario_${depId}"
        name="comentario_${depId}"
        placeholder="Queremos te ouvir..."
        style="width: 100%; min-height: 120px; resize: vertical; box-sizing: border-box; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 1rem; margin-top: 0.5rem;"
      ></textarea>
    `;
    container.appendChild(section);
  });

  // Submissão do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBox.textContent = "Enviando...";
    statusBox.className = "";

    const fd = new FormData(form);
    const body = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      body.append(k, v);
    }

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });

      const data = await res.json();
      console.log("📨 Resposta do servidor:", data);

      if (data.ok) {
        window.location.href = "agradecimento.html";
      } else {
        statusBox.textContent = "⚠️ Erro: " + (data.error || "Falha desconhecida");
        statusBox.className = "error";
      }
    } catch (err) {
      console.error("❌ Erro ao enviar:", err);
      statusBox.textContent = "❌ Erro ao enviar: " + err.message;
      statusBox.className = "error";
    }
  });
});


