# fix_plan.md — ISO Audit Manager

## Task Tags

- `[SETUP]` — Infrastructure, config, scaffolding (verify: `make check-no-test`)
- `[IFACE]` — Interface definition + stub (verify: `make check-no-test`)
- `[TEST]` — Test suite from spec (verify: `make check-no-test`)
- `[IMPL]` — Implementation to make tests pass (verify: `make check`)
- `[WIRE]` — Integration between components (verify: `make check`)
- `[SMOKE]` — End-to-end smoke test (verify: `make check`)

---

# Tasks

## Phase 1: SETUP

- [x] S01 [SETUP] ShadCN-Komponenten installieren — Via CLI installieren (NICHT manuell erstellen). WICHTIG: --no-git Flag verwenden! `bunx shadcn-svelte@next add dialog select checkbox radio-group textarea popover command table alert-dialog sheet progress scroll-area dropdown-menu --no-git` — Specs: 01-architektur
- [x] S03 [SETUP] TanStack Table + DataTable-Wrapper — Reusable DataTable.svelte Komponente in src/lib/components/ erstellen, die @tanstack/svelte-table mit ShadCN table-Styling kombiniert — Specs: 01-architektur
- [x] S04 [SETUP] i18n-System aufsetzen — i18next installieren (bereits vorhanden), I18nRune Klasse in src/lib/i18n/i18n.svelte.ts erstellen, static/locales/de.json mit initialen Schlüsseln für Navigation + gemeinsame Labels, 9 weitere Locale-Stubs (en/fr/es/it/nl/pt/pl/ru/tr.json), i18n-Context in (app)/+layout.svelte via setContext() — Specs: 01-architektur
- [x] S05 [SETUP] Datenbankschema erstellen — Drizzle-Tabellen für Auditoren, Audits, Kalendereinträge, Maßnahmen, Auditpläne, Auditnotizen, Auditfragen, Einstellungen in src/db/schema.ts. JEDE Fachdaten-Tabelle MUSS organizationId-Spalte haben (Org-basierte Mandantenfähigkeit). better-auth Organization Plugin einrichten in src/lib/auth.ts. Nach Schema-Änderung `make db-push` ausführen! — Specs: 01-architektur, 14-einstellungen-persistenz
- [x] S06 [SETUP] App-Layout erstellen — (app)/+layout.server.ts mit Auth-Guard (redirect zu /login wenn !locals.user), (app)/+layout.svelte mit Header-Slot, Nav-Slot, i18n-Context + SettingsState via setContext() — Specs: 02-layout-header-nav, 01-architektur
- [x] S07 [SETUP] SvelteKit-Routen-Scaffolding — Alle 12 Seiten als leere +page.svelte unter (app)/ Route-Gruppe: overview, dashboard, auditor-management, add-auditor, search-manage, calendar, import-export, plan-generator, report-generator, notes-generator, audit-questions, action-plan — Specs: 02-layout-header-nav
- [x] S08 [SETUP] Bestehende Demo-Inhalte entfernen — +page.svelte Demo-Code und data.remote.ts Beispieldaten entfernen, console.log-Statements entfernen, @ts-ignore in hooks.server.ts durch korrekte Typen ersetzen, Root-Seite durch Redirect zu /overview ersetzen — Specs: 01-architektur
- [x] S09 [SETUP] Server-Funktionen-Scaffolding — Remote-Functions-Dateien (.remote.ts) mit query()/command() Stubs für Auditoren, Audits, Kalender, Maßnahmen, Pläne, Notizen, Auditfragen, Einstellungen — Specs: 01-architektur
- [x] S09 [SETUP] TypeScript-Typen + Zod-Schemas — Basis-Interfaces UND Zod-Validierungsschemas in src/lib/types/ für alle Domänobjekte (Auditor, Audit, CalendarEntry, Action, AuditPlan, AuditNotes, AuditQuestion, Settings) — Specs: 01-architektur
- [x] S10 [SETUP] Shared State Klassen — SettingsState in src/lib/state/settings.svelte.ts (Theme, Kompaktansicht, Benachrichtigungen, Locale) — Specs: 01-architektur, 14-einstellungen-persistenz
- [x] S11 [SETUP] Wissensdatenbank-Datendateien — Statische TS-Dateien in src/lib/data/ mit TypeScript-Interfaces und Loader-Funktionen. Erstelle vollständige organisationseinheitOptionen (31 Abteilungen mit je 6-10 Themen), ISO-Normkapitel-Listen (alle 5 Normen). Für abteilungBeschreibungen und zusammenfassungBeschreibungen: erstelle 3-5 vollständige Beispiel-Abteilungen als Vorlage, Rest als TODO-Platzhalter. auditQuestionsData: erstelle Struktur + 2-3 Beispiel-Abteilungen — Specs: 13-wissensdatenbank
- [x] S12 [SETUP] Word-Export-Bibliothek einrichten — docx als Dependency (bun add docx), Basis-Hilfsfunktionen in src/lib/word/ — Specs: 12-word-export
- [x] S13 [SETUP] Drag-and-Drop-Utility — Wiederverwendbare Svelte-Action oder Komponente für Block-Sortierung in src/lib/components/ — Specs: 14-einstellungen-persistenz
- [x] S14 [SETUP] Datei-Upload-Utility — Wiederverwendbare Upload-Komponente mit Validierung (Formate, 5MB), Base64-Konvertierung in src/lib/components/ — Specs: 14-einstellungen-persistenz

