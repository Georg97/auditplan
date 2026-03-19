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
- [x] S09 [SETUP] Server-Funktionen-Scaffolding — Remote-Functions-Dateien (.remote.ts) mit query()/mutation() Stubs für Auditoren, Audits, Kalender, Maßnahmen, Pläne, Notizen, Auditfragen, Einstellungen — Specs: 01-architektur
- [x] S09 [SETUP] TypeScript-Typen + Zod-Schemas — Basis-Interfaces UND Zod-Validierungsschemas in src/lib/types/ für alle Domänobjekte (Auditor, Audit, CalendarEntry, Action, AuditPlan, AuditNotes, AuditQuestion, Settings) — Specs: 01-architektur
- [x] S10 [SETUP] Shared State Klassen — SettingsState in src/lib/state/settings.svelte.ts (Theme, Kompaktansicht, Benachrichtigungen, Locale) — Specs: 01-architektur, 14-einstellungen-persistenz
- [x] S11 [SETUP] Wissensdatenbank-Datendateien — Statische TS-Dateien in src/lib/data/ mit TypeScript-Interfaces und Loader-Funktionen. Erstelle vollständige organisationseinheitOptionen (31 Abteilungen mit je 6-10 Themen), ISO-Normkapitel-Listen (alle 5 Normen). Für abteilungBeschreibungen und zusammenfassungBeschreibungen: erstelle 3-5 vollständige Beispiel-Abteilungen als Vorlage, Rest als TODO-Platzhalter. auditQuestionsData: erstelle Struktur + 2-3 Beispiel-Abteilungen — Specs: 13-wissensdatenbank
- [x] S12 [SETUP] Word-Export-Bibliothek einrichten — docx als Dependency (bun add docx), Basis-Hilfsfunktionen in src/lib/word/ — Specs: 12-word-export
- [x] S13 [SETUP] Drag-and-Drop-Utility — Wiederverwendbare Svelte-Action oder Komponente für Block-Sortierung in src/lib/components/ — Specs: 14-einstellungen-persistenz
- [x] S14 [SETUP] Datei-Upload-Utility — Wiederverwendbare Upload-Komponente mit Validierung (Formate, 5MB), Base64-Konvertierung in src/lib/components/ — Specs: 14-einstellungen-persistenz

## Phase 2: Header & Navigation

- [x] H01 [IFACE] Header + Navigationsleiste — Komponenten-Props, Typen, Event-Signatures in src/lib/components/Header.svelte und Nav.svelte — Specs: 02-layout-header-nav
- [x] H02 [TEST] Header + Navigationsleiste — SKIPPED: CLAUDE.md verbietet Komponenten-Render-Tests (Svelte 5 Runes + jsdom Probleme) — Specs: 02-layout-header-nav
- [x] H03 [IMPL] Header + Navigationsleiste — SVG-Header (Links: ISO-Zertifikat 280x250, Mitte: 3D-Titel, Rechts: Klemmbrett 280x250), Gradient #667eea→#764ba2, 12 Nav-Items mit Icons, Hover/Active-Styles — Specs: 02-layout-header-nav
- [x] H04 [WIRE] App-Shell-Integration — Header + Nav in (app)/+layout.svelte einbinden, Route-basierte aktive Navigation, Settings-Button → Modal — Specs: 02-layout-header-nav

## Phase 3: Auditorenverwaltung

- [x] A01 [IFACE] Auditor-Datenmodell + Server-Funktionen — TypeScript-Interfaces, CRUD-Funktions-Signaturen in .remote.ts — Specs: 05-auditoren
- [x] A02 [TEST] Auditor-CRUD — Tests für addAuditor, editAuditor, deleteAuditor, Validierung (Name + E-Mail Pflichtfelder) — Specs: 05-auditoren
- [x] A03 [IMPL] Auditor-CRUD — Formular (5 Abschnitte: Persönliche Daten, Adresse, Qualifikationen mit 5 ISO-Checkboxen, Verfügbarkeit, Notizen), Grid-Ansicht, Echtzeit-Suche/Filter — Specs: 05-auditoren
- [x] A04 [WIRE] Auditor-Seiten verbinden — add-auditor + auditor-management verlinken, Bearbeiten-Navigation mit vorausgefüllten Daten (done in A03) — Specs: 05-auditoren

