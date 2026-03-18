# 11 - Berichte, Auditfragen & Massnahmenplan

## Datenmodell

```typescript
// --- Berichtsgenerator (§12) ---

interface AuditReport {
	id: string;
	organizationId: string;
	auditId: string; // Referenz auf gespeichertes Audit
	feststellungen: string; // Textarea, 4 Zeilen
	empfehlungen: string; // Textarea, 4 Zeilen
	fazit: string; // Textarea, 3 Zeilen
	generatedHtml: string; // Generierter Bericht als HTML
	createdAt: Date;
	updatedAt: Date;
}

interface ReportFormData {
	selectedAuditId: string; // Required, dynamischer Select aus gespeicherten Audits
	feststellungen: string;
	empfehlungen: string;
	fazit: string;
}

// --- Auditfragen & Dokumente (§14) ---

interface AuditQuestionsForm {
	firmenname: string;
	auditdatum: string; // ISO-Datum
	uhrzeitVon: string; // HH:mm
	uhrzeitBis: string; // HH:mm
	abteilung: string; // Select, 43 Abteilungen
	norm: AuditNorm; // Select
	normkapitel: string; // Dynamisch basierend auf Norm
}

type AuditNorm = 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'ISO 50001' | 'ISO 27001';

interface AuditQuestion {
	id: number; // Laufende Nummer
	frage: string;
	normRef: string; // Normkapitel-Referenz
}

interface AuditDocument {
	id: number;
	name: string;
	beschreibung?: string;
}

interface SavedAuditQuestions {
	id: string;
	organizationId: string;
	formData: AuditQuestionsForm;
	questions: AuditQuestion[];
	documents: AuditDocument[];
	createdAt: Date;
	updatedAt: Date;
}

// --- Massnahmenplan (§15) ---

// Display text comes from i18n
type Feststellungsart = 'major_nonconformity' | 'minor_nonconformity' | 'recommendation' | 'improvement_potential' | 'positive_finding' | 'observation' | 'note';

// Display text comes from i18n
type MassnahmenStatus = 'open' | 'in_progress' | 'implemented' | 'verified' | 'completed';

// Display text comes from i18n
type Audittyp = 'internal' | 'external' | 'supplier' | 'process_audit' | 'system_audit' | 'follow_up_audit';

// Display text comes from i18n
type Prioritaet = 'high' | 'medium' | 'low';

// Display text comes from i18n
type MassnahmenNorm = 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'ISO 50001' | 'ISO 27001' | 'other' | 'all';

interface Massnahme {
	id: string;
	organizationId: string;
	feststellungsbeschreibung: string; // Textarea
	feststellungsart: Feststellungsart; // Select, farbcodiert
	geplanterMassnahme: string; // Textarea
	status: MassnahmenStatus; // Select
	verantwortlicher: string; // Dynamisch
	prioritaet: Prioritaet;
	frist: string; // ISO-Datum
	abschlussdatum: string | null; // ISO-Datum
	norm: MassnahmenNorm; // Select
	nachweiseNotizen: string; // Textarea
	audittyp: Audittyp;
	createdAt: Date;
	updatedAt: Date;
}

interface MassnahmenFilter {
	feststellungsart: Feststellungsart | 'all';
	status: MassnahmenStatus | 'all';
	audittyp: Audittyp | 'all';
	verantwortlicher: string | 'all';
	prioritaet: Prioritaet | 'all';
	norm: MassnahmenNorm | 'all';
}

// Ueberfaellig-Berechnung
interface OverdueCheck {
	isOverdue: boolean; // frist < today AND status != "completed"
}
```

## UI-Beschreibung

### Berichtsgenerator

**Route:** `/report-generator`
**Datei:** `src/routes/report-generator/+page.svelte`

Das Formular zum Erstellen eines Auditberichts besteht aus folgenden Feldern:

| Feld             | Typ               | Details                                                              |
| ---------------- | ----------------- | -------------------------------------------------------------------- |
| Audit auswaehlen | Select (required) | Dynamisch befuellt aus gespeicherten Audits (`saved_audits`-Tabelle) |
| Feststellungen   | Textarea          | 4 Zeilen Hoehe, volle Breite                                         |
| Empfehlungen     | Textarea          | 4 Zeilen Hoehe, volle Breite                                         |
| Fazit            | Textarea          | 3 Zeilen Hoehe, volle Breite                                         |
| Absenden         | Button            | Generiert den Bericht                                                |