## Phase 2: Header & Navigation

- [x] H01 [IFACE] Header + Navigationsleiste — Komponenten-Props, Typen, Event-Signatures in src/lib/components/Header.svelte und Nav.svelte — Specs: 02-layout-header-nav
- [x] H02 [TEST] Header + Navigationsleiste — Rendering-Tests, Navigation-Wechsel, Active-State — Specs: 02-layout-header-nav
- [x] H03 [IMPL] Header + Navigationsleiste — SVG-Header (Links: ISO-Zertifikat 280x250, Mitte: 3D-Titel, Rechts: Klemmbrett 280x250), Gradient #667eea→#764ba2, 12 Nav-Items mit Icons, Hover/Active-Styles — Specs: 02-layout-header-nav
- [x] H04 [WIRE] App-Shell-Integration — Header + Nav in (app)/+layout.svelte einbinden, Route-basierte aktive Navigation, Settings-Button → Modal — Specs: 02-layout-header-nav

## Phase 3: Auditorenverwaltung

- [x] A01 [IFACE] Auditor-Datenmodell + Server-Funktionen — TypeScript-Interfaces, CRUD-Funktions-Signaturen in .remote.ts — Specs: 05-auditoren
- [x] A02 [TEST] Auditor-CRUD — Tests für addAuditor, editAuditor, deleteAuditor, Validierung (Name + E-Mail Pflichtfelder) — Specs: 05-auditoren
- [x] A03 [IMPL] Auditor-CRUD — Formular (5 Abschnitte: Persönliche Daten, Adresse, Qualifikationen mit 5 ISO-Checkboxen, Verfügbarkeit, Notizen), Grid-Ansicht, Echtzeit-Suche/Filter — Specs: 05-auditoren
- [x] A04 [WIRE] Auditor-Seiten verbinden — add-auditor + auditor-management verlinken, Bearbeiten-Navigation mit vorausgefüllten Daten — Specs: 05-auditoren

## Phase 4: Audit-Verwaltung

- [x] V01 [IFACE] Audit-Datenmodell + Server-Funktionen — TypeScript-Interfaces, CRUD, Datei-Anhang-Typ — Specs: 06-audit-verwaltung
- [ ] V02 [TEST] Audit-CRUD — Tests für Erstellen, Suchen, Filtern, Datei-Upload, Status-Validierung — Specs: 06-audit-verwaltung
- [ ] V03 [IMPL] Audit-CRUD — Formular (6 Abschnitte: Grundinfo, Zeitplanung, Organisation, Norm, Personal, Notizen+Dokumente), Suchergebnisse als Grid-Karten mit Status-Farbkodierung — Specs: 06-audit-verwaltung
- [ ] V04 [WIRE] Audit-Seite mit Auditoren verknüpfen — Auditor-Select dynamisch aus DB befüllen — Specs: 06-audit-verwaltung, 05-auditoren

## Phase 5: Dashboard & Übersicht

