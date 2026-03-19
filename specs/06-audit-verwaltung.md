# Spec 06: Audit-Verwaltung (Audit-Suche & Verwaltung)

## Datenmodell

```typescript
// ──────────────────────────────────────────────
// Enums & Konstanten
// ──────────────────────────────────────────────

type AuditTyp = 'internal' | 'external' | 'certification' | 'surveillance' | 'recertification';

type AuditFormat = 'on_site' | 'remote' | 'hybrid';

type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
// 'overdue' is computed (frist < today AND status != 'completed'), not a stored status

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
	// Normen werden ueber Junction-Tabelle `audit_normen` abgebildet (NICHT als JSON-String)
	geltungsbereich: string | null;

	// 5. Personal
	leitenderAuditorId: string; // FK -> auditors.id, NOT NULL, ON DELETE RESTRICT
	// Auditteam wird ueber Junction-Tabelle `audit_team_members` abgebildet (NICHT als Freitext)
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
 * Junction-Tabelle: audit_normen
 * Verknuepft Audits mit ISO-Normen (n:m Beziehung).
 */
interface AuditNormRow {
	auditId: string; // FK -> audits.id, ON DELETE CASCADE
	normId: string; // z.B. "iso9001", "iso14001" etc.
	// Composite Primary Key: (auditId, normId)
}

/**
 * Junction-Tabelle: audit_team_members
 * Verknuepft Audits mit Auditoren als Teammitglieder (n:m Beziehung).
 */
interface AuditTeamMemberRow {
	auditId: string; // FK -> audits.id, ON DELETE CASCADE
	auditorId: string; // FK -> auditors.id, ON DELETE RESTRICT
	role: string | null; // Optionale Rolle im Team, z.B. "Fachexperte", "Beobachter"
	// Composite Primary Key: (auditId, auditorId)
}

/**
 * Datei-Metadaten zu Audits.
 * WICHTIG: Dateien werden NICHT als Base64 in der DB gespeichert.
 * Nur Metadaten (Name, Typ, Groesse, Storage-Key) in der DB,
 * Dateiinhalt in externem Object Storage (R2/S3).
 */
interface AuditDateiRow {
	id: string; // UUID
	auditId: string; // FK -> audits.id, ON DELETE CASCADE
	dateiName: string; // Originalname
	dateiTyp: string; // MIME-Type
	dateiGroesse: number; // Bytes (max 5 MB = 5_242_880)
	storageKey: string; // Referenz auf Datei im Object Storage (R2/S3), NICHT Base64 in DB
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
// Paginiertes Ergebnis
// ──────────────────────────────────────────────

interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pages: number;
}

// ──────────────────────────────────────────────
// Suchparameter
// ──────────────────────────────────────────────

interface AuditSuchParams {
	suchbegriff: string; // Freitext (case-insensitive)
	seite: number; // Pagination (1-basiert)
	proSeite: number; // Items pro Seite
}

// ──────────────────────────────────────────────
// Formular-State (Client)
// ──────────────────────────────────────────────

interface AuditFormState {
	audit: Omit<AuditRow, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>;
	selectedNormen: string[]; // Array von normId-Werten fuer die Junction-Tabelle
	selectedTeamMembers: { auditorId: string; role: string | null }[]; // Teammitglieder fuer Junction-Tabelle
	dateien: File[]; // Neue Uploads (noch nicht gespeichert)
	vorhandeneDateien: AuditDateiRow[]; // Bereits gespeicherte Dateien (nur Metadaten)
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

- Ein einzelnes Textfeld mit Placeholder _"Audits durchsuchen... (Name, Auditor, Abteilung)"_.
- Suche erfolgt in Echtzeit (Debounce 300 ms) per Server-Funktion.
- Die Suche ist **case-insensitive** und durchsucht gleichzeitig die Spalten `auditName`, `abteilung` sowie den verknuepften Auditor-Namen.
- Rechts neben dem Suchfeld: Button **"Neues Audit anlegen"**.

### 2. Suchergebnisse

- Audit-Ergebnisse werden in einem responsiven Karten-Grid dargestellt.
- Jede Karte zeigt:
  - **Kopfzeile**: Auditname, Status-Indikator (farbkodiert nach Status).
  - **Mitte**: Audittyp, Unternehmen, Abteilung, Zeitraum (Start- bis Enddatum).
  - **Fusszeile**: Drei Aktions-Buttons:
    - **Bearbeiten** -- oeffnet das Formular mit vorausgefuellten Daten.
    - **Loeschen** -- Bestaetigung per Bestaetigungsdialog.
    - **Dateien** -- oeffnet Datei-Panel/Modal.

**Status-Semantik**:

| Status      | Bedeutung                      |
| ----------- | ------------------------------ |
| planned     | Geplant (informativ)           |
| in_progress | In Bearbeitung (Warnung)       |
| completed   | Abgeschlossen (Erfolg)         |
| postponed   | Verschoben (gedaempft)         |
| cancelled   | Abgesagt (destruktiv/kritisch) |

### 3. Audit-Formular (6 Sektionen)

Das Formular wird entweder in einem eigenen Bereich (unterhalb der Suche) oder in einem Modal angezeigt. Jede Sektion ist als zusammenklappbarer Bereich implementiert.

#### Sektion 1: Grundinformationen

| Feld      | Typ     | Pflicht | Hinweise                      |
| --------- | ------- | ------- | ----------------------------- |
| Auditname | Text    | Ja      | Min. 3 Zeichen                |
| Audittyp  | Auswahl | Ja      | 5 Optionen (siehe `AuditTyp`) |

#### Sektion 2: Zeitplanung

| Feld        | Typ   | Pflicht | Hinweise      |
| ----------- | ----- | ------- | ------------- |
| Startdatum  | Datum | Ja      |               |
| Enddatum    | Datum | Nein    | >= Startdatum |
| Uhrzeit Von | Zeit  | Nein    |               |
| Uhrzeit Bis | Zeit  | Nein    | > Uhrzeit Von |

#### Sektion 3: Organisation & Standort

| Feld        | Typ     | Pflicht | Hinweise                  |
| ----------- | ------- | ------- | ------------------------- |
| Unternehmen | Text    | Ja      |                           |
| Abteilung   | Text    | Ja      |                           |
| Standort    | Text    | Nein    |                           |
| Format      | Auswahl | Nein    | Vor Ort / Remote / Hybrid |

#### Sektion 4: Norm & Geltungsbereich

- **5+1 ISO-Checkboxen**: Jede Norm als Checkbox mit Label.
- **Geltungsbereich**: Mehrzeiliges Textfeld.

#### Sektion 5: Personal

| Feld              | Typ                   | Pflicht | Hinweise                                |
| ----------------- | --------------------- | ------- | --------------------------------------- |
| Leitender Auditor | Auswahl (dynamisch)   | Ja      | Optionen aus `auditors`-Tabelle geladen |
| Auditteam         | Mehrzeiliges Textfeld | Nein    | Freitext, ein Name pro Zeile            |
| Ansprechpartner   | Text                  | Nein    |                                         |
| Kontakt-E-Mail    | E-Mail                | Nein    | E-Mail-Validierung                      |

#### Sektion 6: Notizen & Dokumente

| Feld            | Typ                   | Hinweise                                                      |
| --------------- | --------------------- | ------------------------------------------------------------- |
| Notizen         | Mehrzeiliges Textfeld |                                                               |
| Dokumente/Links | Mehrzeiliges Textfeld | Ein Link pro Zeile                                            |
| Datei-Upload    | Datei-Upload          | Mehrfachauswahl, erlaubte Typen (siehe unten), max 5 MB/Datei |

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
4. Ergebnis wird als paginiertes `PaginatedResult<AuditRow>` (inkl. Auditor-Name) zurueckgegeben.
5. Das Grid rendert die Karten neu. Pagination-Buttons ermoeglichen das Blaettern durch die Ergebnisse.

### Audit anlegen

1. Klick auf "Neues Audit anlegen".
2. Formular oeffnet sich mit leeren Feldern (`istNeu = true`).
3. Pflichtfelder sind markiert (Fehleranzeige bei Validierungsfehler).
4. Bei "Speichern": Client-Validierung -> Server-Call (`createAudit`).
5. Dateien werden separat per `uploadAuditDatei` in Object Storage (R2/S3) hochgeladen (Groessenpruefung client- und serverseitig). Nur Metadaten (Name, Typ, Groesse, Storage-Key) werden in der DB gespeichert.
6. Bei Erfolg: Formular schliesst, Suchergebnisse aktualisieren.

### Audit bearbeiten

1. Klick auf "Bearbeiten" in einer Karte.
2. Server-Call (`getAudit`) laedt den vollstaendigen Datensatz inkl. Dateien.
3. Formular oeffnet sich vorausgefuellt (`istNeu = false`).
4. Bei "Speichern": Server-Call (`updateAudit`).

### Audit loeschen

1. Klick auf "Loeschen".
2. Bestaetigung per Bestaetigungsdialog: _"Audit '{auditName}' wirklich loeschen? Alle zugehoerigen Dateien werden ebenfalls entfernt."_
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

| Abhaengigkeit           | Beschreibung                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `auditors`-Tabelle      | Dynamisches Dropdown fuer "Leitender Auditor" (Sektion 5)                                        |
| better-auth Session     | `organizationId` fuer alle CRUD-Operationen                                                      |
| Drizzle ORM Schema      | Tabellendefinitionen `audits`, `audit_normen`, `audit_team_members`, `audit_dateien`, `auditors` |
| Spec 07 (Kalender)      | Audits koennen als Kalendereintraege referenziert werden                                         |
| Spec 08 (Import/Export) | Audits werden beim Export/Import beruecksichtigt                                                 |
