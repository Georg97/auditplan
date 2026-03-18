# 12 - Word-Export

## Datenmodell

```typescript
// --- Gemeinsame Konfiguration ---

interface WordPageConfig {
	margins: {
		top: 2700; // twips
		right: 360; // twips
		bottom: 360; // twips
		left: 360; // twips
	};
	border: {
		style: 'single';
		color: '000000'; // Schwarz
		size: 24; // pt
	};
}

interface WordHeaderTable {
	titleRow: {
		col1Width: 70; // Prozent - Titel
		col2Width: 30; // Prozent - Logo (optional)
		title: string; // z.B. "Audit Notes / Auditnotizen"
		titleSize: 32; // pt, fett
		logo?: {
			data: string; // Base64
			width: 200; // px
			height: 60; // px
		};
	};
	dataRow1: {
		colWidths: [25, 28, 20, 27]; // Prozent
		fields: ['Firma', 'Standard', 'Zertifikat', 'Auditart'];
		bgColor: 'D3D3D3'; // Grau
		fontSize: 18; // pt
	};
	dataRow2: {
		colWidths: [25, 28, 20, 27]; // Prozent
		fields: ['Datum', 'Standort', 'Auditor', 'Seite'];
		pageNumber: true; // Dynamische Seitennummer
	};
}

// --- Auditplan Word (§17) ---

interface AuditplanWordData {
	// Kopfdaten
	firma: string;
	standard: string;
	zertifikat: string;
	auditart: string;
	datum: string;
	standort: string;
	auditor: string;
	logo?: string; // Base64

	// Auftraggeber
	auftraggeber: {
		name: string;
		anschrift: string; // Mehrzeilig
		disclaimer: string; // Standardtext
	};

	// Standorte
	standorte: StandortEntry[]; // Komplexe mehrzeilige Struktur

	// Audit-Bloecke
	blocks: AuditplanBlock[];
}

interface StandortEntry {
	name: string;
	adresse: string;
	details: string;
}

interface AuditplanBlock {
	// Info-Zeile (gelb, FFFF00)
	uhrzeit: string;
	abteilung: string;
	auditor: string;
	toggles: BlockToggles; // Deaktivierte Felder werden ausgelassen

	// Beschreibung (grau, D3D3D3)
	beschreibung: string;

	// Weisse Zeilen
	vorstellung: string;
	allgemein: string;
	notizen: string;

	// Graue Zeilen
	dokumente: string;
	zusammenfassung: string;
}

interface BlockToggles {
	vorstellung: boolean;
	allgemein: boolean;
	notizen: boolean;
	dokumente: boolean;
	zusammenfassung: boolean;
}

// --- Auditnotizen Word (§18) ---

interface AuditNotesWordData {
	// Kopfdaten (wie Auditplan)
	firma: string;
	standard: string;
	zertifikat: string;
	auditart: string;
	datum: string;
	standort: string;
	auditor: string;
	logo?: string;

	// Notiz-Bloecke
	blocks: AuditNoteBlock[];
}

interface AuditNoteBlock {
	// Info-Zeile (gelb, dynamisch aus Toggles)
	uhrzeit: string;
	abteilung: string;
	auditor: string;

	// Beschreibung (grau)
	beschreibung: string;

	// Weisse Zeilen
	vorstellung: string;
	allgemein: string;

	// Bedingte Sektionen
	notizen?: string;
	dokumente?: string;

	// QHSE-Dokumente: jedes als eigene Zeile "Name (Datum) - Notizen"
	qhseDocs?: QhseDocEntry[];

	// Bewertungen
	bewertungen?: BewertungEntry[];

	// Zusammenfassung (grau, fett, dynamischer Titel)
	zusammenfassung?: {
		abteilung: string; // Fuer Titel "Zusammenfassung [Abteilung]:"
		text: string;
	};
}

interface QhseDocEntry {
	name: string;
	datum: string;
	notizen: string;
}

interface BewertungEntry {
	typ: string; // Fett + gelb (FFFF00)
	kapitel: string; // In Klammern
	beschreibung: string;
}

// --- Notizen aus Bloecken Word (§19) ---

interface NotesFromBlocksData {
	// Gesammelt aus Auditplan-Generator-Feldern
	auftraggeber: string;
	standorte: string;
	geltungsbereich: string;
	auditart: string;
	isoStandards: string;
	zertifikatsnummer: string;
	auditor: string;

	// Bloecke (wie §18)
	blocks: AuditNoteBlock[];
}

// --- Auditfragen Word (§20) ---

interface AuditQuestionsWordData {
	abteilung: string;
	datum: string;
	questions: {
		nummer: number;
		frage: string;
		normRef: string;
	}[];
	documents: {
		name: string;
		beschreibung?: string;
	}[];
}

// Tabellen-Rahmen Konfiguration (§18)
interface TableBorderConfig {
	top: { style: 'single'; size: 1; color: '000000' };
	bottom: { style: 'single'; size: 1; color: '000000' };
	left: { style: 'single'; size: 1; color: '000000' };
	right: { style: 'single'; size: 1; color: '000000' };
	insideHorizontal: { style: 'single'; size: 1; color: '000000' };
	insideVertical: 'NONE'; // Keine inneren vertikalen Linien
}
```

