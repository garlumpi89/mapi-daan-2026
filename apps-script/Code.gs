const RSVP_SHEET_NAME = 'RSVP';
const DETAILS_SHEET_NAME = 'Detalles_invitados';
const DASHBOARD_SHEET_NAME = 'Resumen';
const SONGS_SHEET_NAME = 'Canciones';
const MESSAGES_SHEET_NAME = 'Mensajes';

const RSVP_HEADERS = [
  'Fecha y hora',
  'Idioma',
  'Asistencia',
  'Nombre de contacto',
  'Teléfono',
  'Número de asistentes',
  'Nombres de asistentes',
  'Preboda',
  'Autobús',
  'Detalles de invitados',
  'Canción',
  'Notas',
  'Mensaje',
  'Origen'
];

const DETAILS_HEADERS = [
  'Fecha y hora',
  'Nombre de contacto',
  'Teléfono',
  'Nombre invitado',
  'Menú especial',
  'Alergias / intolerancias'
];

const SONGS_HEADERS = [
  'Fecha y hora',
  'Nombre de contacto',
  'Canción'
];

const MESSAGES_HEADERS = [
  'Fecha y hora',
  'Nombre de contacto',
  'Mensaje'
];

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resumenSheet = getSheet_(ss, DASHBOARD_SHEET_NAME, []);
  const rsvpSheet = getSheet_(ss, RSVP_SHEET_NAME, RSVP_HEADERS);
  const detailsSheet = getSheet_(ss, DETAILS_SHEET_NAME, DETAILS_HEADERS);
  const songsSheet = getSheet_(ss, SONGS_SHEET_NAME, SONGS_HEADERS);
  const messagesSheet = getSheet_(ss, MESSAGES_SHEET_NAME, MESSAGES_HEADERS);

  setupDashboard_(resumenSheet);
  ss.setActiveSheet(resumenSheet);
  ss.moveActiveSheet(1);

  const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  const timestamp = new Date();

  const idioma = normalizeLanguage_(data.language);
  const asistencia = normalizeYesNo_(data.attendance);
  const preboda = normalizeYesNo_(data.prewedding);
  const autobus = normalizeYesNo_(data.bus);
  const guestNames = Array.isArray(data.guestNames) ? data.guestNames : [];
  const guestDetails = Array.isArray(data.guestDetails) ? data.guestDetails : [];

  const normalizedGuestDetails = guestDetails.map(function (g) {
    return {
      name: g.name || '',
      menu: normalizeMenu_(g.menu),
      allergies: g.allergies || ''
    };
  });

  rsvpSheet.appendRow([
    timestamp,
    idioma,
    asistencia,
    data.contactName || '',
    data.phone || '',
    data.guestCount || '',
    guestNames.join('\n'),
    preboda,
    autobus,
    normalizedGuestDetails.map(function (g) {
      return `${g.name || ''} | menú: ${g.menu || ''} | alergias: ${g.allergies || ''}`;
    }).join('\n'),
    data.song || '',
    data.notes || '',
    data.message || '',
    data.source || ''
  ]);

  if (asistencia !== 'No') {
    normalizedGuestDetails.forEach(function (g) {
      if (g.name || g.menu || g.allergies) {
        detailsSheet.appendRow([
          timestamp,
          data.contactName || '',
          data.phone || '',
          g.name || '',
          g.menu || '',
          g.allergies || ''
        ]);
      }
    });
  }

  if (data.song) {
    songsSheet.appendRow([timestamp, data.contactName || '', data.song || '']);
  }

  if (data.message) {
    messagesSheet.appendRow([timestamp, data.contactName || '', data.message || '']);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeLanguage_(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'en' || v === 'english' || v === 'inglés' || v === 'ingles') return 'Inglés';
  if (v === 'nl' || v === 'nederlands' || v === 'dutch' || v === 'neerlandés' || v === 'neerlandes' || v === 'holandés' || v === 'holandes') return 'Neerlandés';
  return 'Español';
}

function normalizeYesNo_(value) {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'yes' || v === 'ja' || v === 'sí' || v === 'si') return 'Sí';
  if (v === 'no' || v === 'nee') return 'No';
  return '';
}

function normalizeMenu_(value) {
  const v = String(value || '').trim().toLowerCase();
  if (!v || v === 'none' || v === 'geen' || v === 'ninguno') return 'Ninguno';
  if (v === 'vegetarian' || v === 'vegetarisch' || v === 'vegetariano') return 'Vegetariano';
  if (v === 'vegan' || v === 'vegano') return 'Vegano';
  if (v === 'gluten-free' || v === 'gluten_free' || v === 'glutenvrij' || v === 'sin gluten') return 'Sin gluten';
  if (v === 'menú infantil' || v === 'infantil' || v === 'infantil' || v === 'child' || v === 'children' || v === 'kids' || v === 'kindermenu') return 'Infantil';
  if (v === 'other' || v === 'anders' || v === 'otro') return 'Otro';
  return value || '';
}

function getSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (headers.length && sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function setupDashboard_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.getRange('A1:B1').setValues([['Métrica', 'Valor']]).setFontWeight('bold');
  sheet.getRange('A2:A10').setValues([
    ['Asistentes boda'],
    ['Asistentes preboda'],
    ['Necesitan autobús'],
    ['Vegetarianos'],
    ['Veganos'],
    ['Sin gluten'],
    ['Infantil'],
    ['Otros menús especiales'],
    ['Personas con alergias/intolerancias']
  ]);

  sheet.getRange('B2').setFormula(`=SUMIF('${RSVP_SHEET_NAME}'!C:C;"Sí";'${RSVP_SHEET_NAME}'!F:F)`);
  sheet.getRange('B3').setFormula(`=SUMIF('${RSVP_SHEET_NAME}'!H:H;"Sí";'${RSVP_SHEET_NAME}'!F:F)`);
  sheet.getRange('B4').setFormula(`=SUMIF('${RSVP_SHEET_NAME}'!I:I;"Sí";'${RSVP_SHEET_NAME}'!F:F)`);
  sheet.getRange('B5').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!E:E;"Vegetariano")`);
  sheet.getRange('B6').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!E:E;"Vegano")`);
  sheet.getRange('B7').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!E:E;"Sin gluten")`);
  sheet.getRange('B8').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!E:E;"Infantil")`);
  sheet.getRange('B9').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!E:E;"Otro")`);
  sheet.getRange('B10').setFormula(`=COUNTIF('${DETAILS_SHEET_NAME}'!F:F;"<>")-1`);

  sheet.getRange('D1:E1').setValues([['Menús especiales', '']]).setFontWeight('bold');
  sheet.getRange('D2:E2').setValues([['Invitado', 'Menú']]).setFontWeight('bold');
  sheet.getRange('D3').setFormula(`=IFERROR(FILTER({'${DETAILS_SHEET_NAME}'!D2:D\\'${DETAILS_SHEET_NAME}'!E2:E};('${DETAILS_SHEET_NAME}'!E2:E<>"")*('${DETAILS_SHEET_NAME}'!E2:E<>"Ninguno"));"")`);

  sheet.getRange('G1:H1').setValues([['Alergias / intolerancias', '']]).setFontWeight('bold');
  sheet.getRange('G2:H2').setValues([['Invitado', 'Observación']]).setFontWeight('bold');
  sheet.getRange('G3').setFormula(`=IFERROR(FILTER({'${DETAILS_SHEET_NAME}'!D2:D\\'${DETAILS_SHEET_NAME}'!F2:F};'${DETAILS_SHEET_NAME}'!F2:F<>"");"")`);

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 8);
}
