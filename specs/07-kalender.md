# Spec 07: Kalender

## Datenmodell

```typescript
// ──────────────────────────────────────────────
// Enums & Konstanten
// ──────────────────────────────────────────────

type KalenderAnsicht = 'month' | 'week' | 'day';

// ──────────────────────────────────────────────
// Drizzle-Schema (Turso / SQLite)
// ──────────────────────────────────────────────

/**
 * Tabelle: calendar_entries
 * Jeder Eintrag repraesentiert ein Ereignis im Kalender.
 */
interface CalendarEntryRow {
	id: string; // UUID, Primary Key
	organizationId: string; // FK -> organization.id (organization-based tenancy)
	datum: string; // ISO-Date (YYYY-MM-DD), NOT NULL
	titel: string; // NOT NULL
	startzeit: string | null; // "HH:mm"
	endzeit: string | null; // "HH:mm"
	unternehmen: string | null;
	auditorId: string | null; // FK -> auditors.id
	beschreibung: string | null;
	auditId: string | null; // FK -> audits.id (optionale Verknuepfung)
	createdAt: string; // ISO-DateTime
	updatedAt: string; // ISO-DateTime
}

// ──────────────────────────────────────────────
// Client-State
// ──────────────────────────────────────────────

interface KalenderState {
	ansicht: KalenderAnsicht;
	aktuellesDatum: Date; // Referenzdatum fuer Navigation
	eintraege: CalendarEntryRow[];
	ausgewaehltesDatum: string | null; // ISO-Date des angeklickten Tages
	modalOffen: boolean;
	modalEintrag: Partial<CalendarEntryRow>; // Formular-Daten im Modal
	laedt: boolean;
}

// ──────────────────────────────────────────────
// Hilfsdaten fuer Monatsansicht
// ──────────────────────────────────────────────

interface KalenderTag {
	datum: string; // ISO-Date
	tag: number; // Tagesnummer (1-31)
	istAktuellerMonat: boolean;
	istHeute: boolean;
	eintraege: CalendarEntryRow[];
	hatEintraege: boolean;
}

interface KalenderWoche {
	tage: KalenderTag[]; // Immer 7 Eintraege (Mo-So)
}

// ──────────────────────────────────────────────
// Hilfsdaten fuer Wochenansicht
// ──────────────────────────────────────────────

interface StundenSlot {
	stunde: number; // 0-23
	label: string; // "08:00", "09:00", ...
	eintraege: CalendarEntryRow[];
}

interface WochenansichtTag {
	datum: string;
	wochentag: string; // "Montag", "Dienstag", ...
	slots: StundenSlot[];
}
```

## UI-Beschreibung

### Layout

Die Kalenderseite besteht aus drei Bereichen:

1. **Navigationsleiste** (oben)
2. **Kalender-Grid** (Hauptbereich)
3. **Eintrags-Modal** (Overlay)

### 1. Navigationsleiste

Horizontale Leiste mit folgenden Elementen (von links nach rechts):

- **Zurueck-Button** (`<` / Chevron Left) -- navigiert zum vorherigen Monat/Woche/Tag.
- **Periodenbezeichnung** (zentriert, fett): z.B. _"Maerz 2026"_ (Monatsansicht), _"KW 12 - 16.03. - 22.03.2026"_ (Wochenansicht), _"Mittwoch, 18. Maerz 2026"_ (Tagesansicht).
- **Weiter-Button** (`>` / Chevron Right) -- navigiert zum naechsten Monat/Woche/Tag.
- **Heute-Button** (rechts) -- springt zur aktuellen Periode zurueck.
- **Ansichts-Umschalter** (rechts): 3 Buttons / SegmentedControl (Bits-UI `ToggleGroup`):
  - Monat | Woche | Tag

### 2. Kalender-Grid

#### Monatsansicht

- **7-Spalten-Grid**: `grid-cols-7`.
- **Kopfzeile**: Wochentage (Mo, Di, Mi, Do, Fr, Sa, So) als Labels.
- **Zellen**: Quadratische Zellen (`aspect-square`).
  - Tagesnummer oben links.
  - Tage ausserhalb des aktuellen Monats: muted foreground, reduzierte Deckkraft.
  - Heutiger Tag: Farbiger Kreis um die Tagesnummer (`bg-primary text-primary-foreground rounded-full`).
  - **Tage mit Audit-Eintraegen**: Highlight days with audits using brand color (light background `bg-brand/10`, left border accent `border-l-2 border-brand`).
  - Bei Klick auf eine Zelle: Modal zum Erstellen eines neuen Eintrags oeffnen (Datum vorausgefuellt).
  - Vorhandene Eintraege werden als kleine Pillen/Badges innerhalb der Zelle angezeigt (Titel, ggf. gekuerzt). Bei Klick auf einen Eintrag: Modal zum Bearbeiten oeffnen.

#### Wochenansicht

- **8-Spalten-Layout**: 1 Spalte fuer Uhrzeiten (links), 7 Spalten fuer Mo-So.
- **Stundenslots**: Zeilen fuer jede Stunde (Standard: 07:00-20:00, konfigurierbar).
- Eintraege werden als farbige Bloecke ueber die entsprechenden Stundenslots gelegt.
- Klick auf einen leeren Slot: Modal oeffnen mit vorausgefuelltem Datum und Startzeit.