## UI-Beschreibung

### Gemeinsamer Header (alle Word-Exporte ausser §20)

Der Word-Header wird in `Header.DEFAULT` der docx.js-Bibliothek platziert und besteht aus einer Tabelle:

**Titel-Zeile:**

- 2 Spalten (70% / 30%)
- Spalte 1: Dokumenttitel (z.B. "Audit Notes / Auditnotizen"), 32pt, fett
- Spalte 2: Optionales Logo, 200x60px (falls in Einstellungen hinterlegt)

**Daten-Zeile 1:**

- 4 Spalten (25% / 28% / 20% / 27%)
- Felder: Firma, Standard, Zertifikat, Auditart
- Hintergrund: Grau (`#D3D3D3`), Schriftgroesse: 18pt

**Daten-Zeile 2:**

- 4 Spalten (25% / 28% / 20% / 27%)
- Felder: Datum, Standort, Auditor, Seite (dynamische Seitennummer via `PageNumber`)

### Auditplan Word (§17)

**Datei:** `src/lib/export/auditplan-word.ts`
**Funktion:** `generateWordDocument(data: AuditplanWordData)`
**Umfang:** ca. 3400 Zeilen

**Auftraggeber-Sektion:**

- Tab-Stopp bei 3200 twips fuer Label/Wert-Ausrichtung
- Mehrzeilige Einrueckung fuer Adressen
- Disclaimer-Text am Ende

**Standorte-Sektion:**

- Komplexe mehrzeilige Struktur mit verschachtelten Informationen

**Audit-Bloecke:**
Jeder Block wird als 1-spaltige Tabelle dargestellt:

| Zeile           | Hintergrund     | Inhalt                                                                     |
| --------------- | --------------- | -------------------------------------------------------------------------- |
| Info-Zeile      | Gelb (`FFFF00`) | Uhrzeit, Abteilung, Auditor. Deaktivierte Toggle-Felder werden weggelassen |
| Beschreibung    | Grau (`D3D3D3`) | Abteilungsbeschreibung                                                     |
| Vorstellung     | Weiss           | Vorstellungstext                                                           |
| Allgemein       | Weiss           | Allgemeine Informationen                                                   |
| Notizen         | Weiss           | Notizfeld                                                                  |
| Dokumente       | Grau (`D3D3D3`) | Dokumentenliste                                                            |
| Zusammenfassung | Grau (`D3D3D3`) | Zusammenfassungstext                                                       |

### Auditnotizen Word (§18)

**Datei:** `src/lib/export/auditnotizen-word.ts`
**Funktion:** `generateNotesWordDocument(notesData: AuditNotesWordData)`
**Umfang:** ca. 540 Zeilen

**Pro Notiz-Block:**

| Sektion         | Details                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| Info-Zeile      | Gelb, dynamisch basierend auf aktiven Toggles                                            |
| Beschreibung    | Grau, Abteilungsbeschreibung                                                             |
| Vorstellung     | Weiss, Vorstellungstext                                                                  |
| Allgemein       | Weiss, allgemeine Informationen                                                          |
| Notizen         | Bedingt, nur wenn Toggle aktiv                                                           |
| Dokumente       | Bedingt, nur wenn Toggle aktiv                                                           |
| QHSE-Dokumente  | Jedes Dokument als eigene Zeile: "Name (Datum) - Notizen". Keine redundante Ueberschrift |
| Bewertungen     | Typ fett + gelb (`FFFF00`), Kapitel in Klammern, Beschreibung                            |
| Zusammenfassung | Grau, fett, Titel: "Zusammenfassung [Abteilung]:"                                        |

**Tabellen-Raender:**

- Oben/Unten/Links/Rechts: Einfach, 1pt, Schwarz
- Innen horizontal: Einfach, 1pt, Schwarz
- Innen vertikal: KEINE

### Notizen aus Bloecken Word (§19)

**Datei:** `src/lib/export/notizen-bloecke-word.ts`
**Funktion:** `generateNotesWordDocumentFromBlocks(data: NotesFromBlocksData)`

Identische Struktur wie §18, jedoch werden die Daten aus den Auditplan-Generator-Bloecken gesammelt:

