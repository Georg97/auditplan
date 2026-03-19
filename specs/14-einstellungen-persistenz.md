# 14 - Einstellungen, Datei-Upload, Datenpersistenz & Drag and Drop

## Datenmodell

```typescript
// --- Einstellungen (§16) ---

interface AppSettings {
	// Erscheinungsbild
	colorMode: 'light' | 'dark' | 'system'; // mode-watcher
	accentPreset: AccentPreset; // Akzentfarben-Vorauswahl

	// Ansicht
	kompaktansicht: boolean;
	benachrichtigungen: boolean; // Standard: true

	// Sprache
	sprache: SupportedLocale; // "de" | "en" | "fr" | "es" | "it" | "nl" | "pt" | "pl" | "ru" | "tr"

	// Standardwerte
	standardAuditor: string;
	standardAbteilung: string;
}

// Accent presets override --brand, --accent-mid, --accent-deep CSS variables
type AccentPreset =
	| 'default' // Teal-blue (project default from layout.css)
	| 'indigo'
	| 'violet'
	| 'rose'
	| 'emerald'
	| 'amber'
	| 'slate';

// Each preset defines OKLCH values for the three accent CSS variables
interface AccentPresetDefinition {
	name: AccentPreset;
	label: string; // i18n key for display
	brand: string; // OKLCH value for --brand
	accentMid: string; // OKLCH value for --accent-mid
	accentDeep: string; // OKLCH value for --accent-deep
}

// --- Datei-Upload (§27) ---

interface UploadedFile {
	id: string;
	filename: string;
	size: number; // Bytes
	mimeType: string;
	data: string; // Base64 via FileReader.readAsDataURL()
	uploadedAt: Date;
}

// Erlaubte Dateitypen
type AcceptedFileType =
	| 'application/pdf'
	| 'application/msword'
	| 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	| 'application/vnd.ms-excel'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/vnd.ms-powerpoint'
	| 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	| 'text/plain'
	| 'image/jpeg'
	| 'image/png';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// --- Datenpersistenz (§28) ---

// Drizzle ORM Tabellen (Turso/libSQL)
interface DbSchema {
	audits: AuditsTable;
	auditors: AuditorsTable;
	saved_plans: SavedPlansTable;
	saved_notes: SavedNotesTable;
	saved_audits: SavedAuditsTable;
	saved_audit_questions: SavedAuditQuestionsTable;
	calendar_entries: CalendarEntriesTable;
	actions: ActionsTable;
	settings: SettingsTable; // JSON-Objekt pro Benutzer
	uploaded_files: UploadedFilesTable;
}

// Settings werden als JSON-Objekt gespeichert
interface SettingsTable {
	id: string;
	organizationId: string;
	data: string; // JSON.stringify(AppSettings)
	createdAt: Date;
	updatedAt: Date;
}

// Logo separat oder in Settings gespeichert
interface LogoStorage {
	key: 'auditplan_logo';
	value: string; // Base64-String
}

// --- Drag & Drop (§29) ---

interface DragState {
	isDragging: boolean;
	dragIndex: number | null;
	dropIndex: number | null;
}

// Gespeicherter Block-Zustand fuer State Preservation
interface BlockFieldState {
	inputs: Record<string, string>;
	textareas: Record<string, string>;
	selects: Record<string, string>;
	checkboxes: Record<string, boolean>;
	visibility: Record<string, boolean>;
	qhseDocs: QhseDocState[];
	ratings: RatingState[];
}

interface QhseDocState {
	name: string;
	datum: string;
	notizen: string;
}

interface RatingState {
	typ: string;
	kapitel: string;
	beschreibung: string;
}
```

## Funktionale Anforderungen

### Einstellungen (Modal)

**Komponente:** `src/lib/components/settings/SettingsModal.svelte`

Das Einstellungen-Modal wird ueber das Zahnrad-Symbol im Header geoeffnet.

#### Erscheinungsbild

**Light/Dark-Modus:**

- Steuerung via `mode-watcher` (bereits eingerichtet)
- 3 Optionen: Light / Dark / System
- Setzt `.dark` Klasse auf `<html>`, Tailwind dark mode uebernimmt den Rest
- `mode-watcher` speichert Praeferenz automatisch

**Akzentfarben-Vorauswahl:**

- 7 Presets: default, indigo, violet, rose, emerald, amber, slate
- Accent preset selector showing available color themes with a preview of each preset's brand color
- Klick auf ein Preset setzt es als aktiv
- Sofortige Anwendung: CSS-Variablen (`--brand`, `--accent-mid`, `--accent-deep`) werden sofort ueberschrieben
- Bei Auswahl eines Presets werden die OKLCH-Werte als Inline-Styles auf `<html>` gesetzt. Alle ShadCN-Komponenten und Tailwind-Klassen, die diese Variablen referenzieren, passen sich automatisch an.

