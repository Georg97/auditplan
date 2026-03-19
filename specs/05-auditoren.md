# 05 - Modul: Auditorenverwaltung

## Datenmodell

```typescript
// --- Auditor (Datenbanktabelle) ---

interface Auditor {
	id: string;
	organizationId: string; // Zuordnung zur Organisation

	// Persoenliche Daten
	name: string; // Pflichtfeld
	title: string | null;
	email: string; // Pflichtfeld, E-Mail-Validierung
	phone: string | null;
	mobile: string | null;
	company: string | null;

	// Adresse
	street: string | null;
	zipCode: string | null;
	city: string | null;
	country: string; // Standard: "Deutschland"

	// Qualifikationen
	iso9001: boolean; // ISO 9001 Qualitaetsmanagement
	iso14001: boolean; // ISO 14001 Umweltmanagement
	iso45001: boolean; // ISO 45001 Arbeitsschutz
	iso50001: boolean; // ISO 50001 Energiemanagement
	iso27001: boolean; // ISO 27001 Informationssicherheit
	certifications: string | null; // Freitext, weitere Zertifizierungen
	languages: string | null; // Freitext, Sprachen
	experienceYears: number | null; // Berufserfahrung in Jahren

	// Verfuegbarkeit
	dailyRate: number | null; // Tagessatz in EUR (Schrittweite 50)
	availability: 'full_time' | 'part_time' | 'by_arrangement' | 'limited' | null;

	// Notizen
	notes: string | null;

	createdAt: Date;
	updatedAt: Date;
}

// --- Formular-State ---

interface AuditorFormState {
	name: string;
	title: string;
	email: string;
	phone: string;
	mobile: string;
	company: string;
	street: string;
	zipCode: string;
	city: string;
	country: string;
	iso9001: boolean;
	iso14001: boolean;
	iso45001: boolean;
	iso50001: boolean;
	iso27001: boolean;
	certifications: string;
	languages: string;
	experienceYears: number | null;
	dailyRate: number | null;
	availability: string;
	notes: string;
}

// --- Validierungsfehler ---

interface AuditorValidationErrors {
	name?: string;
	email?: string;
	[key: string]: string | undefined;
}

// --- Paginiertes Ergebnis ---

interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pages: number;
}

// --- Remote Functions ---

interface AuditorRemoteFunctions {
	// Paginierte Liste aller Auditoren (fuer initiales Laden der Grid-Ansicht)
	getAuditors: (page: number, limit: number) => Promise<PaginatedResult<Auditor>>;

	getAuditor: (id: string) => Promise<Auditor | null>;
	createAuditor: (data: Omit<Auditor, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<Auditor>;
	updateAuditor: (id: string, data: Partial<Auditor>) => Promise<Auditor>;
	deleteAuditor: (id: string) => Promise<void>;

	// Server-seitige Suche via SQL LIKE/WHERE — NICHT clientseitige Filterung
	searchAuditors: (query: string, page: number, limit: number) => Promise<PaginatedResult<Auditor>>;
}
```

## UI-Beschreibung

### Teil A: Auditorenverwaltung (Grid-Ansicht)

**Route:** `src/routes/(app)/auditor-management/+page.svelte`
**Remote Functions:** `src/routes/(app)/auditor-management/auditors.remote.ts`

#### Seitenaufbau

Die Seite zeigt ein Suchfeld und darunter ein responsives Grid von Auditor-Karten.

#### Suchfeld

- Placeholder: "Suche nach Name, Firma oder Spezialisierung..."
- Filtert in Echtzeit (Debounce 300ms) die angezeigten Auditor-Karten
- Suche erfolgt server-seitig via SQL LIKE/WHERE auf `name`, `company` und Qualifikationsfeldern
- Ergebnisse werden paginiert zurueckgegeben

#### Auditor-Karten

Jede Karte zeigt:

- **Name** und **Titel**
- **Kontaktdaten:** E-Mail, Telefon, Unternehmen
- **ISO-Qualifikationen** als Badges (ISO 9001, 14001, 45001, 50001, 27001)
- **Erfahrung:** "X Jahre" Anzeige
- **Aktionen:** Bearbeiten und Loeschen