- [ ] D01 [IFACE] Dashboard-Datenmodell — Statistik-Typen, Aggregationsfunktionen — Specs: 04-dashboard
- [ ] D02 [TEST] Dashboard-Statistiken — 8 Karten, Statusverteilung, Filter — Specs: 04-dashboard
- [ ] D03 [IMPL] Dashboard — Statusverteilung (4 farbige Prozentkarten), 8 klickbare Statistik-Karten, Filterleiste (Alle/Geplant/In Bearbeitung/Abgeschlossen), Auditliste, anstehende Audits + kritische Maßnahmen — Specs: 04-dashboard
- [ ] U01 [IFACE] Übersicht-Datenmodell — Gespeicherte-Items-Typen für 3 Abschnitte — Specs: 03-uebersicht
- [ ] U02 [TEST] Übersicht — Gespeicherte Auditfragen, Notizen, Pläne anzeigen — Specs: 03-uebersicht
- [ ] U03 [IMPL] Übersicht — 3 scrollbare Abschnitte mit Einträgen (Name/Datum + Aktionsbuttons: Bearbeiten, Löschen, Word/PDF-Download) — Specs: 03-uebersicht

## Phase 6: Kalender

- [ ] K01 [IFACE] Kalender-Datenmodell + Server-Funktionen — Eintrag-Typ, View-Modi-Enum — Specs: 07-kalender
- [ ] K02 [TEST] Kalender — Monats/Wochen/Tagesansicht, Eintrag-CRUD, Navigation — Specs: 07-kalender
- [ ] K03 [IMPL] Kalender — 3 Ansichten (Monat: 7-Spalten-Grid, Woche: Stundenslots, Tag: Detail), Navigation (Zurück/Weiter/Heute), Modal für Einträge, Audit-Tage blau (#e8eaff) — Specs: 07-kalender
- [ ] K04 [WIRE] Kalender mit Audits verbinden — Audit-Termine automatisch im Kalender anzeigen — Specs: 07-kalender, 06-audit-verwaltung

## Phase 7: Import/Export

- [ ] IE01 [IFACE] Import/Export-Funktionen — Export-JSON-Schema, CSV-Generierung, Import-Validierung — Specs: 08-import-export
- [ ] IE02 [TEST] Import/Export — JSON-Roundtrip, CSV-Format mit BOM, Fehlerbehandlung — Specs: 08-import-export
- [ ] IE03 [IMPL] Import/Export — 3 Karten-Layout (Export JSON, Import JSON, CSV Export), Dateidownload/-upload — Specs: 08-import-export

## Phase 8: Einstellungen

- [ ] E01 [IFACE] Einstellungen-Datenmodell — Theme-Typen (18 Themes), Sprach-Config, Kompaktansicht — Specs: 14-einstellungen-persistenz
- [ ] E02 [TEST] Einstellungen — Theme-Wechsel, Sprache, Standardwerte, Daten-Management — Specs: 14-einstellungen-persistenz
- [ ] E03 [IMPL] Einstellungen — Modal mit Tabs (Global: 18 Theme-Farbvorschauen, Individuell: 3 Bereichsfarben), Kompaktansicht, Benachrichtigungen, Sprachauswahl, Standard-Auditor/-Abteilung, Daten-Management (Export/Import/Löschen) — Specs: 14-einstellungen-persistenz

## Phase 9: Auditplan-Generator (Kernmodul)

- [ ] PG01 [IFACE] Auditplan-Generator Datenmodell — Plan-Typ, Block-Typ, Zeilen-Typ, Toggle-States, ZN-Nummern-Array — Specs: 09-auditplan-generator
- [ ] PG02 [TEST] Auditplan-Generator Grunddaten — Auftraggeber, Standorte (dynamische Liste), Geltungsbereich, Normgrundlage (Multiselect), Auditdetails — Specs: 09-auditplan-generator
- [ ] PG03 [IMPL] Auditplan-Generator Grunddaten — ZN-Verwaltung (Pill-Badges), Logo-Upload, Auftraggeber, Standorte, Geltungsbereich, Normgrundlage/Auditkriterien (Custom-Multiselect 5 ISO), Auditart (16 Typen + Custom), Beauftragter, Auditziel (readonly + Anpass-Checkbox), Auditsprachen, Team (4 Rollen mit Extern), Betriebsorganisation, Auditmethode, Revisionen, Auditzeiten — Specs: 09-auditplan-generator
- [ ] PG04 [TEST] Audit-Block-System — Block-CRUD, Zeilen, Toggles (Datum/Uhrzeit/Remote), Multiselects — Specs: 09-auditplan-generator
- [ ] PG05 [IMPL] Audit-Block-System — Blöcke mit Zeilen (Datum, Uhrzeit, Remote, Organisationseinheit, Normkapitel, Thema, Element, Auditor, Gesprächspartner), aufklappbares Notizen-Panel (6 Textareas), Toggle-System, Block-Operationen (Erstellen, Löschen, Duplizieren, Verschieben, Drag & Drop) — Specs: 09-auditplan-generator
- [ ] PG06 [TEST] Auto-Population Auditplan — Abteilungswechsel befüllt Beschreibung + Zusammenfassung, Auto-Fill-Schutz (manuelle Eingaben nicht überschreiben) — Specs: 09-auditplan-generator, 13-wissensdatenbank
- [ ] PG07 [IMPL] Auto-Population Auditplan — updateElementOptions: Normkapitel filtern, Themen aktualisieren, Beschreibung auto-befüllen (abteilungBeschreibungen), Zusammenfassung auto-befüllen (zusammenfassungBeschreibungen), Labels + Blocktitel aktualisieren — Specs: 09-auditplan-generator, 13-wissensdatenbank
- [ ] PG08 [WIRE] Auditplan-Generator Speichern/Laden — Auditor-Selects aus DB, Standort-Selects, Speichern/Laden aller Plandaten inkl. Blöcke + Toggles + Revisionen, Hinweise + Verteiler — Specs: 09-auditplan-generator, 05-auditoren

## Phase 10: Notizen-Generator

- [ ] NG01 [IFACE] Notizen-Generator Datenmodell — Notizen-Block-Typ, QHSE-Dokument-Typ, Bewertungsfeld-Typ — Specs: 10-notizen-generator
- [ ] NG02 [TEST] Notizen-Generator Kopfdaten — Formularfelder (8 Felder in 4 Reihen), Logo-Upload — Specs: 10-notizen-generator
- [ ] NG03 [IMPL] Notizen-Generator Kopfdaten — 2-spaltiges Layout (Links: Firma, Standards, Zertifikat, Auditart, Datum Von/Bis, Standort, Auditor, Seite Von/Bis; Rechts: Logo 250px) — Specs: 10-notizen-generator
- [ ] NG04 [TEST] Notizen-Block-System — Block-CRUD, 6 Toggles, QHSE-Dokumente (CRUD + Sortierung), Bewertungsfelder (5 Typen, Kapitel-Multiselect) — Specs: 10-notizen-generator
- [ ] NG05 [IMPL] Notizen-Block-System — Blöcke mit 6 Toggles (Datum, Uhrzeit, Remote, Dokumente anzeigen, Bewertung anzeigen, Notizen anzeigen), QHSE-Dokumentverwaltung, Bewertungsfelder, Block-Operationen (Erstellen, Löschen, Duplizieren inkl. tiefe Kopie, Verschieben, Drag & Drop) — Specs: 10-notizen-generator
- [ ] NG06 [TEST] Auto-Population Notizen — Abteilungswechsel, Auto-Fill-Schutz — Specs: 10-notizen-generator, 13-wissensdatenbank
- [ ] NG07 [IMPL] Auto-Population Notizen — handleDepartmentSelectChange: Beschreibung + Zusammenfassung auto-befüllen mit Schutzlogik — Specs: 10-notizen-generator, 13-wissensdatenbank
- [ ] NG08 [WIRE] Notizen-Generator Speichern/Laden — saveAuditNotes, editSavedNotes, Toggle-Zustandserhaltung bei allen Operationen — Specs: 10-notizen-generator

## Phase 11: Berichte, Auditfragen, Maßnahmenplan

- [ ] B01 [IFACE] Berichtsgenerator + Auditfragen + Maßnahmenplan — Interfaces für alle 3 Module — Specs: 11-berichte-auditfragen
- [ ] B02 [TEST] Berichtsgenerator — Formular-Validierung, Report-Generierung — Specs: 11-berichte-auditfragen
- [ ] B03 [IMPL] Berichtsgenerator — Audit-Select (dynamisch), Feststellungen, Empfehlungen, Fazit, generierter Bericht-Container — Specs: 11-berichte-auditfragen
- [ ] B04 [TEST] Auditfragen & Dokumente — Abteilungsauswahl (43 Abteilungen), Normauswahl, Fragengenerierung aus Wissensdatenbank — Specs: 11-berichte-auditfragen, 13-wissensdatenbank
- [ ] B05 [IMPL] Auditfragen & Dokumente — Audit-Info-Felder, Bereichsauswahl (Abteilung + Norm + Kapitel), automatische Fragen + Dokumente, Speichern + Word/PDF-Export — Specs: 11-berichte-auditfragen, 13-wissensdatenbank
- [ ] B06 [TEST] Maßnahmenplan — 6-Filter-Leiste, CRUD, Überfälligkeits-Berechnung — Specs: 11-berichte-auditfragen
- [ ] B07 [IMPL] Maßnahmenplan — 6 Filter (2 Reihen), Maßnahmen-Felder (10 Felder inkl. Feststellungsart farbkodiert, Status, Priorität, Frist), Überfälligkeits-Berechnung + visuelle Hervorhebung — Specs: 11-berichte-auditfragen

## Phase 12: Word-Export

- [ ] W01 [IFACE] Word-Export Basisfunktionen — Shared Typen, Header-Tabelle-Builder, Seitenformatierung-Helpers — Specs: 12-word-export
- [ ] W02 [TEST] Auditplan Word-Export — Seitenrahmen, Kopfzeile, Auftraggeber, Standorte, Block-Tabellen — Specs: 12-word-export
- [ ] W03 [IMPL] Auditplan Word-Export — generateWordDocument: Seitenränder (2700/360 Twips), schwarzer Rahmen, Header-Tabelle (Logo, Daten), Auftraggeber mit Tab-Stops, Standorte, Audit-Blöcke als Tabellen (gelbe Info-Zeile, graue Beschreibung/Zusammenfassung) — Specs: 12-word-export
- [ ] W04 [TEST] Auditnotizen Word-Export — Notizen-Blöcke, bedingte Felder (showDokumente/showBewertung/showNotizen), QHSE-Dokument-Zeilen, Bewertungsfeld-Formatierung — Specs: 12-word-export
- [ ] W05 [IMPL] Auditnotizen Word-Export — generateNotesWordDocument + generateNotesWordDocumentFromBlocks: Block-Tabellen, bedingte Sektionen, QHSE je Zeile, Bewertung fett+gelb, Zusammenfassung grau+fett, Tabellenrahmen (keine vertikalen Innenlinien) — Specs: 12-word-export
- [ ] W06 [TEST] Auditfragen Word-Export — HTML-Blob-Ansatz, .doc Format — Specs: 12-word-export
- [ ] W07 [IMPL] Auditfragen Word-Export — generateAuditQuestionsWord: HTML-Blob mit MIME application/msword, Abteilung + Datum + nummerierte Fragen + Dokumentenliste, Dateiname Auditfragen*[Abt]*[Datum].doc — Specs: 12-word-export

## Phase 13: Integration Wiring

- [ ] I01 [WIRE] Dashboard mit allen Datenquellen — Audits, Auditoren, Maßnahmen, Kalender zählen und aggregieren — Specs: 04-dashboard, 06-audit-verwaltung, 05-auditoren
- [ ] I02 [WIRE] Übersicht mit Speicher/Lade-Flows — Gespeicherte Pläne/Notizen/Fragen laden, bearbeiten (in Generator-Formulare), löschen, downloaden — Specs: 03-uebersicht, 09-auditplan-generator, 10-notizen-generator
- [ ] I03 [WIRE] Einstellungen global anwenden — Theme-Wechsel, Sprache, Kompaktansicht wirkt auf alle Seiten — Specs: 14-einstellungen-persistenz
- [ ] I04 [WIRE] Word-Export in alle Generatoren einbinden — Download-Buttons in Auditplan, Notizen, Auditfragen, Übersicht — Specs: 12-word-export
- [ ] I05 [WIRE] i18n komplett — Alle 10 Sprachen mit Übersetzungen für alle Module — Specs: 01-architektur

## Phase 14: SMOKE Tests

- [ ] SM01 [SMOKE] App startet und Build erfolgreich — `bun run build` ohne Fehler, alle Seiten erreichbar
- [ ] SM02 [SMOKE] Auditor-Roundtrip — Erstellen, Bearbeiten, Löschen, in Audit-Formular als Select verfügbar
- [ ] SM03 [SMOKE] Auditplan-Roundtrip — Plan erstellen, Blöcke konfigurieren, speichern, laden, Word-Export
- [ ] SM04 [SMOKE] Import/Export-Roundtrip — Alle Daten exportieren, löschen, reimportieren, verifizieren
- [ ] SM05 [SMOKE] Volle Navigation — Alle 12 Seiten erreichbar, keine toten Links, Einstellungen funktionieren
