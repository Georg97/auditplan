# 11 - Berichte, Auditfragen & Massnahmenplan

## Datenmodell

```typescript
// --- Berichtsgenerator (§12) ---

interface AuditReport {
	id: string;
	organizationId: string;
	auditId: string; // FK → saved_audits.id
	feststellungen: string;
	empfehlungen: string;
	fazit: string;
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

/**
 * Tabelle: saved_audit_questions
 *
 * Header-Datensatz mit flachen Spalten (KEIN verschachteltes formData-Objekt).
 * Fragen und Dokumente sind in eigenen Junction-Tabellen normalisiert.
 */
interface SavedAuditQuestions {
	id: string;
	organizationId: string;

	// Flache Spalten (frueher im formData-Objekt verschachtelt)
	firmenname: string;
	auditdatum: string; // ISO-Datum
	uhrzeitVon: string; // HH:mm
	uhrzeitBis: string; // HH:mm
	abteilung: string; // Select, 43 Abteilungen
	norm: AuditNorm; // Select
	normkapitel: string; // Dynamisch basierend auf Norm

	createdAt: Date;
	updatedAt: Date;
}

/**
 * Tabelle: saved_question_entries
 *
 * Junction-Tabelle fuer einzelne Auditfragen.
 * FK → saved_audit_questions.id
 */
interface SavedQuestionEntry {
	id: string;
	savedAuditQuestionsId: string; // FK → saved_audit_questions.id
	frage: string;
	normRef: string; // Normkapitel-Referenz
	position: number; // Sortierreihenfolge (0-basiert)
}

/**
 * Tabelle: saved_question_documents
 *
 * Junction-Tabelle fuer Dokumente zu einem Auditfragen-Satz.
 * FK → saved_audit_questions.id
 */
interface SavedQuestionDocument {
	id: string;
	savedAuditQuestionsId: string; // FK → saved_audit_questions.id
	name: string;
	beschreibung: string | null;
	position: number; // Sortierreihenfolge (0-basiert)
}

// --- Massnahmenplan (§15) ---

// Display text comes from i18n
type FindingType = 'major_nonconformity' | 'minor_nonconformity' | 'recommendation' | 'improvement_potential' | 'positive_finding' | 'observation' | 'note';

// Display text comes from i18n
type ActionStatus = 'open' | 'in_progress' | 'implemented' | 'verified' | 'completed';

// Display text comes from i18n
type AuditType = 'internal' | 'external' | 'supplier' | 'process_audit' | 'system_audit' | 'follow_up_audit';

// Display text comes from i18n
type Priority = 'high' | 'medium' | 'low';

// Display text comes from i18n
type ActionNorm = 'ISO 9001' | 'ISO 14001' | 'ISO 45001' | 'ISO 50001' | 'ISO 27001' | 'other' | 'all';

/**
 * Tabelle: actions
 *
 * Massnahmen koennen optional auf ein Audit verweisen (auditId).
 * organizationId ist Pflicht (Multi-Tenancy).
 */
interface Massnahme {
	id: string;
	organizationId: string;
	auditId: string | null; // Optionaler FK → audits.id
	description: string;
	findingType: FindingType; // Visually distinguished by semantic color
	plannedAction: string;
	status: ActionStatus;
	responsible: string;
	priority: Priority;
	dueDate: string; // ISO-Datum
	completionDate: string | null; // ISO-Datum
	norm: ActionNorm;
	evidenceNotes: string;
	auditType: AuditType;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Filter fuer Massnahmenplan.
 * Alle Filter werden als server-seitige SQL WHERE-Clauses umgesetzt
 * (NICHT client-seitige Array-Filterung).
 */
interface MassnahmenFilter {
	findingType: FindingType | 'all';
	status: ActionStatus | 'all';
	auditType: AuditType | 'all';
	responsible: string | 'all';
	priority: Priority | 'all';
	norm: ActionNorm | 'all';
	page: number; // Aktuelle Seite (1-basiert)
	pageSize: number; // Eintraege pro Seite (Standard: 20)
}

interface MassnahmenFilterResult {
	items: Massnahme[];
	total: number; // Gesamtanzahl (fuer Pagination)
	page: number;
	pageSize: number;
	totalPages: number;
}

// Ueberfaellig-Berechnung
interface OverdueCheck {
	isOverdue: boolean; // dueDate < today AND status != "completed"
}
```

## Funktionale Anforderungen

### Berichtsgenerator

**Route:** `/report-generator`
**Datei:** `src/routes/report-generator/+page.svelte`

**Formularfelder:**

| Feld             | Typ               | Details                                                              |
| ---------------- | ----------------- | -------------------------------------------------------------------- |
| Audit auswaehlen | Select (required) | Dynamisch befuellt aus gespeicherten Audits (`saved_audits`-Tabelle) |
| Feststellungen   | Textarea          | Mehrzeilig                                                           |
| Empfehlungen     | Textarea          | Mehrzeilig                                                           |
| Fazit            | Textarea          | Mehrzeilig                                                           |
| Absenden         | Button            | Generiert den Bericht                                                |

Nach dem Absenden wird der generierte Bericht unterhalb des Formulars angezeigt. Der Bericht hat ein strukturiertes Format mit Ueberschriften fuer jede Sektion (Feststellungen, Empfehlungen, Fazit) und wird aus den eingegebenen Daten zusammengesetzt.

### Auditfragen & Dokumente

**Route:** `/audit-questions`
**Datei:** `src/routes/audit-questions/+page.svelte`

**Audit-Informationen:**

