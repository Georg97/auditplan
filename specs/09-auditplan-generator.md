# Spec 09: Auditplan-Generator (Kernmodul)

## Datenmodell

> **Alle Tabellen sind normalisiert. Child-Tabellen referenzieren Parent via Foreign Key mit CASCADE DELETE.**

```typescript
// ══════════════════════════════════════════════
// ENUMS & KONSTANTEN
// ══════════════════════════════════════════════

// Display text comes from i18n
type AuditartOption =
	| 'initial_certification'
	| 'surveillance_audit'
	| 'recertification'
	| 'internal'
	| 'supplier'
	| 'process_audit'
	| 'system_audit'
	| 'product_audit'
	| 'combined_audit'
	| 'transfer_audit'
	| 'preliminary_audit'
	| 'delta_audit'
	| 'follow_up_audit'
	| 'unannounced_audit'
	| 'remote_audit'
	| 'hybrid_audit';

// Display text comes from i18n
type AuditSprache = 'de' | 'en' | 'fr' | 'es' | 'it' | 'pt' | 'nl' | 'pl' | 'cs' | 'tr' | 'ru' | 'zh' | 'ja' | 'ko';

// Display text comes from i18n
type Schichtsystem = 'single_shift' | 'double_shift' | 'triple_shift' | 'other';

// Display text comes from i18n
type Auditmethode = 'on_site' | 'on_site_and_remote' | 'fully_remote';

// Display text comes from i18n
type TeamRolle = 'lead_auditor' | 'auditors' | 'trainees' | 'experts';

// ISO-Normen (5+1 Checkboxen)
const ISO_NORMEN = [
	{ id: 'iso9001', label: 'ISO 9001:2015' },
	{ id: 'iso14001', label: 'ISO 14001:2015' },
	{ id: 'iso45001', label: 'ISO 45001:2018' },
	{ id: 'iso50001', label: 'ISO 50001:2018' },
	{ id: 'iso27001', label: 'ISO/IEC 27001:2022' },
	{ id: 'andere', label: 'Andere (Freitext)' }
] as const;

// Organisationseinheiten (26+ Abteilungen)
const ORGANISATIONSEINHEITEN: string[] = [
	'Geschäftsführung',
	'Qualitätsmanagement',
	'Umweltmanagement',
	'Arbeitssicherheit',
	'Produktion',
	'Logistik',
	'Einkauf',
	'Vertrieb',
	'Marketing',
	'Personal / HR',
	'Finanzen / Buchhaltung',
	'IT / EDV',
	'Forschung & Entwicklung',
	'Konstruktion',
	'Instandhaltung',
	'Lager / Warenannahme',
	'Versand',
	'Kundendienst',
	'Rechtsabteilung',
	'Facility Management',
	'Energiemanagement',
	'Informationssicherheit',
	'Datenschutz',
	'Ausbildung',
	'Projektmanagement',
	'Unternehmenskommunikation'
	// Weitere koennen hinzugefuegt werden
];

// ══════════════════════════════════════════════
// DRIZZLE-SCHEMA (Turso / SQLite) — NORMALISIERT
// ══════════════════════════════════════════════
// IDs: crypto.randomUUID() fuer alle Tabellen.
// organizationId nur auf AuditPlan — Child-Tabellen erben Org-Scope via FK-Kette.

/**
 * Haupttabelle: audit_plans
 * Top-Level-Container fuer einen Auditplan.
 */
interface AuditPlan {
	id: string; // crypto.randomUUID()
	organizationId: string; // FK -> organization.id
	name: string; // Planname fuer Anzeige
	logoBase64: string | null;
	logoDateiname: string | null;
	createdBy: string; // FK -> user.id
	updatedBy: string; // FK -> user.id
	createdAt: string; // ISO timestamp
	updatedAt: string; // ISO timestamp
}

/**
 * Grunddaten des Auditplans.
 * 1:1-Beziehung zu AuditPlan.
 */
interface AuditPlanGrunddaten {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	auftraggeber: string; // Multi-line
	geltungsbereich: string; // Multi-line
	beauftragter: string;
	auditziel: string; // Standard-Text, readonly bis Checkbox
	auditzielEditierbar: boolean;
	auditartFreitext: string;
	schichtsystem: Schichtsystem;
	schichtsystemFreitext: string;
	schichtuebergaben: string;
	bemerkungBetrieb: string;
	auditmethode: Auditmethode;
	iktTechnik: string;
	iktTestdatum: string; // ISO-Date
	testLetztesAudit: boolean;
	gastgeber: string;
	revisionOrtDatum: string;
	revisionAenderungWaehrendAudit: string;
	revisionKommentare: string;
	hinweiseInfoText: string;
	verteiler: string; // Multi-line
	verteilungAuditteam: boolean;
	verteilungGeschaeftsfuehrung: boolean;
	verteilungFachabteilungen: boolean;
	verteilungExtern: boolean;
}

/**
 * Normgrundlage: ausgewaehlte Normen fuer einen Auditplan.
 * n:1-Beziehung zu AuditPlan (eine Zeile pro ausgewaehlter Norm).
 */
interface AuditPlanNorm {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	normId: string; // ID aus ISO_NORMEN (z.B. 'iso9001', 'andere')
	freitext: string; // Nur relevant wenn normId = 'andere'
	position: number;
}

/**
 * Junction-Tabelle: Auditarten eines Auditplans.
 * n:1-Beziehung zu AuditPlan (eine Zeile pro ausgewaehlter Auditart).
 */
interface AuditPlanAuditart {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	auditartId: string; // From AuditartOption enum or custom text
	isCustom: boolean; // true if user-defined
	position: number;
}

/**
 * Junction-Tabelle: Auditsprachen eines Auditplans.
 * n:1-Beziehung zu AuditPlan (eine Zeile pro ausgewaehlter Sprache).
 */
interface AuditPlanAuditsprache {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	sprache: AuditSprache; // From AuditSprache type
	position: number;
}

/**
 * Standorte des Auditplans.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanStandort {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	name: string;
	position: number;
}

/**
 * Revisionen des Auditplans.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanRevision {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	nummer: string; // Auto: "Rev. 1.0", "Rev. 2.0", ...
	datum: string; // ISO-Date
	beschreibung: string; // Multi-line
	position: number;
}

/**
 * Team-Mitglieder des Auditplans.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanTeamMitglied {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	rolle: TeamRolle;
	auditorId: string | null; // FK -> auditors.id (optional, fuer interne)
	externalName: string; // Name (Freitext, fuer externe oder Override)
	externalCompany: string; // Firmenname (nur wenn istExtern = true)
	istExtern: boolean;
	position: number;
}

/**
 * Auditzeiten-Tabelle: eine Tabelle pro Auditor+Standort-Kombination.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanAuditzeit {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	auditorId: string | null; // FK -> auditors.id (null for external auditors)
	auditorName: string; // Denormalized for display. auditorId is the FK. If auditorId is null, this is an external auditor and auditorName is the primary identifier.
	standortId: string; // FK -> audit_plan_standorte.id
	standortName: string;
	position: number;
}

/**
 * Einzelne Zeile in einer Auditzeiten-Tabelle.
 * n:1-Beziehung zu AuditPlanAuditzeit.
 */
interface AuditPlanAuditzeitZeile {
	id: string; // crypto.randomUUID()
	auditzeitId: string; // FK -> audit_plan_auditzeiten.id, CASCADE DELETE
	startzeit: string; // "HH:mm"
	endzeit: string; // "HH:mm"
	aktivitaet: string;
	stunden: number; // Auto-berechnet aus Start/Ende
	position: number;
}

/**
 * Audit-Block: Container fuer Audit-Block-Zeilen.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanBlock {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	position: number; // Fuer Sortierung / Drag & Drop
}

/**
 * Einzelne Zeile in einem Audit-Block.
 * n:1-Beziehung zu AuditPlanBlock.
 */
interface AuditPlanBlockZeile {
	id: string; // crypto.randomUUID()
	blockId: string; // FK -> audit_plan_blocks.id, CASCADE DELETE
	datum: string; // ISO-Date
	uhrzeitVon: string; // "HH:mm"
	uhrzeitBis: string; // "HH:mm"
	istRemote: boolean;
	organisationseinheit: string;
	auditor: string;
	gespraechspartner: string;
	// elementProzess: see junction table AuditPlanBlockZeileElementProzess
	manuellBearbeitetBeschreibung: boolean;
	manuellBearbeitetZusammenfassung: boolean;
	manuellBearbeitetThema: boolean;
	manuellBearbeitetNormkapitel: boolean;
	position: number;
}

/**
 * Notizen fuer eine Audit-Block-Zeile.
 * 1:1-Beziehung zu AuditPlanBlockZeile.
 */
interface AuditPlanBlockZeileNotizen {
	id: string; // crypto.randomUUID()
	zeileId: string; // FK -> audit_plan_block_zeilen.id, CASCADE DELETE
	beschreibung: string; // Multi-line, Auto-Fill aus abteilungBeschreibungen
	vorstellung: string; // Multi-line, Default-Text
	allgemein: string; // Multi-line, Default-Text
	notizen: string; // Multi-line
	dokumente: string; // Multi-line
	zusammenfassung: string; // Multi-line, Auto-Fill aus zusammenfassungBeschreibungen
}

/**
 * Toggles fuer eine Audit-Block-Zeile (steuern Word-Export).
 * 1:1-Beziehung zu AuditPlanBlockZeile.
 */
interface AuditPlanBlockZeileToggles {
	id: string; // crypto.randomUUID()
	zeileId: string; // FK -> audit_plan_block_zeilen.id, CASCADE DELETE
	datumToggle: boolean; // Default: true
	uhrzeitToggle: boolean; // Default: true
	remoteToggle: boolean; // Default: true
}

/**
 * Junction-Tabelle: Normkapitel einer Audit-Block-Zeile.
 * n:n-Beziehung zwischen AuditPlanBlockZeile und Normkapiteln.
 */
interface AuditPlanBlockZeileNormkapitel {
	id: string; // crypto.randomUUID()
	zeileId: string; // FK -> audit_plan_block_zeilen.id, CASCADE DELETE
	normkapitelId: string; // Referenz auf Normkapitel-Eintrag
	position: number;
}

/**
 * Junction-Tabelle: Themen einer Audit-Block-Zeile.
 * n:n-Beziehung zwischen AuditPlanBlockZeile und Themen.
 */
interface AuditPlanBlockZeileThemen {
	id: string; // crypto.randomUUID()
	zeileId: string; // FK -> audit_plan_block_zeilen.id, CASCADE DELETE
	themaId: string | null; // Referenz auf vordefiniertes Thema (null bei Custom)
	customText: string; // Freitext (nur wenn themaId = null)
	position: number;
}

/**
 * Junction-Tabelle: Element/Prozess einer Audit-Block-Zeile.
 * n:1-Beziehung zu AuditPlanBlockZeile (Multiselect + Custom).
 */
interface AuditPlanBlockZeileElementProzess {
	id: string; // crypto.randomUUID()
	zeileId: string; // FK -> audit_plan_block_zeilen.id, CASCADE DELETE
	value: string; // Predefined or custom text
	isCustom: boolean; // true if user-defined
	position: number;
}

/**
 * Zertifikatsnummern des Auditplans.
 * n:1-Beziehung zu AuditPlan.
 */
interface AuditPlanZnNummer {
	id: string; // crypto.randomUUID()
	auditPlanId: string; // FK -> audit_plans.id, CASCADE DELETE
	value: string; // Die Zertifikatsnummer
	position: number;
}

// ──────────────────────────────────────────────
// Auto-Population Mappings (§23.1)
// ──────────────────────────────────────────────

/**
 * Mapping: Organisationseinheit -> Beschreibungstext
 * Wird bei Aenderung der Organisationseinheit in einer
 * Audit-Block-Zeile angewendet (nur wenn nicht manuell bearbeitet).
 */
type AbteilungBeschreibungen = Record<string, string>;

/**
 * Mapping: Organisationseinheit -> Zusammenfassungstext
 */
type ZusammenfassungBeschreibungen = Record<string, string>;

/**
 * Mapping: Organisationseinheit -> gefilterte Normkapitel
 */
type AbteilungNormkapitel = Record<string, string[]>;

/**
 * Mapping: Organisationseinheit -> Themen
 */
type AbteilungThemen = Record<string, string[]>;
```

