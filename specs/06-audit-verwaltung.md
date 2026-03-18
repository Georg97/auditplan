# Spec 06: Audit-Verwaltung (Audit-Suche & Verwaltung)

## Datenmodell

```typescript
// ──────────────────────────────────────────────
// Enums & Konstanten
// ──────────────────────────────────────────────

type AuditTyp = 'internal' | 'external' | 'certification' | 'surveillance' | 'recertification';

type AuditFormat = 'on_site' | 'remote' | 'hybrid';

type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

// ──────────────────────────────────────────────
// Drizzle-Schema (Turso / SQLite)
// ──────────────────────────────────────────────

/**
 * Haupttabelle: audits
 * Jede Zeile repräsentiert einen vollständigen Audit-Datensatz.
 */
interface AuditRow {
	id: string; // UUID, Primary Key
	organizationId: string; // FK -> organization.id (organization-based tenancy)

	// 1. Grundinformationen
	auditName: string; // NOT NULL
	auditTyp: AuditTyp; // NOT NULL

	// 2. Zeitplanung
	startDatum: string; // ISO-Date, NOT NULL
	endDatum: string | null; // ISO-Date, optional
	uhrzeitVon: string | null; // "HH:mm"
	uhrzeitBis: string | null; // "HH:mm"

	// 3. Organisation & Standort
	unternehmen: string; // NOT NULL
	abteilung: string; // NOT NULL
	standort: string | null;
	format: AuditFormat | null;

	// 4. Norm & Geltungsbereich
	normen: string; // JSON-Array von Norm-IDs, z.B. '["iso9001","iso14001"]'
	geltungsbereich: string | null;

	// 5. Personal
	leitenderAuditorId: string; // FK -> auditors.id, NOT NULL
	auditTeam: string | null;
	ansprechpartner: string | null;
	kontaktEmail: string | null;

	// 6. Notizen & Dokumente
	notizen: string | null;
	dokumenteLinks: string | null;

	// Meta
	status: AuditStatus;
	createdAt: string; // ISO-DateTime
	updatedAt: string; // ISO-DateTime
}

/**
 * Datei-Uploads zu Audits.
 * Dateien werden als Blob/Base64 oder per Dateipfad gespeichert.
 */
interface AuditDateiRow {
	id: string; // UUID
	auditId: string; // FK -> audits.id, ON DELETE CASCADE
	dateiName: string; // Originalname
	dateiTyp: string; // MIME-Type
	dateiGroesse: number; // Bytes (max 5 MB = 5_242_880)
	dateiInhalt: string; // Base64-kodierter Inhalt
	createdAt: string;
}

// ──────────────────────────────────────────────
// ISO-Checkboxen (5+1)
// ──────────────────────────────────────────────

interface NormOption {
	id: string; // z.B. "iso9001"
	label: string; // z.B. "ISO 9001:2015"
	checked: boolean;
}

// ──────────────────────────────────────────────
// Auditor (Referenztabelle)
// ──────────────────────────────────────────────

interface AuditorRow {
	id: string;
	organizationId: string;
	name: string;
	email: string | null;
	aktiv: boolean;
	createdAt: string;
}

// ──────────────────────────────────────────────
// Suchparameter
// ──────────────────────────────────────────────

interface AuditSuchParams {
	suchbegriff: string; // Freitext (case-insensitive)
	seite: number; // Pagination
	proSeite: number; // Items pro Seite
}

// ──────────────────────────────────────────────
// Formular-State (Client)
// ──────────────────────────────────────────────

interface AuditFormState {
	audit: Omit<AuditRow, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>;
	dateien: File[]; // Neue Uploads (noch nicht gespeichert)
	vorhandeneDateien: AuditDateiRow[]; // Bereits gespeicherte Dateien
	fehler: Record<string, string>; // Validierungsfehler pro Feld
	istNeu: boolean;
	speichert: boolean;
}
```

## UI-Beschreibung

### Layout

Die Seite gliedert sich in zwei Bereiche:

1. **Suchleiste** (oberer Bereich, volle Breite)
2. **Ergebnis-Grid / Formular** (darunter)

### 1. Suchleiste