#### Leerer Zustand

Hinweis: "Keine Auditoren vorhanden. Fuegen Sie Ihren ersten Auditor hinzu." mit Button "Auditor hinzufuegen" der zu `/add-auditor` navigiert.

---

### Teil B: Auditor hinzufuegen / bearbeiten (Formular)

**Route:** `src/routes/(app)/add-auditor/+page.svelte`
**Remote Functions:** `src/routes/(app)/add-auditor/auditor-form.remote.ts`

Im Bearbeitungsmodus wird die Route mit Query-Parameter aufgerufen: `/add-auditor?edit={id}`

#### Seitenaufbau

Seitentitel: "Auditor hinzufuegen" (oder "Auditor bearbeiten" im Edit-Modus). Das Formular ist in fuenf Abschnitte gegliedert:

#### Abschnitt 1: Persoenliche Daten

| Feld        | Typ     | Pflicht | Validierung   | Platzhalter           |
| ----------- | ------- | ------- | ------------- | --------------------- |
| Name        | `text`  | Ja      | Nicht leer    | "Vor- und Nachname"   |
| Titel       | `text`  | Nein    | -             | "z.B. Lead Auditor"   |
| E-Mail      | `email` | Ja      | E-Mail-Format | "auditor@example.com" |
| Telefon     | `tel`   | Nein    | -             | "+49 123 456789"      |
| Mobil       | `tel`   | Nein    | -             | "+49 170 1234567"     |
| Unternehmen | `text`  | Nein    | -             | "Firmenname"          |

#### Abschnitt 2: Adresse

| Feld    | Typ    | Pflicht | Standard      |
| ------- | ------ | ------- | ------------- |
| Strasse | `text` | Nein    | -             |
| PLZ     | `text` | Nein    | -             |
| Ort     | `text` | Nein    | -             |
| Land    | `text` | Nein    | "Deutschland" |

#### Abschnitt 3: Qualifikationen

**ISO-Checkboxen** (ShadCN `Checkbox`):

| Checkbox   | Label                              |
| ---------- | ---------------------------------- |
| `iso9001`  | ISO 9001 - Qualitaetsmanagement    |
| `iso14001` | ISO 14001 - Umweltmanagement       |
| `iso45001` | ISO 45001 - Arbeitsschutz          |
| `iso50001` | ISO 50001 - Energiemanagement      |
| `iso27001` | ISO 27001 - Informationssicherheit |

**Weitere Felder:**

| Feld             | Typ        | Beschreibung                                      |
| ---------------- | ---------- | ------------------------------------------------- |
| Zertifizierungen | `textarea` | Freitext fuer weitere Zertifizierungen            |
| Sprachen         | `text`     | Kommagetrennte Sprachen, z.B. "Deutsch, Englisch" |
| Berufserfahrung  | `number`   | Ganzzahl, Jahre, `min="0"`, `max="50"`            |

#### Abschnitt 4: Verfuegbarkeit

| Feld           | Typ      | Details                                                         |
| -------------- | -------- | --------------------------------------------------------------- |
| Tagessatz      | `number` | `step="50"`, `min="0"`, Suffix: "EUR / Tag"                     |
| Verfuegbarkeit | `select` | Optionen: Vollzeit, Teilzeit, Nach Vereinbarung, Eingeschraenkt |

Das Select-Feld wird mit einer ShadCN `Select`-Komponente umgesetzt.

#### Abschnitt 5: Notizen

| Feld    | Typ        | Details                                              |
| ------- | ---------- | ---------------------------------------------------- |
| Notizen | `textarea` | Platzhalter "Zusaetzliche Anmerkungen...", resizable |

#### Aktions-Buttons

- **Speichern** — Formular absenden
- **Zuruecksetzen** — Formular leeren bzw. auf Anfangswerte zuruecksetzen

## Interaktionen

### Grid-Ansicht: Daten laden

