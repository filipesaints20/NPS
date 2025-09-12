const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyq8dFmy4mvz-hebVbUezGVA4I5uh4MK6Ejk7J-REV1fz3WBnvVM1d2OgIB_yhLcVErXQ/exec";

const DEPARTAMENTOS = [
  "CEO", "CFO", "ADM", "PLANEJAMENTO", "RH", "FINANCEIRO",
  "ENGENHARIA", "SST", "COMUNICAÇÃO", "SGI", "PLANEJAMENTOS"
];

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script carregado");

  const qs = new URLSearchParams(window.location.search);
  const token = qs.get("token")?.trim().toUpperCase() || "";
  console.log("🔑 Token recebido:", token);

  const form = document.getElementById("nps-form");
  const statusBox = document.getElementById("status");

  if (!DEPARTAMENTOS.includes(token)) {
    statusBox.textContent = "⚠️ Token inválido ou ausente. Verifique o link.";
    statusBox.className = "error";
    form.style.display = "none";
    return;
  }

  document.getElementById("token").value = token;

  const container = document.getElementById("perguntas-container");
  const outrosDepartamentos = DEPARTAMENTOS.filter(dep => dep !== token);
  console.log("📋 Departamentos a avaliar:", outrosDepartamentos);

  // ...continua normalmente

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
      console.log("📨 Resposta do servidor:", data);

      if (data.ok) {
        window.location.href = "agradecimento.html";
      } else {
        statusBox.textContent = "⚠️ Erro: " + (data.error || "Falha desconhecida");
        statusBox.className = "error";

        if (data.error === "Este token já foi utilizado.") {
          form.style.display = "none";
        }
      }
    } catch (err) {
      console.error("❌ Erro ao enviar:", err);
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        statusBox.textContent = "❌ Não foi possível conectar ao servidor. Verifique se o Web App está publicado corretamente.";
      } else {
        statusBox.textContent = "❌ Erro ao enviar: " + err.message;
      }
      statusBox.className = "error";
    }
  });
});