- Ein einzelnes Textfeld (`<input type="text">`) mit Placeholder _"Audits durchsuchen... (Name, Auditor, Abteilung)"_.
- Suche erfolgt in Echtzeit (Debounce 300 ms) per Server-Funktion.
- Die Suche ist **case-insensitive** und durchsucht gleichzeitig die Spalten `auditName`, `abteilung` sowie den verknuepften Auditor-Namen.
- Rechts neben dem Suchfeld: Button **"Neues Audit anlegen"** (primarer Button, Bits-UI `Button`).

### 2. Suchergebnisse (Responsive Grid)

- CSS-Grid: `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, Gap `1rem`.
- Jede Karte (`Card` aus Bits-UI) zeigt:
  - **Kopfzeile**: Auditname (fett), Status-Badge (farbkodiert, siehe unten).
  - **Mitte**: Audittyp, Unternehmen, Abteilung, Zeitraum (Start- bis Enddatum).
  - **Fusszeile**: Drei Aktions-Buttons:
    - **Bearbeiten** (Stift-Icon) -- oeffnet das Formular mit vorausgefuellten Daten.
    - **Loeschen** (Papierkorb-Icon) -- Bestaetigung per Dialog.
    - **Dateien** (Bueroklammer-Icon) -- oeffnet Datei-Panel/Modal.

**Status-Farbkodierung** (Tailwind-Klassen):

| Status      | Hintergrund     | Text              |
| ----------- | --------------- | ----------------- |
| planned     | `bg-blue-100`   | `text-blue-800`   |
| in_progress | `bg-yellow-100` | `text-yellow-800` |
| completed   | `bg-green-100`  | `text-green-800`  |
| cancelled   | `bg-red-100`    | `text-red-800`    |

### 3. Audit-Formular (6 Sektionen)

Das Formular wird entweder in einem eigenen Bereich (unterhalb der Suche) oder in einem breitbildigen Modal angezeigt. Jede Sektion ist als zusammenklappbares Akkordeon (Bits-UI `Accordion`) implementiert.

#### Sektion 1: Grundinformationen

| Feld      | Typ                  | Pflicht | Hinweise                      |
| --------- | -------------------- | ------- | ----------------------------- |
| Auditname | `<input text>`       | Ja      | Min. 3 Zeichen                |
| Audittyp  | `<Select>` (Bits-UI) | Ja      | 5 Optionen (siehe `AuditTyp`) |

#### Sektion 2: Zeitplanung

| Feld        | Typ            | Pflicht | Hinweise      |
| ----------- | -------------- | ------- | ------------- |
| Startdatum  | `<input date>` | Ja      |               |
| Enddatum    | `<input date>` | Nein    | >= Startdatum |
| Uhrzeit Von | `<input time>` | Nein    |               |
| Uhrzeit Bis | `<input time>` | Nein    | > Uhrzeit Von |

#### Sektion 3: Organisation & Standort

| Feld        | Typ            | Pflicht | Hinweise                  |
| ----------- | -------------- | ------- | ------------------------- |
| Unternehmen | `<input text>` | Ja      |                           |
| Abteilung   | `<input text>` | Ja      |                           |
| Standort    | `<input text>` | Nein    |                           |
| Format      | `<Select>`     | Nein    | Vor Ort / Remote / Hybrid |

#### Sektion 4: Norm & Geltungsbereich

- **5+1 ISO-Checkboxen**: Jede Norm als Bits-UI `Checkbox` mit Label.
- **Geltungsbereich**: `<textarea>` (4 Zeilen).

#### Sektion 5: Personal

| Feld              | Typ                    | Pflicht | Hinweise                                |
| ----------------- | ---------------------- | ------- | --------------------------------------- |
| Leitender Auditor | `<Select>` (dynamisch) | Ja      | Optionen aus `auditors`-Tabelle geladen |
| Auditteam         | `<textarea>`           | Nein    | Freitext, ein Name pro Zeile            |
| Ansprechpartner   | `<input text>`         | Nein    |                                         |
| Kontakt-E-Mail    | `<input email>`        | Nein    | E-Mail-Validierung                      |

#### Sektion 6: Notizen & Dokumente

| Feld            | Typ                     | Hinweise                                                  |
| --------------- | ----------------------- | --------------------------------------------------------- |
| Notizen         | `<textarea>` (6 Zeilen) |                                                           |
| Dokumente/Links | `<textarea>` (4 Zeilen) | Ein Link pro Zeile                                        |
| Datei-Upload    | `<input type="file">`   | `multiple`, `accept` siehe erlaubte Typen, max 5 MB/Datei |

**Erlaubte Dateitypen**: PDF (`.pdf`), Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`), Text (`.txt`), Bilder (`.png`, `.jpg`, `.jpeg`, `.gif`).

