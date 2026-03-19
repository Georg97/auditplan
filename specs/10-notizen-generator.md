# Spec 10: Notizen-Generator (Auditnotizen-Generator)

## Datenmodell

```typescript
// ══════════════════════════════════════════════
// ENUMS & KONSTANTEN
// ══════════════════════════════════════════════

/**
 * Bewertungstypen (§26)
 */
// Display text comes from i18n
type BewertungsTyp = 'major_nonconformity' | 'minor_nonconformity' | 'observation' | 'improvement_potential' | 'positive_finding';

// ══════════════════════════════════════════════
// DRIZZLE-SCHEMA (Turso / SQLite) — normalisiert
// ══════════════════════════════════════════════

/**
 * Haupttabelle: audit_notes
 * Top-level entity — Header-Felder als eigene Spalten, kein JSON-Blob.
 * IDs: crypto.randomUUID()
 * organizationId sitzt nur hier; alle Kind-Tabellen erben ueber FK.
 */
interface AuditNotes {
	id: string; // PK, crypto.randomUUID()
	organizationId: string; // FK -> organization.id
	name: string; // Anzeigename

	// Header-Felder (ehem. NotizenHeader)
	firma: string;
	standards: string;
	zertifikat: string;
	auditart: string;
	datumVon: string; // ISO-Date
	datumBis: string; // ISO-Date
	standort: string;
	auditor: string;
	seiteVon: string;
	seiteBis: string;

	// Logo
	logoBase64: string | null;

	// Timestamps & Audit
	createdAt: string;
	updatedAt: string;
	createdBy: string; // FK -> user.id
	updatedBy: string; // FK -> user.id
}

/**
 * notizen_block
 * Ein Notizen-Block innerhalb einer AuditNotes-Instanz.
 * FK: auditNotesId -> audit_notes.id (CASCADE DELETE)
 */
interface NotizenBlock {
	id: string; // PK, crypto.randomUUID()
	auditNotesId: string; // FK -> audit_notes.id
	position: number; // Sortierung / Drag & Drop

	// Block-Felder
	datum: string; // ISO-Date
	uhrzeitVon: string; // "HH:mm"
	uhrzeitBis: string; // "HH:mm"
	istRemote: boolean;

	organisationseinheit: string;
	auditor: string;
	gespraechspartner: string;

	// Notizen-Felder
	beschreibung: string; // Multi-line, Auto-Fill
	vorstellung: string; // Multi-line, Default-Text
	allgemein: string; // Multi-line, Default-Text
	notizen: string; // Multi-line
	dokumente: string; // Multi-line
	zusammenfassung: string; // Multi-line, Auto-Fill

	// Auto-Fill-Schutz
	manuellBeschreibung: boolean;
	manuellZusammenfassung: boolean;
	manuellThema: boolean;
	manuellNormkapitel: boolean;
}

/**
 * notizen_block_toggles
 * 1:1 mit NotizenBlock — Toggle-Zustaende fuer Export-Sichtbarkeit.
 * FK: notizenBlockId -> notizen_block.id (CASCADE DELETE)
 */
interface NotizenBlockToggles {
	id: string; // PK, crypto.randomUUID()
	notizenBlockId: string; // FK -> notizen_block.id (UNIQUE)

	datum: boolean; // Default: true
	uhrzeit: boolean; // Default: true
	remote: boolean; // Default: true
	dokumenteAnzeigen: boolean; // Default: true
	bewertungAnzeigen: boolean; // Default: true
	notizenAnzeigen: boolean; // Default: true
}

/**
 * notizen_block_qhse_dokument
 * QHSE-Dokumente innerhalb eines Blocks (§25).
 * FK: notizenBlockId -> notizen_block.id (CASCADE DELETE)
 */
interface NotizenBlockQhseDokument {
	id: string; // PK, crypto.randomUUID()
	notizenBlockId: string; // FK -> notizen_block.id
	position: number; // Sortierung

	name: string; // Dokumentname
	datum: string; // ISO-Date
	notizen: string; // Freitext
}

/**
 * notizen_block_bewertung
 * Bewertungseintrag innerhalb eines Blocks (§26).
 * FK: notizenBlockId -> notizen_block.id (CASCADE DELETE)
 */
interface NotizenBlockBewertung {
	id: string; // PK, crypto.randomUUID()
	notizenBlockId: string; // FK -> notizen_block.id
	position: number; // Sortierung

	typ: BewertungsTyp;
	beschreibung: string; // Freitext
}

/**
 * notizen_block_bewertung_kapitel
 * Junction: Bewertung <-> Normkapitel (m:n).
 * FK: bewertungId -> notizen_block_bewertung.id (CASCADE DELETE)
 * kapitelId referenziert die ID eines Normkapitels aus der Wissensdatenbank.
 */
interface NotizenBlockBewertungKapitel {
	id: string; // PK, crypto.randomUUID()
	bewertungId: string; // FK -> notizen_block_bewertung.id
	kapitelId: string; // FK -> Normkapitel (Wissensdatenbank)
	position: number; // Sortierung
}

/**
 * notizen_block_normkapitel
 * Junction: NotizenBlock <-> Normkapitel (m:n).
 * FK: notizenBlockId -> notizen_block.id (CASCADE DELETE)
 * normkapitelId referenziert die ID eines Normkapitels aus der Wissensdatenbank.
 */
interface NotizenBlockNormkapitel {
	id: string; // PK, crypto.randomUUID()
	notizenBlockId: string; // FK -> notizen_block.id
	normkapitelId: string; // FK -> Normkapitel (Wissensdatenbank)
	position: number; // Sortierung
}

// ──────────────────────────────────────────────
// Auto-Population Mappings (§23.2)
// ──────────────────────────────────────────────
// Identisch zu §23.1 (Spec 09), wiederverwendete Typen:

type AbteilungBeschreibungen = Record<string, string>;
type ZusammenfassungBeschreibungen = Record<string, string>;
type AbteilungNormkapitel = Record<string, string[]>;
type AbteilungThemen = Record<string, string[]>;
```