## UI-Beschreibung

### Gesamtlayout

Die Seite ist ein langes, scrollbares Formular mit einer fixierten Aktionsleiste am oberen Rand. Die einzelnen Sektionen sind vertikal untereinander angeordnet, jeweils in einer ShadCN Card mit Titel.

### Aktionsleiste (fixiert, oben)

Horizontale Leiste mit 5 Buttons:

| Button                  | Typ        | Beschreibung                                     |
| ----------------------- | ---------- | ------------------------------------------------ |
| Speichern               | Primaer    | Speichert Plan in DB                             |
| Als Word generieren     | Sekundaer  | Generiert .docx-Datei                            |
| Als PDF generieren      | Sekundaer  | Generiert .pdf-Datei                             |
| Auditnotizen generieren | Sekundaer  | Uebertraegt Daten an Notizen-Generator (Spec 10) |
| Formular zuruecksetzen  | Destruktiv | Loescht alle Eingaben (mit Bestaetigung)         |

### Sektion: ZN-Verwaltung (Zertifikatsnummern)

- **Eingabefeld** + **Hinzufuegen-Button**: Textfeld fuer neue ZN, Button mit `+`-Icon.
- **Anzeige**: Pill-Badges (ShadCN Badge) nebeneinander.
  - Jede Pill zeigt die ZN und hat einen `x`-Button zum Loeschen.
