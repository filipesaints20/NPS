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
    Logger.log("Token recebido: " + token);

    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    const deptOrigem = GROUPS[token];
    Logger.log("Departamento de origem identificado: " + deptOrigem);

    if (!deptOrigem) {
      Logger.log("Token inválido: " + token);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: "Token inválido" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const dados = sh.getDataRange().getValues();
    const jaRespondido = dados.some(row => row[2] === token);
    Logger.log("Token já utilizado? " + jaRespondido);

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

        Logger.log("Registrando resposta para: " + nomeDepartamento);
        Logger.log("Nota: " + nps + " | Comentário: " + comentario);

        if (nomeDepartamento === token) {
          Logger.log("Ignorando departamento de origem: " + nomeDepartamento);
          continue;
        }

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

    Logger.log("Departamentos registrados: " + respostasRegistradas.join(", "));

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Respostas registradas com sucesso.",
        departamentos: respostasRegistradas
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    Logger.log("Erro no doPost: " + msg);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: msg }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