Nach dem Absenden wird der generierte Bericht in einem separaten Container unterhalb des Formulars angezeigt. Der Bericht hat ein strukturiertes Format mit Ueberschriften fuer jede Sektion (Feststellungen, Empfehlungen, Fazit) und wird aus den eingegebenen Daten zusammengesetzt.

### Auditfragen & Dokumente

**Route:** `/audit-questions`
**Datei:** `src/routes/audit-questions/+page.svelte`

**Audit-Informationen (oberer Bereich):**

| Feld        | Typ        | Details     |
| ----------- | ---------- | ----------- |
| Firmenname  | Text-Input | Pflichtfeld |
| Auditdatum  | Date-Input | Pflichtfeld |
| Uhrzeit Von | Time-Input | Pflichtfeld |
| Uhrzeit Bis | Time-Input | Pflichtfeld |

**Bereichsauswahl (mittlerer Bereich):**

| Feld        | Typ    | Details                                  |
| ----------- | ------ | ---------------------------------------- |
| Abteilung   | Select | 43 Abteilungen aus Wissensdatenbank      |
| Norm        | Select | ISO 9001 / 14001 / 45001 / 50001 / 27001 |
| Normkapitel | Select | Dynamisch basierend auf gewaehlter Norm  |

**Fragen- und Dokumentenanzeige:**

- `loadAuditQuestions()` laedt Fragen aus der Wissensdatenbank basierend auf Abteilung + Norm
- Fragen werden als nummerierte Liste in einem Fragen-Container dargestellt
- Dokumente werden als separate Liste unterhalb der Fragen angezeigt

**Aktionen:**

| Aktion      | Beschreibung                                                                      |
| ----------- | --------------------------------------------------------------------------------- |
| Speichern   | `saveAuditForm()` - Speichert Formulardaten + Fragen + Dokumente in die Datenbank |
| Word-Export | `.doc`-Format via HTML-Blob (NICHT docx.js), MIME: `application/msword`           |
| PDF-Export  | PDF-Generierung aus den aktuellen Daten                                           |

### Massnahmenplan

**Route:** `/action-plan`
**Datei:** `src/routes/action-plan/+page.svelte`

**Filterleiste (6 Filter in 2 Reihen):**

| Reihe   | Filter 1                               | Filter 2                                              | Filter 3                       |
| ------- | -------------------------------------- | ----------------------------------------------------- | ------------------------------ |
| Reihe 1 | Feststellungsart (7 Optionen + "Alle") | Status (5 Optionen + "Alle")                          | Audittyp (6 Optionen + "Alle") |
| Reihe 2 | Verantwortlicher (dynamisch + "Alle")  | Prioritaet (4 Optionen: Hoch/Mittel/Niedrig + "Alle") | Norm (7 Optionen + "Alle")     |

**Massnahmen-Eintraege:**

Jede Massnahme wird als Karte dargestellt mit folgenden Feldern:

| Feld                      | Typ         | Besonderheit                                                      |
| ------------------------- | ----------- | ----------------------------------------------------------------- |
| Feststellungsbeschreibung | Textarea    | Mehrzeilig                                                        |
| Feststellungsart          | Select      | Farbcodiert (z.B. Rot fuer Hauptabweichung, Gelb fuer Empfehlung) |
| Geplante Massnahme        | Textarea    | Mehrzeilig                                                        |
| Status                    | Select      | 5 Optionen                                                        |
| Verantwortlicher          | Text/Select | Dynamisch                                                         |
| Prioritaet                | Select      | Hoch / Mittel / Niedrig                                           |
| Frist                     | Date-Input  |                                                                   |
| Abschlussdatum            | Date-Input  | Optional                                                          |
| Norm                      | Select      | ISO-Norm-Auswahl                                                  |
| Nachweise/Notizen         | Textarea    | Mehrzeilig                                                        |

**Farbcodierung Feststellungsart:**

| Feststellungsart      | Farbe    |
| --------------------- | -------- |
| major_nonconformity   | Rot      |
| minor_nonconformity   | Orange   |
| recommendation        | Gelb     |
| improvement_potential | Blau     |
| positive_finding      | Gruen    |
| observation           | Grau     |
| note                  | Hellblau |