- Daten gespeichert in `zertifikatsnummern: string[]`.

### Sektion: Logo-Upload

- **File upload**: Akzeptiert Bildformate, gestylt als Button.
- **Vorschau**: Bild in einem image preview container mit dashed border in brand color.
- **Entfernen-Button**: Unter der Vorschau, nur sichtbar wenn Logo vorhanden.
- Logo wird als Base64-String gespeichert.

### Sektion: Grunddaten

#### Auftraggeber

- Multi-line text area.

#### Standorte (dynamische Liste)

- Jeder Standort: Textfeld + Loeschen-Button (Papierkorb-Icon).
- **Hinzufuegen-Button**: _"+ Standort hinzufuegen"_ am Ende der Liste.
- Mindestens 1 Standort muss vorhanden sein.

#### Geltungsbereich

- Multi-line text area, frei skalierbar.

#### Normgrundlage / Auditkriterien (Custom Multiselect)

- **5+1 ISO-Checkboxen**: Jede Norm als Checkbox mit Label.
- **Durchsuchbares Dropdown**: Textfeld zum Filtern der Normen.
- Ausgewaehlte Normen werden als Pills unterhalb angezeigt.

### Sektion: Auditdetails

#### Auditart (Searchable Multiselect)

- Dropdown mit 16 vordefinierten Auditarten (siehe `AuditartOption`).
- Suchfeld zum Filtern.
- Moeglichkeit, benutzerdefinierte Eintraege hinzuzufuegen (Freitext-Eingabe + Enter).
- Ausgewaehlte Arten als Pills.