| Feld        | Typ        | Details     |
| ----------- | ---------- | ----------- |
| Firmenname  | Text-Input | Pflichtfeld |
| Auditdatum  | Date-Input | Pflichtfeld |
| Uhrzeit Von | Time-Input | Pflichtfeld |
| Uhrzeit Bis | Time-Input | Pflichtfeld |

**Bereichsauswahl:**

| Feld        | Typ    | Details                                  |
| ----------- | ------ | ---------------------------------------- |
| Abteilung   | Select | 43 Abteilungen aus Wissensdatenbank      |
| Norm        | Select | ISO 9001 / 14001 / 45001 / 50001 / 27001 |
| Normkapitel | Select | Dynamisch basierend auf gewaehlter Norm  |

**Fragen- und Dokumentenanzeige:**

- `loadAuditQuestions()` laedt Fragen aus der Wissensdatenbank basierend auf Abteilung + Norm
- Fragen werden als nummerierte Liste dargestellt
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

**Filterleiste:**

6 Filter controls:

| Filter      | Optionen                                      |
| ----------- | --------------------------------------------- |
| FindingType | 7 Optionen + "Alle"                           |
| Status      | 5 Optionen + "Alle"                           |
| AuditType   | 6 Optionen + "Alle"                           |
| Responsible | Dynamisch aus vorhandenen Eintraegen + "Alle" |
| Priority    | Hoch / Mittel / Niedrig + "Alle"              |
| Norm        | 7 Optionen + "Alle"                           |

**Massnahmen-Felder:**

| Feld (i18n Label)         | DB Field       | Typ         | Besonderheit                                         |
| ------------------------- | -------------- | ----------- | ---------------------------------------------------- |
| Feststellungsbeschreibung | description    | Textarea    | Mehrzeilig                                           |
| Feststellungsart          | findingType    | Select      | Visually distinguished by semantic color (see below) |
| Geplante Massnahme        | plannedAction  | Textarea    | Mehrzeilig                                           |
| Status                    | status         | Select      | 5 Optionen                                           |
| Verantwortlicher          | responsible    | Text/Select | Dynamisch                                            |
| Prioritaet                | priority       | Select      | Hoch / Mittel / Niedrig                              |
| Frist                     | dueDate        | Date-Input  |                                                      |
| Abschlussdatum            | completionDate | Date-Input  | Optional                                             |
| Norm                      | norm           | Select      | ISO-Norm-Auswahl                                     |
| Nachweise/Notizen         | evidenceNotes  | Textarea    | Mehrzeilig                                           |

**FindingType-Farbcodierung:**

Finding types are visually distinguished by semantic color to indicate severity. More critical types (e.g. major_nonconformity) use destructive/warning colors, positive types (e.g. positive_finding) use success colors, and informational types use muted/info colors.

**Ueberfaellig-Markierung:**

Wenn `dueDate < heute` UND `status !== "completed"`, wird die Massnahme visuell als ueberfaellig hervorgehoben.

## Interaktionen

### Berichtsgenerator

1. **Audit laden:** Beim Oeffnen der Seite werden alle gespeicherten Audits via Server-Load-Funktion geladen und im Select angezeigt.
2. **Bericht generieren:** Klick auf "Absenden" sendet ein POST an eine SvelteKit-Server-Action. Der Server erstellt den Bericht und speichert ihn in der Datenbank.
3. **Bericht anzeigen:** Nach erfolgreicher Generierung wird der Bericht unterhalb des Formulars gerendert.

### Auditfragen & Dokumente

1. **Norm-Auswahl:** Aenderung der Norm laedt dynamisch die passenden Normkapitel im dritten Select.
2. **Fragen laden:** Aenderung von Abteilung oder Norm loest `loadAuditQuestions()` aus. Diese Funktion laedt passende Fragen und Dokumente aus der Wissensdatenbank (`src/lib/data/`).
3. **Speichern:** `saveAuditForm()` speichert alle Formulardaten, Fragen und Dokumente via Server-Action in die Datenbank.
4. **Word-Export:** Generierung einer `.doc`-Datei ueber HTML-Blob-Ansatz. Die Datei wird als `Auditfragen_[Abteilung]_[Datum].doc` heruntergeladen.
5. **PDF-Export:** Generierung einer PDF-Datei aus den aktuellen Formulardaten und Fragen.

### Massnahmenplan

1. **Filtern (server-seitig):** Jede Aenderung eines Filters sendet die Filter als Query-Parameter an den Server. Die Filterung erfolgt als SQL WHERE-Clauses auf der Datenbank (NICHT client-seitige Array-Filterung). Der Server gibt ein `MassnahmenFilterResult` mit paginierten Ergebnissen zurueck.
2. **Pagination:** Ergebnisse werden paginiert (Standard: 20 pro Seite). Navigation ueber Seiten-Buttons unterhalb der Massnahmen-Liste. Bei Filteraenderung wird auf Seite 1 zurueckgesetzt.
3. **Massnahme erstellen:** Button "Neue Massnahme" oeffnet ein leeres Formular. Speichern via Server-Action.
4. **Massnahme bearbeiten:** Klick auf eine bestehende Massnahme oeffnet diese zum Bearbeiten. Aenderungen werden via Server-Action gespeichert.
5. **Ueberfaellig-Pruefung:** Bei jedem Laden/Filtern wird fuer jede Massnahme geprueft: `dueDate < new Date()` UND `status !== "completed"`. Ueberfaellige Eintraege erhalten eine visuelle Hervorhebung.
6. **Dynamischer Verantwortlicher-Filter:** Die Optionen im Filter "Verantwortlicher" werden via separater Server-Query aus den vorhandenen Massnahmen-Eintraegen abgeleitet (SELECT DISTINCT).

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
