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
	value: number;
	label: string; // i18n-Schluessel
	href: string; // Zielroute bei Klick
}

// --- Status-Verteilung ---

interface StatusDistribution {
	label: string; // z.B. "Geplant", "In Bearbeitung", "Abgeschlossen", "Ueberfaellig (berechnet)"
	percentage: number;
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

Die Dashboard-Seite besteht aus folgenden Bereichen:

1. **Status-Verteilung** — Vier Karten zeigen die prozentuale Verteilung der Audit-Status (Geplant, In Bearbeitung, Abgeschlossen, Ueberfaellig)
2. **Statistik-Karten** — Responsive Grid mit 8 klickbaren Statistik-Karten
3. **Audit-Liste mit Filtern** — Filterbare, paginierte Audit-Liste
4. **Unterer Bereich** — Zwei Bereiche nebeneinander: Naechste anstehende Audits und Kritische Massnahmen

### Status-Verteilung

Vier Karten zeigen jeweils:

- Prozentwert
- Status-Label
- Anzahl

Dargestellte Status:

| Status                   | Bedeutung                               |
| ------------------------ | --------------------------------------- |
| Geplant                  | Audits mit Status `planned`             |
| In Bearbeitung           | Audits mit Status `in_progress`         |
| Abgeschlossen            | Audits mit Status `completed`           |
| Ueberfaellig (berechnet) | Frist < heute UND Status != `completed` |

### Statistik-Karten

8 klickbare Karten mit jeweils einem Zahlenwert und Label:

| #   | Label                       | Navigation bei Klick                |
| --- | --------------------------- | ----------------------------------- |
| 1   | Gesamte Audits              | `/search-manage` (alle Audits)      |
| 2   | Auditoren                   | `/auditor-management`               |
| 3   | Geplant                     | `/search-manage?status=planned`     |
| 4   | Abgeschlossen               | `/search-manage?status=completed`   |
| 5   | In Bearbeitung              | `/search-manage?status=in_progress` |
| 6   | Offene Massnahmen           | `/action-plan?filter=offen`         |
| 7   | Ueberfaellige Massnahmen    | `/action-plan?filter=ueberfaellig`  |
| 8   | Anstehende Audits (30 Tage) | `/calendar`                         |

### Audit-Liste mit Filtern

#### Filter-Buttons

| Button         | Filter-Wert     |
| -------------- | --------------- |
| Alle           | `"alle"`        |
| Geplant        | `"planned"`     |
| In Bearbeitung | `"in_progress"` |
| Abgeschlossen  | `"completed"`   |

Der aktive Filter ist visuell hervorgehoben.

#### Audit-Eintraege

Jeder Eintrag zeigt:

- **Titel**
- **ISO-Norm** (als Badge)
- **Auditor** (Name)
- **Datum** (formatiert)
- **Status** (als Badge)
- **Abteilung**

### Unterer Bereich

Zwei Bereiche nebeneinander (auf Mobil untereinander):

#### Naechste anstehende Audits

- Chronologisch sortiert (naechstes Datum zuerst)
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, Datum, Auditor, ISO-Norm
- Relative Datumsanzeige: "in 3 Tagen", "in 2 Wochen" (via `@internationalized/date`)

#### Kritische Massnahmen

- Sortiert nach: Ueberfaellige zuerst, dann hohe Prioritaet
- Maximal 5 Eintraege
- Jeder Eintrag: Titel, zugehoeriges Audit, Faelligkeitsdatum, Verantwortlicher
- Ueberfaellige Eintraege: Anzeige "X Tage ueberfaellig"
- Hohe Prioritaet wird visuell hervorgehoben

## Interaktionen

### Daten laden

1. Beim Seitenaufruf wird `getDashboardStats()` aufgerufen (eine Remote Function, die alle Daten aggregiert)
2. Server-seitige Aggregation via SQL COUNT/GROUP BY — es werden NICHT alle Datensaetze geladen und clientseitig gezaehlt
3. Waehrend des Ladens: Skeleton-Loader fuer alle Bereiche
4. Daten werden in `$state`-Variablen gespeichert
5. Alle Werte werden bei jedem Seitenaufruf neu vom Server geladen (kein Caching)

### Statistik-Karten-Klick

Klick auf eine Statistik-Karte navigiert zur relevanten Detailansicht (siehe Navigationstabelle oben).

### Audit-Filter

1. Klick auf einen Filter-Button -> `activeFilter` State wird aktualisiert
2. `getFilteredAudits(status, page, limit)` wird als Remote Function aufgerufen (paginiert)
3. Die Audit-Liste wird mit den gefilterten Ergebnissen aktualisiert
4. Pagination-Buttons ermoeglichen das Blaettern durch die Ergebnisse

### Responsive Verhalten

- Alle Bereiche passen sich an die Bildschirmbreite an (mehrere Spalten auf Desktop, weniger auf Tablet, eine Spalte auf Mobil)

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema, i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **ShadCN:** Badge-Komponenten fuer Status-Anzeigen
- **@internationalized/date:** Relative Datumsformatierung ("in 3 Tagen"), Berechnung der 30-Tage-Grenze
- **Verlinkt zu:** Auditoren-Modul (Spec 05), Suchen-Modul, Massnahmenplan-Modul, Kalender-Modul