## UI-Beschreibung

### Gesamtlayout

Die Seite ist ein langes, scrollbares Formular. Oben eine fixierte Aktionsleiste, dann der Header-Bereich, danach die Notizen-Bloecke.

### Aktionsleiste (fixiert, oben)

Aktionsleiste mit folgenden Funktionen:

- **Speichern**: Speichert Notizen in DB.
- **Generieren**: Generiert Word-Dokument (.docx).
- **Zuruecksetzen**: Loescht alle Eingaben (mit Bestaetigung).

### Header-Bereich

Header mit Formularfeldern und Logo-Upload.

#### Formularfelder

Folgende Felder sind im Header enthalten:

- Firma/Auftraggeber (Text)
- Standard(s) (Text)
- Zertifikat (Text)
- Auditart (Text)
- Datum Von (Date), Datum Bis (Date)
- Standort(e) (Text)
- Auditor (Text)
- Seite Von (Text), Seite Bis (Text)

#### Logo-Upload

- File upload fuer Bildformate.
- Vorschau des hochgeladenen Bildes.
- Entfernen-Funktion, nur sichtbar wenn Logo vorhanden.
- Logo wird als Base64-String gespeichert.

### Notizen-Bloecke (§24.2)

#### Block-Verwaltung

- Bloecke koennen hinzugefuegt werden.
- Bloecke werden in einem Array gespeichert und nach `position` sortiert.

#### Block-Operationen (§24.3)

Jeder Block unterstuetzt folgende Operationen:

- **Loeschen**: Mit Bestaetigung per AlertDialog, dann Entfernen.
- **Duplizieren**: Deep Copy aller Werte, Toggles, QHSE-Dokumente, Bewertungen.
- **Verschieben**: Block nach oben/unten verschieben.
- **Drag & Drop**: Block per Drag & Drop neu positionieren.

#### Block-Kopfzeile

- **Block-Titel**: Organisationseinheit (oder "Neuer Block" als Platzhalter).

#### Block-Felder

Identisch zu den Audit-Block-Zeilen aus Spec 09:

- **Datum**: Date picker (Toggle-gesteuert).
- **Uhrzeit Von / Bis**: Time picker (Toggle-gesteuert).
- **Remote**: Checkbox (Toggle-gesteuert).
- **Organisationseinheit**: Texteingabe mit Vorschlaegen aus 26+ vordefinierten Abteilungen.
- **Normkapitel**: Searchable Multiselect, gefiltert nach Organisationseinheit.
- **Thema**: Searchable Multiselect mit Custom-Eintraegen, gefiltert nach Organisationseinheit.
- **Element/Prozess**: Searchable Multiselect mit Custom-Eintraegen.
- **Auditor**: Textfeld.
- **Gespraechspartner**: Textfeld.

#### Collapsible notes section with 6 text fields

| Feld            | Auto-Fill                                           |
| --------------- | --------------------------------------------------- |
| Beschreibung    | Aus `abteilungBeschreibungen[organisationseinheit]` |
| Vorstellung     | Default-Text                                        |
| Allgemein       | Default-Text                                        |
| Notizen         | Leer                                                |
| Dokumente       | Leer                                                |
| Zusammenfassung | Aus `zusammenfassungBeschreibungen[org.einheit]`    |

#### 6 per-block visibility toggles (§22.2)

Pro Block 6 Toggles fuer Export-Sichtbarkeit:

