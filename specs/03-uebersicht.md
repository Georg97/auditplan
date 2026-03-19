# 03 - Modul: Uebersicht

## Datenmodell

```typescript
// --- Summary item for list display ---
// The Overview page only needs summary info for each saved item.
// Full data lives in normalized tables (see Spec 09: AuditPlan, Spec 10: AuditNotes, Spec 11: SavedAuditQuestions).

interface SummaryItem {
	id: string;
	name: string;
	type: 'plan' | 'notes' | 'questions';
	createdAt: Date;
	updatedAt: Date;
}

// --- Paginiertes Ergebnis ---

interface PaginatedResult<T> {
	items: T[];
	total: number; // Gesamtanzahl Eintraege
	page: number; // Aktuelle Seite (1-basiert)
	pages: number; // Gesamtanzahl Seiten
}

// --- Remote Functions ---
// Each function queries the respective normalized table (audit_plans, audit_notes, saved_audit_questions)
// and returns only the summary fields needed for list display.

interface OverviewRemoteFunctions {
	getPlans: (page: number, limit: number) => Promise<PaginatedResult<SummaryItem>>; // From audit_plans (Spec 09)
	getNotes: (page: number, limit: number) => Promise<PaginatedResult<SummaryItem>>; // From audit_notes (Spec 10)
	getQuestions: (page: number, limit: number) => Promise<PaginatedResult<SummaryItem>>; // From saved_audit_questions (Spec 11)
	deletePlan: (id: string) => Promise<void>;
	deleteNote: (id: string) => Promise<void>;
	deleteQuestion: (id: string) => Promise<void>;
}
```

## UI-Beschreibung

**Route:** `src/routes/(app)/overview/+page.svelte`
**Remote Functions:** `src/routes/(app)/overview/overview.remote.ts`

Diese Seite ist die Standard-Startseite der Anwendung nach dem Login.

### Seitenaufbau

```
+------------------------------------------------------+
|  Seitentitel: "Uebersicht"                           |
+------------------------------------------------------+
|                                                      |
|  Abschnitt 1: Gespeicherte Auditfragen & Dokumente  |
|  +------------------------------------------------+  |
|  | [Name]  [Datum]  [Bearbeiten] [Loeschen] [DL]  |  |
|  | [Name]  [Datum]  [Bearbeiten] [Loeschen] [DL]  |  |
|  | ...                                             |  |
|  +------------------------------------------------+  |
|                                                      |
|  Abschnitt 2: Gespeicherte Auditnotizen             |
|  +------------------------------------------------+  |
|  | [Name]  [Datum]  [Bearbeiten] [Loeschen] [DL]  |  |
|  | ...                                             |  |
|  +------------------------------------------------+  |
|                                                      |
|  Abschnitt 3: Gespeicherte Auditplaene              |
|  +------------------------------------------------+  |
|  | [Name]  [Datum]  [Bearbeiten] [Loeschen] [DL]  |  |
|  | ...                                             |  |
|  +------------------------------------------------+  |
+------------------------------------------------------+
```

### Abschnitt-Container

| Eigenschaft   | Wert                                            |
| ------------- | ----------------------------------------------- |
| Hintergrund   | ShadCN Card (`bg-card`)                         |
| Border-Radius | rounded-lg                                      |
| Box-Shadow    | card shadow                                     |
| Padding       | standard card padding                           |
| Margin-Bottom | standard section spacing                        |
| Max-Hoehe     | scrollable container with reasonable max height |
| Overflow-Y    | `auto` (scrollbar bei vielen Eintraegen)        |

### Abschnitts-Titel

| Eigenschaft    | Wert                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Schriftgroesse | medium heading text                                                                                  |
| Schriftstil    | bold                                                                                                 |
| Farbe          | foreground                                                                                           |
| Margin-Bottom  | standard spacing                                                                                     |
| Icon           | Lucide icon vor dem Titel (Dokumente: `file-text`, Notizen: `pencil-line`, Plaene: `clipboard-list`) |

### Eintrags-Zeile

