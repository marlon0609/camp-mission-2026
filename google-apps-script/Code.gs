/**
 * Camp Mission 2026 — Dangbessito
 * Google Apps Script — Réception des inscriptions → Google Sheets
 *
 * DÉPLOIEMENT :
 *  1. Ouvre Google Sheets > Extensions > Apps Script
 *  2. Remplace tout le contenu par ce fichier
 *  3. Déployer > Nouveau déploiement > Type = Application Web
 *     - Exécuter en tant que : Moi
 *     - Qui a accès        : Tout le monde
 *  4. Copie l'URL générée et colle-la dans assets/js/main.js
 *     (variable SCRIPT_URL)
 */

const FEUILLE = 'Inscriptions';

const LEGION_MAP = {
  'aiglons-avettes':          'Légion des Aiglons · Avettes (3–5 ans)',
  'coeurs-or-souriantes':     'Légion des Cœurs d\'Or · Souriantes (6–9 ans)',
  'ardents-rayonnantes':      'Légion des Ardents · Rayonnantes (9–12 ans)',
  'entraineurs-conquerantes': 'Légion des Entraîneurs · Conquérantes (12–15 ans)'
};

/* ─── Réception du formulaire ─────────────────────────────────────────────── */
function doPost(e) {
  try {
    const d     = e.parameter;
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(FEUILLE);

    if (!sheet) {
      sheet = ss.insertSheet(FEUILLE);
      _initSheet(sheet);
    }

    const num = sheet.getLastRow(); // N° séquentiel (1 = première inscription)

    sheet.appendRow([
      num,
      Utilities.formatDate(new Date(), 'Africa/Lome', 'dd/MM/yyyy HH:mm'),
      (d.nom    || '').trim(),
      (d.prenom || '').trim(),
      d.ddn     || '',
      d.sexe === 'M' ? 'Masculin' : 'Féminin',
      d.paroisse || '',
      LEGION_MAP[d.legion] || d.legion || '',
      (d['tuteur-nom'] || '').trim(),
      (d['tuteur-tel'] || '').trim(),
      _swim(d.swim),
      (d.sante  || '').trim() || '—',
      d.consent1 === 'on' ? '✓' : '✗',
      d.consent2 === 'on' ? '✓' : '✗'
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, err: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ─── Test de disponibilité (GET) ─────────────────────────────────────────── */
function doGet() {
  return ContentService
    .createTextOutput('Camp Mission 2026 — API active ✓')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function _swim(val) {
  return val === 'oui' ? 'Oui' : val === 'non' ? 'Non' : 'Un peu';
}

function _initSheet(sheet) {
  const HEADERS = [
    'N°', 'Date inscription',
    'Nom', 'Prénom', 'Date naissance', 'Sexe',
    'Groupe de base', 'Légion',
    'Tuteur — Nom', 'Tuteur — Tél',
    'Sait nager ?', 'Infos médicales',
    'Consent. activités', 'Consent. photos'
  ];

  sheet.appendRow(HEADERS);

  const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
  hdr.setBackground('#0a0a0a')
     .setFontColor('#F5C800')
     .setFontWeight('bold')
     .setHorizontalAlignment('center')
     .setVerticalAlignment('middle')
     .setWrap(false);

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);

  // Largeurs de colonnes
  const widths = [36, 140, 110, 110, 110, 80, 120, 240, 160, 130, 90, 200, 120, 120];
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
}