#### Weitere Einstellungen

| Feld               | Typ        | Standard           |
| ------------------ | ---------- | ------------------ |
| Kompaktansicht     | Checkbox   | Aus                |
| Benachrichtigungen | Checkbox   | An                 |
| Sprache            | Select     | "de" (10 Sprachen) |
| Standard-Auditor   | Text-Input | Leer               |
| Standard-Abteilung | Text-Input | Leer               |

#### Daten-Management

| Aktion              | Beschreibung                                                  |
| ------------------- | ------------------------------------------------------------- |
| Export JSON         | Exportiert alle Benutzerdaten als JSON-Datei                  |
| Import              | Importiert eine zuvor exportierte JSON-Datei                  |
| Alle Daten loeschen | Loescht alle Benutzerdaten nach Bestaetigung (Confirm-Dialog) |

### Datei-Upload (§27)

**Verwendung:** In verschiedenen Formularen (Auditnotizen, Massnahmenplan)

| Eigenschaft      | Wert                                          |
| ---------------- | --------------------------------------------- |
| Erlaubte Typen   | PDF, Word, Excel, PPT, Text, JPEG, PNG        |
| Maximale Groesse | 5 MB pro Datei                                |
| Verarbeitung     | `FileReader.readAsDataURL()` -> Base64-String |
| Speicherung      | Dateiname + Groesse + Base64-Daten in DB      |

**Datei-Vorschau:**

- Zeigt hochgeladene Dateien mit Download- und Loesch-Button

**Datei-Viewer:**

- File viewer supports images (inline), PDFs (embedded), other formats (download link with file icon)
- Oeffnet sich bei Klick auf eine Datei in der Vorschau

**Hilfsfunktion:** `formatFileSize(bytes: number): string` - Formatiert Bytes in lesbare Groesse (KB, MB)

### Datenpersistenz (§28)

Alle Daten werden serverseitig in Turso (libSQL) via Drizzle ORM gespeichert. **Kein localStorage.**

**Datenbank-Tabellen:**

| Tabelle                 | Inhalt                                     |
| ----------------------- | ------------------------------------------ |
| `audits`                | Audit-Stammdaten                           |
| `auditors`              | Auditor-Stammdaten                         |
| `saved_plans`           | Gespeicherte Auditplaene                   |
| `saved_notes`           | Gespeicherte Auditnotizen                  |
| `saved_audits`          | Gespeicherte Audit-Konfigurationen         |
| `saved_audit_questions` | Gespeicherte Auditfragen                   |
| `calendar_entries`      | Kalendereintraege                          |
| `actions`               | Massnahmenplan-Eintraege                   |
| `settings`              | Einstellungen als JSON-Objekt pro Benutzer |

**Logo-Speicherung:**

- `auditplan_logo` als Base64-String in der Settings-Tabelle oder als separater Eintrag

**Datenintegritaet:**

- Daten werden beim App-Start geladen (SvelteKit `+layout.server.ts`)
- Bei jeder Aenderung wird sofort persistiert (Server-Actions)
- Export/Import deckt ALLE Datentabellen ab

### Drag & Drop (§29)

**Verwendung:** Audit-Bloecke im Auditplan-Generator und Notizen-Bloecke

#### Funktionales Verhalten

- Benutzer kann Bloecke per Drag & Drop neu anordnen
- Beim Ziehen wird visuelles Feedback angezeigt (der gezogene Block ist erkennbar hervorgehoben)
- Nach dem Ablegen wird die Reihenfolge des Arrays aktualisiert und die Bloecke neu gerendert
- Alle Feldwerte und Toggle-Zustaende werden beim Verschieben beibehalten (State Preservation)

## Interaktionen

### Einstellungen speichern

1. Benutzer oeffnet das Einstellungen-Modal ueber das Zahnrad-Symbol.
2. Aenderungen an Modus, Akzentfarben, Checkboxen, Sprache oder Textfeldern loesen sofort ein Update aus.
3. Das Settings-Objekt wird via Server-Action als JSON in die `settings`-Tabelle geschrieben.
4. Light/Dark-Modus wird via `mode-watcher` gesteuert (`.dark` Klasse auf `<html>`).
5. Akzentfarben-Aenderungen setzen CSS-Variablen (`--brand`, `--accent-mid`, `--accent-deep`) auf `<html>`.
6. Sprachwechsel laedt die entsprechenden Uebersetzungen nach.

### Akzentfarbe anwenden

1. Benutzer waehlt ein Preset im Erscheinungsbild-Bereich.
2. Die OKLCH-Werte des Presets werden auf dem `<html>`-Element als CSS Custom Properties gesetzt.
3. Alle Tailwind-Klassen und ShadCN-Komponenten, die `--brand`, `--accent-mid`, `--accent-deep` referenzieren, passen sich automatisch an.
4. Die Auswahl wird in der `settings`-Tabelle persistiert und beim naechsten App-Start wiederhergestellt.

