/**
 * Camp registration endpoint.
 * Receives a JSON body (sent as text/plain) from the landing page form,
 * optionally saves an uploaded birth-certificate file to a private Drive
 * folder, and appends a row to the bound Google Sheet.
 *
 * Deploy: Extensions ▸ Apps Script from a Google Sheet, paste this, then
 * Deploy ▸ New deployment ▸ Web app ▸ Execute as: Me ▸ Who has access: Anyone.
 * Copy the Web App URL into js/main.js (REGISTRATION_ENDPOINT).
 */

// ЗАПОЛНИТЬ: ID приватной папки Google Drive для загруженных свидетельств.
// (Создайте папку, откройте её, скопируйте ID из URL после /folders/.)
var DRIVE_FOLDER_ID = 'PASTE_PRIVATE_DRIVE_FOLDER_ID';

var HEADERS = ['Ամսաթիվ', 'Երեխա', 'Տարիք', 'Սեռ', 'Ծնող', 'Հեռախոս',
               'Բնակավայր', 'Առողջություն', 'Մեկնաբանություն', 'Վկայական', 'Համաձայնություն'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    var fileLink = '';
    if (data.fileData && data.fileName) {
      var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      var blob = Utilities.newBlob(
        Utilities.base64Decode(data.fileData),
        data.fileMime || 'application/octet-stream',
        data.fileName
      );
      var file = folder.createFile(blob);
      fileLink = file.getUrl();
    }

    sheet.appendRow([
      new Date(),
      data.childName || '',
      data.age || '',
      data.gender || '',
      data.parentName || '',
      data.parentPhone || '',
      data.location || '',
      data.health || '',
      data.comment || '',
      fileLink,
      data.consent ? 'Այո' : 'Ոչ'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
