const GROUPS = {
  "CEO": "Ceo",
  "CFO": "CFO (Diretor Financeiro)",
  "ADM | SUPRIMENTOS | FACILITIES": "ADM | Suprimentos | Facilities",
  "PLANEJAMENTO": "Planejamento",
  "RH": "Recursos Humanos",
  "FINANCEIRO": "Financeiro",
  "DEPARTAMENTO DE QUALIDADE": "Departamento de Qualidade",
  "ENGENHARIA": "Engenharia",
  "SST": "Saúde e Segurança do Trabalho",
  "COMUNICAÇÃO": "Comunicação"
};

const SHEET_NAME = "Respostas";

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  const headers = ["Timestamp", "Departamento", "Token", "NPS", "Comentário"];
  const range = sh.getRange(1, 1, 1, headers.length);
  const values = range.getValues()[0];
  if (values.filter(String).length === 0) {
    range.setValues([headers]);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("OK: webapp rodando")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const params = e.parameter || {};
    const token = (params.token || "").trim().toUpperCase();
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    const deptOrigem = GROUPS[token];
    if (!deptOrigem) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Token inválido" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const dados = sh.getDataRange().getValues();
    const jaRespondido = dados.some(row => row[2] === token);
    if (jaRespondido) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Este token já foi utilizado." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const respostasRegistradas = [];
    for (const key in params) {
      if (key.startsWith("nps_")) {
        const depKey = key.replace("nps_", "");
        const comentarioKey = "comentario_" + depKey;
        const nps = params[key].trim();
        const comentario = (params[comentarioKey] || "").trim();
        const nomeDepartamento = depKey.replace(/_/g, " ").toUpperCase();

        if (nomeDepartamento === token) continue;

        sh.appendRow([
          new Date(),
          nomeDepartamento,
          token,
          nps,
          comentario
        ]);

        respostasRegistradas.push(nomeDepartamento);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Respostas registradas com sucesso.",
        departamentos: respostasRegistradas
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: msg }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