#### Beauftragter

- Einfaches Textfeld.

#### Auditziel

- Multi-line text area (readonly, muted background).
- Standardtext (vordefiniert, ca. 3-4 Saetze zum Auditzweck).
- **Checkbox**: _"Auditziel bearbeiten"_ -- schaltet text area auf editierbar um (default background).

#### Auditsprache (Multiselect)

- Dropdown mit 14 Sprachen.
- Mehrfachauswahl moeglich.
- Ausgewaehlte Sprachen als Pills.

### Sektion: Audit-Team

4 Rollengruppen, jeweils als Untersektion:

| Rolle       | Felder                                                    |
| ----------- | --------------------------------------------------------- |
| Auditleiter | Name (text area), Extern (Checkbox), Firmenname (bedingt) |
| Auditoren   | Name (text area), Extern (Checkbox), Firmenname (bedingt) |
| Trainees    | Name (text area), Extern (Checkbox), Firmenname (bedingt) |
| Experten    | Name (text area), Extern (Checkbox), Firmenname (bedingt) |

- **Firmenname-Feld**: Nur sichtbar, wenn `istExtern = true`.
- Jede Rolle kann mehrere Eintraege haben (dynamische Liste mit Hinzufuegen/Entfernen).

### Sektion: Betriebsorganisation

