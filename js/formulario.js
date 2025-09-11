// Link do Google Apps Script codificado em Base64
const encodedURL = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6UGswNnowekY2UjRZN1BpdTE5UnNOMmJXczRRWnpUcWgzTkp4SVNzQlFRR3g1aEpCanRWanhuX0JxMUIzTnp4WXpKdw==";
const WEB_APP_URL = atob(encodedURL);

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(window.location.search);
  const token = qs.get("token")?.trim().toUpperCase() || "";
  document.getElementById("token").value = token;

  const form = document.getElementById("nps-form");
  const statusBox = document.getElementById("status");

  // Verifica se já respondeu
  const preenchido = localStorage.getItem("nps_" + token);
  if (preenchido) {
    form.style.display = "none";
    statusBox.textContent = "Você já respondeu esta pesquisa. Obrigado!";
    statusBox.className = "success";
    return;
  }

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
        form.style.display = "none";
        statusBox.textContent = "Obrigado pelo seu feedback!";
        statusBox.className = "success";
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