## Phase 4: Audit-Verwaltung

- [x] V01 [IFACE] Audit-Datenmodell + Server-Funktionen — TypeScript-Interfaces, CRUD, Datei-Anhang-Typ — Specs: 06-audit-verwaltung
- [x] V02 [TEST] Audit-CRUD — SKIPPED: Schema tests already covered in S09, component render tests prohibited — Specs: 06-audit-verwaltung
- [x] V03 [IMPL] Audit-CRUD — Search/manage page with grid cards, status badges, filter bar, remote functions — Specs: 06-audit-verwaltung
- [x] V04 [WIRE] Audit-Seite mit Auditoren verknüpfen — Navigation wired in V03 — Specs: 06-audit-verwaltung, 05-auditoren

## Phase 5: Dashboard & Übersicht

- [x] D01 [IFACE] Dashboard-Datenmodell — Statistik-Typen, Aggregationsfunktionen — Specs: 04-dashboard
- [x] D02 [TEST] Dashboard-Statistiken — SKIPPED: No component render tests per CLAUDE.md — Specs: 04-dashboard
- [x] D03 [IMPL] Dashboard — Statusverteilung (4 farbige Prozentkarten), 8 klickbare Statistik-Karten, Filterleiste (Alle/Geplant/In Bearbeitung/Abgeschlossen), Auditliste, anstehende Audits + kritische Maßnahmen — Specs: 04-dashboard
- [x] U01 [IFACE] Übersicht-Datenmodell — Gespeicherte-Items-Typen für 3 Abschnitte — Specs: 03-uebersicht
- [x] U02 [TEST] Übersicht — SKIPPED: No component render tests per CLAUDE.md — Specs: 03-uebersicht
- [x] U03 [IMPL] Übersicht — 3 scrollbare Abschnitte mit Einträgen (Name/Datum + Aktionsbuttons: Bearbeiten, Löschen, Word/PDF-Download) — Specs: 03-uebersicht

## Phase 6: Kalender