#### Schichtsystem

- 4 Radio-Buttons: 1-Schicht, 2-Schicht, 3-Schicht, Anderes.
- Bei "Anderes": Freitextfeld erscheint.

#### Schichtuebergaben

- Textfeld.

#### Bemerkung

- Textfeld.

### Sektion: Auditmethode

#### Methode

- 3 Radio-Buttons: vor Ort, vor Ort & remote, 100% remote.

#### IKT-Technik

- Textfeld (z.B. "Microsoft Teams", "Zoom").

#### IKT-Testdatum

- Date picker.

#### Test letztes Audit

- Checkbox: _"IKT-Technik wurde im letzten Audit getestet"_.

#### Gastgeber

- Textfeld.

### Sektion: Revisionen

- **Dynamische Liste** mit automatischer Nummerierung.
- Jede Revision:
  - **Nummer** (readonly): "Rev. 1.0", "Rev. 2.0", "Rev. 3.0", ...
  - **Datum**: Date picker.
  - **Beschreibung**: Multi-line text area.
  - **Loeschen-Button**: Papierkorb-Icon.
- **Hinzufuegen-Button**: _"+ Revision hinzufuegen"_.
- Zusaetzliche Felder:
  - **Ort/Datum**: Textfeld.
  - **Aenderung waehrend Audit**: Multi-line text area.
  - **Kommentare**: Multi-line text area.

### Sektion: Auditzeiten-Uebersicht

- **Tabelle hinzufuegen-Button**: _"+ Auditzeiten-Tabelle hinzufuegen"_.
- Jede Tabelle:
  - **Kopf**: Auditor (Select aus Team-Mitgliedern), Standort (Select aus Standorten).
  - **Zeilen** (dynamisch):

    | Startzeit | Endzeit | Aktivitaet | Stunden |
    | --------- | ------- | ---------- | ------- |
    | HH:mm     | HH:mm   | Freitext   | Auto    |

  - **Zeile hinzufuegen**: Button unter der Tabelle.
  - **Gesamtsumme**: Automatisch berechnete Stundensumme am Tabellenende.
  - Stunden pro Zeile: `(endzeit - startzeit)` in Dezimalstunden.

### Sektion: Audit-Bloecke (§24.1, §22.1, §23.1, §24.3)

Dies ist der komplexeste Teil des Auditplan-Generators.

#### Block-Verwaltung

- **Block hinzufuegen-Button**: _"+ Audit-Block hinzufuegen"_ -- erstellt einen neuen Block.
- Jeder Block hat eine eindeutige Timestamp-ID (`Date.now().toString()`).
- Bloecke werden in einem Array gespeichert und nach `position` sortiert.

#### Block-Operationen (§24.3)

