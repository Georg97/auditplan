# 04 - Modul: Dashboard

## Datenmodell

```typescript
// --- Audit-Status ---

type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
// 'overdue' is computed (frist < today AND status != 'completed'), not a stored status

// --- Massnahmen-Prioritaet ---

type ActionPriority = 'high' | 'medium' | 'low';

// --- Statistik-Karten ---

interface StatCard {
	id: string;
	icon: string; // Lucide icon name
	value: number;
	label: string; // i18n-Schluessel
	href: string; // Zielroute bei Klick
	color: string; // ShadCN chart color token (chart-1 through chart-5)
}

// --- Status-Verteilung ---

interface StatusDistribution {
	label: string; // z.B. "Geplant", "In Bearbeitung", "Abgeschlossen", "Ueberfaellig (berechnet)"
	percentage: number;
	color: string; // semantic status color (success, warning, info, destructive)
	count: number;
	isComputed?: boolean; // true for 'overdue' (derived from frist < today AND status != 'completed')
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

// --- Paginiertes Ergebnis ---

interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pages: number;
}

// --- Dashboard-Statistiken (server-seitig aggregiert via SQL COUNT/GROUP BY) ---

interface DashboardStats {
	totalAudits: number; // SELECT COUNT(*) FROM audits
	totalAuditors: number; // SELECT COUNT(*) FROM auditors
	planned: number; // SELECT COUNT(*) FROM audits WHERE status = 'planned'
	completed: number; // SELECT COUNT(*) FROM audits WHERE status = 'completed'
	inProgress: number; // SELECT COUNT(*) FROM audits WHERE status = 'in_progress'
	openActions: number; // SELECT COUNT(*) FROM actions WHERE status = 'open'
	overdueAudits: number; // Computed: SELECT COUNT(*) FROM audits WHERE startDatum < NOW() AND status NOT IN ('completed', 'cancelled')
	overdueActions: number; // SELECT COUNT(*) FROM actions WHERE dueDate < NOW() AND status != 'completed'
	upcomingAudits: number; // SELECT COUNT(*) FROM audits WHERE startDatum BETWEEN NOW() AND NOW()+30d
}

// --- Dashboard-Daten (Gesamtpaket) ---

interface DashboardData {
	statusDistribution: StatusDistribution[]; // Berechnet aus den Stats-Counts, NICHT durch Laden aller Audits
	stats: DashboardStats;
	upcomingAudits: AuditListItem[]; // Limitiert auf max. N Eintraege via SQL LIMIT
	criticalActions: CriticalAction[]; // Limitiert auf max. N Eintraege via SQL LIMIT
}

// --- Remote Functions ---
// WICHTIG: Alle Statistiken werden server-seitig via SQL COUNT/GROUP BY aggregiert.
// Es werden NICHT alle Datensaetze geladen und clientseitig gezaehlt.

interface DashboardRemoteFunctions {
	// Laedt vorberechnete Counts + limitierte Listen in einem einzigen Server-Call
	getDashboardStats: () => Promise<DashboardData>;

	// Paginierte, gefilterte Audit-Liste fuer den Audit-Bereich
	getFilteredAudits: (status: AuditStatus | 'all', page: number, limit: number) => Promise<PaginatedResult<AuditListItem>>;

	// Naechste anstehende Audits (chronologisch, limitiert)
	getUpcomingAudits: (limit: number) => Promise<AuditListItem[]>;

	// Kritische/ueberfaellige Massnahmen (sortiert nach Dringlichkeit, limitiert)
	getCriticalActions: (limit: number) => Promise<CriticalAction[]>;
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

4 Karten in einer Reihe (4-column grid, gap-4):

| Status                   | Farbe             | Beispiel |
| ------------------------ | ----------------- | -------- |
| Geplant                  | info color        | "30%"    |
| In Bearbeitung           | warning color     | "25%"    |
| Abgeschlossen            | success color     | "35%"    |
| Ueberfaellig (berechnet) | destructive color | "10%"    |

Jede Karte:

| Eigenschaft   | Wert                                   |
| ------------- | -------------------------------------- |
| Hintergrund   | Jeweilige semantische Farbe            |
| Textfarbe     | Weiss (primary-foreground)             |
| Border-Radius | rounded-lg                             |
| Padding       | standard card padding                  |
| Prozentwert   | large display text, bold               |
| Label         | small text, slightly transparent white |
| Anzahl        | base text, darunter                    |

### Statistik-Karten (8 Karten)

Responsive card grid (auto-fill columns, gap-4)

Die 8 Karten:

| #   | Icon (Lucide)    | Label                       | Farbe                      |
| --- | ---------------- | --------------------------- | -------------------------- |
| 1   | `bar-chart-3`    | Gesamte Audits              | chart-1 color              |
| 2   | `users`          | Auditoren                   | chart-2 color              |
| 3   | `calendar`       | Geplant                     | info color                 |
| 4   | `check-circle`   | Abgeschlossen               | success color              |
| 5   | `refresh-cw`     | In Bearbeitung              | warning color              |
| 6   | `clipboard-list` | Offene Massnahmen           | destructive color          |
| 7   | `alert-triangle` | Ueberfaellige Massnahmen    | destructive color (darker) |
| 8   | `bell`           | Anstehende Audits (30 Tage) | info color                 |

Jede Statistik-Karte:

| Eigenschaft   | Wert                                  |
| ------------- | ------------------------------------- |
| Hintergrund   | ShadCN Card (`bg-card`)               |
| Border-Radius | rounded-lg                            |
| Box-Shadow    | card shadow                           |
| Padding       | standard card padding                 |
| Cursor        | Pointer                               |
| Hover         | subtle hover lift, shadow intensified |
| Icon          | large icon size, oben                 |
| Wert          | large text, bold, accent color        |
| Label         | small text, muted foreground          |

### Audit-Liste mit Filtern

#### Filter-Buttons

Horizontale Reihe, gap-2:

| Button         | Filter-Wert     |
| -------------- | --------------- |
| Alle           | `"alle"`        |
| Geplant        | `"planned"`     |
| In Bearbeitung | `"in_progress"` |
| Abgeschlossen  | `"completed"`   |

Aktiver Filter: primary button variant (brand background, white text).
Inaktiver Filter: outline button variant.

#### Audit-Eintraege

Jeder Eintrag als Zeile mit:

- **Titel** (bold)
- **ISO-Norm** — use ShadCN Badge with appropriate variant for each standard
- **Auditor** (Name)
- **Datum** (formatiert)
- **Status** — use ShadCN Badge with appropriate variant for each status
- **Abteilung**

### Unterer Bereich (2-spaltig)

2-column grid, gap-6 (stacks to 1 column on mobile)

#### Naechste anstehende Audits (links)

- Chronologisch sortiert (naechstes Datum zuerst)
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, Datum, Auditor, ISO-Norm
- Datumsanzeige relativ: "in 3 Tagen", "in 2 Wochen" (via `@internationalized/date`)

#### Kritische Massnahmen (rechts)

- Sortiert nach: Ueberfaellige zuerst, dann hohe Prioritaet
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, zugehoeriges Audit, Faelligkeitsdatum, Verantwortlicher
- Ueberfaellige: destructive background accent, Anzeige "X Tage ueberfaellig"
- Hohe Prioritaet: warning color accent

## Interaktionen

### Daten laden

1. Beim Seitenaufruf wird `getDashboardStats()` aufgerufen (eine Remote Function, die alle Daten aggregiert)
2. Server-seitige Aggregation via SQL COUNT/GROUP BY — es werden NICHT alle Datensaetze geladen und clientseitig gezaehlt
3. Waehrend des Ladens: Skeleton-Loader fuer alle Bereiche
4. Daten werden in `$state`-Variablen gespeichert
5. Alle Werte werden bei jedem Seitenaufruf neu vom Server geladen (kein Caching)

### Statistik-Karten-Klick

1. Klick auf eine Statistik-Karte -> Navigation zur relevanten Detailansicht
   - "Gesamte Audits" -> `/search-manage` (alle Audits)
   - "Auditoren" -> `/auditor-management`
   - "Geplant" -> `/search-manage?status=planned`
   - "Abgeschlossen" -> `/search-manage?status=completed`
   - "In Bearbeitung" -> `/search-manage?status=in_progress`
   - "Offene Massnahmen" -> `/action-plan?filter=offen`
   - "Ueberfaellige Massnahmen" -> `/action-plan?filter=ueberfaellig`
   - "Anstehende Audits" -> `/calendar`

### Audit-Filter

1. Klick auf einen Filter-Button -> `activeFilter` State wird aktualisiert
2. `getFilteredAudits(status, page, limit)` wird als Remote Function aufgerufen (paginiert)
3. Die Audit-Liste wird mit den gefilterten Ergebnissen aktualisiert
4. Der aktive Button erhaelt den primary button Stil
5. Pagination-Buttons ermoeglichen das Blaettern durch die Ergebnisse

### Responsive Verhalten

- Status-Verteilung: `4 -> 2 -> 1` Spalten bei kleineren Bildschirmen
- Statistik-Karten: Automatisches Umfliessen durch responsive card grid
- Unterer Bereich: `2 -> 1` Spalten unter `md` breakpoint

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema, i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **ShadCN:** Badge-Komponenten fuer Status-Anzeigen
- **@internationalized/date:** Relative Datumsformatierung ("in 3 Tagen"), Berechnung der 30-Tage-Grenze
- **Verlinkt zu:** Auditoren-Modul (Spec 05), Suchen-Modul, Massnahmenplan-Modul, Kalender-Modul