Unterhalb des Upload-Feldes: Liste bereits hochgeladener Dateien mit Dateiname, Groesse und Loeschen-Button.

### Formular-Buttons

- **Speichern** (primaer) -- Validierung, dann POST/PUT an Server.
- **Abbrechen** (sekundaer) -- Formular schliessen, Aenderungen verwerfen.

## Interaktionen

### Suche

1. Benutzer tippt in das Suchfeld.
2. Nach 300 ms Debounce wird ein Server-Call (`searchAudits`) mit dem Suchbegriff ausgeloest.
3. Server fuehrt eine SQL-Abfrage mit `LIKE '%suchbegriff%'` auf `auditName`, `abteilung` sowie einem JOIN auf `auditors.name` aus.
4. Ergebnis wird als Array von `AuditRow` (inkl. Auditor-Name) zurueckgegeben.
5. Das Grid rendert die Karten neu.

### Audit anlegen

1. Klick auf "Neues Audit anlegen".
2. Formular oeffnet sich mit leeren Feldern (`istNeu = true`).
3. Pflichtfelder sind markiert (rote Umrandung bei Fehler).
4. Bei "Speichern": Client-Validierung -> Server-Call (`createAudit`).
5. Dateien werden separat per `uploadAuditDatei` hochgeladen (Base64-Kodierung, Groessenpruefung client- und serverseitig).
6. Bei Erfolg: Formular schliesst, Suchergebnisse aktualisieren.

### Audit bearbeiten

1. Klick auf "Bearbeiten" in einer Karte.
2. Server-Call (`getAudit`) laedt den vollstaendigen Datensatz inkl. Dateien.
3. Formular oeffnet sich vorausgefuellt (`istNeu = false`).
4. Bei "Speichern": Server-Call (`updateAudit`).

### Audit loeschen

1. Klick auf "Loeschen".
2. Bestaetigung per Bits-UI `AlertDialog`: _"Audit '{auditName}' wirklich loeschen? Alle zugehoerigen Dateien werden ebenfalls entfernt."_
3. Bei Bestaetigung: Server-Call (`deleteAudit`), CASCADE loescht auch `audit_dateien`.
4. Karte wird aus dem Grid entfernt.

### Dateien anzeigen

1. Klick auf "Dateien".
2. Modal/Panel oeffnet sich mit Liste aller `AuditDateiRow` fuer diesen Audit.
3. Pro Datei: Download-Button, Loeschen-Button.
4. Neuer Upload moeglich direkt aus diesem Panel.

### Validierung

- Client-seitig: Pflichtfelder pruefen, E-Mail-Format, Dateigroesse (max 5 MB), Dateityp-Whitelist.
- Server-seitig: Identische Pruefungen plus Auth-Check (`organizationId` muss mit Session uebereinstimmen).
- Fehlermeldungen erscheinen inline unter dem jeweiligen Feld.

## Abhaengigkeiten

### Intern (Projekt)

| Abhaengigkeit           | Beschreibung                                               |
| ----------------------- | ---------------------------------------------------------- |
| `auditors`-Tabelle      | Dynamisches Dropdown fuer "Leitender Auditor" (Sektion 5)  |
| better-auth Session     | `organizationId` fuer alle CRUD-Operationen                |
| Drizzle ORM Schema      | Tabellendefinitionen `audits`, `audit_dateien`, `auditors` |
| Spec 07 (Kalender)      | Audits koennen als Kalendereintraege referenziert werden   |
| Spec 08 (Import/Export) | Audits werden beim Export/Import beruecksichtigt           |

### Extern (Bibliotheken)

| Paket          | Verwendung                                             |
| -------------- | ------------------------------------------------------ |
| SvelteKit      | Routing (`/audits`), Server-Funktionen                 |
| Svelte 5       | Reaktive Zustandsverwaltung (`$state`, `$derived`)     |
| Bits-UI        | Select, Checkbox, Button, Card, AlertDialog, Accordion |
| Tailwind CSS 4 | Styling, responsive Grid, Farbkodierung                |
| Drizzle ORM    | SQL-Queries, Schema-Definition                         |
| Turso          | SQLite-Datenbank (libsql)                              |
| better-auth    | Authentifizierung, Session-Management                  |
| Bun            | Runtime, Paketmanager                                  |