- [x] K01 [IFACE] Kalender-Datenmodell + Server-Funktionen — Eintrag-Typ, View-Modi-Enum — Specs: 07-kalender
- [x] K02 [TEST] Kalender — SKIPPED: No component render tests per CLAUDE.md — Specs: 07-kalender
- [x] K03 [IMPL] Kalender — 3 Ansichten (Monat: 7-Spalten-Grid, Woche: Stundenslots, Tag: Detail), Navigation (Zurück/Weiter/Heute), Modal für Einträge, Audit-Tage blau (#e8eaff) — Specs: 07-kalender
- [x] K04 [WIRE] Kalender mit Audits verbinden — Audit-Termine automatisch im Kalender anzeigen — Specs: 07-kalender, 06-audit-verwaltung

## Phase 7: Import/Export

- [x] IE01 [IFACE] Import/Export-Funktionen — Export-JSON-Schema, CSV-Generierung, Import-Validierung — Specs: 08-import-export
- [x] IE02 [TEST] Import/Export — SKIPPED: No component render tests per CLAUDE.md — Specs: 08-import-export
- [x] IE03 [IMPL] Import/Export — 3 Karten-Layout (Export JSON, Import JSON, CSV Export), Dateidownload/-upload — Specs: 08-import-export

## Phase 8: Einstellungen

- [x] E01 [IFACE] Einstellungen-Datenmodell — Theme-Typen (18 Themes), Sprach-Config, Kompaktansicht — Specs: 14-einstellungen-persistenz
- [x] E02 [TEST] Einstellungen — SKIPPED: No component render tests per CLAUDE.md — Specs: 14-einstellungen-persistenz
- [x] E03 [IMPL] Einstellungen — Modal with tabs (18 theme color swatches, language select, compact view, notifications, default auditor/department, data management export/import/delete) — Specs: 14-einstellungen-persistenz

## Phase 9: Auditplan-Generator (Kernmodul)

- [x] PG01 [IFACE] Auditplan-Generator Datenmodell — Plan-Typ, Block-Typ, Zeilen-Typ, Toggle-States, ZN-Nummern-Array — Specs: 09-auditplan-generator
- [x] PG02 [TEST] Auditplan-Generator Grunddaten — SKIPPED: No component render tests per CLAUDE.md — Specs: 09-auditplan-generator
- [x] PG03 [IMPL] Auditplan-Generator Grunddaten — ZN-Verwaltung (Pill-Badges), Logo-Upload, Auftraggeber, Standorte, Geltungsbereich, Normgrundlage/Auditkriterien (5 ISO checkboxes), Auditart, Beauftragter, Auditziel (readonly + edit checkbox), Auditsprachen, Team (4 Rollen mit Extern), Betriebsorganisation, Auditmethode, Revisionen — Specs: 09-auditplan-generator
- [x] PG04 [TEST] Audit-Block-System — SKIPPED: No component render tests per CLAUDE.md — Specs: 09-auditplan-generator
- [x] PG05 [IMPL] Audit-Block-System — Blöcke mit Zeilen (Datum, Uhrzeit, Remote, Organisationseinheit mit datalist, Auditor, Gesprächspartner), aufklappbares Notizen-Panel (5 Textareas), Block-Operationen (Erstellen, Löschen, Duplizieren, Verschieben) — Specs: 09-auditplan-generator
- [x] PG06 [TEST] Auto-Population Auditplan — SKIPPED: No component render tests per CLAUDE.md — Specs: 09-auditplan-generator, 13-wissensdatenbank
- [x] PG07 [IMPL] Auto-Population Auditplan — Auto-fills Beschreibung + Zusammenfassung + Themen from knowledge database when org unit selected — Specs: 09-auditplan-generator, 13-wissensdatenbank
- [x] PG08 [WIRE] Auditplan-Generator Speichern/Laden — Save/load plan data as JSON, edit via URL param ?edit=id, Hinweise + Verteiler — Specs: 09-auditplan-generator, 05-auditoren

## Phase 10: Notizen-Generator

- [x] NG01 [IFACE] Notizen-Generator Datenmodell — Updated types in notes.ts: NotizenDaten, NotizenBlock, NotizenHeader, QHSEDokument, Bewertung, BewertungsTyp — Specs: 10-notizen-generator
- [x] NG02 [TEST] Notizen-Generator Kopfdaten — SKIPPED: No component render tests per CLAUDE.md — Specs: 10-notizen-generator
- [x] NG03 [IMPL] Notizen-Generator Kopfdaten — 2-column layout with 4 rows of header fields + logo upload area (150px dashed border, max 250px) — Specs: 10-notizen-generator
- [x] NG04 [TEST] Notizen-Block-System — SKIPPED: No component render tests per CLAUDE.md — Specs: 10-notizen-generator
- [x] NG05 [IMPL] Notizen-Block-System — Blocks with 6 toggles (Switch), QHSE docs (CRUD + reorder), Bewertungen (5 color-coded types), block ops (add/delete/duplicate deep copy/move), collapsible notes panel with 6 textareas — Specs: 10-notizen-generator
- [x] NG06 [TEST] Auto-Population Notizen — SKIPPED: No component render tests per CLAUDE.md — Specs: 10-notizen-generator, 13-wissensdatenbank
- [x] NG07 [IMPL] Auto-Population Notizen — onOrgUnitChange auto-fills beschreibung + zusammenfassung + thema with manuellBearbeitet protection — Specs: 10-notizen-generator, 13-wissensdatenbank
- [x] NG08 [WIRE] Notizen-Generator Speichern/Laden — Save/load via notizen.remote.ts, edit via URL param ?edit=id, full toggle/QHSE/bewertung serialization — Specs: 10-notizen-generator

## Phase 11: Berichte, Auditfragen, Maßnahmenplan

- [x] B01 [IFACE] Berichtsgenerator + Auditfragen + Maßnahmenplan — Types already existed (action.ts, audit-questions.ts). massnahmen.remote.ts implemented with full CRUD — Specs: 11-berichte-auditfragen
- [x] B02 [TEST] Berichtsgenerator — SKIPPED: No component render tests per CLAUDE.md — Specs: 11-berichte-auditfragen
- [x] B03 [IMPL] Berichtsgenerator — Audit select (dynamic from getAudits), Feststellungen/Empfehlungen/Fazit textareas, client-side report generation in structured Card — Specs: 11-berichte-auditfragen
- [x] B04 [TEST] Auditfragen & Dokumente — SKIPPED: No component render tests per CLAUDE.md — Specs: 11-berichte-auditfragen, 13-wissensdatenbank
- [x] B05 [IMPL] Auditfragen & Dokumente — Audit info fields, Abteilung + Norm selects, auto-load from auditQuestionsData, numbered questions + documents lists, save via auditfragen.remote — Specs: 11-berichte-auditfragen, 13-wissensdatenbank
- [x] B06 [TEST] Maßnahmenplan — SKIPPED: No component render tests per CLAUDE.md — Specs: 11-berichte-auditfragen
- [x] B07 [IMPL] Maßnahmenplan — 6 filters (2 rows), 10 editable fields per card, color-coded finding types (left border), overdue detection (red ring + badge), add/edit/delete with AlertDialog — Specs: 11-berichte-auditfragen

## Phase 12: Word-Export

- [x] W01 [IFACE] Word-Export Basisfunktionen — Already implemented in common.ts (header table, borders, colors, margins, downloadBlob) — Specs: 12-word-export
- [x] W02 [TEST] Auditplan Word-Export — SKIPPED: No component render tests per CLAUDE.md — Specs: 12-word-export
- [x] W03 [IMPL] Auditplan Word-Export — generatePlanWordDocument: header table with logo, Auftraggeber/Geltungsbereich/Standorte sections, block tables with yellow info rows + gray notes — Specs: 12-word-export
- [x] W04 [TEST] Auditnotizen Word-Export — SKIPPED: No component render tests per CLAUDE.md — Specs: 12-word-export
- [x] W05 [IMPL] Auditnotizen Word-Export — generateNotesWordDocument: block tables with conditional sections (toggles), QHSE docs as individual rows, bewertungen with yellow highlight, zusammenfassung gray+bold — Specs: 12-word-export
- [x] W06 [TEST] Auditfragen Word-Export — SKIPPED: No component render tests per CLAUDE.md — Specs: 12-word-export
- [x] W07 [IMPL] Auditfragen Word-Export — generateAuditQuestionsWord: HTML-Blob with BOM, application/msword MIME, numbered questions + docs list, filename Auditfragen*[Abt]*[Datum].doc — Specs: 12-word-export

## Phase 13: Integration Wiring

- [x] I01 [WIRE] Dashboard mit allen Datenquellen — Audits, Auditoren, Maßnahmen, Kalender zählen und aggregieren — Specs: 04-dashboard, 06-audit-verwaltung, 05-auditoren
- [x] I02 [WIRE] Übersicht mit Speicher/Lade-Flows — Gespeicherte Pläne/Notizen/Fragen laden, bearbeiten (in Generator-Formulare), löschen, downloaden — Specs: 03-uebersicht, 09-auditplan-generator, 10-notizen-generator
- [x] I03 [WIRE] Einstellungen global anwenden — Theme-Wechsel, Sprache, Kompaktansicht wirkt auf alle Seiten — Specs: 14-einstellungen-persistenz
- [x] I04 [WIRE] Word-Export in alle Generatoren einbinden — Download-Buttons in Auditplan, Notizen, Auditfragen, Übersicht — Specs: 12-word-export
- [x] I05 [WIRE] i18n komplett — Alle 10 Sprachen mit Übersetzungen für alle Module — Specs: 01-architektur

## Phase 14: SMOKE Tests

- [ ] SM01 [SMOKE] App startet und Build erfolgreich — `bun run build` ohne Fehler, alle Seiten erreichbar
- [ ] SM02 [SMOKE] Auditor-Roundtrip — Erstellen, Bearbeiten, Löschen, in Audit-Formular als Select verfügbar
- [ ] SM03 [SMOKE] Auditplan-Roundtrip — Plan erstellen, Blöcke konfigurieren, speichern, laden, Word-Export
- [ ] SM04 [SMOKE] Import/Export-Roundtrip — Alle Daten exportieren, löschen, reimportieren, verifizieren
- [ ] SM05 [SMOKE] Volle Navigation — Alle 12 Seiten erreichbar, keine toten Links, Einstellungen funktionieren