**Ueberfaellig-Markierung:**

Wenn `frist < heute` UND `status !== "completed"`, wird die Massnahme visuell hervorgehoben (z.B. roter Rahmen oder roter Hintergrund-Akzent).

## Interaktionen

### Berichtsgenerator

1. **Audit laden:** Beim Oeffnen der Seite werden alle gespeicherten Audits via Server-Load-Funktion geladen und im Select angezeigt.
2. **Bericht generieren:** Klick auf "Absenden" sendet ein POST an eine SvelteKit-Server-Action. Der Server erstellt den Bericht und speichert ihn in der Datenbank.
3. **Bericht anzeigen:** Nach erfolgreicher Generierung wird der Bericht im Container unterhalb des Formulars gerendert.

### Auditfragen & Dokumente

1. **Norm-Auswahl:** Aenderung der Norm laedt dynamisch die passenden Normkapitel im dritten Select.
2. **Fragen laden:** Aenderung von Abteilung oder Norm loest `loadAuditQuestions()` aus. Diese Funktion laedt passende Fragen und Dokumente aus der Wissensdatenbank (`src/lib/data/`).
3. **Speichern:** `saveAuditForm()` speichert alle Formulardaten, Fragen und Dokumente via Server-Action in die Datenbank.
4. **Word-Export:** Generierung einer `.doc`-Datei ueber HTML-Blob-Ansatz. Die Datei wird als `Auditfragen_[Abteilung]_[Datum].doc` heruntergeladen.
5. **PDF-Export:** Generierung einer PDF-Datei aus den aktuellen Formulardaten und Fragen.

### Massnahmenplan

1. **Filtern:** Jede Aenderung eines Filters loedt sofort die gefilterten Massnahmen neu (clientseitig oder via Server-Load mit Query-Parametern).
2. **Massnahme erstellen:** Button "Neue Massnahme" oeffnet ein leeres Formular. Speichern via Server-Action.
3. **Massnahme bearbeiten:** Klick auf eine bestehende Massnahme oeffnet diese zum Bearbeiten. Aenderungen werden via Server-Action gespeichert.
4. **Ueberfaellig-Pruefung:** Bei jedem Laden/Filtern wird fuer jede Massnahme geprueft: `frist < new Date()` UND `status !== "completed"`. Ueberfaellige Eintraege erhalten eine visuelle Hervorhebung.
5. **Dynamischer Verantwortlicher-Filter:** Die Optionen im Filter "Verantwortlicher" werden aus den vorhandenen Massnahmen-Eintraegen abgeleitet.

## Abhaengigkeiten

### Interne Abhaengigkeiten

| Abhaengigkeit              | Beschreibung                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `src/lib/data/`            | Wissensdatenbank: Abteilungen, Normkapitel, Auditfragen (siehe Spec 13)  |
| `src/lib/server/db/`       | Drizzle ORM Schema und Datenbankzugriff (Turso)                          |
| `better-auth`              | Authentifizierung: `organizationId` fuer alle Datensaetze                |
| Spec 01 (Architektur)      | Authentifizierung, Datenbankschema, i18n                                 |
| Spec 13 (Wissensdatenbank) | `organisationseinheitOptionen`, `auditQuestionsData`, Normkapitel-Listen |
| Spec 14 (Einstellungen)    | Farbschema, Sprache, Standard-Auditor/Abteilung                          |

### Datenbank-Tabellen (Drizzle ORM + Turso)

| Tabelle                 | Beschreibung                                     |
| ----------------------- | ------------------------------------------------ |
| `audit_reports`         | Generierte Auditberichte                         |
| `saved_audits`          | Gespeicherte Audits (Quelle fuer Bericht-Select) |
| `saved_audit_questions` | Gespeicherte Auditfragen-Formulare               |
| `actions`               | Massnahmenplan-Eintraege                         |

### Externe Abhaengigkeiten

| Paket            | Verwendung                                        |
| ---------------- | ------------------------------------------------- |
| `@libsql/client` | Turso-Datenbankverbindung                         |
| `drizzle-orm`    | ORM fuer Datenbankoperationen                     |
| `bits-ui`        | UI-Komponenten (Select, Button, Textarea, Dialog) |
| Tailwind CSS 4   | Styling, Farbcodierung, responsive Layouts        |