- Auftraggeber, Standorte, Geltungsbereich, Auditart aus Plan-Feldern
- ISO-Standards, Zertifikatsnummer, Auditor aus Plan-Kopfdaten

**Dateiname:** `Auditnotizen_{timestamp}.docx`

### Auditfragen Word (§20)

**Datei:** `src/lib/export/auditfragen-word.ts`
**Funktion:** `generateAuditQuestionsWord()`

**Wichtig:** Verwendet NICHT docx.js, sondern den HTML-Blob-Ansatz fuer `.doc`-Format.

| Eigenschaft | Wert                                                    |
| ----------- | ------------------------------------------------------- |
| Format      | `.doc` (NICHT `.docx`)                                  |
| MIME-Typ    | `application/msword`                                    |
| Methode     | HTML-String wird als Blob mit Word-MIME-Typ gespeichert |

**Inhalt:**

- Abteilung und Datum als Kopfinformationen
- Nummerierte Fragenliste mit Norm-Referenzen
- Dokumentenliste

**Dateiname:** `Auditfragen_[Abteilung]_[Datum].doc`

## Interaktionen

### Auditplan Word generieren

1. Benutzer klickt "Word-Export" im Auditplan-Generator.
2. `generateWordDocument(data)` sammelt alle Formulardaten und Block-Inhalte.
3. Die docx.js-Bibliothek erstellt das Dokument mit Header-Tabelle, Auftraggeber, Standorten und Audit-Bloecken.
4. `Packer.toBlob()` erzeugt den Blob, der via `saveAs()` (file-saver) heruntergeladen wird.
5. Toggle-Felder, die deaktiviert sind, werden in der Info-Zeile der Bloecke weggelassen.

### Auditnotizen Word generieren

1. Benutzer klickt "Word-Export" auf der Auditnotizen-Seite.
2. `generateNotesWordDocument(notesData)` iteriert ueber alle Notiz-Bloecke.
3. Fuer jeden Block wird eine Tabelle mit bedingten Sektionen erstellt (Notizen, Dokumente, Bewertung nur wenn aktiviert).
4. QHSE-Dokumente werden einzeln als eigene Zeilen ausgegeben, nicht als gemeinsame Liste.
5. Bewertungen werden mit farblicher Hervorhebung (Typ gelb) formatiert.

### Notizen aus Bloecken generieren

1. Benutzer klickt "Notizen aus Bloecken exportieren" im Auditplan-Generator.
2. `generateNotesWordDocumentFromBlocks(data)` sammelt Kopfdaten aus den Plan-Feldern.
3. Struktur und Formatierung identisch zu §18.
4. Datei wird als `Auditnotizen_{timestamp}.docx` heruntergeladen.

### Auditfragen Word generieren

1. Benutzer klickt "Word-Export" auf der Auditfragen-Seite.
2. `generateAuditQuestionsWord()` liest die aktuellen Formulardaten und geladenen Fragen.
3. Ein HTML-String wird zusammengebaut mit Abteilung, Datum, Fragenliste und Dokumenten.
4. Der HTML-String wird als Blob mit MIME-Typ `application/msword` erstellt.
5. Download als `Auditfragen_[Abteilung]_[Datum].doc`.

## Abhaengigkeiten

### Interne Abhaengigkeiten

| Abhaengigkeit              | Beschreibung                                    |
| -------------------------- | ----------------------------------------------- |
| Spec 11 (Berichte)         | Auditfragen-Formulardaten fuer §20 Word-Export  |
| Spec 13 (Wissensdatenbank) | Abteilungsbeschreibungen, Zusammenfassungstexte |
| Spec 14 (Einstellungen)    | Logo (Base64) fuer Header                       |
| `src/lib/data/`            | Statische Daten fuer Abteilungen, Normen        |
| `src/lib/server/db/`       | Gespeicherte Audits, Notizen, Plandaten         |

### Externe Abhaengigkeiten

| Paket                | Verwendung                                |
| -------------------- | ----------------------------------------- |
| `docx`               | Word-Dokument-Generierung (§17, §18, §19) |
| `file-saver`         | `saveAs()` fuer Datei-Download            |
| Kein `docx` fuer §20 | Auditfragen nutzen HTML-Blob-Ansatz       |

### Dateistruktur

```
src/lib/export/
  auditplan-word.ts          # §17 - generateWordDocument() (~3400 Zeilen)
  auditnotizen-word.ts       # §18 - generateNotesWordDocument() (~540 Zeilen)
  notizen-bloecke-word.ts    # §19 - generateNotesWordDocumentFromBlocks()
  auditfragen-word.ts        # §20 - generateAuditQuestionsWord()
```