### Datei hochladen

1. Benutzer klickt auf Upload-Button oder zieht Datei in den Bereich.
2. Validierung: Dateityp und Groesse (max. 5 MB) werden geprueft.
3. `FileReader.readAsDataURL()` liest die Datei als Base64-String.
4. Dateiname, Groesse und Base64-Daten werden via Server-Action in der Datenbank gespeichert.
5. Vorschau wird aktualisiert mit Thumbnail/Icon, Download- und Loesch-Button.

### Datei anzeigen

1. Benutzer klickt auf eine Datei in der Vorschau.
2. Datei-Viewer oeffnet sich als Modal.
3. Bilder werden inline angezeigt.
4. PDFs werden eingebettet dargestellt.
5. Andere Dateitypen zeigen ein Icon mit Dateiname und Download-Link.

### Daten exportieren

1. Benutzer klickt "Export JSON" in den Einstellungen.
2. Server-Action liest alle Tabellen des Benutzers aus.
3. Alle Daten werden als JSON-Objekt zusammengefasst und als Datei heruntergeladen.

### Daten importieren

1. Benutzer klickt "Import" und waehlt eine JSON-Datei.
2. Die Datei wird gelesen und validiert (korrektes Format, erwartete Schluessel).
3. Via Server-Action werden alle Tabellen mit den importierten Daten befuellt/ueberschrieben.
4. Die Seite wird neu geladen, um die importierten Daten anzuzeigen.

### Alle Daten loeschen

1. Benutzer klickt "Alle Daten loeschen".
2. Ein Confirm-Dialog fragt nach Bestaetigung.
3. Nach Bestaetigung: Server-Action loescht alle Benutzerdaten aus allen Tabellen.
4. Einstellungen werden auf Standardwerte zurueckgesetzt.

### Drag & Drop - Bloecke verschieben

1. **`initBlockDragAndDrop()`** wird beim Rendern der Block-Liste aufgerufen.
2. **Drag Start:** Speichert den Index des gezogenen Blocks. Visuelles Feedback wird angewendet.
3. **Drag Over:** Verhindert Standard-Verhalten und zeigt die potenzielle Zielposition an.
4. **Drop:** Berechnet die neue Position und aktualisiert das Array.
5. **Drag End:** Entfernt visuelles Feedback.
6. **State Preservation:** Vor dem Re-Render werden alle DOM-Werte gespeichert (Inputs, Textareas, Selects, Checkboxen, Sichtbarkeit, QHSE-Dokumente, Bewertungen). Nach dem Re-Render werden diese Werte wiederhergestellt.

## Abhaengigkeiten

### Interne Abhaengigkeiten

| Abhaengigkeit              | Beschreibung                                                         |
| -------------------------- | -------------------------------------------------------------------- |
| Spec 01 (Architektur)      | Authentifizierung (better-auth), Datenbankschema, i18n (10 Sprachen) |
| Spec 02 (Layout)           | Header-Zahnrad-Symbol oeffnet Einstellungen-Modal                    |
| Spec 11 (Berichte)         | Massnahmenplan verwendet Datei-Upload                                |
| Spec 12 (Word-Export)      | Logo aus Einstellungen fuer Word-Header                              |
| Spec 13 (Wissensdatenbank) | Standard-Abteilung aus Einstellungen                                 |
| Auditplan-Generator        | Drag & Drop fuer Audit-Bloecke                                       |
| Auditnotizen               | Drag & Drop fuer Notizen-Bloecke, Datei-Upload                       |

### Datenbank-Tabellen (Drizzle ORM + Turso)

| Tabelle                | Beschreibung                                     |
| ---------------------- | ------------------------------------------------ |
| `settings`             | JSON-Objekt mit allen Einstellungen pro Benutzer |
| `uploaded_files`       | Hochgeladene Dateien (Metadaten + Base64-Daten)  |
| Alle weiteren Tabellen | Fuer Export/Import relevant                      |

### Externe Abhaengigkeiten

| Paket            | Verwendung                                                  |
| ---------------- | ----------------------------------------------------------- |
| `@libsql/client` | Turso-Datenbankverbindung                                   |
| `drizzle-orm`    | ORM fuer Datenbankoperationen                               |
| `better-auth`    | Benutzer-Authentifizierung (organizationId fuer alle Daten) |
| `mode-watcher`   | Light/Dark/System Modus-Umschaltung                         |
| `bits-ui`        | UI-Komponenten (Dialog, Tabs, Select, Checkbox, Button)     |
| Tailwind CSS 4   | Theming via OKLCH CSS-Variablen, responsive Layouts         |
| SvelteKit        | Server-Actions, Load-Funktionen, Routing                    |