| Toggle             | Default | Wirkung                                             |
| ------------------ | ------- | --------------------------------------------------- |
| Datum              | an      | Datum im Word-Export ein-/ausblenden                |
| Uhrzeit            | an      | Uhrzeitfelder im Word-Export ein-/ausblenden        |
| Remote             | an      | Remote-Kennzeichnung im Word-Export ein-/ausblenden |
| Dokumente anzeigen | an      | QHSE-Dokumente im Word-Export ein-/ausblenden       |
| Bewertung anzeigen | an      | Bewertungsfelder im Word-Export ein-/ausblenden     |
| Notizen anzeigen   | an      | Notizen im Word-Export ein-/ausblenden              |

Toggle-Zustaende werden bei allen Operationen erhalten: Duplizieren, Verschieben, Speichern, Laden, Export.

#### QHSE-Dokumente (§25)

Innerhalb jedes Blocks:

- QHSE-Dokumente koennen hinzugefuegt, geloescht (mit Bestaetigung) und nach oben/unten verschoben werden.
- Jedes Dokument hat folgende Felder:

  | Feld    | Typ         | Beschreibung         |
  | ------- | ----------- | -------------------- |
  | Name    | Text input  | Dokumentname         |
  | Datum   | Date picker | Dokumentdatum        |
  | Notizen | Text input  | Freitext-Anmerkungen |

#### Bewertungsfelder (§26)

Innerhalb jedes Blocks:

- Bewertungen koennen hinzugefuegt und geloescht werden (Loeschen ohne zusaetzliche Bestaetigung).
- Default-Typ bei neuer Bewertung: "Beobachtung" (`observation`).
- Jede Bewertung hat folgende Felder:

  | Feld         | Beschreibung                                          |
  | ------------ | ----------------------------------------------------- |
  | Typ          | Auswahl aus 5 Bewertungstypen (siehe `BewertungsTyp`) |
  | Kapitel      | Searchable Multiselect fuer ISO-Kapitel               |
  | Beschreibung | Multi-line text area (Freitext)                       |

**Bewertungstypen:** `major_nonconformity`, `minor_nonconformity`, `observation`, `improvement_potential`, `positive_finding`. Jeder Typ soll visuell unterscheidbar dargestellt werden (z.B. durch Farbkodierung nach Schweregrad).

## Interaktionen

### Speichern

1. Klick auf **Speichern**.
2. Client serialisiert das gesamte `NotizenDaten`-Objekt zu JSON.
3. Server-Call (`saveNotes`): Speichert in `saved_notes`-Tabelle.
4. Bei bestehendem Datensatz: Update. Bei neuem: Insert.
5. Erfolgsmeldung (Toast-Notification).
6. Alle Toggle-Zustaende, QHSE-Dokumente, Bewertungen und Auto-Fill-Flags werden mitserialisiert.

### Word-Export (Generieren)

1. Klick auf **Generieren**.
2. Client bereitet die Daten auf:
   - Toggle-Zustaende pro Block bestimmen, welche Felder erscheinen.
   - Export-Toggles bestimmen, welche Abschnitte (Dokumente, Bewertung, Notizen) enthalten sind.
3. Server-Call (`generateNotesWord`): Erstellt .docx-Datei.
4. Word-Dokument-Struktur:
   - Header-Daten als Tabelle oben.
   - Pro Notizen-Block eine Tabelle mit den sichtbaren Feldern.
   - QHSE-Dokumente (wenn aktiviert): Jedes Dokument als eigene Zeile.
   - Bewertungen (wenn aktiviert): Jede Bewertung als eigene Zeile mit Typ, Kapitel und Beschreibung.
5. Datei wird zum Download angeboten.

### Zuruecksetzen

1. Klick auf **Zuruecksetzen**.
2. AlertDialog: _"Alle Eingaben werden unwiderruflich geloescht. Fortfahren?"_
3. Bei Bestaetigung: Alle Felder auf Initialwerte zuruecksetzen.

### Notizen-Block hinzufuegen (§24.2)

1. Klick auf Block hinzufuegen.
2. Ein neuer Block wird erstellt:
   - Neue UUID.
   - Position: letzter Index + 1.
   - Alle Felder auf Initialwerte (leere Strings, Default-Toggles auf `true`).
   - Leere Arrays fuer QHSE-Dokumente und Bewertungen.
3. Block erscheint am Ende der Liste.

### Notizen-Block duplizieren (§24.3)

1. Duplizieren eines Blocks.
2. **Deep Copy** des gesamten Blocks:
   - Neue UUID fuer Block, alle QHSE-Dokumente und alle Bewertungen.
   - Alle Feldwerte werden kopiert.
   - Alle 6 Toggle-Zustaende werden kopiert.
   - Alle QHSE-Dokumente werden kopiert (inkl. Name, Datum, Notizen).
   - Alle Bewertungen werden kopiert (inkl. Typ, Kapitel, Beschreibung).
   - Alle `manuellBearbeitet`-Flags werden kopiert.
