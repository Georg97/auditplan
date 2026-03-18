# 04 - Modul: Dashboard

## Datenmodell

```typescript
// --- Audit-Status ---

type AuditStatus = 'geplant' | 'in_bearbeitung' | 'abgeschlossen' | 'ueberfaellig';

// --- Massnahmen-Prioritaet ---

type ActionPriority = 'hoch' | 'mittel' | 'niedrig';

// --- Statistik-Karten ---

interface StatCard {
	id: string;
	icon: string; // Emoji
	value: number;
	label: string; // i18n-Schluessel
	href: string; // Zielroute bei Klick
	color: string; // Akzentfarbe
}

// --- Status-Verteilung ---

interface StatusDistribution {
	label: string; // z.B. "Aktuell", "Faellig", "In Pruefung", "Ueberfaellig"
	percentage: number;
	color: string; // Hintergrundfarbe
	count: number;
}

// --- Audit (fuer Liste) ---

interface AuditListItem {
	id: string;
	title: string;
	isoStandard: string; // z.B. "ISO 9001"
	auditor: string;
	date: Date;
	status: AuditStatus;
	department: string;
}

// --- Kritische Massnahme ---

interface CriticalAction {
	id: string;
	title: string;
	auditTitle: string;
	dueDate: Date;
	priority: ActionPriority;
	responsible: string;
	daysOverdue: number;
}

// --- Dashboard-Daten (Gesamtpaket) ---

interface DashboardData {
	statusDistribution: StatusDistribution[];
	stats: {
		totalAudits: number;
		totalAuditors: number;
		planned: number;
		completed: number;
		inProgress: number;
		openActions: number;
		overdueActions: number;
		upcomingAudits: number; // naechste 30 Tage
	};
	recentAudits: AuditListItem[];
	upcomingAudits: AuditListItem[];
	criticalActions: CriticalAction[];
}

// --- Remote Functions ---

interface DashboardRemoteFunctions {
	getDashboardData: () => Promise<DashboardData>;
	getFilteredAudits: (status: AuditStatus | 'alle') => Promise<AuditListItem[]>;
}
```

## UI-Beschreibung

**Route:** `src/routes/(app)/dashboard/+page.svelte`
**Remote Functions:** `src/routes/(app)/dashboard/dashboard.remote.ts`

### Seitenaufbau

```
+------------------------------------------------------+
|  Seitentitel: "Dashboard"                            |
+------------------------------------------------------+
|                                                      |
|  Status-Verteilung (4 Karten)                        |
|  [Aktuell 45%] [Faellig 20%] [Pruefung 25%] [Ueberf 10%] |
|                                                      |
+------------------------------------------------------+
|                                                      |
|  Statistik-Karten (2x4 Grid)                        |
|  [Gesamt] [Auditoren] [Geplant] [Abgeschl.]         |
|  [In Bearb.] [Offen] [Ueberfaellig] [Anstehend]     |
|                                                      |
+------------------------------------------------------+
|                                                      |
|  Audit-Liste mit Filtern                             |
|  [Alle] [Geplant] [In Bearb.] [Abgeschlossen]       |
|  +------------------------------------------------+  |
|  | Audit-Eintraege ...                             |  |
|  +------------------------------------------------+  |
|                                                      |
+------------------------------------------------------+
|                                                      |
|  [Naechste Audits]        [Kritische Massnahmen]     |
|                                                      |
+------------------------------------------------------+
```

### Status-Verteilung (oberer Bereich)

4 Karten in einer Reihe (`display: grid`, `grid-template-columns: repeat(4, 1fr)`, `gap: 1rem`):

| Status       | Farbe              | Beispiel |
| ------------ | ------------------ | -------- |
| Aktuell      | `#38a169` (Gruen)  | "45%"    |
| Faellig      | `#dd6b20` (Orange) | "20%"    |
| In Pruefung  | `#3182ce` (Blau)   | "25%"    |
| Ueberfaellig | `#e53e3e` (Rot)    | "10%"    |

Jede Karte:

| Eigenschaft   | Wert                                             |
| ------------- | ------------------------------------------------ |
| Hintergrund   | Jeweilige Farbe                                  |
| Textfarbe     | Weiss                                            |
| Border-Radius | `12px`                                           |
| Padding       | `1.5rem`                                         |
| Prozentwert   | Schriftgroesse `2.5rem`, Fett                    |
| Label         | Schriftgroesse `0.9rem`, `rgba(255,255,255,0.9)` |
| Anzahl        | Schriftgroesse `1rem`, darunter                  |

### Statistik-Karten (8 Karten)

Responsive Grid: `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`, `gap: 1rem`

Die 8 Karten:

| #   | Icon | Label                       | Farbe     |
| --- | ---- | --------------------------- | --------- |
| 1   | "📊" | Gesamte Audits              | `#667eea` |
| 2   | "👥" | Auditoren                   | `#764ba2` |
| 3   | "📅" | Geplant                     | `#3182ce` |
| 4   | "✅" | Abgeschlossen               | `#38a169` |
| 5   | "🔄" | In Bearbeitung              | `#dd6b20` |
| 6   | "📋" | Offene Massnahmen           | `#e53e3e` |
| 7   | "⚠️" | Ueberfaellige Massnahmen    | `#c53030` |
| 8   | "🔔" | Anstehende Audits (30 Tage) | `#2b6cb0` |

Jede Statistik-Karte:

| Eigenschaft   | Wert                                      |
| ------------- | ----------------------------------------- |
| Hintergrund   | Weiss                                     |
| Border-Radius | `12px`                                    |
| Box-Shadow    | `0 2px 10px rgba(0, 0, 0, 0.1)`           |
| Padding       | `1.5rem`                                  |
| Cursor        | Pointer                                   |
| Hover         | `translateY(-3px)`, Shadow verstaerkt     |
| Icon          | Schriftgroesse `2rem`, oben               |
| Wert          | Schriftgroesse `2rem`, Fett, Akzentfarbe  |
| Label         | Schriftgroesse `0.85rem`, Farbe `#718096` |

### Audit-Liste mit Filtern

#### Filter-Buttons

Horizontale Reihe, `gap: 0.5rem`:

| Button         | Filter-Wert        |
| -------------- | ------------------ |
| Alle           | `"alle"`           |
| Geplant        | `"geplant"`        |
| In Bearbeitung | `"in_bearbeitung"` |
| Abgeschlossen  | `"abgeschlossen"`  |

Aktiver Filter: Gradient-Hintergrund (`#667eea` -> `#764ba2`), weisser Text.
Inaktiver Filter: Weisser Hintergrund, grauer Rand, dunkler Text.

#### Audit-Eintraege

Jeder Eintrag als Zeile mit:

- **Titel** (fett)
- **ISO-Norm** (Badge, z.B. "ISO 9001")
- **Auditor** (Name)
- **Datum** (formatiert)
- **Status** (farbiger Badge)
- **Abteilung**

### Unterer Bereich (2-spaltig)

`display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 1.5rem`

#### Naechste anstehende Audits (links)

- Chronologisch sortiert (naechstes Datum zuerst)
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, Datum, Auditor, ISO-Norm
- Datumsanzeige relativ: "in 3 Tagen", "in 2 Wochen" (via `date-fns`)

#### Kritische Massnahmen (rechts)

- Sortiert nach: Ueberfaellige zuerst, dann hohe Prioritaet
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, zugehoeriges Audit, Faelligkeitsdatum, Verantwortlicher
- Ueberfaellige: Roter Hintergrund-Akzent, Anzeige "X Tage ueberfaellig"
- Hohe Prioritaet: Orangefarbener Akzent

## Interaktionen

### Daten laden

1. Beim Seitenaufruf wird `getDashboardData()` aufgerufen (eine Remote Function, die alle Daten aggregiert)
2. Waehrend des Ladens: Skeleton-Loader fuer alle Bereiche
3. Daten werden in `$state`-Variablen gespeichert
4. Alle Werte werden bei jedem Seitenaufruf neu vom Server geladen (kein Caching)

### Statistik-Karten-Klick

1. Klick auf eine Statistik-Karte -> Navigation zur relevanten Detailansicht
   - "Gesamte Audits" -> `/suchen` (alle Audits)
   - "Auditoren" -> `/auditoren`
   - "Geplant" -> `/suchen?status=geplant`
   - "Abgeschlossen" -> `/suchen?status=abgeschlossen`
   - "In Bearbeitung" -> `/suchen?status=in_bearbeitung`
   - "Offene Massnahmen" -> `/massnahmenplan?filter=offen`
   - "Ueberfaellige Massnahmen" -> `/massnahmenplan?filter=ueberfaellig`
   - "Anstehende Audits" -> `/kalender`

### Audit-Filter

1. Klick auf einen Filter-Button -> `activeFilter` State wird aktualisiert
2. `getFilteredAudits(status)` wird als Remote Function aufgerufen
3. Die Audit-Liste wird mit den gefilterten Ergebnissen aktualisiert
4. Der aktive Button erhaelt den Gradient-Stil

### Responsive Verhalten

- Status-Verteilung: `4 -> 2 -> 1` Spalten bei kleineren Bildschirmen
- Statistik-Karten: Automatisches Umfliessen durch `auto-fill` + `minmax(200px, 1fr)`
- Unterer Bereich: `2 -> 1` Spalten unter `768px`

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema, i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **Bits UI:** Badge-Komponenten fuer Status-Anzeigen
- **date-fns:** Relative Datumsformatierung ("in 3 Tagen"), Berechnung der 30-Tage-Grenze
- **Verlinkt zu:** Auditoren-Modul (Spec 05), Suchen-Modul, Massnahmenplan-Modul, Kalender-Modul
