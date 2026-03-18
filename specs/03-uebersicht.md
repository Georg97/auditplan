# 03 - Modul: Uebersicht

## Datenmodell

```typescript
// --- Gespeicherte Auditfragen & Dokumente ---

interface SavedDocument {
	id: string;
	userId: string;
	name: string;
	type: 'auditfragen' | 'dokument';
	content: Record<string, unknown>; // JSON-Inhalt des Generators
	createdAt: Date;
	updatedAt: Date;
}

// --- Gespeicherte Auditnotizen ---

interface SavedNote {
	id: string;
	userId: string;
	name: string;
	content: Record<string, unknown>; // JSON-Inhalt des Notizen-Generators
	createdAt: Date;
	updatedAt: Date;
}

// --- Gespeicherte Auditplaene ---

interface SavedPlan {
	id: string;
	userId: string;
	name: string;
	content: Record<string, unknown>; // JSON-Inhalt des Plan-Generators
	createdAt: Date;
	updatedAt: Date;
}

// --- Gemeinsamer Typ fuer die Uebersichtsliste ---

interface OverviewEntry {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	type: 'document' | 'note' | 'plan';
}

// --- Remote Functions ---

interface OverviewRemoteFunctions {
	getDocuments: () => Promise<SavedDocument[]>;
	getNotes: () => Promise<SavedNote[]>;
	getPlans: () => Promise<SavedPlan[]>;
	deleteDocument: (id: string) => Promise<void>;
	deleteNote: (id: string) => Promise<void>;
	deletePlan: (id: string) => Promise<void>;
}
```

## UI-Beschreibung

**Route:** `src/routes/(app)/uebersicht/+page.svelte`
**Remote Functions:** `src/routes/(app)/uebersicht/overview.remote.ts`

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

| Eigenschaft   | Wert                                     |
| ------------- | ---------------------------------------- |
| Hintergrund   | Weiss                                    |
| Border-Radius | `12px`                                   |
| Box-Shadow    | `0 2px 10px rgba(0, 0, 0, 0.1)`          |
| Padding       | `1.5rem`                                 |
| Margin-Bottom | `1.5rem`                                 |
| Max-Hoehe     | `400px`                                  |
| Overflow-Y    | `auto` (scrollbar bei vielen Eintraegen) |

### Abschnitts-Titel

| Eigenschaft    | Wert                                                               |
| -------------- | ------------------------------------------------------------------ |
| Schriftgroesse | `1.3rem`                                                           |
| Schriftstil    | Fett (bold)                                                        |
| Farbe          | `#2d3748`                                                          |
| Margin-Bottom  | `1rem`                                                             |
| Icon           | Emoji vor dem Titel (Dokumente: "📄", Notizen: "📝", Plaene: "📋") |

### Eintrags-Zeile

| Eigenschaft       | Wert                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Layout            | Flexbox, `justify-content: space-between`, `align-items: center` |
| Padding           | `0.75rem 1rem`                                                   |
| Border-Bottom     | `1px solid #e2e8f0`                                              |
| Hover-Hintergrund | `#f7fafc`                                                        |

#### Linke Seite (Name + Datum)

- **Name:** Schriftgroesse `1rem`, Farbe `#2d3748`, Fett
- **Datum:** Schriftgroesse `0.85rem`, Farbe `#718096`, formatiert mit `date-fns` (z.B. "14. Maerz 2026")

#### Rechte Seite (Aktions-Buttons)

3 Buttons nebeneinander mit `gap: 0.5rem`:

1. **Bearbeiten** (Blau)
   - Hintergrund: `#667eea`
   - Text: Weiss
   - Icon: Stift-Symbol
   - Border-Radius: `6px`
   - Padding: `0.4rem 0.8rem`

2. **Loeschen** (Rot)
   - Hintergrund: `#e53e3e`
   - Text: Weiss
   - Icon: Muelleimer-Symbol
   - Border-Radius: `6px`
   - Padding: `0.4rem 0.8rem`

3. **Download** (Gruen)
   - Hintergrund: `#38a169`
   - Text: Weiss
   - Icon: Download-Symbol
   - Border-Radius: `6px`
   - Padding: `0.4rem 0.8rem`
   - Dropdown bei Klick: "Word (.docx)" und "PDF (.pdf)"

### Leerer Zustand

Wenn ein Abschnitt keine Eintraege hat:

- Zentrierter Text: "Keine gespeicherten [Typ] vorhanden."
- Farbe: `#a0aec0`
- Schriftgroesse: `0.95rem`
- Padding: `2rem`

## Interaktionen

### Daten laden

1. Beim Seitenaufruf werden alle drei Remote Functions parallel aufgerufen:
   - `getDocuments()` -> Laedt gespeicherte Auditfragen & Dokumente
   - `getNotes()` -> Laedt gespeicherte Auditnotizen
   - `getPlans()` -> Laedt gespeicherte Auditplaene
2. Waehrend des Ladens wird ein Skeleton-Loader angezeigt (3 Platzhalter-Bloecke)
3. Die Ergebnisse werden in reaktive `$state`-Variablen gespeichert

### Bearbeiten

1. Klick auf "Bearbeiten" -> Navigation zur entsprechenden Generator-Seite
2. Die `id` des Eintrags wird als URL-Parameter mitgegeben:
   - Dokument: `/fragen-dokumente?edit={id}`
   - Notiz: `/auditnotizen?edit={id}`
   - Plan: `/auditplan?edit={id}`
3. Die Generator-Seite laedt den Eintrag per Remote Function und befuellt das Formular

### Loeschen

1. Klick auf "Loeschen" -> Bestaetigungsdialog oeffnet sich (Bits UI `AlertDialog`)
2. Dialog-Text: "Moechten Sie '[Name]' wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden."
3. Buttons: "Abbrechen" (grau) und "Loeschen" (rot)
4. Bei Bestaetigung: Remote Function `delete[Type](id)` wird aufgerufen
5. Nach erfolgreichem Loeschen: Eintrag wird aus der lokalen `$state`-Liste entfernt (optimistic UI)
6. Toast-Benachrichtigung: "Erfolgreich geloescht"

### Download

1. Klick auf "Download" -> Dropdown-Menue erscheint (Bits UI `DropdownMenu`)
2. Optionen: "Word (.docx)" und "PDF (.pdf)"
3. Bei Auswahl:
   - Word: `content`-JSON wird an die `docx`-Bibliothek uebergeben, Datei wird generiert und heruntergeladen
   - PDF: Content wird serverseitig als PDF gerendert und als Download bereitgestellt
4. Dateiname: `{name}_{datum}.{format}`

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema, i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **Bits UI:** `AlertDialog` (Loeschen-Bestaetigung), `DropdownMenu` (Download-Optionen)
- **docx:** Word-Dokument-Generierung
- **date-fns:** Datumsformatierung in der Eintragsliste
- **Abhaengig von Generator-Modulen:** Die Bearbeiten-Funktion navigiert zu den jeweiligen Generator-Seiten (Auditplan, Auditnotizen, Auditfragen)