| Eigenschaft       | Wert                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Layout            | Flexbox, `justify-content: space-between`, `align-items: center` |
| Padding           | compact row padding                                              |
| Border-Bottom     | border color                                                     |
| Hover-Hintergrund | muted background                                                 |

#### Linke Seite (Name + Datum)

- **Name:** base text size, foreground color, bold
- **Datum:** small text, muted foreground, formatiert mit `@internationalized/date` (z.B. "14. Maerz 2026")

#### Rechte Seite (Aktions-Buttons)

3 Buttons nebeneinander mit gap-2:

1. **Bearbeiten** — primary button (outline variant), Lucide icon: `pencil`
2. **Loeschen** — destructive button, Lucide icon: `trash-2`
3. **Download** — outline button (success intent), Lucide icon: `download`
   - Dropdown bei Klick: "Word (.docx)" und "PDF (.pdf)"

All buttons use compact button padding.

### Leerer Zustand

Wenn ein Abschnitt keine Eintraege hat:

- Zentrierter Text: "Keine gespeicherten [Typ] vorhanden."
- Farbe: muted foreground
- Schriftgroesse: small text
- Padding: generous empty-state padding

## Interaktionen

### Daten laden

1. Beim Seitenaufruf werden alle drei Remote Functions parallel aufgerufen:
   - `getPlans(page, limit)` -> Laedt Auditplaene aus `audit_plans` (Spec 09), nur Summary-Felder (paginiert)
   - `getNotes(page, limit)` -> Laedt Auditnotizen aus `audit_notes` (Spec 10), nur Summary-Felder (paginiert)
   - `getQuestions(page, limit)` -> Laedt Auditfragen aus `saved_audit_questions` (Spec 11), nur Summary-Felder (paginiert)
2. Waehrend des Ladens wird ein Skeleton-Loader angezeigt (3 Platzhalter-Bloecke)
3. Die Ergebnisse werden in reaktive `$state`-Variablen gespeichert
4. Beim Scrollen werden weitere Eintraege nachgeladen (infinite scroll oder Pagination-Buttons)

### Bearbeiten

1. Klick auf "Bearbeiten" -> Navigation zur entsprechenden Generator-Seite
2. Die `id` des Eintrags wird als URL-Parameter mitgegeben:
   - Plan: `/plan-generator?edit={id}` (Spec 09: AuditPlan)
   - Notiz: `/notes-generator?edit={id}` (Spec 10: AuditNotes)
   - Auditfragen: `/audit-questions?edit={id}` (Spec 11: SavedAuditQuestions)
3. Die Generator-Seite laedt den Eintrag per Remote Function und befuellt das Formular

### Loeschen

1. Klick auf "Loeschen" -> Bestaetigungsdialog oeffnet sich (ShadCN `AlertDialog`)
2. Dialog-Text: "Moechten Sie '[Name]' wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden."
3. Buttons: outline button "Abbrechen" und destructive button "Loeschen"
4. Bei Bestaetigung: Remote Function `deletePlan(id)` / `deleteNote(id)` / `deleteQuestion(id)` wird aufgerufen
5. Nach erfolgreichem Loeschen: Eintrag wird aus der lokalen `$state`-Liste entfernt (optimistic UI)
6. Toast-Benachrichtigung: "Erfolgreich geloescht"

### Download

1. Klick auf "Download" -> Dropdown-Menue erscheint (ShadCN `DropdownMenu`)
2. Optionen: "Word (.docx)" und "PDF (.pdf)"
3. Bei Auswahl:
   - Word: Normalized data is loaded from the respective tables and passed to the `docx` library for generation
   - PDF: Data is loaded from the respective tables, rendered as PDF server-side and provided as download
4. Dateiname: `{name}_{datum}.{format}`

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema, i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **ShadCN:** `AlertDialog` (Loeschen-Bestaetigung), `DropdownMenu` (Download-Optionen)
- **docx:** Word-Dokument-Generierung
- **@internationalized/date:** Datumsformatierung in der Eintragsliste
- **Abhaengig von Generator-Modulen:** Die Bearbeiten-Funktion navigiert zu den jeweiligen Generator-Seiten (Auditplan, Auditnotizen, Auditfragen)