Jeder Block hat in der Kopfzeile folgende Aktions-Buttons:

| Aktion      | Icon/Button           | Beschreibung                                      |
| ----------- | --------------------- | ------------------------------------------------- |
| Loeschen    | Papierkorb            | Bestaetigung per AlertDialog, dann Entfernen      |
| Duplizieren | Kopieren-Icon         | Deep Copy aller Werte, Toggles, QHSE, Bewertungen |
| Nach oben   | Pfeil hoch            | Block eine Position nach oben verschieben         |
| Nach unten  | Pfeil runter          | Block eine Position nach unten verschieben        |
| Drag & Drop | Griff-Icon (6 Punkte) | Block per Drag & Drop neu positionieren           |

#### Zeilen pro Block

Jeder Block kann mehrere Zeilen enthalten. Jede Zeile hat folgende Felder:

**Hauptfelder:**

| Feld                 | Typ                     | Beschreibung                                    |
| -------------------- | ----------------------- | ----------------------------------------------- |
| Datum                | Date picker             | Toggle-gesteuert (§22.1)                        |
| Uhrzeit Von          | Time picker             | Toggle-gesteuert (§22.1)                        |
| Uhrzeit Bis          | Time picker             | Toggle-gesteuert (§22.1)                        |
| Remote               | Checkbox                | Toggle-gesteuert (§22.1)                        |
| Organisationseinheit | Text input mit datalist | 26+ vordefinierte Abteilungen                   |
| Normkapitel          | Searchable Multiselect  | Gefiltert nach Organisationseinheit             |
| Thema                | Searchable Multiselect  | + Custom-Eintraege, gefiltert nach Org.-einheit |
| Element/Prozess      | Searchable Multiselect  | + Custom-Eintraege                              |
| Auditor              | Textfeld                |                                                 |
| Gespraechspartner    | Textfeld                |                                                 |

**Toggles (§22.1):**

Drei Toggles pro Zeile, die bestimmen, ob das jeweilige Feld im Word-Export erscheint:

- **Datum-Toggle**: Wenn aus, wird das Datum im Export nicht angezeigt.
- **Uhrzeit-Toggle**: Wenn aus, werden Uhrzeit Von/Bis im Export nicht angezeigt.
- **Remote-Toggle**: Wenn aus, wird die Remote-Kennzeichnung im Export nicht angezeigt.

Die Toggles sind als ShadCN Switch Komponenten neben den jeweiligen Feldern positioniert.

**Notizen-Panel (aufklappbar):**

Unter jeder Zeile befindet sich ein aufklappbares Panel (ShadCN Collapsible) mit folgenden Textfeldern:

| Feld            | Auto-Fill                                           |
| --------------- | --------------------------------------------------- |
| Beschreibung    | Aus `abteilungBeschreibungen[organisationseinheit]` |
| Vorstellung     | Default-Text (vordefiniert)                         |
| Allgemein       | Default-Text (vordefiniert)                         |
| Notizen         | Leer                                                |
| Dokumente       | Leer                                                |
| Zusammenfassung | Aus `zusammenfassungBeschreibungen[org.einheit]`    |

#### Auto-Population (§23.1)

Bei Aenderung der **Organisationseinheit** in einer Zeile werden folgende Aktionen ausgeloest:

1. **Normkapitel filtern**: Nur die fuer die Abteilung relevanten Normkapitel werden im Multiselect angezeigt (aus `AbteilungNormkapitel`).
2. **Themen aktualisieren**: Themen-Dropdown wird mit abteilungsspezifischen Optionen befuellt (aus `AbteilungThemen`).
3. **Beschreibung auto-fuellen**: Das Notizen-Feld "Beschreibung" wird mit dem Text aus `abteilungBeschreibungen` gefuellt.
4. **Zusammenfassung auto-fuellen**: Das Notizen-Feld "Zusammenfassung" wird mit dem Text aus `zusammenfassungBeschreibungen` gefuellt.
5. **Label aktualisieren**: Die Zeilen-Ueberschrift zeigt den Abteilungsnamen.
6. **Block-Titel aktualisieren**: Der Block-Titel zeigt die Organisationseinheit der ersten Zeile.

