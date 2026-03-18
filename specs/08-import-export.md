# Spec 08: Import / Export

## Datenmodell

```typescript
// ──────────────────────────────────────────────
// Export-Datenstruktur (JSON)
// ──────────────────────────────────────────────

/**
 * Vollstaendiger Datenexport.
 * Dateiname: auditplan_backup_{timestamp}.json
 * Beispiel: auditplan_backup_2026-03-18T14-30-00.json
 */
interface ExportDaten {
	version: string; // Schema-Version, z.B. "1.0"
	exportiertAm: string; // ISO-DateTime
	benutzer: string; // organizationId oder Anzeigename

	// Alle exportierbaren Datenschluessel
	audits: AuditRow[];
	auditors: AuditorRow[];
	saved_plans: SavedPlanRow[];
	saved_notes: SavedNotesRow[];
	calendar_entries: CalendarEntryRow[];
	actions: ActionRow[];
	settings: SettingsRow[];
	saved_audits: SavedAuditRow[];
	saved_audit_questions: SavedAuditQuestionRow[];
}

/**
 * Schluessel, die im Export enthalten sind.
 * Jeder Schluessel entspricht einer Datenbanktabelle.
 */
type ExportSchluessel = 'audits' | 'auditors' | 'saved_plans' | 'saved_notes' | 'calendar_entries' | 'actions' | 'settings' | 'saved_audits' | 'saved_audit_questions';

// ──────────────────────────────────────────────
// Import-Validierung
// ──────────────────────────────────────────────

interface ImportErgebnis {
	erfolgreich: boolean;
	importierteSchluessel: ExportSchluessel[];
	uebersprungeneSchluessel: string[]; // Unbekannte Schluessel
	fehler: string[]; // Validierungsfehler
	anzahl: Record<ExportSchluessel, number>; // Importierte Datensaetze pro Schluessel
}

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

Die Seite zeigt 3 Karten in einem responsiven Grid:

```
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
gap: 1.5rem
```

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

- Karten haben gleiche Hoehe (CSS `align-items: stretch` auf dem Grid).
- Ladeindikator (Spinner) auf dem jeweiligen Button waehrend der Operation.
- Fehlermeldungen in roter Infobox unterhalb des Buttons.

## Interaktionen

### JSON-Export

1. Benutzer klickt **"JSON exportieren"**.
2. Button zeigt Lade-Spinner.
3. Server-Call (`exportAllData`): Laedt alle 9 Datenschluessel aus der Datenbank fuer den aktuellen Benutzer.
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
5. Bei Validierungsfehler: Fehlermeldung anzeigen, Abbruch.
6. Bei gueltigem JSON: Server-Call (`importData`) mit dem geparsten Objekt.
7. Server validiert jeden Datensatz einzeln und schreibt gueltige Eintraege in die DB.
8. Server gibt `ImportErgebnis` zurueck.
9. Client zeigt Zusammenfassung an:
   - Erfolgreich importierte Schluessel mit Anzahl.
   - Uebersprungene/unbekannte Schluessel.
   - Eventuelle Fehler.

### CSV-Export

1. Benutzer klickt **"CSV exportieren"**.
2. Button zeigt Lade-Spinner.
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

| Abhaengigkeit            | Beschreibung                                                 |
| ------------------------ | ------------------------------------------------------------ |
| Alle 9 Datenbanktabellen | Export liest alle Tabellen, Import schreibt in alle Tabellen |
| better-auth Session      | `organizationId` fuer Datenzuordnung                         |
| Drizzle ORM Schema       | Zugriff auf alle relevanten Tabellen                         |
| Spec 06 (Audits)         | `audits`, `auditors` Tabellen                                |
| Spec 07 (Kalender)       | `calendar_entries` Tabelle                                   |
| Spec 09 (Auditplan)      | `saved_plans` Tabelle                                        |
| Spec 10 (Notizen)        | `saved_notes` Tabelle                                        |

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
