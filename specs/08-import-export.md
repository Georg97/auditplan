# Spec 08: Import / Export

## Datenmodell

> **Hinweis:** Export/Import arbeitet mit normalisierten Tabellen. Export JOINt ueber alle
> Relationen, Import fuegt in korrekter Reihenfolge ein (Parent → Child) mit Transaction.

```typescript
// ──────────────────────────────────────────────
// Export-Datenstruktur (JSON)
// ──────────────────────────────────────────────

/**
 * Vollstaendiger Datenexport.
 * Dateiname: auditplan_backup_{timestamp}.json
 * Beispiel: auditplan_backup_2026-03-18T14-30-00.json
 *
 * Der Export JOINt ueber alle Relationen und baut daraus
 * ein vollstaendiges JSON. Jeder Schluessel entspricht einer
 * normalisierten Datenbanktabelle (keine JSON-Blobs).
 */
interface ExportDaten {
	version: string; // Schema-Version, z.B. "1.0"
	exportiertAm: string; // ISO-DateTime
	benutzer: string; // organizationId oder Anzeigename

	// ── Parent-Tabellen ──
	audits: AuditRow[];
	auditors: AuditorRow[];
	calendar_entries: CalendarEntryRow[];
	settings: SettingsRow[];
	saved_audits: SavedAuditRow[];

	// ── Audit Child-Tabellen (Spec 06) ──
	audit_normen: AuditNormRow[]; // FK → audits (Junction: Audit <-> Normen)
	audit_team_members: AuditTeamMemberRow[]; // FK → audits, auditors (Junction: Audit <-> Auditoren)
	audit_dateien: AuditDateiRow[]; // FK → audits (metadata only, not file content)
	audit_reports: AuditReportRow[]; // FK → saved_audits (Spec 11)

	// ── Auditplan (Spec 09) ──
	audit_plans: AuditPlanRow[]; // Parent
	audit_plan_grunddaten: AuditPlanGrunddatenRow[]; // 1:1 → audit_plans
	audit_plan_normen: AuditPlanNormRow[]; // n:1 → audit_plans
	audit_plan_standorte: AuditPlanStandortRow[]; // n:1 → audit_plans
	audit_plan_revisionen: AuditPlanRevisionRow[]; // n:1 → audit_plans
	audit_plan_team_mitglieder: AuditPlanTeamMitgliedRow[]; // n:1 → audit_plans
	audit_plan_auditzeiten: AuditPlanAuditzeitRow[]; // n:1 → audit_plans
	audit_plan_auditzeit_zeilen: AuditPlanAuditzeitZeileRow[]; // n:1 → audit_plan_auditzeiten
	audit_plan_blocks: AuditPlanBlockRow[]; // n:1 → audit_plans
	audit_plan_block_zeilen: AuditPlanBlockZeileRow[]; // n:1 → audit_plan_blocks
	audit_plan_block_zeilen_notizen: AuditPlanBlockZeileNotizenRow[]; // 1:1 → audit_plan_block_zeilen
	audit_plan_block_zeilen_toggles: AuditPlanBlockZeileTogglesRow[]; // 1:1 → audit_plan_block_zeilen
	audit_plan_block_zeilen_normkapitel: AuditPlanBlockZeileNormkapitelRow[]; // n:n → audit_plan_block_zeilen
	audit_plan_block_zeilen_themen: AuditPlanBlockZeileThemenRow[]; // n:n → audit_plan_block_zeilen
	audit_plan_zn_nummern: AuditPlanZnNummerRow[]; // n:1 → audit_plans

	// ── Auditnotizen (Spec 10) ──
	audit_notes: AuditNotesRow[]; // Parent
	notizen_blocks: NotizenBlockRow[]; // n:1 → audit_notes
	notizen_block_toggles: NotizenBlockTogglesRow[]; // 1:1 → notizen_blocks
	notizen_block_qhse_dokumente: NotizenBlockQhseDokumentRow[]; // n:1 → notizen_blocks
	notizen_block_bewertungen: NotizenBlockBewertungRow[]; // n:1 → notizen_blocks
	notizen_block_bewertung_kapitel: NotizenBlockBewertungKapitelRow[]; // n:n → notizen_block_bewertungen
	notizen_block_normkapitel: NotizenBlockNormkapitelRow[]; // n:n → notizen_blocks

	// ── Auditfragen (Spec 11) ──
	saved_audit_questions: SavedAuditQuestionRow[]; // Header-Daten (flache Spalten)
	saved_question_entries: SavedQuestionEntryRow[]; // Child: einzelne Fragen (FK → saved_audit_questions)
	saved_question_documents: SavedQuestionDocumentRow[]; // Child: Dokumente (FK → saved_audit_questions)

	// ── Massnahmenplan (Spec 11) ──
	actions: ActionRow[]; // FK → audits (optional)
}

/**
 * Schluessel, die im Export enthalten sind.
 * Jeder Schluessel entspricht einer normalisierten Datenbanktabelle.
 */
type ExportSchluessel =
	// Parent-Tabellen
	| 'audits'
	| 'auditors'
	| 'calendar_entries'
	| 'settings'
	| 'saved_audits'
	// Audit children (Spec 06)
	| 'audit_normen'
	| 'audit_team_members'
	| 'audit_dateien'
	| 'audit_reports'
	// Auditplan (Spec 09)
	| 'audit_plans'
	| 'audit_plan_grunddaten'
	| 'audit_plan_normen'
	| 'audit_plan_standorte'
	| 'audit_plan_revisionen'
	| 'audit_plan_team_mitglieder'
	| 'audit_plan_auditzeiten'
	| 'audit_plan_auditzeit_zeilen'
	| 'audit_plan_blocks'
	| 'audit_plan_block_zeilen'
	| 'audit_plan_block_zeilen_notizen'
	| 'audit_plan_block_zeilen_toggles'
	| 'audit_plan_block_zeilen_normkapitel'
	| 'audit_plan_block_zeilen_themen'
	| 'audit_plan_zn_nummern'
	// Auditnotizen (Spec 10)
	| 'audit_notes'
	| 'notizen_blocks'
	| 'notizen_block_toggles'
	| 'notizen_block_qhse_dokumente'
	| 'notizen_block_bewertungen'
	| 'notizen_block_bewertung_kapitel'
	| 'notizen_block_normkapitel'
	// Auditfragen (Spec 11)
	| 'saved_audit_questions'
	| 'saved_question_entries'
	| 'saved_question_documents'
	// Massnahmenplan (Spec 11)
	| 'actions';

// ──────────────────────────────────────────────
// Import-Validierung
// ──────────────────────────────────────────────

/**
 * Import fuegt Datensaetze in korrekter Reihenfolge ein:
 *   1. Parent-Tabellen (audits, auditors, saved_plans, ...)
 *   2. Child-Tabellen (saved_question_entries, saved_question_documents, actions)
 *
 * Alle Inserts laufen innerhalb einer einzigen DB-Transaction.
 * Bei Fehler: Rollback der gesamten Transaction.
 */
interface ImportErgebnis {
	erfolgreich: boolean;
	importierteSchluessel: ExportSchluessel[];
	uebersprungeneSchluessel: string[]; // Unbekannte Schluessel
	fehler: string[]; // Validierungsfehler
	anzahl: Record<ExportSchluessel, number>; // Importierte Datensaetze pro Schluessel
}

// ──────────────────────────────────────────────
// Import-Reihenfolge (Parent → Child)
// ──────────────────────────────────────────────

/**
 * Definiert die Einfuegereihenfolge fuer den Import.
 * Parent-Tabellen werden zuerst eingefuegt, damit FK-Constraints
 * der Child-Tabellen erfuellt sind.
 */
const IMPORT_ORDER: ExportSchluessel[] = [
	// 1. Unabhaengige Parent-Tabellen
	'audits',
	'auditors',
	'calendar_entries',
	'settings',
	'saved_audits',

	// 2. Audit children (FK → audits, auditors)
	'audit_normen',
	'audit_team_members',
	'audit_dateien',
	'audit_reports',

	// 3. Auditplan hierarchy (Spec 09)
	'audit_plans', // Parent
	'audit_plan_grunddaten', // 1:1 → audit_plans
	'audit_plan_normen', // n:1 → audit_plans
	'audit_plan_standorte', // n:1 → audit_plans
	'audit_plan_revisionen', // n:1 → audit_plans
	'audit_plan_team_mitglieder', // n:1 → audit_plans
	'audit_plan_zn_nummern', // n:1 → audit_plans
	'audit_plan_auditzeiten', // n:1 → audit_plans
	'audit_plan_auditzeit_zeilen', // n:1 → audit_plan_auditzeiten
	'audit_plan_blocks', // n:1 → audit_plans
	'audit_plan_block_zeilen', // n:1 → audit_plan_blocks
	'audit_plan_block_zeilen_notizen', // 1:1 → audit_plan_block_zeilen
	'audit_plan_block_zeilen_toggles', // 1:1 → audit_plan_block_zeilen
	'audit_plan_block_zeilen_normkapitel', // n:n → audit_plan_block_zeilen
	'audit_plan_block_zeilen_themen', // n:n → audit_plan_block_zeilen

	// 4. Auditnotizen hierarchy (Spec 10)
	'audit_notes', // Parent
	'notizen_blocks', // n:1 → audit_notes
	'notizen_block_toggles', // 1:1 → notizen_blocks
	'notizen_block_qhse_dokumente', // n:1 → notizen_blocks
	'notizen_block_bewertungen', // n:1 → notizen_blocks
	'notizen_block_bewertung_kapitel', // n:n → notizen_block_bewertungen
	'notizen_block_normkapitel', // n:n → notizen_blocks

	// 5. Auditfragen hierarchy (Spec 11)
	'saved_audit_questions',
	'saved_question_entries', // FK → saved_audit_questions
	'saved_question_documents', // FK → saved_audit_questions

	// 6. Massnahmen (optionaler FK → audits)
	'actions'
];

// ──────────────────────────────────────────────
// CSV-Export
// ──────────────────────────────────────────────

/**
 * CSV-Export betrifft nur die Audit-Daten.
 * Dateiname: audits_export_{timestamp}.csv
 * Kodierung: UTF-8 mit BOM (\uFEFF) fuer korrekte Excel-Darstellung.
 */
interface CsvExportOptionen {
	trennzeichen: string; // Standard: ";"  (fuer deutsche Excel-Versionen)
	zeilenumbruch: string; // "\r\n" (Windows)
	mitBom: boolean; // true -> UTF-8 BOM voranstellen
}

// ──────────────────────────────────────────────
// UI-State
// ──────────────────────────────────────────────

interface ImportExportState {
	exportiert: boolean;
	importiert: boolean;
	csvExportiert: boolean;
	laedt: boolean;
	fehler: string | null;
	importErgebnis: ImportErgebnis | null;
}
```