3. Kopie wird direkt unterhalb des Originals eingefuegt.

### Notizen-Block loeschen (§24.3)

1. Loeschen eines Blocks.
2. AlertDialog: _"Notizen-Block wirklich loeschen? Alle Eintraege, QHSE-Dokumente und Bewertungen gehen verloren."_
3. Bei Bestaetigung: Block wird aus dem Array entfernt.

### Notizen-Block verschieben (§24.3)

1. **Nach oben/unten**: `position`-Werte werden getauscht. Alle Toggle-Zustaende, QHSE-Dokumente und Bewertungen bleiben erhalten.
2. **Drag & Drop**: Positionen werden nach dem Drop neu berechnet. Alle Daten bleiben intakt.

### QHSE-Dokument hinzufuegen (§25)

1. Klick auf Dokument hinzufuegen innerhalb eines Blocks.
2. Neues leeres Dokument-Objekt wird dem `qhseDokumente`-Array angefuegt.
3. Felder sind sofort bearbeitbar.

### QHSE-Dokument loeschen (§25)

1. Loeschen eines Dokuments.
2. AlertDialog: _"QHSE-Dokument '{name}' wirklich loeschen?"_
3. Bei Bestaetigung: Dokument wird aus dem Array entfernt.

### QHSE-Dokument verschieben (§25)

1. Dokument wird im Array um eine Position nach oben/unten verschoben.

### Bewertung hinzufuegen (§26)

1. Klick auf Bewertung hinzufuegen innerhalb eines Blocks.
2. Neues Bewertungs-Objekt mit Default-Typ "Beobachtung" wird angefuegt.
3. Felder sind sofort bearbeitbar.

### Bewertung loeschen (§26)

1. Bewertung wird aus dem Array entfernt (ohne zusaetzliche Bestaetigung).

### Auto-Population bei Organisationseinheit-Aenderung (§23.2)

Identisch zu §23.1 (Spec 09):

1. Benutzer waehlt/tippt eine neue Organisationseinheit.
2. System prueft fuer jedes Auto-Fill-Feld, ob `manuellBearbeitet` = false.
3. Nicht-manuell-bearbeitete Felder werden aktualisiert:
   - Normkapitel -> gefiltert
   - Themen -> gefiltert
   - Beschreibung -> aus Mapping
   - Zusammenfassung -> aus Mapping
4. Block-Titel wird aktualisiert.

### Toggle-Zustand-Erhaltung

Die 6 Toggles pro Block werden in folgenden Situationen vollstaendig erhalten:

| Operation   | Toggle-Erhaltung                                    |
| ----------- | --------------------------------------------------- |
| Duplizieren | Alle 6 Toggles werden in die Kopie uebernommen      |
| Verschieben | Toggles bleiben am Block (unveraendert)             |
| Speichern   | Toggles werden als Teil des JSON serialisiert       |
| Laden       | Toggles werden aus dem JSON deserialisiert          |
| Export      | Toggles bestimmen die Sichtbarkeit im Word-Dokument |

## Abhaengigkeiten

### Intern (Projekt)

| Abhaengigkeit           | Beschreibung                                       |
| ----------------------- | -------------------------------------------------- |
| `saved_notes`-Tabelle   | Persistierung der Notizen-Daten                    |
| better-auth Session     | `organizationId` fuer Speichern/Laden              |
| Drizzle ORM Schema      | Tabellendefinition `saved_notes`                   |
| Spec 09 (Auditplan)     | Datenuebernahme von "Auditnotizen generieren"      |
| Spec 08 (Import/Export) | `saved_notes` wird exportiert/importiert           |
| Auto-Population Maps    | Identische Mappings wie Spec 09 (wiederverwendet)  |
| Organisationseinheiten  | Identische Konstante wie Spec 09 (wiederverwendet) |

### Extern (Bibliotheken)

| Paket          | Verwendung                                                    |
| -------------- | ------------------------------------------------------------- |
| SvelteKit      | Routing (`/notes-generator`), Server-Funktionen               |
| Svelte 5       | Reaktive Zustandsverwaltung (`$state`, `$derived`, `$effect`) |
| Tailwind CSS 4 | Layout, responsive Design                                     |
| Drizzle ORM    | CRUD fuer `saved_notes`                                       |
| Turso          | SQLite-Datenbank (libsql)                                     |
| better-auth    | Authentifizierung, Session-Management                         |
| Bun            | Runtime, Paketmanager                                         |
| docx (o.ae.)   | Word-Generierung                                              |
