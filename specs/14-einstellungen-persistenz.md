# 14 - Einstellungen, Datei-Upload, Datenpersistenz & Drag and Drop

## Datenmodell

```typescript
// --- Einstellungen (§16) ---

interface AppSettings {
	// Farbschema
	theme: ThemeName;
	individualColors: {
		header: ColorOption;
		nav: ColorOption;
		card: ColorOption;
	};

	// Ansicht
	kompaktansicht: boolean;
	benachrichtigungen: boolean; // Standard: true

	// Sprache
	sprache: SupportedLocale; // "de" | "en" | "fr" | "es" | "it" | "nl" | "pt" | "pl" | "ru" | "tr"

	// Standardwerte
	standardAuditor: string;
	standardAbteilung: string;
}

type ThemeName =
	| 'default' // #667eea -> #764ba2
	| 'dark'
	| 'light'
	| 'green'
	| 'blue'
	| 'red'
	| 'purple'
	| 'orange'
	| 'cyan'
	| 'pink'
	| 'yellow'
	| 'indigo'
	| 'teal'
	| 'rose'
	| 'emerald'
	| 'sky'
	| 'slate';

interface ThemeDefinition {
	name: ThemeName;
	label: string;
	bodyBgGradient: [string, string]; // Von -> Bis
	headerBg: string;
	buttonColors: {
		primary: string;
		secondary: string;
	};
	navHighlight: string;
	cardHeadings: string;
	modalHeader: string;
	previewColor: string; // Fuer Farbvorschau-Quadrat
}

// 18 Themes (17 benannt + "default")
const THEMES: ThemeDefinition[] = [
	{
		name: 'default',
		label: 'Default',
		bodyBgGradient: ['#667eea', '#764ba2'],
		headerBg: 'linear-gradient(135deg, #667eea, #764ba2)',
		buttonColors: { primary: '#667eea', secondary: '#764ba2' },
		navHighlight: '#667eea',
		cardHeadings: '#667eea',
		modalHeader: '#667eea',
		previewColor: '#667eea'
	}
	// ... 16 weitere Themes
];

type ColorOption =
	| 'inherit' // Vom globalen Theme uebernehmen
	| 'default'
	| 'blue'
	| 'green'
	| 'red'
	| 'purple'
	| 'orange';

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

## UI-Beschreibung

### Einstellungen (Modal)

**Komponente:** `src/lib/components/settings/SettingsModal.svelte`

Das Einstellungen-Modal wird ueber das Zahnrad-Symbol im Header geoeffnet.

#### Tab "Global" - Farbschemata

| Eigenschaft         | Wert                                       |
| ------------------- | ------------------------------------------ |
| Layout              | Grid mit Farbvorschau-Quadraten            |
| Anzahl Themes       | 18                                         |
| Vorschau            | Jedes Theme als farbiges Quadrat mit Label |
| Auswahl             | Klick auf Quadrat setzt aktives Theme      |
| Sofortige Anwendung | Theme wird sofort nach Auswahl angewendet  |

**Theme-Liste:**

| Theme   | Gradient / Hauptfarbe  |
| ------- | ---------------------- |
| Default | `#667eea` -> `#764ba2` |
| Dark    | Dunkle Farben          |
| Light   | Helle Farben           |
| Green   | Gruentoene             |
| Blue    | Blauttoene             |
| Red     | Rottoene               |
| Purple  | Lilatoene              |
| Orange  | Orangetoene            |
| Cyan    | Cyantoene              |
| Pink    | Rosatoene              |
| Yellow  | Gelbtoene              |
| Indigo  | Indigotoene            |
| Teal    | Petroltoene            |
| Rose    | Altrosattoene          |
| Emerald | Smaragdtoene           |
| Sky     | Himmelblau             |
| Slate   | Schiefergrau           |

Jedes Theme definiert: Body-Hintergrund-Gradient, Header-Hintergrund, Button-Farben, Nav-Highlight, Card-Ueberschriften, Modal-Header.

#### Tab "Individuelle Bereiche"

3 Farb-Selects fuer individuelle Anpassungen:

| Bereich    | Optionen                                           |
| ---------- | -------------------------------------------------- |
| Header     | inherit, default, blue, green, red, purple, orange |
| Navigation | inherit, default, blue, green, red, purple, orange |
| Karten     | inherit, default, blue, green, red, purple, orange |

Bei "inherit" wird die Farbe vom globalen Theme uebernommen.

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

**Vorschau-Modal:**

- Zeigt hochgeladene Dateien mit Download- und Loesch-Button
- Bilder: Als `<img>`-Tag dargestellt
- PDFs: Als `<iframe>` eingebettet
- Andere Dateitypen: Als Icon mit Dateiname

**Datei-Viewer-Modal:**

- z-index: 1001 (ueber anderen Modals)
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

#### Visuelle Rueckmeldung beim Ziehen

| Eigenschaft | Wert                                     |
| ----------- | ---------------------------------------- |
| Rahmen      | `2px dashed #667eea` (gestrichelt, Blau) |
| Hintergrund | `#f0f2ff` (helles Blau)                  |
| Skalierung  | `scale(1.02)`                            |

#### Block-Verschiebung

Nach dem Ablegen wird die Reihenfolge des Arrays aktualisiert und die Bloecke neu gerendert. Dabei werden alle Feldwerte und Toggle-Zustaende beibehalten.

## Interaktionen

### Einstellungen speichern

1. Benutzer oeffnet das Einstellungen-Modal ueber das Zahnrad-Symbol.
2. Aenderungen an Theme, Farben, Checkboxen, Sprache oder Textfeldern loesen sofort ein Update aus.
3. Das Settings-Objekt wird via Server-Action als JSON in die `settings`-Tabelle geschrieben.
4. Theme-Aenderungen werden sofort auf der gesamten Seite angewendet (CSS-Variablen oder Tailwind-Klassen).
5. Sprachwechsel laedt die entsprechenden Uebersetzungen nach.

### Farbschema anwenden

1. Benutzer klickt auf ein Theme-Quadrat im Tab "Global".
2. Die `ThemeDefinition` wird ausgelesen und auf CSS-Variablen gemappt.
3. Body-Gradient, Header, Buttons, Navigation, Karten und Modal werden aktualisiert.
4. Individuelle Bereichsfarben (Tab "Individuelle Bereiche") ueberschreiben ggf. die globalen Farben.

### Datei hochladen

1. Benutzer klickt auf Upload-Button oder zieht Datei in den Bereich.
2. Validierung: Dateityp und Groesse (max. 5 MB) werden geprueft.
3. `FileReader.readAsDataURL()` liest die Datei als Base64-String.
4. Dateiname, Groesse und Base64-Daten werden via Server-Action in der Datenbank gespeichert.
5. Vorschau wird aktualisiert mit Thumbnail/Icon, Download- und Loesch-Button.

### Datei anzeigen

1. Benutzer klickt auf eine Datei in der Vorschau.
2. Datei-Viewer-Modal oeffnet sich (z-index: 1001).
3. Bilder: `<img src="data:image/...;base64,...">` direkt angezeigt.
4. PDFs: `<iframe src="data:application/pdf;base64,...">` eingebettet.
5. Andere Dateitypen: Icon mit Dateiname und Download-Link.

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
2. **Drag Start:** `handleNotesDragStart()` speichert den Index des gezogenen Blocks. Visuelles Feedback wird angewendet (gestrichelter Rahmen, heller Hintergrund, Skalierung).
3. **Drag Over:** `handleNotesDragOver()` verhindert Standard-Verhalten und zeigt die potenzielle Zielposition an.
4. **Drop:** `handleNotesDrop()` berechnet die neue Position und aktualisiert das Array.
5. **Drag End:** `handleNotesDragEnd()` entfernt visuelles Feedback.
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
| `bits-ui`        | UI-Komponenten (Dialog, Tabs, Select, Checkbox, Button)     |
| Tailwind CSS 4   | Theming via CSS-Variablen, responsive Layouts               |
| SvelteKit        | Server-Actions, Load-Funktionen, Routing                    |