## UI-Beschreibung

### Layout

Die Seite zeigt 3 Karten in einem responsiven Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` mit `gap-6`.

Jede Karte ist eine Bits-UI `Card` mit einheitlicher Struktur: Icon, Titel, Beschreibungstext, Aktions-Button.

### Karte 1: Daten exportieren

- **Icon**: Download-Icon (z.B. Lucide `Download`).
- **Titel**: _"Daten exportieren"_
- **Beschreibung**: _"Exportiert alle Ihre Daten als JSON-Datei. Diese Datei kann spaeter zum Wiederherstellen verwendet werden."_
- **Button**: _"JSON exportieren"_ (primaer).
- **Verhalten nach Export**: Erfolgsmeldung unter dem Button: _"Backup erfolgreich erstellt: auditplan*backup*{timestamp}.json"_

### Karte 2: Daten importieren

- **Icon**: Upload-Icon (z.B. Lucide `Upload`).
- **Titel**: _"Daten importieren"_
- **Beschreibung**: _"Importiert Daten aus einer zuvor exportierten JSON-Datei. Bestehende Daten werden ergaenzt."_
- **Button**: _"JSON importieren"_ (primaer) -- tatsaechlich ein gestyltes `<label>` fuer ein verstecktes `<input type="file" accept=".json">`.
- **Nach Import**: Zusammenfassung der importierten Daten (Anzahl pro Schluessel) oder Fehlermeldung.

### Karte 3: CSV Export

- **Icon**: Tabellen-Icon (z.B. Lucide `FileSpreadsheet`).
- **Titel**: _"CSV Export"_
- **Beschreibung**: _"Exportiert die Audit-Daten als CSV-Datei fuer die Verwendung in Excel oder anderen Tabellenkalkulationen."_
- **Button**: _"CSV exportieren"_ (primaer).
- **Verhalten nach Export**: Erfolgsmeldung: _"CSV-Datei erstellt: audits*export*{timestamp}.csv"_

### Allgemeine Gestaltung

- Karten haben gleiche Hoehe (Grid `items-stretch`).
- ShadCN Button loading state with Lucide Loader2 icon on the active button during the operation.
- Fehlermeldungen: use toast error or ShadCN Alert destructive variant below the button.

## Interaktionen

### JSON-Export

1. Benutzer klickt **"JSON exportieren"**.
2. Button zeigt Loading-State (ShadCN Button mit Lucide Loader2 Icon).
3. Server-Call (`exportAllData`): Laedt alle Datenschluessel aus der Datenbank fuer den aktuellen Benutzer.
4. Server gibt das vollstaendige `ExportDaten`-Objekt zurueck.
5. Client erstellt eine JSON-Datei:
   ```
   const blob = new Blob([JSON.stringify(daten, null, 2)], { type: "application/json" });
   ```
6. Datei wird per programmatischem `<a>`-Klick heruntergeladen.
7. Dateiname: `auditplan_backup_{timestamp}.json` (Timestamp-Format: `YYYY-MM-DDTHH-mm-ss`).
8. Erfolgsmeldung wird angezeigt.

### JSON-Import

1. Benutzer klickt **"JSON importieren"** (oeffnet den nativen Datei-Dialog).
2. Benutzer waehlt eine `.json`-Datei aus.
3. Client liest die Datei per `FileReader`:
   ```
   reader.readAsText(file);
   ```
4. Client parst JSON und fuehrt Grundvalidierung durch:
   - Ist es gueltiges JSON?
   - Enthaelt es mindestens einen bekannten Schluessel?
   - Sind die Werte Arrays?
5. Bei Validierungsfehler: Fehlermeldung anzeigen (toast error oder ShadCN Alert destructive), Abbruch.
6. Bei gueltigem JSON: Server-Call (`importData`) mit dem geparsten Objekt.
7. Server validiert jeden Datensatz einzeln und schreibt gueltige Eintraege in die DB.
8. Server gibt `ImportErgebnis` zurueck.
9. Client zeigt Zusammenfassung an:
   - Erfolgreich importierte Schluessel mit Anzahl.
   - Uebersprungene/unbekannte Schluessel.
   - Eventuelle Fehler.

### CSV-Export

1. Benutzer klickt **"CSV exportieren"**.
2. Button zeigt Loading-State (ShadCN Button mit Lucide Loader2 Icon).
3. Server-Call (`getAuditsForCsvExport`): Laedt alle Audits des Benutzers.
4. Client konvertiert die Audit-Daten in CSV-Format:
   - **UTF-8 BOM** (`\uFEFF`) am Dateianfang fuer korrekte Umlaute in Excel.
   - **Trennzeichen**: Semikolon (`;`) -- Standard fuer deutsche Excel-Versionen.
   - **Spalten**: Auditname, Audittyp, Startdatum, Enddatum, Unternehmen, Abteilung, Standort, Format, Leitender Auditor, Status.
   - **Kopfzeile**: Deutsche Spaltennamen.
   - Werte mit Semikolon oder Anfuehrungszeichen werden in doppelte Anfuehrungszeichen eingeschlossen.
5. Datei wird heruntergeladen.
6. Dateiname: `audits_export_{timestamp}.csv`.

### Fehlerbehandlung

- Netzwerkfehler: Generische Fehlermeldung _"Export/Import fehlgeschlagen. Bitte versuchen Sie es erneut."_
- Ungueltige Datei: Spezifische Meldung _"Die ausgewaehlte Datei ist kein gueltiges Backup-Format."_
- Teilweise Import-Fehler: Zusammenfassung zeigt sowohl Erfolge als auch Fehler an.

## Abhaengigkeiten

### Intern (Projekt)

| Abhaengigkeit             | Beschreibung                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Alle Datenbanktabellen    | Export liest alle Tabellen, Import schreibt in alle Tabellen                                              |
| better-auth Session       | `organizationId` fuer Datenzuordnung                                                                      |
| Drizzle ORM Schema        | Zugriff auf alle relevanten Tabellen                                                                      |
| Spec 06 (Audits)          | `audits`, `auditors`, `audit_normen`, `audit_team_members`, `audit_dateien`                               |
| Spec 07 (Kalender)        | `calendar_entries` Tabelle                                                                                |
| Spec 09 (Auditplan)       | `audit_plans` + 14 child tables                                                                           |
| Spec 10 (Notizen)         | `audit_notes` + 6 child tables                                                                            |
| Spec 11 (Berichte/Fragen) | `audit_reports`, `saved_audit_questions`, `saved_question_entries`, `saved_question_documents`, `actions` |

### Extern (Bibliotheken)

| Paket          | Verwendung                                    |
| -------------- | --------------------------------------------- |
| SvelteKit      | Routing (`/import-export`), Server-Funktionen |
| Svelte 5       | Reaktive Zustandsverwaltung (`$state`)        |
| Bits-UI        | Card, Button                                  |
| Tailwind CSS 4 | Grid-Layout, Karten-Styling                   |
| Drizzle ORM    | Batch-Lese- und Schreib-Operationen           |
| Turso          | SQLite-Datenbank (libsql)                     |
| better-auth    | Authentifizierung, Session-Management         |
| Bun            | Runtime, Paketmanager                         |