**Auto-Fill-Schutz**: Wenn der Benutzer ein Auto-Fill-Feld manuell bearbeitet hat (`manuellBearbeitet.*` = true), wird dieses Feld bei erneuter Aenderung der Organisationseinheit **nicht** ueberschrieben. Der Schutz wird pro Feld individuell getrackt.

### Sektion: Hinweise und Verteiler

- **Info-Box**: Informational variant background, readonly Text mit Hinweisen zum Auditplan.
- **Verteiler**: Multi-line text area fuer Freitext-Verteilerliste.
- **4 Verteilungs-Checkboxen**:
  - Auditteam
  - Geschaeftsfuehrung
  - Fachabteilungen
  - Extern

## Interaktionen

### Speichern

1. Klick auf **Speichern**.
2. Client serialisiert das gesamte `AuditplanDaten`-Objekt zu JSON.
3. Server-Call (`savePlan`): Speichert in `saved_plans`-Tabelle.
4. Bei bestehendem Plan: Update. Bei neuem Plan: Insert.
5. Erfolgsmeldung (Toast-Notification).

### Word-Export

1. Klick auf **Als Word generieren**.
2. Client bereitet die Daten auf (Toggles beruecksichtigen, leere Felder ausblenden).
3. Server-Call (`generateWord`): Erstellt .docx-Datei.
4. Datei wird zum Download angeboten.
5. Toggle-Zustaende bestimmen, welche Spalten/Felder im Dokument erscheinen.

### PDF-Export

1. Wie Word-Export, aber als .pdf.
2. Server-Call (`generatePdf`).

### Auditnotizen generieren

1. Klick auf **Auditnotizen generieren**.
2. Relevante Daten (Audit-Bloecke, Grunddaten, Team) werden an den Notizen-Generator (Spec 10) uebertragen.
3. Navigation zu `/notes-generator` mit vorausgefuellten Daten.

### Formular zuruecksetzen

1. Klick auf **Formular zuruecksetzen**.
2. Bestaetigung per AlertDialog: _"Alle Eingaben werden unwiderruflich geloescht. Fortfahren?"_
3. Bei Bestaetigung: Alle Felder auf Initialwerte zuruecksetzen.

### ZN hinzufuegen

1. Benutzer tippt ZN in das Eingabefeld.
2. Klick auf "Hinzufuegen" oder Enter.
3. ZN wird dem Array hinzugefuegt und als Pill angezeigt.
4. Eingabefeld wird geleert.

### ZN loeschen

1. Klick auf `x` an einer ZN-Pill.
2. ZN wird aus dem Array entfernt.

### Logo hochladen

1. Klick auf Upload-Button oeffnet Datei-Dialog.
2. Bild wird als Base64 gelesen.
3. Vorschau wird im Container angezeigt.

### Logo entfernen

1. Klick auf "Entfernen".
2. `logoBase64` und `logoDateiname` werden auf `null` gesetzt.
3. Vorschau verschwindet.

### Standort hinzufuegen/entfernen

1. **Hinzufuegen**: Neuer leerer Standort-Eintrag wird an die Liste angefuegt.
2. **Entfernen**: Standort wird aus der Liste entfernt (min. 1 muss bleiben).

### Revision hinzufuegen

1. Klick auf "Revision hinzufuegen".
2. Neue Revision mit automatischer Nummer (naechste ganze Zahl + ".0") wird angefuegt.
3. Datum ist auf heute voreingestellt.

### Auditzeitzeile hinzufuegen

1. Klick auf "Zeile hinzufuegen" in einer Auditzeiten-Tabelle.
2. Neue leere Zeile wird angefuegt.
3. Bei Eingabe von Start- und Endzeit: Stunden werden automatisch berechnet.
4. Gesamtsumme aktualisiert sich automatisch.