1. Beim Seitenaufruf wird `getAuditors(page, limit)` aufgerufen (paginiert)
2. Skeleton-Loader waehrend des Ladens
3. Ergebnis wird in `$state`-Variablen gespeichert (items + Pagination-Metadaten)
4. Die Karten werden reaktiv gerendert
5. Pagination-Buttons ermoeglichen das Blaettern durch die Ergebnisse

### Grid-Ansicht: Suche

1. Benutzer tippt in das Suchfeld
2. Debounce von 300ms
3. Server-seitige Suche: `searchAuditors(query, page, limit)` wird aufgerufen — SQL LIKE/WHERE auf `name`, `company`, Qualifikationsfeldern
4. Die Grid-Ansicht aktualisiert sich mit den paginierten Ergebnissen vom Server

### Grid-Ansicht: Bearbeiten

1. Klick auf "Bearbeiten" in einer Auditor-Karte
2. Navigation zu `/add-auditor?edit={id}`
3. Die Formular-Seite erkennt den `edit`-Parameter und laedt den Auditor per `getAuditor(id)`

### Grid-Ansicht: Loeschen

1. Klick auf "Loeschen" -> Bestaetigungsdialog (ShadCN `AlertDialog`)
2. Dialog-Text: "Moechten Sie den Auditor '[Name]' wirklich loeschen?"
3. Bei Bestaetigung: `deleteAuditor(id)` wird aufgerufen
4. Erfolg: Auditor wird aus der lokalen Liste entfernt, Toast-Benachrichtigung
5. Fehler: Fehlermeldung als Toast

### Formular: Laden im Bearbeitungsmodus

1. URL enthaelt `?edit={id}` -> Bearbeitungsmodus
2. `getAuditor(id)` wird aufgerufen
3. Formulardaten werden mit den geladenen Werten befuellt
4. Seitentitel aendert sich zu "Auditor bearbeiten"
5. Kein `edit`-Parameter -> Leeres Formular, Titel "Auditor hinzufuegen"

### Formular: Validierung

1. Clientseitige Validierung beim Absenden:
   - `name`: Darf nicht leer sein -> Fehler: "Name ist erforderlich"
   - `email`: Muss gueltiges E-Mail-Format haben -> Fehler: "Bitte geben Sie eine gueltige E-Mail-Adresse ein"
2. Fehlerhafte Felder werden visuell markiert mit Fehlermeldung
3. Erstes fehlerhaftes Feld erhaelt automatisch den Fokus

### Formular: Speichern

1. Klick auf "Speichern" -> Validierung wird ausgefuehrt
2. Bei Erfolg:
   - Neuer Auditor: `createAuditor(data)` wird aufgerufen
   - Bestehender Auditor: `updateAuditor(id, data)` wird aufgerufen
3. Nach erfolgreichem Speichern:
   - Toast-Benachrichtigung: "Auditor erfolgreich gespeichert"
   - Navigation zurueck zu `/auditor-management`
4. Bei Fehler: Toast-Benachrichtigung mit Fehlermeldung

### Formular: Zuruecksetzen

1. Klick auf "Zuruecksetzen"
2. Im Erstellungsmodus: Alle Felder werden geleert (Standardwerte)
3. Im Bearbeitungsmodus: Felder werden auf die urspruenglich geladenen Werte zurueckgesetzt
4. Validierungsfehler werden entfernt

## Abhaengigkeiten

- **Spec 01 (Architektur):** Remote Functions, Drizzle-Schema (`auditors`-Tabelle), i18n
- **Spec 02 (Layout):** Seite wird innerhalb des App-Layouts gerendert
- **Spec 04 (Dashboard):** Dashboard zeigt Auditoren-Anzahl als Statistik-Karte
- **ShadCN:** `Checkbox`, `Select`, `AlertDialog`, `Input`-Komponenten
- **Drizzle-Schema:** `auditors`-Tabelle mit allen oben definierten Feldern
- **SvelteKit:** `$page.url.searchParams` fuer den `edit`-Query-Parameter
