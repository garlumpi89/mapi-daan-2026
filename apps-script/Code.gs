// Google Apps Script for RSVP -> Google Sheets
// 1) Create a Google Sheet named e.g. "Mapi Daan RSVP".
// 2) Extensions > Apps Script, paste this file.
// 3) Set SHEET_NAME if needed.
// 4) Deploy > New deployment > Web app.
//    Execute as: Me. Who has access: Anyone.
// 5) Copy the Web App URL into config.js as googleScriptUrl.

const SHEET_NAME = 'RSVP';
const HEADERS = ['Timestamp','Language','Attendance','Contact name','Email','Phone','Guest count','Guest names','Pre-wedding','Bus','Guest details','Song','Notes','Message'];

function doPost(e) {
  const sheet = getSheet_();
  const data = JSON.parse(e.postData.contents || '{}');
  sheet.appendRow([
    new Date(),
    data.language || '',
    data.attendance || '',
    data.contactName || '',
    data.email || '',
    data.phone || '',
    data.guestCount || '',
    Array.isArray(data.guestNames) ? data.guestNames.join('\n') : '',
    data.prewedding || '',
    data.bus || '',
    Array.isArray(data.guestDetails) ? data.guestDetails.map(g => `${g.name || ''} | menu: ${g.menu || ''} | allergies: ${g.allergies || ''}`).join('\n') : '',
    data.song || '',
    data.notes || '',
    data.message || ''
  ]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}