### Audit-Block hinzufuegen (§24.1)

1. Klick auf "Audit-Block hinzufuegen".
2. Ein neuer Block wird erstellt:
   - Neue ID: `Date.now().toString()`.
   - Position: letzter Index + 1.
   - Eine leere Zeile wird initial hinzugefuegt.
3. Block erscheint am Ende der Block-Liste.

### Audit-Block duplizieren (§24.3)

1. Klick auf Duplizieren-Icon in der Block-Kopfzeile.
2. Deep Copy des gesamten Blocks:
   - Neue ID fuer Block und alle Zeilen.
   - Alle Feldwerte werden kopiert.
   - Alle Toggle-Zustaende werden kopiert.
   - Alle Notizen werden kopiert.
   - Alle `manuellBearbeitet`-Flags werden kopiert.
3. Kopie wird direkt unterhalb des Originals eingefuegt.

### Audit-Block loeschen (§24.3)

1. Klick auf Loeschen-Icon.
2. AlertDialog: _"Audit-Block wirklich loeschen? Alle Zeilen und Notizen gehen verloren."_
3. Bei Bestaetigung: Block wird aus dem Array entfernt.

### Audit-Block verschieben (§24.3)

1. **Nach oben/unten**: `position`-Werte werden getauscht.
2. **Drag & Drop**: Positionen werden nach dem Drop neu berechnet.

### Auto-Population bei Organisationseinheit-Aenderung (§23.1)

1. Benutzer waehlt/tippt eine neue Organisationseinheit in einer Audit-Block-Zeile.
2. System prueft fuer jedes Auto-Fill-Feld, ob `manuellBearbeitet` = false.
3. Nur nicht-manuell-bearbeitete Felder werden aktualisiert:
   - Normkapitel -> gefiltert
   - Themen -> gefiltert
   - Beschreibung -> aus Mapping
   - Zusammenfassung -> aus Mapping
4. Block-Titel und Zeilen-Label werden immer aktualisiert.

## Abhaengigkeiten

### Intern (Projekt)

| Abhaengigkeit           | Beschreibung                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| `saved_plans`-Tabelle   | Persistierung der Auditplan-Daten                                |
| `auditors`-Tabelle      | Auditor-Auswahl in Auditzeiten und Team                          |
| better-auth Session     | `organizationId` fuer Speichern/Laden                            |
| Drizzle ORM Schema      | Tabellendefinition `saved_plans`                                 |
| Spec 10 (Notizen)       | Datenuebergabe bei "Auditnotizen generieren"                     |
| Spec 08 (Import/Export) | `saved_plans` wird exportiert/importiert                         |
| Auto-Population Maps    | `abteilungBeschreibungen`, `zusammenfassungBeschreibungen`, etc. |
| Organisationseinheiten  | Konstante Liste (26+ Eintraege)                                  |

### Extern (Bibliotheken)

| Paket               | Verwendung                                                         |
| ------------------- | ------------------------------------------------------------------ |
| SvelteKit           | Routing (`/plan-generator`), Server-Funktionen                     |
| Svelte 5            | Reaktive Zustandsverwaltung (`$state`, `$derived`, `$effect`)      |
| ShadCN-svelte       | Card, Button, Select, Checkbox, Switch, Badge, Collapsible, Dialog |
| Tailwind CSS 4      | Formularlayout, responsive Design                                  |
| Drizzle ORM         | CRUD fuer `saved_plans`                                            |
| Turso               | SQLite-Datenbank (libsql)                                          |
| better-auth         | Authentifizierung, Session-Management                              |
| Bun                 | Runtime, Paketmanager                                              |
| docx (o.ae.)        | Word-Generierung (z.B. `docx` npm-Paket)                           |
| pdf-lib / puppeteer | PDF-Generierung                                                    |