#### Tagesansicht

- Einzelne Spalte mit Stundenslots (ganzer Tag).
- Detailliertere Darstellung: Jeder Eintrag zeigt Titel, Unternehmen, Auditor, Beschreibung.
- Klick auf leeren Bereich: Neuer Eintrag.

### 3. Eintrags-Modal

Bits-UI `Dialog` mit folgenden Feldern:

| Feld         | Typ            | Hinweise                            |
| ------------ | -------------- | ----------------------------------- |
| Datum        | `<input date>` | Vorausgefuellt mit angeklicktem Tag |
| Titel        | `<input text>` | Pflichtfeld                         |
| Startzeit    | `<input time>` |                                     |
| Endzeit      | `<input time>` | Muss > Startzeit sein               |
| Unternehmen  | `<input text>` |                                     |
| Auditor      | `<Select>`     | Dynamisch aus Auditoren-Tabelle     |
| Beschreibung | `<textarea>`   | 4 Zeilen                            |

**Buttons** am unteren Rand des Modals:

- **Abbrechen** (sekundaer) -- Modal schliessen ohne Speichern.
- **Speichern** (primaer) -- Validierung, dann Server-Call.
- Bei bestehendem Eintrag zusaetzlich: **Loeschen** (destructive variant).

## Interaktionen

### Navigation

1. Klick auf **Zurueck**: `aktuellesDatum` wird um 1 Monat/Woche/Tag zurueckgesetzt (je nach Ansicht).
2. Klick auf **Weiter**: `aktuellesDatum` wird um 1 Monat/Woche/Tag vorgesetzt.
3. Klick auf **Heute**: `aktuellesDatum` wird auf `new Date()` gesetzt.
4. Nach jeder Navigation: Server-Call (`getCalendarEntries`) mit neuem Datumsbereich.

### Ansicht wechseln

1. Klick auf Monat/Woche/Tag im ToggleGroup.
2. `ansicht` wird aktualisiert.
3. Das Grid rendert sich entsprechend um.
4. Eintraege werden ggf. neu geladen (anderer Datumsbereich).

### Neuen Eintrag erstellen

1. Klick auf eine leere Zelle/Slot im Kalender.
2. Modal oeffnet sich mit vorausgefuelltem Datum (und ggf. Startzeit).
3. Benutzer fuellt Felder aus.
4. Klick auf **Speichern**: Client-Validierung -> Server-Call (`createCalendarEntry`).
5. Bei Erfolg: Modal schliesst, Eintrag erscheint im Kalender.

### Eintrag bearbeiten

1. Klick auf einen bestehenden Eintrag (Pill/Block).
2. Modal oeffnet sich mit vorausgefuellten Daten.
3. Benutzer aendert Felder.
4. Klick auf **Speichern**: Server-Call (`updateCalendarEntry`).

### Eintrag loeschen

1. Im Bearbeitungs-Modal: Klick auf **Loeschen**.
2. Bestaetigung per AlertDialog: _"Kalendereintrag '{titel}' wirklich loeschen?"_
3. Bei Bestaetigung: Server-Call (`deleteCalendarEntry`).
4. Eintrag wird aus dem Kalender entfernt.

### Datenladung

- Beim Seitenladen und bei jeder Navigation wird `getCalendarEntries` aufgerufen.
- Parameter: `startDatum` und `endDatum` des sichtbaren Bereichs (ganzer Monat inkl. ueberlappender Tage bei Monatsansicht).
- Server filtert nach `organizationId` (aus Session) und Datumsbereich.

## Abhaengigkeiten

### Intern (Projekt)

| Abhaengigkeit              | Beschreibung                                             |
| -------------------------- | -------------------------------------------------------- |
| `auditors`-Tabelle         | Dropdown fuer Auditor-Auswahl im Modal                   |
| `audits`-Tabelle           | Optionale Verknuepfung von Kalendereintraegen mit Audits |
| better-auth Session        | `organizationId` fuer alle CRUD-Operationen              |
| Drizzle ORM Schema         | Tabellendefinition `calendar_entries`                    |
| Spec 06 (Audit-Verwaltung) | Audits koennen als Kalendereintraege verknuepft werden   |

### Extern (Bibliotheken)

| Paket          | Verwendung                                         |
| -------------- | -------------------------------------------------- |
| SvelteKit      | Routing (`/calendar`), Server-Funktionen           |
| Svelte 5       | Reaktive Zustandsverwaltung (`$state`, `$derived`) |
| Bits-UI        | Dialog, ToggleGroup, Button, Select, AlertDialog   |
| Tailwind CSS 4 | Grid-Layout, responsive Styling                    |
| Drizzle ORM    | SQL-Queries, Schema-Definition                     |
| Turso          | SQLite-Datenbank (libsql)                          |
| better-auth    | Authentifizierung, Session-Management              |
| Bun            | Runtime, Paketmanager                              |
