/*
 * script.js – Logik für die professionelle Gutachten‑App
 *
 * Diese Datei implementiert die Datenerfassung, die Berechnungen nach
 * Sachwert‑, Ertrags‑ und Vergleichswertverfahren (in vereinfachter
 * Form) sowie den Import/Export der Daten. Die NHK‑Werte und
 * Gesamtnutzungsdauern stammen aus der SW‑RL
 * (Anlagen 1 und 3)【431491009068357†L2864-L2874】【431491009068357†L730-L743】. Der
 * Modernisierungsgrad wird über eine Punktetabelle ermittelt【431491009068357†L2907-L2933】.
 */

(() => {
  // Aktuelles Jahr (für Altersberechnung)
  const CURRENT_YEAR = new Date().getFullYear();

  /**
   * Datenbasis für NHK 2010 je Gebäudeart und Standardstufe (Euro/m² BGF).
   * Es werden typische Werte aus Anlage 1 der SW‑RL verwendet. Die
   * Gesamtnutzungsdauer (gnd) orientiert sich an Anlage 3【431491009068357†L2864-L2874】.
   */
  const NHK_DATA = {
    single: {
      label: 'Freistehendes Einfamilienhaus',
      nhk: [655, 725, 835, 1005, 1260], // Standardstufe 1–5, Variante 1.11
      gnd: [60, 65, 70, 75, 80],
    },
    double: {
      label: 'Doppelhaus / Reihenendhaus',
      nhk: [615, 685, 785, 945, 1180],
      gnd: [60, 65, 70, 75, 80],
    },
    row: {
      label: 'Reihenmittelhaus',
      nhk: [575, 640, 735, 885, 1105],
      gnd: [60, 65, 70, 75, 80],
    },
    multi_small: {
      label: 'Mehrfamilienhaus (bis 6 WE)',
      nhk: [null, null, 825, 985, 1190], // Stufe 3–5
      gnd: 70,
    },
    multi_medium: {
      label: 'Mehrfamilienhaus (7–20 WE)',
      nhk: [null, null, 765, 915, 1105],
      gnd: 70,
    },
    multi_large: {
      label: 'Mehrfamilienhaus (>20 WE)',
      nhk: [null, null, 755, 900, 1090],
      gnd: 70,
    },
  };

  /**
   * Kategorisierung des Modernisierungsgrads entsprechend Anlage 4【431491009068357†L2925-L2933】.
   */
  function getModernisationCategory(points) {
    if (points <= 1) return { grade: 'nicht modernisiert', factor: 0 };
    if (points <= 4) return { grade: 'kleine Modernisierungen', factor: 0.1 };
    if (points <= 8) return { grade: 'mittlerer Modernisierungsgrad', factor: 0.2 };
    if (points <= 13) return { grade: 'überwiegend modernisiert', factor: 0.3 };
    return { grade: 'umfassend modernisiert', factor: 0.4 };
  }

  // DOM‑Elemente
  const form = document.getElementById('gutachtenForm');
  const buildingTypeEl = document.getElementById('buildingType');
  const standardLevelEl = document.getElementById('standardLevel');
  const constructionYearEl = document.getElementById('constructionYear');
  const gndEl = document.getElementById('gnd');
  const modCheckboxes = Array.from(document.querySelectorAll('.mod-item'));
  const modPointsDisplay = document.getElementById('modPointsDisplay');
  const rentTableBody = document.querySelector('#rentTable tbody');
  const compTableBody = document.querySelector('#compTable tbody');
  const addRentBtn = document.getElementById('addRent');
  const addCompBtn = document.getElementById('addComp');
  const calculateBtn = document.getElementById('calculateBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFileEl = document.getElementById('importFile');
  const resultsEl = document.getElementById('results');
  const attachmentsInput = document.getElementById('attachments');

  let attachmentsFiles = [];
  let currentData = null; // wird nach Berechnung/Import gefüllt

  /**
   * Aktualisiert den GND‑Input entsprechend Gebäudeart und Standardstufe.
   */
  function updateGnd() {
    const type = buildingTypeEl.value;
    const level = parseInt(standardLevelEl.value, 10) - 1; // 0‑basiert
    const entry = NHK_DATA[type];
    let value;
    if (Array.isArray(entry.gnd)) {
      value = entry.gnd[level] || entry.gnd[entry.gnd.length - 1];
    } else {
      value = entry.gnd;
    }
    gndEl.value = value;
  }

  /**
   * Berechnet die Summe der Modernisierungspunkte und aktualisiert die Anzeige.
   */
  function updateModernisationPoints() {
    let sum = 0;
    modCheckboxes.forEach(cb => {
      if (cb.checked) sum += parseInt(cb.dataset.points, 10);
    });
    const cat = getModernisationCategory(sum);
    modPointsDisplay.textContent = `Modernisierungspunkte: ${sum} (${cat.grade})`;
  }

  /**
   * Fügt eine neue Zeile für eine Mieteinheit hinzu.
   */
  function addRentRow(area = '', rent = '') {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="number" min="0" step="0.1" value="${area}" placeholder="Fläche"></td>` +
                   `<td><input type="number" min="0" step="0.01" value="${rent}" placeholder="Miete"></td>` +
                   `<td><button type="button" class="delRow">✕</button></td>`;
    tr.querySelector('.delRow').addEventListener('click', () => tr.remove());
    rentTableBody.appendChild(tr);
  }

  /**
   * Fügt eine neue Zeile für einen Vergleichswert hinzu.
   */
  function addCompRow(price = '', weight = '') {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="number" min="0" step="0.01" value="${price}" placeholder="Preis"></td>` +
                   `<td><input type="number" min="0" max="100" step="0.1" value="${weight}" placeholder="Gewicht"></td>` +
                   `<td><button type="button" class="delRow">✕</button></td>`;
    tr.querySelector('.delRow').addEventListener('click', () => tr.remove());
    compTableBody.appendChild(tr);
  }

  /**
   * Sammelt die Daten aus dem Formular und berechnet die Werte.
   */
  function performCalculation() {
    // Basisdaten
    const onr = document.getElementById('onr').value.trim();
    const buildingType = buildingTypeEl.value;
    const standardLevel = parseInt(standardLevelEl.value, 10);
    const baujahr = parseInt(constructionYearEl.value, 10);
    const gnd = parseFloat(gndEl.value);
    const bgf = parseFloat(document.getElementById('bgf').value);
    const landArea = parseFloat(document.getElementById('landArea').value);
    const nutzung = document.getElementById('nutzung').value.trim();
    const lage = document.getElementById('lage').value.trim();
    const rechte = document.getElementById('rechte').value.trim();
    const besonderheiten = document.getElementById('besonderheiten').value.trim();
    // Datenquellen
    const brwZone = document.getElementById('brwZone').value.trim();
    const brwValue = parseFloat(document.getElementById('brwValue').value);
    const lz = parseFloat(document.getElementById('lz').value || '0');
    const bpi = parseFloat(document.getElementById('bpi').value);
    const regionalFactor = parseFloat(document.getElementById('regionalFactor').value);
    const marketFactor = parseFloat(document.getElementById('marketFactor').value);
    // Mieteinheiten
    const maintCostPercent = parseFloat(document.getElementById('maintCostPercent').value);
    const rents = [];
    rentTableBody.querySelectorAll('tr').forEach(row => {
      const areaInput = row.querySelector('td:nth-child(1) input');
      const rentInput = row.querySelector('td:nth-child(2) input');
      const area = parseFloat(areaInput.value || '0');
      const rentPer = parseFloat(rentInput.value || '0');
      if (!isNaN(area) && !isNaN(rentPer) && area > 0) {
        rents.push({ area, rentPer });
      }
    });
    // Vergleichswerte
    const comps = [];
    compTableBody.querySelectorAll('tr').forEach(row => {
      const priceInput = row.querySelector('td:nth-child(1) input');
      const weightInput = row.querySelector('td:nth-child(2) input');
      const price = parseFloat(priceInput.value || '0');
      const weight = parseFloat(weightInput.value || '0');
      if (!isNaN(price) && price > 0) {
        comps.push({ price, weight: weight || 0 });
      }
    });
    // Freitexte
    const ertragsText = document.getElementById('ertragsText').value.trim();
    const vergleichText = document.getElementById('vergleichText').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const sachwertText = document.getElementById('sachwertText').value.trim();
    // Modernisierungspunkte
    let modPoints = 0;
    modCheckboxes.forEach(cb => {
      if (cb.checked) modPoints += parseInt(cb.dataset.points, 10);
    });
    const modCat = getModernisationCategory(modPoints);
    // Altersberechnung
    const age = Math.max(0, CURRENT_YEAR - baujahr);
    const restNutzungsdauer = Math.max(0, gnd - age);
    const ageFactor = restNutzungsdauer / gnd; // Anteil verbleibender Nutzungsdauer
    // NHK Basiswert (Euro/m²)
    const nhkEntry = NHK_DATA[buildingType];
    const nhkBase = nhkEntry.nhk[standardLevel - 1] || nhkEntry.nhk.filter(n => n).slice(-1)[0] || 0;
    // Wenn NHK nicht vorhanden (bei Stufe 1–2 für MFH), Standard 3 verwenden
    const nhkVal = nhkBase || nhkEntry.nhk[2] || 0;
    // Aktuell angepasster NHK: NHK 2010 × (Baupreisindex / 100) × Regionalfaktor
    const nhkCurrent = nhkVal * (bpi / 100) * regionalFactor;
    // Gebäudewert vor Marktanpassung: NHK_current × BGF × Altersfaktor × (1 + Modernisierungsfaktor)
    const buildingValue = nhkCurrent * bgf * ageFactor * (1 + modCat.factor);
    // Bodenwert: Bodenrichtwert × Fläche
    const landValue = brwValue * landArea;
    // Vorläufiger Sachwert (ohne Marktanpassung)
    const sachwertVor = buildingValue + landValue;
    // Marktanpassung
    const sachwert = sachwertVor * marketFactor;
    // Ertragswertverfahren
    let ertragswert = 0;
    if (rents.length > 0 && lz > 0) {
      let rohertrag = 0;
      rents.forEach(({ area, rentPer }) => {
        rohertrag += area * rentPer * 12;
      });
      const bewirtschaftungskosten = rohertrag * (maintCostPercent / 100);
      const reinertrag = rohertrag - bewirtschaftungskosten;
      // Landwertanteil aus dem Ertragswert abziehen (Liegenschaftszinssatz * Bodenwert)
      const bodenErtrag = landValue * (lz / 100);
      const gebaeudeErtrag = Math.max(0, reinertrag - bodenErtrag);
      const gebaeudeWertErtrags = gebaeudeErtrag / (lz / 100);
      ertragswert = landValue + gebaeudeWertErtrags;
    }
    // Vergleichswertverfahren
    let vergleichswert = 0;
    if (comps.length > 0) {
      let sumWeight = 0;
      let sumPrice = 0;
      comps.forEach(({ price, weight }) => {
        const w = weight > 0 ? weight : 1;
        sumWeight += w;
        sumPrice += price * w;
      });
      vergleichswert = sumPrice / sumWeight;
    }
    // Plausible Bandbreite und finaler Wert
    const values = [];
    if (sachwert > 0) values.push(sachwert);
    if (ertragswert > 0) values.push(ertragswert);
    if (vergleichswert > 0) values.push(vergleichswert);
    let minVal = 0;
    let maxVal = 0;
    let avgVal = 0;
    if (values.length > 0) {
      minVal = Math.min(...values);
      maxVal = Math.max(...values);
      avgVal = values.reduce((a, b) => a + b, 0) / values.length;
    }
    // manueller Wert
    const manualValInput = document.getElementById('manualValue').value;
    const manualVal = manualValInput ? parseFloat(manualValInput) : null;
    const finalVal = manualVal || avgVal || 0;
    // Data für Export
    currentData = {
      onr,
      stichtage: {
        wertermittlung: new Date().toISOString().split('T')[0],
        daten: new Date().toISOString().split('T')[0],
        foto: new Date().toISOString().split('T')[0],
      },
      objekt: {
        gemeinde: '',
        lage_beschreibung: lage,
        nutzung,
        bgf,
        grundstueck: {
          flaeche: landArea,
          brw_zone: brwZone,
        },
        rechte_lasten: rechte,
        besonderheiten,
        gebaeudeart: NHK_DATA[buildingType].label,
        standardstufe: standardLevel,
        baujahr,
        gnd,
        age,
        restnutzungsdauer: restNutzungsdauer,
        modernisierungspunkte: modPoints,
        modernisierungsgrad: modCat.grade,
      },
      datenquellen: {
        brw: { wert: brwValue, stichtag: '', quelle: '', paragraf: '§ 196 BauGB; ImmoWertV' },
        lz: { wert: lz, quelle: '', paragraf: 'ImmoWertV' },
        bpi: { wert: bpi, quelle: '', paragraf: 'Destatis' },
        regionalFactor: regionalFactor,
        marketFactor: marketFactor,
        nhkBase: nhkVal,
      },
      verfahren: {
        sachwert: {
          nhk: nhkVal,
          nhkCurrent,
          ageFactor,
          modernisierungsFaktor: modCat.factor,
          vorlaeufig: sachwertVor,
          resultat: sachwert,
          text: sachwertText,
        },
        ertragswert: {
          rohertrag: rents.reduce((sum, { area, rentPer }) => sum + area * rentPer * 12, 0),
          bewirtschaftungskosten: rents.reduce((sum, { area, rentPer }) => sum + area * rentPer * 12, 0) * (maintCostPercent / 100),
          reinertrag: 0, // Berechnung unten
          resultat: ertragswert,
          text: ertragsText,
        },
        vergleichswert: {
          vergleichswerte: comps,
          resultat: vergleichswert,
          text: vergleichText,
        },
      },
      plausi: {
        bandbreite: { min: minVal, max: maxVal },
        final: finalVal,
        wahlBegruendung: notes,
      },
    };
    // reinertrag nachträglich setzen (Rohertrag minus Bewirtschaftungskosten)
    currentData.verfahren.ertragswert.reinertrag = currentData.verfahren.ertragswert.rohertrag - currentData.verfahren.ertragswert.bewirtschaftungskosten;
    // Anzeige
    resultsEl.textContent =
      `Sachwert: ${sachwert.toFixed(2)} €\n` +
      `Ertragswert: ${ertragswert.toFixed(2)} €\n` +
      `Vergleichswert: ${vergleichswert.toFixed(2)} €\n` +
      `Bandbreite: ${minVal.toFixed(2)} € – ${maxVal.toFixed(2)} €\n` +
      `Finaler Verkehrswert: ${finalVal.toFixed(2)} €`;
  }

  /**
   * Erstellt eine ZIP‑Datei mit JSON, Meta und DOCX.
   */
  async function performExport() {
    if (!currentData) {
      alert('Bitte zuerst die Berechnung durchführen.');
      return;
    }
    const zip = new JSZip();
    // gutachten.json
    const jsonStr = JSON.stringify(currentData, null, 2);
    zip.file('gutachten.json', jsonStr);
    // meta.json (einfacher Hash: Länge + Timestamp)
    const meta = {
      version: '1.0',
      hash: jsonStr.length.toString(16),
      timestamp: new Date().toISOString(),
    };
    zip.file('meta.json', JSON.stringify(meta, null, 2));
    // Dokument erzeugen
    const docBlob = await window.generateDocx(currentData);
    zip.file('Gutachten.docx', docBlob);
    // attachments
    const attFolder = zip.folder('attachments');
    for (const file of attachmentsFiles) {
      const arrayBuffer = await file.arrayBuffer();
      attFolder.file(file.name, arrayBuffer);
    }
    // ZIP generieren
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `${currentData.onr || 'gutachten'}.ivg.zip`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Importiert Daten aus einer ZIP‑Datei und befüllt das Formular.
   */
  async function performImport(file) {
    try {
      const zip = await JSZip.loadAsync(file);
      const jsonData = await zip.file('gutachten.json').async('string');
      const data = JSON.parse(jsonData);
      // Befülle Formularfelder; einige Felder werden ggf. überschrieben
      document.getElementById('onr').value = data.onr || '';
      // Objekt
      buildingTypeEl.value = Object.keys(NHK_DATA).find(k => NHK_DATA[k].label === data.objekt.gebaeudeart) || 'single';
      standardLevelEl.value = data.objekt.standardstufe || '3';
      constructionYearEl.value = data.objekt.baujahr || '';
      gndEl.value = data.objekt.gnd || '';
      document.getElementById('bgf').value = data.objekt.bgf || '';
      document.getElementById('landArea').value = data.objekt.grundstueck.flaeche || '';
      document.getElementById('nutzung').value = data.objekt.nutzung || '';
      document.getElementById('lage').value = data.objekt.lage_beschreibung || '';
      document.getElementById('rechte').value = data.objekt.rechte_lasten || '';
      document.getElementById('besonderheiten').value = data.objekt.besonderheiten || '';
      // Datenquellen
      document.getElementById('brwZone').value = data.objekt.grundstueck.brw_zone || '';
      document.getElementById('brwValue').value = data.datenquellen.brw.wert || '';
      document.getElementById('lz').value = data.datenquellen.lz.wert || '';
      document.getElementById('bpi').value = data.datenquellen.bpi.wert || '';
      document.getElementById('regionalFactor').value = data.datenquellen.regionalFactor || 1;
      document.getElementById('marketFactor').value = data.datenquellen.marketFactor || 1;
      // Modernisierung – setze Checkboxen nach Punkten (heuristisch)
      modCheckboxes.forEach(cb => (cb.checked = false));
      // Wir setzen keine automatische Zuordnung, da Punkte nicht eindeutig
      updateModernisationPoints();
      // Mieteinheiten
      rentTableBody.innerHTML = '';
      if (data.verfahren && data.verfahren.ertragswert && data.verfahren.ertragswert.rohertrag > 0) {
        // Es wurden keine einzelnen Einheiten exportiert; wir lassen leer
      }
      // Vergleichswerte
      compTableBody.innerHTML = '';
      if (data.verfahren && data.verfahren.vergleichswert && Array.isArray(data.verfahren.vergleichswert.vergleichswerte)) {
        data.verfahren.vergleichswert.vergleichswerte.forEach(({ price, weight }) => {
          addCompRow(price || '', weight || '');
        });
      }
      // Freitexte
      document.getElementById('ertragsText').value = data.verfahren.ertragswert.text || '';
      document.getElementById('vergleichText').value = data.verfahren.vergleichswert.text || '';
      document.getElementById('sachwertText').value = data.verfahren.sachwert.text || '';
      document.getElementById('notes').value = data.plausi.wahlBegruendung || '';
      document.getElementById('manualValue').value = data.plausi.final || '';
      // Keine Anhänge importieren (Browser‑Sicherheitsbeschränkung)
      currentData = data;
      updateGnd();
      performCalculation();
    } catch (err) {
      console.error(err);
      alert('Import fehlgeschlagen: ' + err.message);
    }
  }

  // Ereignisse
  buildingTypeEl.addEventListener('change', updateGnd);
  standardLevelEl.addEventListener('change', updateGnd);
  modCheckboxes.forEach(cb => cb.addEventListener('change', updateModernisationPoints));
  addRentBtn.addEventListener('click', () => addRentRow());
  addCompBtn.addEventListener('click', () => addCompRow());
  calculateBtn.addEventListener('click', () => {
    performCalculation();
  });
  exportBtn.addEventListener('click', () => {
    performExport();
  });
  importFileEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) performImport(file);
  });
  attachmentsInput.addEventListener('change', (e) => {
    attachmentsFiles = Array.from(e.target.files || []);
  });
  // Initiale Einstellungen
  updateGnd();
  updateModernisationPoints();
})();