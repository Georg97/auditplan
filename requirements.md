# Detailliertes Anforderungsdokument — Der ISO Audit Manager

**Version:** 1.0
**Datum:** 2026-03-18
**Dokumenttyp:** Funktionale Anforderungsspezifikation (FRS)
**Umfang:** Vollständige Analyse aller Funktionen, Interaktionen und Ausgaben

---

## Inhaltsverzeichnis

1. [Systemarchitektur und technische Anforderungen](#1-systemarchitektur-und-technische-anforderungen)
2. [Header und visuelles Branding](#2-header-und-visuelles-branding)
3. [Navigationsleiste](#3-navigationsleiste)
4. [Modul: Übersicht](#4-modul-übersicht)
5. [Modul: Dashboard](#5-modul-dashboard)
6. [Modul: Auditorenverwaltung](#6-modul-auditorenverwaltung)
7. [Modul: Auditor hinzufügen/bearbeiten](#7-modul-auditor-hinzufügenbearbeiten)
8. [Modul: Audit-Suche & Verwaltung](#8-modul-audit-suche--verwaltung)
9. [Modul: Kalender](#9-modul-kalender)
10. [Modul: Import/Export](#10-modul-importexport)
11. [Modul: Auditplan-Generator](#11-modul-auditplan-generator)
12. [Modul: Berichtsgenerator](#12-modul-berichtsgenerator)
13. [Modul: Auditnotizen-Generator](#13-modul-auditnotizen-generator)
14. [Modul: Auditfragen & Dokumente](#14-modul-auditfragen--dokumente)
15. [Modul: Maßnahmenplan](#15-modul-maßnahmenplan)
16. [Einstellungen](#16-einstellungen)
17. [Word-Dokumentgenerierung — Auditplan](#17-word-dokumentgenerierung--auditplan)
18. [Word-Dokumentgenerierung — Auditnotizen](#18-word-dokumentgenerierung--auditnotizen)
19. [Word-Dokumentgenerierung — Notizen aus Blöcken](#19-word-dokumentgenerierung--notizen-aus-blöcken)
20. [Word-Dokumentgenerierung — Auditfragen](#20-word-dokumentgenerierung--auditfragen)
21. [Wissensdatenbank und vorausgefüllte Inhalte](#21-wissensdatenbank-und-vorausgefüllte-inhalte)
22. [Toggle-System](#22-toggle-system)
23. [Auto-Population und intelligente Befüllung](#23-auto-population-und-intelligente-befüllung)
24. [Block-Management-System](#24-block-management-system)
25. [QHSE-Dokumentverwaltung](#25-qhse-dokumentverwaltung)
26. [Bewertungsfelder und Feststellungen](#26-bewertungsfelder-und-feststellungen)
27. [Datei-Upload und -Verwaltung](#27-datei-upload-und--verwaltung)
28. [Datenpersistenz](#28-datenpersistenz)
29. [Drag & Drop und Sortierung](#29-drag--drop-und-sortierung)

---

## 1. Systemarchitektur und technische Anforderungen

### 1.1 Grundlegende Architekturanforderungen

Die Anwendung muss als Svelte/SvelteKit Anwendung implementiert sein. Der Stack wurde bereits initialisiert. Hauptmerkmale vom Stack:
- Drizzle ORM
- Turso als DB Provider (Auth + Appdata)
- Svelte 5 + SvelteKit mit den neuen Remote Functions
- ShadCN + Tailwind 4 für components & styling

### 1.2 Externe Bibliotheken

need to fill in

### 1.3 Datenhaltung

Sämtliche Daten **MÜSSEN** ausschließlich im `localStorage` des Browsers gespeichert werden. Es darf kein serverseitiger Datenspeicher verwendet werden. Die Daten werden als JSON-Strings serialisiert und unter definierten Schlüsseln abgelegt. Bei jedem Laden der Anwendung werden alle relevanten Daten aus dem localStorage wiederhergestellt. Die Anwendung **MUSS** vollständig offline funktionieren (nach dem initialen Laden der CDN-Bibliotheken).

### 1.4 Sprachunterstützung

Die Anwendung ist primär auf Deutsch ausgelegt. Die Benutzeroberfläche verwendet durchgehend deutschsprachige Labels, Beschreibungen und Platzhalter. Über das Einstellungsmodul kann die UI-Sprache auf 10 verschiedene Sprachen umgestellt werden (Deutsch, Englisch, Französisch, Spanisch, Italienisch, Niederländisch, Portugiesisch, Polnisch, Russisch, Türkisch). Die Internationalisierung wird über `data-i18n`-Attribute im HTML und eine externe `translations.js`-Datei gesteuert.

---

## 2. Header und visuelles Branding

### 2.1 Gesamtstruktur des Headers

Der Header **MUSS** eine visuell ansprechende Kopfzeile darstellen, die das professionelle Branding der Anwendung transportiert. Er besteht aus drei horizontal angeordneten Elementen innerhalb eines Flex-Containers mit `justify-content: space-between`: einem linken SVG-Grafikelement, dem zentralen Titelbereich und einem rechten SVG-Grafikelement. Der Header hat einen Gradient-Hintergrund (standardmäßig von #667eea nach #764ba2), weißen Text und ein Padding von 40px.

### 2.2 Linke SVG-Grafik (ISO-Zertifikat)

Die linke Grafik **MUSS** ein dreidimensional gestaltetes ISO-Zertifikat darstellen, das mit einer Lupe kombiniert ist. Die SVG-Grafik umfasst ca. 280 Zeilen Code und verwendet fortgeschrittene SVG-Techniken: mehrere Gradient-Definitionen (goldGradient, certGradient, sealGradient, glassGradient), Filter-Effekte (shadow3d, innerShadow, glowEffect, emboss, bevel) und Transformationen. Das Zertifikat enthält einen goldenen Kopfbereich mit den Texten "ZERTIFIKAT" und "ISO", ein grünes Qualitätssiegel mit Häkchen, drei ISO-Badges (9001, 14001, 45001), einen Datumsstempel (2025) sowie dekorative Stern- und Glitzereffekte. Die Grafik hat eine Breite von 280px und eine Höhe von 250px.

### 2.3 Zentraler Titelbereich

Der zentrale Bereich **MUSS** den Haupttitel der Anwendung darstellen: "Der ISO Audit Manager" als `<h1>`-Element mit einer Schriftgröße von 2.5rem, Schriftstärke 700, einem vierfachen Text-Schatten und einer perspektivischen 3D-Transformation (`transform: perspective(600px) rotateX(5deg)`). Darunter befinden sich zwei Untertitel-Absätze: "Effizient planen. Normkonform prüfen. Sicher nachweisen." und "Ihr Auditprozess nach ISO: effizient, normkonform, zertifizierungssicher." — beide mit einer Schriftgröße von 1.1rem, Transparenz 0.95 und eigenen 3D-Transformationen.

### 2.4 Rechte SVG-Grafik (Auditplan-Klemmbrett)

Die rechte Grafik **MUSS** ein dreidimensionales Klemmbrett mit Auditplan-Visualisierung darstellen (ca. 346 Zeilen SVG-Code). Sie zeigt vier ISO-Standards-Fortschrittsanzeigen (9001 QM, 14001 UM, 45001 AMS, 50001 EnMS), einen Fortschrittsbalken (60% für ISO 50001), eine Auditorenteam-Visualisierung (4 Personen mit 3D-Effekten), ein Kalender-Icon (oben rechts), ein Dokumenten-/Bericht-Icon (unten rechts) und ein Qualitätsbadge ("GEPRÜFT", unten zentriert). Die Grafik hat dieselben Dimensionen wie die linke (280x250px).

### 2.5 Einstellungs-Button

In der oberen rechten Ecke des Headers **MUSS** ein runder Einstellungs-Button positioniert sein (ID: `settingsBtn`, Klasse: `btn-settings`). Der Button verwendet ein SVG-Zahnradsymbol und hat einen halbtransparenten weißen Hintergrund (`rgba(255, 255, 255, 0.2)`) mit einer halbtransparenten Umrandung. Beim Hover **MUSS** sich der Button um 90 Grad drehen (CSS-Transition). Der Klick auf den Button **MUSS** das Einstellungsmodal öffnen.

---

## 3. Navigationsleiste

### 3.1 Grundstruktur

Die Navigationsleiste **MUSS** als horizontale Flexbox-Leiste mit `flex-wrap: wrap` implementiert sein, die unterhalb des Headers positioniert ist. Sie hat einen hellgrauen Hintergrund (#f8f9fa), einen unteren Rand von 2px (#e0e0e0) und ein Padding von 20px. Die Navigation enthält genau 12 Navigationseinträge, die jeweils als Button-ähnliche Elemente gestaltet sind.

### 3.2 Navigationseinträge

Jeder Navigationseintrag (Klasse: `nav-item`) **MUSS** folgende visuelle Eigenschaften besitzen: einen weißen Hintergrund, eine 2px-Umrandung (#e0e0e0), abgerundete Ecken (8px), ein Padding von 12px 20px, eine Schriftgröße von 0.95rem und Schriftstärke 600 in der Farbe #555. Jeder Eintrag enthält ein SVG-Icon (24x24px) und einen Textlabel. Die Einträge **MÜSSEN** beim Hover die Rahmenfarbe auf #667eea ändern, die Textfarbe auf #667eea umstellen und sich um 2px nach oben verschieben (`translateY(-2px)`). Der aktive Eintrag **MUSS** den Primary-Gradient als Hintergrund und weiße Schrift haben.

### 3.3 Die 12 Navigationsziele

Die Navigation **MUSS** genau diese 12 Einträge in dieser Reihenfolge enthalten:

1. **Übersicht** (`data-page="overview"`, Home-Icon) — Standardmäßig aktiv beim Laden der Anwendung. Zeigt die Übersichtsseite mit allen gespeicherten Elementen.

2. **Dashboard** (`data-page="dashboard"`, Grid-Icon) — Zeigt Echtzeit-Statistiken, Statusverteilung, anstehende Audits und kritische Maßnahmen.

3. **Auditor-Verwaltung** (`data-page="auditor-management"`, Personen-Icon) — Grid-Ansicht aller registrierten Auditoren mit Such- und Filterfunktion.

4. **Auditor hinzufügen** (`data-page="add-auditor"`, Person-Plus-Icon) — Formular zur Erfassung vollständiger Auditorenprofile.

5. **Suchen & Verwalten** (`data-page="search-manage"`, Lupe-Icon) — CRUD-Operationen für Audit-Datensätze mit Suchfunktion und Datei-Upload.

6. **Kalender** (`data-page="calendar"`, Kalender-Icon) — Kalenderansicht mit Monats-, Wochen- und Tagesansicht für die Auditplanung.

7. **Import/Export** (`data-page="import-export"`, Download-Icon) — Datensicherung und -wiederherstellung über JSON und CSV.

8. **Auditplan-Generator** (`data-page="plan-generator"`, Dokument-Icon) — Kernmodul zur Erstellung professioneller Auditpläne mit Word-Export.

9. **Auditbericht Generator** (`data-page="report-generator"`, Text-Dokument-Icon) — Modul zur Erstellung von Auditberichten.

10. **Auditnotizen Generator** (`data-page="notes-generator"`, Stift-Dokument-Icon) — Kernmodul zur strukturierten Auditnotizen-Dokumentation.

11. **Auditfragen & Dokumente** (`data-page="audit-questions"`, Fragezeichen-Icon) — Normbasierte Auditfragen- und Dokumentengenerierung.

12. **Maßnahmenplan** (`data-page="action-plan"`, Häkchen-Dokument-Icon) — Verwaltung von Feststellungen und Korrekturmaßnahmen.

### 3.4 Seitenwechsel-Logik

Beim Klick auf einen Navigationseintrag **MUSS** die Funktion `navigateToPage(pageId)` aufgerufen werden. Diese Funktion **MUSS**: (a) alle Seiten-Container (`.page`) ausblenden (`display: none`), (b) den Ziel-Container einblenden (`display: block`), (c) den aktiven Zustand vom vorherigen Nav-Item entfernen und auf das geklickte setzen, (d) seitenspezifische Initialisierungen durchführen (z.B. Dashboard-Statistiken aktualisieren beim Wechsel zum Dashboard, Auditorenliste aktualisieren beim Wechsel zur Auditorenverwaltung, Kalender rendern beim Wechsel zum Kalender).

---

## 4. Modul: Übersicht

### 4.1 Zweck und Anforderungen

Die Übersichtsseite (ID: `page-overview`) **MUSS** als Startseite der Anwendung fungieren und dem Benutzer einen sofortigen Überblick über alle gespeicherten Daten bieten. Sie ist standardmäßig aktiv (Klasse: `page active`) und zeigt drei separate Abschnitte mit gespeicherten Daten.

### 4.2 Gespeicherte Auditfragen & Dokumente

Der erste Abschnitt **MUSS** die Überschrift "Gespeicherte Auditfragen & Dokumente" tragen und alle gespeicherten Auditfragen-Datensätze aus dem localStorage-Schlüssel `saved_audits` in einem scrollbaren Container (ID: `savedAuditsList`, `overflow-x: auto`) anzeigen. Jeder Eintrag **MUSS** den Namen/die Abteilung, das Erstellungsdatum und Aktionsbuttons zum Bearbeiten, Löschen und Herunterladen (als Word oder PDF) anzeigen. Das Bearbeiten **MUSS** den Datensatz zurück in das Auditfragen-Formular laden. Das Löschen **MUSS** einen Bestätigungsdialog anzeigen. Der Download **MUSS** ein Word- oder PDF-Dokument generieren und herunterladen.

### 4.3 Gespeicherte Auditnotizen

Der zweite Abschnitt **MUSS** die Überschrift "Gespeicherte Auditnotizen" tragen und alle gespeicherten Auditnotizen aus dem localStorage-Schlüssel `saved_notes` anzeigen (Container-ID: `savedNotesList`). Jeder Eintrag **MUSS** Firmenname, Auditor, Datum und Aktionsbuttons (Bearbeiten, Löschen, Word-Download) anzeigen. Das Bearbeiten **MUSS** alle Formulardaten einschließlich aller Blöcke, QHSE-Dokumente, Bewertungsfelder, Toggle-Zustände und Textwerte wiederherstellen. Der Word-Download **MUSS** die Funktion `downloadSavedNotesAsWord(notesId)` aufrufen, die ein professionelles Word-Dokument erzeugt.

### 4.4 Gespeicherte Auditpläne

Der dritte Abschnitt **MUSS** die Überschrift "Gespeicherte Auditpläne" tragen und alle gespeicherten Auditpläne aus dem localStorage-Schlüssel `saved_plans` anzeigen (Container-ID: `savedPlansList`). Jeder Eintrag **MUSS** Auftraggeber, Geltungsbereich, Erstellungsdatum und Aktionsbuttons (Bearbeiten, Löschen, Word-Download) anzeigen. Das Bearbeiten **MUSS** den kompletten Plan einschließlich ZN-Nummern, Standorte, Auditblöcke mit allen Zeilen und Toggle-Zuständen, Revisionen und alle Formularfelder wiederherstellen.

---

## 5. Modul: Dashboard

### 5.1 Zweck und Gesamtlayout

Das Dashboard (ID: `page-dashboard`) **MUSS** dem Benutzer einen Echtzeit-Überblick über alle relevanten Audit-Kennzahlen in Form von Statistik-Karten, einer Statusverteilung und Listen mit anstehenden Audits und kritischen Maßnahmen bieten. Die Daten werden bei jedem Seitenwechsel zum Dashboard über `updateDashboard()` aktualisiert.

### 5.2 Statusverteilung

Am oberen Rand des Dashboards **MUSS** eine Statusverteilung (Container-ID: `statusDistribution`, Klasse: `distribution-grid`) als Grid-Layout mit automatisch angepasster Spaltenbreite (`grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))`) angezeigt werden. Die Verteilungskarten zeigen den prozentualen Anteil jeder Auditkategorie (aktuell, fällig, in Prüfung, überfällig) mit visueller Farbkodierung: grüner Rand für aktuelle Audits, orangener Rand für bald fällige, blauer Rand für in Prüfung befindliche und roter Rand für überfällige Audits. Die Prozentzahl **MUSS** mit einer Schriftgröße von 2.5rem und Schriftstärke 700 angezeigt werden.

### 5.3 Statistik-Karten (8 Karten)

Das Dashboard **MUSS** genau 8 Statistik-Karten in einem responsiven Grid (`grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`) anzeigen. Jede Karte **MUSS** ein Emoji-Icon, einen numerischen Wert und einen beschreibenden Text enthalten. Die Karten **MÜSSEN** klickbar sein und den Benutzer zu relevanten Detailansichten navigieren:

1. **Gesamte Audits** (Icon: 📊, ID: `totalAudits`) — Zeigt die Gesamtzahl aller Audit-Datensätze. Klick navigiert zu "Suchen & Verwalten".

2. **Auditoren** (Icon: 👥, ID: `totalAuditors`) — Zeigt die Gesamtzahl registrierter Auditoren. Klick navigiert zur "Auditor-Verwaltung".

3. **Geplant** (Icon: ⏳, ID: `pendingAudits`) — Zeigt die Anzahl der Audits mit Status "geplant". Klick filtert die Dashboard-Auditliste auf "geplant".

4. **Abgeschlossen** (Icon: ✅, ID: `completedAudits`) — Zeigt die Anzahl abgeschlossener Audits. Klick filtert auf "abgeschlossen".

5. **In Bearbeitung** (Icon: 🔄, ID: `inProgressAudits`) — Zeigt die Anzahl laufender Audits. Klick filtert auf "in-bearbeitung".

6. **Offene Maßnahmen** (Icon: 📝, ID: `totalActions`) — Zeigt die Anzahl offener Maßnahmen. Klick navigiert zum Maßnahmenplan mit Filter "open".

7. **Überfällige Maßnahmen** (Icon: ⚠️, ID: `overdueActions`) — Zeigt die Anzahl überfälliger Maßnahmen (Frist < heute UND Status != "abgeschlossen"). Klick navigiert zum Maßnahmenplan mit Filter "overdue".

8. **Anstehende Audits (30 Tage)** (Icon: 📅, ID: `upcomingAudits`) — Zeigt die Anzahl der Audits in den nächsten 30 Tagen. Klick navigiert zum Kalender.

### 5.4 Aktuelle Audits mit Filterung

Unterhalb der Statistik-Karten **MUSS** eine Liste aktueller Audits mit Filterleiste angezeigt werden. Die Filterleiste enthält vier Buttons: "Alle" (Standard, aktiv), "Geplant", "In Bearbeitung" und "Abgeschlossen". Jeder Filter-Button (Klasse: `btn btn-filter`) **MUSS** beim Klick die Auditliste entsprechend filtern und seinen aktiven Zustand visuell darstellen (Gradient-Hintergrund, weiße Schrift). Die Auditliste (Container-ID: `auditList`, Klasse: `audit-list`) zeigt die gefilterten Audits als Karten in einem responsiven Grid.

### 5.5 Anstehende Audits und Kritische Maßnahmen

Am unteren Rand des Dashboards **MÜSSEN** zwei weitere Abschnitte angezeigt werden: "Nächste anstehende Audits" (Container-ID: `upcomingAuditsList`) — chronologisch sortiert, die zeitlich nächsten Audits — und "Kritische Maßnahmen" (Container-ID: `criticalActionsList`) — überfällige und hochpriorisierte Maßnahmen mit visueller Hervorhebung.

---

## 6. Modul: Auditorenverwaltung

### 6.1 Grid-Ansicht

Die Auditorenverwaltung (ID: `page-auditor-management`) **MUSS** alle registrierten Auditoren in einem responsiven Grid-Layout (Klasse: `auditor-grid`, `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`) anzeigen. Jeder Auditor wird als Karte (Klasse: `auditor-card`) dargestellt mit: Name als Überschrift (Farbe: #667eea), Kontaktinformationen (E-Mail, Telefon, Mobil), Unternehmen, ISO-Spezialisierungen, Erfahrung in Jahren und Aktionsbuttons (Bearbeiten, Löschen). Die Karten **MÜSSEN** beim Hover einen Schatteneffekt und eine leichte Anhebung (`translateY(-5px)`) zeigen.

### 6.2 Such- und Filterfunktion

Die Seite **MUSS** eine Suchleiste bereitstellen, über die Auditoren nach Name, Unternehmen oder Spezialisierung gesucht werden können. Die Suche **MUSS** in Echtzeit beim Tippen filtern (keine Eingabetaste erforderlich).

### 6.3 CRUD-Operationen

- **Anzeigen**: Die Funktion `displayAuditors()` **MUSS** alle Auditoren aus dem Array laden und als Karten rendern.
- **Bearbeiten**: `editAuditor(id)` **MUSS** zur Seite "Auditor hinzufügen" navigieren und alle Felder mit den bestehenden Daten vorausfüllen, sodass der Benutzer Änderungen vornehmen und speichern kann.
- **Löschen**: `deleteAuditor(id)` **MUSS** einen Bestätigungsdialog (`confirm()`) anzeigen und bei Bestätigung den Auditor aus dem Array und dem localStorage entfernen.

---

## 7. Modul: Auditor hinzufügen/bearbeiten

### 7.1 Formularstruktur

Das Auditorenformular (ID: `auditorForm`, Seite: `page-add-auditor`) **MUSS** aus fünf klar getrennten Abschnitten bestehen, die jeweils mit einer Überschrift und einer visuellen Gruppierung versehen sind. Das Formular **MUSS** bei Absendung die Funktion `addAuditor(e)` auslösen, die den neuen Auditor zum Array hinzufügt und in localStorage speichert.

### 7.2 Abschnitt 1: Persönliche Daten

Dieser Abschnitt **MUSS** sechs Felder in drei zweispaltigen Reihen enthalten:

- **Name** (ID: `auditorName`, Typ: text, PFLICHTFELD): Vollständiger Name des Auditors. Platzhalter: "z.B. Max Mustermann". Dieses Feld **MUSS** vor dem Speichern validiert werden — bei leerem Feld **MUSS** eine Fehlermeldung erscheinen.

- **Titel** (ID: `auditorTitle`, Typ: text, optional): Akademischer oder beruflicher Titel. Platzhalter: "z.B. Dr., Dipl.-Ing.". Dieses Feld dient der professionellen Anrede in generierten Dokumenten.

- **E-Mail** (ID: `auditorEmail`, Typ: email, PFLICHTFELD): Die E-Mail-Adresse des Auditors. Platzhalter: "max.mustermann@beispiel.de". Das Feld **MUSS** eine HTML5-E-Mail-Validierung durchführen und bei ungültigem Format eine Fehlermeldung anzeigen.

- **Telefon** (ID: `auditorPhone`, Typ: tel, optional): Festnetznummer. Platzhalter: "+49 123 456789".

- **Mobil** (ID: `auditorMobile`, Typ: tel, optional): Mobilnummer. Platzhalter: "+49 170 123456".

- **Unternehmen/Organisation** (ID: `auditorCompany`, Typ: text, optional): Zugehöriges Unternehmen oder Organisation. Platzhalter: "z.B. TÜV Nord". Dieses Feld wird beim Export und in der Auditorenliste angezeigt.

### 7.3 Abschnitt 2: Adresse

Dieser Abschnitt **MUSS** vier Felder für die Postadresse enthalten:

- **Straße und Hausnummer** (ID: `auditorStreet`, optional): Platzhalter: "Musterstraße 123".
- **PLZ** (ID: `auditorZip`, optional): Platzhalter: "12345".
- **Ort** (ID: `auditorCity`, optional): Platzhalter: "Hamburg".
- **Land** (ID: `auditorCountry`, optional, Standardwert: "Deutschland"): Platzhalter: "Deutschland". Das Feld **MUSS** beim Laden des Formulars mit "Deutschland" vorausgefüllt sein.

### 7.4 Abschnitt 3: Qualifikationen & Spezialisierungen

Dieser Abschnitt **MUSS** folgende Elemente enthalten:

- **ISO-Spezialisierungen** (5 Checkboxen mit Klasse `auditor-spec`): ISO 9001 (Qualitätsmanagement), ISO 14001 (Umweltmanagement), ISO 45001 (Arbeitsschutzmanagement), ISO 50001 (Energiemanagement), ISO 27001 (Informationssicherheit). Jede Checkbox **MUSS** 18x18px groß sein und beim Aktivieren mit dem normspezifischen Farbschema hervorgehoben werden.

- **Zertifizierungen** (ID: `auditorCertifications`, Typ: textarea, 4 Zeilen, optional): Freitext-Auflistung aller Audit-Zertifizierungen. Platzhalter: "z.B. Lead Auditor ISO 9001, IATF 16949, VDA 6.3...".

- **Sprachen** (ID: `auditorLanguages`, Typ: text, optional): Beherrschte Sprachen. Platzhalter: "z.B. Deutsch, Englisch, Französisch".

- **Berufserfahrung** (ID: `auditorExperience`, Typ: number, min: 0, optional): Jahre der relevanten Berufserfahrung. Platzhalter: "z.B. 10".

### 7.5 Abschnitt 4: Verfügbarkeit & Konditionen

- **Tagessatz** (ID: `auditorDailyRate`, Typ: number, min: 0, step: 50, optional): Honorarsatz in Euro. Platzhalter: "z.B. 800". Die Schrittweite von 50 **MUSS** sicherstellen, dass der Benutzer in 50-Euro-Schritten adjustieren kann.

- **Verfügbarkeit** (ID: `auditorAvailability`, Typ: select, optional): Dropdown mit den Optionen "Bitte wählen...", "Vollzeit verfügbar", "Teilzeit verfügbar", "Nach Vereinbarung" und "Eingeschränkt verfügbar".

### 7.6 Abschnitt 5: Notizen & Bemerkungen

- **Interne Notizen** (ID: `auditorNotes`, Typ: textarea, 4 Zeilen, optional): Zusätzliche Informationen und Besonderheiten. Platzhalter: "Weitere Informationen, Besonderheiten, etc...".

### 7.7 Aktionsbuttons

Das Formular **MUSS** zwei Buttons am unteren Rand anzeigen:

- **"Auditor speichern"** (Klasse: `btn btn-success btn-large`, Typ: submit): Löst die Formularvalidierung und das Speichern aus. Bei Erfolg **MUSS** eine Erfolgsbenachrichtigung angezeigt und das Formular zurückgesetzt werden.

- **"Formular zurücksetzen"** (Klasse: `btn btn-danger btn-large`, Typ: button, onclick: `resetAuditorForm()`): Setzt alle Felder auf ihre Standardwerte zurück, ohne zu speichern.

---

## 8. Modul: Audit-Suche & Verwaltung

### 8.1 Suchfunktion

Am oberen Rand der Seite (ID: `page-search-manage`) **MUSS** ein prominentes Suchfeld (ID: `searchInput`) platziert sein mit dem Platzhalter "Audit Name, Auditor oder Abteilung suchen...". Das Suchfeld **MUSS** in Echtzeit bei jeder Eingabe (`oninput`) die Funktion `updateSearchResults()` aufrufen, die die angezeigte Auditliste filtert. Die Suche **MUSS** den Auditnamen, den zugewiesenen Auditor und die Abteilung durchsuchen (case-insensitive).

### 8.2 Neues Audit anlegen — Formularstruktur

Das Audit-Formular (ID: `auditForm`) **MUSS** aus sechs Unterabschnitten bestehen, die jeweils mit einer farbigen Überschrift (Farbe: #667eea) gruppiert sind:

#### Abschnitt "Grundinformationen"
- **Auditname** (ID: `auditName`, PFLICHTFELD): Bezeichnung des Audits.
- **Audittyp** (ID: `auditType`, PFLICHTFELD, Select): Optionen: "Typ wählen...", "Internes Audit", "Externes Audit", "Zertifizierungsaudit", "Überwachungsaudit", "Rezertifizierung".

#### Abschnitt "Zeitplanung"
- **Startdatum** (ID: `auditDate`, PFLICHTFELD, Typ: date).
- **Enddatum** (ID: `auditEndDate`, optional, Typ: date).
- **Uhrzeit von** (ID: `auditTimeFrom`, optional, Typ: time).
- **Uhrzeit bis** (ID: `auditTimeTo`, optional, Typ: time).

#### Abschnitt "Organisation & Standort"
- **Unternehmen** (ID: `auditCompany`, PFLICHTFELD): Auditiertes Unternehmen.
- **Abteilung/Bereich** (ID: `department`, PFLICHTFELD): Auditierte Abteilung.
- **Standort** (ID: `auditLocation`, optional): Platzhalter: "z.B. München, Hauptsitz".
- **Format** (ID: `auditFormat`, optional, Select): "Vor Ort", "Remote", "Hybrid".

#### Abschnitt "Norm & Geltungsbereich"
- **Auditierte Standards** (5 Checkboxen, Klasse: `audit-standard`): ISO 9001 (QM), ISO 14001 (UM), ISO 45001 (AMS), ISO 50001 (EnMS), ISO 27001 (ISMS), Andere.
- **Geltungsbereich** (ID: `auditScope`, textarea, 2 Zeilen): Platzhalter: "z.B. Entwicklung und Vertrieb von Softwarelösungen".

#### Abschnitt "Personal"
- **Leitender Auditor** (ID: `auditor`, PFLICHTFELD, Select): Dynamisch mit registrierten Auditoren befüllt.
- **Auditteam** (ID: `auditTeam`, optional): Weitere Teammitglieder, Platzhalter: "z.B. Max Müller, Anna Schmidt".
- **Ansprechpartner** (ID: `auditContact`, optional): Hauptkontaktperson beim Kunden.
- **Kontakt-E-Mail** (ID: `auditContactEmail`, optional, Typ: email).

#### Abschnitt "Status & Planung"
- **Status** (ID: `status`, PFLICHTFELD, Select): "geplant", "in-bearbeitung", "abgeschlossen", "verschoben", "abgesagt".
- **Geplante Dauer** (ID: `auditDuration`, optional, Typ: number, min: 0, step: 0.5): Dauer in Tagen, Platzhalter: "z.B. 1.5".
- **Auditziele** (ID: `auditObjectives`, textarea, 2 Zeilen): Platzhalter: "z.B. Überprüfung der Wirksamkeit des QM-Systems".

#### Abschnitt "Notizen & Dokumente"
- **Notizen** (ID: `notes`, textarea, 3 Zeilen).
- **Dokumente/Links** (ID: `auditDocuments`, textarea, 2 Zeilen).
- **Datei-Upload** (ID: `auditFiles`, Typ: file, multiple): Akzeptierte Formate: PDF, Word, Excel, PowerPoint, Text, Bilder (max. 5MB pro Datei). Der Hilfetext **MUSS** die erlaubten Formate auflisten. Nach dem Upload **MUSS** ein "Dateien anzeigen"-Button (ID: `showFilesPreviewBtn`) erscheinen und die Anzahl der Dateien (ID: `filesCount`) aktualisiert werden.

### 8.3 Suchergebnisse

Unterhalb des Formulars **MUSS** ein Container (ID: `searchResults`, Klasse: `audit-list`) die Suchergebnisse als Audit-Karten in einem responsiven Grid anzeigen. Jede Karte zeigt Auditname, Typ, Datum, Unternehmen, Abteilung, Status (farbkodiert), Auditor und Aktionsbuttons (Bearbeiten, Löschen, Dateien anzeigen).

---

## 9. Modul: Kalender

### 9.1 Ansichtsmodi und Navigation

Der Kalender (ID: `page-calendar`) **MUSS** drei Ansichtsmodi unterstützen, die über dedizierte Toggle-Buttons umschaltbar sind:

- **Monatsansicht** (Button-ID: `viewMonth`): Grid mit 7 Spalten (Mo-So), jeder Tag als quadratische Zelle (`aspect-ratio: 1`) mit Rahmen, abgerundeten Ecken und Hover-Effekt. Tage mit Audits **MÜSSEN** einen blauen Hintergrund (#e8eaff) und einen blauen Rahmen (#667eea) erhalten.

- **Wochenansicht** (Button-ID: `viewWeek`): Stundengenaue Ansicht einer Woche mit Zeitslots.

- **Tagesansicht** (Button-ID: `viewDay`): Detailansicht eines einzelnen Tages mit allen Einträgen.

Die Navigationsleiste **MUSS** enthalten: einen "Zurück"-Button (ID: `prevPeriod`), eine Anzeige der aktuellen Periode (ID: `currentPeriod`), einen "Weiter"-Button (ID: `nextPeriod`) und einen "Heute"-Button (ID: `todayBtn`, ruft `goToToday()` auf).

### 9.2 Kalendereintrags-Modal

Beim Klick auf einen Tag **MUSS** ein Modal (ID: `calendarEntryModal`) erscheinen mit folgenden Feldern:

- **Datum** (ID: `calendar_entry_date`, Typ: date) — vorausgefüllt mit dem geklickten Datum.
- **Titel** (ID: `calendar_entry_title`, Typ: text) — Platzhalter: "z.B. Audit ISO 9001".
- **Startzeit** (ID: `calendar_entry_time_start`, Typ: time).
- **Endzeit** (ID: `calendar_entry_time_end`, Typ: time).
- **Unternehmen** (ID: `calendar_entry_company`, Typ: text) — Platzhalter: "Firmenname".
- **Auditor** (ID: `calendar_entry_auditor`, Typ: text) — Platzhalter: "Name des Auditors".
- **Beschreibung** (ID: `calendar_entry_description`, Typ: textarea) — Platzhalter: "Weitere Details...".

Das Modal **MUSS** einen "Abbrechen"-Button und einen "Speichern"-Button enthalten. Die Daten werden unter dem localStorage-Schlüssel `calendar_entries` gespeichert.

---

## 10. Modul: Import/Export

### 10.1 Kartenbasiertes Layout

Die Import/Export-Seite (ID: `page-import-export`) **MUSS** drei nebeneinander angeordnete Optionskarten (Klasse: `ie-card`, Grid-Layout mit `minmax(300px, 1fr)`) anzeigen:

### 10.2 Karte 1: Daten exportieren
- Überschrift: "📤 Daten exportieren"
- Beschreibung: "Exportieren Sie alle Ihre Audit-Daten und Auditor-Informationen als JSON-Datei."
- Button (ID: `exportAllData`, Klasse: `btn btn-primary`): "Alle Daten exportieren"
- **Anforderung**: Beim Klick **MUSS** die Funktion `exportData()` aufgerufen werden, die alle Daten aus allen localStorage-Schlüsseln (audits, auditors, saved_notes, saved_plans, calendar_entries, actions, settings, saved_audits, saved_audit_questions) in ein JSON-Objekt zusammenfasst und als Datei `auditplan_backup_{timestamp}.json` herunterlädt.

### 10.3 Karte 2: Daten importieren
- Überschrift: "📥 Daten importieren"
- Beschreibung: "Importieren Sie zuvor exportierte Daten aus einer JSON-Datei."
- Datei-Input (ID: `importAllData`, akzeptiert: `.json`, versteckt): Der sichtbare Button ist ein `<label>`, das als Button gestylt ist.
- **Anforderung**: Die Funktion `importData(e)` **MUSS** die JSON-Datei lesen, validieren und alle enthaltenen Daten in die entsprechenden localStorage-Schlüssel schreiben. Anschließend **MÜSSEN** alle UI-Komponenten aktualisiert werden.

### 10.4 Karte 3: CSV Export
- Überschrift: "📄 CSV Export"
- Beschreibung: "Exportieren Sie Audit-Daten als CSV-Datei für Excel."
- Button (ID: `exportCSV`, Klasse: `btn btn-secondary`): "Als CSV exportieren"
- **Anforderung**: Die Funktion `exportToCSV()` **MUSS** alle Audit-Datensätze in ein CSV-Format konvertieren und als `audits_export_{timestamp}.csv` herunterladen. Die CSV-Datei **MUSS** UTF-8-kodiert sein und ein BOM enthalten, damit Excel die Umlaute korrekt anzeigt.

---

## 11. Modul: Auditplan-Generator

### 11.1 Überblick und Aktionsleiste

Der Auditplan-Generator (ID: `page-plan-generator`) ist das **Kernmodul** der Anwendung und generiert professionelle Auditpläne als Word-Dokumente. Die Seite **MUSS** eine prominente Aktionsleiste am oberen Rand mit folgenden Buttons enthalten:

- **"Speichern"** (onclick: `saveAuditPlan()`, Klasse: `btn btn-success btn-large`, Breite: 240px): Speichert den gesamten Plan in localStorage unter `saved_plans`.
- **"Als Word generieren"** (onclick: `generateComprehensivePlanWithFormat('docx')`, Klasse: `btn btn-primary btn-large`): Generiert ein professionelles Word-Dokument.
- **"Als PDF generieren"** (onclick: `generateComprehensivePlanWithFormat('pdf')`, Klasse: `btn btn-primary btn-large`): Generiert eine PDF-Version.
- **"Auditnotizen generieren"** (onclick: `generateAuditNotesFromBlocks()`, Hintergrund: #9C27B0): Erzeugt Auditnotizen aus den konfigurierten Audit-Blöcken.
- **"Formular zurücksetzen"** (ID: `resetPlanFormBtn`, Klasse: `btn btn-danger btn-large`): Setzt alle Felder zurück.

### 11.2 Abschnitt: Auditplan (ZN und Logo)

#### ZN-Verwaltung (Zertifizierungsnummern)
- Eingabefeld (ID: `znInput`, Standardwert: "01 ") mit "Hinzufügen"-Button (ID: `addZnBtn`).
- Die ZN-Nummern werden in einem Array `znNumbers` gespeichert und als Pillenbadges in einem Flexbox-Container (ID: `znList`) dargestellt.
- Jede ZN-Pille **MUSS** einen Lösch-Button (×) enthalten, der die ZN aus dem Array entfernt.
- Im Word-Export erscheinen die ZN-Nummern auf dem Deckblatt.

#### Logo-Upload
- Datei-Input (ID: `plan_logo`, akzeptiert: `image/*`).
- Vorschau-Container (ID: `plan_logo_preview`) mit gestricheltem Rahmen (`border: 2px dashed`), minimaler Höhe 150px und Platzhaltertext "Logo wird hier angezeigt".
- "Logo entfernen"-Button (ID: `remove_plan_logo_btn`, standardmäßig versteckt).
- Das Logo wird als Base64-String in localStorage unter `auditplan_logo` gespeichert und bei jedem Laden automatisch wiederhergestellt.

### 11.3 Abschnitt: Grunddaten

#### Auftraggeber
- Textarea (ID: `auftraggeber`, 4 Zeilen): Platzhalter mit Zeilenumbrüchen: "Firmenname\nStraße Hausnummer\nPLZ Ort". Unterhalb des Feldes **MUSS** ein Hilfetext stehen: "Sofern vom Auftraggeber keine Änderungen des Auditplans bis 1 Woche vor dem Audittermin eingehen, so gilt dieser als genehmigt."

#### Standort(e) / Produktionsstätte(n)
- Dynamische Liste (Container-ID: `standorteContainer`) mit "Standort hinzufügen"-Button (onclick: `addStandort()`).
- Jeder hinzugefügte Standort **MUSS** als editierbares Feld mit eigenem Lösch-Button erscheinen.
- Die Standorte werden im Array `standorteList` gespeichert und bei Speicherung/Wiederherstellung berücksichtigt.

#### Geltungsbereich
- Textarea (ID: `geltungsbereich`, 2 Zeilen): Platzhalter: "z.B. Herstellung von Präzisionsteilen für die Automobilindustrie".

#### Normgrundlage / Auditkriterien
- Custom-Multiselect mit durchsuchbarem Dropdown (Klasse: `custom-multiselect`).
- Auswahlfeld (ID: `criteriaSelectedDisplay`) mit Pfeil-Symbol, das beim Klick den Dropdown (ID: `criteriaDropdown`) ein-/ausblendet.
- **5 Checkboxen** (Standard: ISO 9001, 14001, 45001, 50001 aktiviert, ISO 27001 deaktiviert): ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, ISO 50001:2018, ISO 27001:2022.
- Bei jeder Checkbox-Änderung **MUSS** `updateCriteriaSelection()` aufgerufen werden, die die Readonly-Textarea (ID: `ausgewaehlteKriterien`, 6 Zeilen, Hintergrund: #f8f9fa) aktualisiert.

### 11.4 Abschnitt: Auditdetails

#### Auditart (Durchsuchbarer Multiselect)
- Container (ID: `auditart_container`, Klasse: `auditart-multiselect-container`).
- Hidden Input (ID: `auditart_hidden`) für den tatsächlichen Formularwert.
- Suchfeld (ID: `auditart_search`): Echtzeit-Filterung der 16 vordefinierten Auditarten + Möglichkeit zur eigenen Eingabe über Custom-Input (ID: `auditart_custom_input`) und "Hinzufügen"-Button (onclick: `addCustomAuditart()`).
- **16 vordefinierte Auditarten:** Erstzertifizierung, Überwachungsaudit, Rezertifizierung, Sonderaudit, Integrationsaudit, Erweiterungsaudit, Vorabaudit, Pre-Assessment, Follow-up Audit, Systemaudit, Prozessaudit, Produktaudit, Remote Audit, Kombiniertes Audit, Angekündigtes Audit, Unangekündigtes Audit.

#### Beauftragter des Kunden
- Textfeld (ID: `beauftragter`): Platzhalter: "Ansprechpartner beim Kunden".

#### Auditziel
- Textarea (ID: `auditziel`, 8 Zeilen, standardmäßig readonly, Hintergrund: #f8f9fa).
- Der Standardtext **MUSS** ein professionell formuliertes Auditziel zur Überprüfung des Managementsystems enthalten.
- Checkbox (ID: `customAuditziel`, Label: "Auditziel anpassen"): Beim Aktivieren **MUSS** die Textarea editierbar werden (readonly entfernt, Hintergrund auf weiß).

#### Auditsprache(n)
- Custom-Multiselect mit 14 Sprachen: Deutsch (Standard: aktiviert), Englisch, Französisch, Spanisch, Italienisch, Niederländisch, Polnisch, Tschechisch, Russisch, Türkisch, Chinesisch, Japanisch, Arabisch, Portugiesisch.

### 11.5 Abschnitt: Audit-Team

Für jede der **vier Rollen** (Auditleiter, Auditoren, Trainees, Experten) **MUSS** ein identischer Feldblock bereitgestellt werden:

- **Name(n)** (Textarea, 2 Zeilen): Platzhalter zeigt an, dass mehrere Personen eingetragen werden können (z.B. "hier können mehrere Auditleiter stehen").
- **Extern-Checkbox** (z.B. ID: `auditleiterExtern`): Label: "Extern". Beim Aktivieren **MUSS** ein zusätzliches Firmenname-Feld (z.B. ID: `auditleiterFirma`) sichtbar werden (Platzhalter: "Firmenname"), das sonst versteckt ist.
- Im Word-Export wird das Extern-Attribut mit dem Symbol ☑ (aktiviert) oder ☐ (deaktiviert) dargestellt, gefolgt von "extern, Firma: [Firmenname]".

### 11.6 Abschnitt: Betriebsorganisation

- **Schichtsystem** (Radio-Buttons, Name: `schichtsystem`): 4 Optionen — "1-Schicht" (Standard: ausgewählt), "2-Schicht", "3-Schicht", "Anderes". Bei Auswahl von "Anderes" **MUSS** ein Freitextfeld (ID: `anderesSchichtsystem`, Platzhalter: "z.B. Kontinuierliche Schicht") sichtbar werden.
- **Schichtübergaben** (ID: `schichtuebergaben`, Typ: text): Platzhalter: "z.B. 06:00, 14:00, 22:00".
- **Bemerkung** (ID: `bemerkung`, Textarea, 2 Zeilen): Platzhalter: "Besondere Hinweise".

### 11.7 Abschnitt: Auditmethode

- **Auditmethode** (Radio-Buttons, Name: `auditmethode`): 3 Optionen — "vor Ort" (Standard), "vor Ort & remote", "100% remote".
- **IKT-Technik** (ID: `iktTechnik`, Typ: text): Platzhalter: "z.B. Teams, Zoom, WebEx".
- **IKT-Testdatum** (ID: `iktTestDatum`, Typ: date).
- **Test letztes Audit** (Checkbox, ID: `testLetztesAudit`): Label: "Test erfolgte im letzten Audit, es gab keine Änderungen".
- **Gastgeber** (ID: `gastgeber`, Typ: text): Platzhalter: "Ansprechpartner vor Ort".

### 11.8 Abschnitt: Revisions-Verfolgung

- Dynamische Revisionsliste (Container-ID: `revisionsList`, Array: `revisions`).
- Jede Revision enthält: automatische Nummerierung (readonly, z.B. "Rev. 1.0"), Datum (Typ: date), Änderungsbeschreibung (Textarea, 2 Zeilen) und Lösch-Button.
- "Revision hinzufügen"-Button (ID: `addRevisionBtn`): Fügt eine neue Revision mit automatischer Nummerierung hinzu (Rev. 2.0, 3.0, ...).
- Zusätzlich: "Ort, Datum" (ID: `ortDatum`, Platzhalter: "z.B. Hamburg, 05.07.2025"), "Änderung während des Audits" (ID: `aenderungAudit`), "Kommentare" (ID: `kommentare`, Textarea, 5 Zeilen).

### 11.9 Abschnitt: Auditzeiten-Übersicht

- Beschreibungstext: "Zur internen Auswertung sollte den Auditoren ein Raum zur Verfügung stehen. Auditbeauftragte begleiten die Auditoren während des gesamten Audits."
- "Auditzeiten-Tabelle hinzufügen"-Button (ID: `addAuditorTimeTableBtn`).
- Jede Tabelle enthält: Auditorauswahl (aus registrierten Auditoren), Standortauswahl (aus eingetragenen Standorten), dynamische Zeitzeilen (Start-/Endzeit, Aktivität/Rolle, Stunden) und automatische Zeilen- und Spaltensummen. Die Tabellen sind horizontal scrollbar für kleine Bildschirme.

### 11.10 Abschnitt: Audit-Blöcke

Dies ist die **zentrale Konfigurationsfunktion** des Auditplan-Generators. Siehe separates Kapitel [24. Block-Management-System](#24-block-management-system) für die detaillierte Beschreibung aller Felder, Toggles und Interaktionen.

### 11.11 Abschnitt: Hinweise und Verteiler

- **Infobox** mit vordefinierten Hinweisen zu Remote-Teilnahme, mehreren Auditoren und Vertraulichkeit.
- **Verteiler beim Auftraggeber** (ID: `verteilerAuftraggeber`, Textarea, 2 Zeilen): Platzhalter: "(vom Auftraggeber festzulegen)".
- **Verteilungs-Checkboxen** (4 Stück): Auftraggeber (Standard: aktiviert), Zertifizierungsstelle(n) (aktiviert), Auditor/Gutachter/Experte (aktiviert), Datenbank (deaktiviert). Diese bestimmen, wer eine Kopie des Auditplans erhält.

---

## 12. Modul: Berichtsgenerator

### 12.1 Formularstruktur

Der Berichtsgenerator (ID: `page-report-generator`) **MUSS** ein Formular (ID: `reportGeneratorForm`) mit folgenden Feldern bereitstellen:

- **Audit auswählen** (ID: `reportAudit`, Select, PFLICHTFELD): Dynamisch mit allen gespeicherten Audits befüllt.
- **Feststellungen** (ID: `reportFindings`, Textarea, 4 Zeilen): Platzhalter: "Beschreiben Sie die wichtigsten Feststellungen...".
- **Empfehlungen** (ID: `reportRecommendations`, Textarea, 4 Zeilen): Platzhalter: "Ihre Empfehlungen...".
- **Fazit** (ID: `reportConclusion`, Textarea, 3 Zeilen): Platzhalter: "Zusammenfassung und Fazit...".
- **"Bericht generieren"**-Button (Typ: submit, Klasse: `btn btn-primary`).

### 12.2 Generierter Bericht

Der generierte Bericht **MUSS** im Container (ID: `generatedReport`) angezeigt werden und alle eingegebenen Informationen strukturiert darstellen.

---

## 13. Modul: Auditnotizen-Generator

### 13.1 Aktionsleiste

Die Seite (ID: `page-notes-generator`) **MUSS** eine Aktionsleiste mit drei Buttons enthalten:
- **"Speichern"** (onclick: `saveAuditNotes()`): Speichert alle Notizen in localStorage.
- **"Generieren"** (Typ: submit, Formular: `notesGeneratorForm`): Generiert das Word-Dokument.
- **"Zurücksetzen"** (ID: `resetNotesBtn`): Setzt das Formular zurück.

### 13.2 Kopfdaten

Das Formular **MUSS** ein zweispaltiges Layout haben: links die Eingabefelder, rechts den Logo-Upload (Breite: 250px).

#### Linke Spalte — Formularfelder (in 4 Reihen à 2 Felder):

**Reihe 1:**
- **Firma/Auftraggeber** (ID: `notes_client`): Platzhalter: "z.B. Jongen Werkzeugtechnik GmbH".
- **Standard(s)** (ID: `notes_standards`): Platzhalter: "z.B. ISO 9001:2015".

**Reihe 2:**
- **Zertifikat** (ID: `notes_certificate`): Platzhalter: "z.B. 01 100 2200342".
- **Auditart** (ID: `notes_audit_type`): Platzhalter: "z.B. RA".

**Reihe 3:**
- **Datum (von — bis)**: Zwei Datumfelder (IDs: `notes_header_date_from`, `notes_header_date_to`).
- **Standort(e)** (ID: `notes_location`): Platzhalter: "Standort eingeben".

**Reihe 4:**
- **Auditor** (ID: `notes_auditor`): Platzhalter: "Auditor Name".
- **Seite (von — bis)**: Zwei Textfelder (IDs: `notes_page_from`, `notes_page_to`), Platzhalter: "1" und "5".

#### Rechte Spalte — Logo-Upload:
- Datei-Input (ID: `notes_logo`, akzeptiert: `image/*`).
- Vorschau (ID: `logo_preview`, gestrichelter Rahmen, 150px Mindesthöhe).
- "Logo entfernen"-Button (ID: `remove_logo_btn`).

### 13.3 Notizen-Blöcke

Siehe Kapitel [24. Block-Management-System](#24-block-management-system) für die detaillierte Beschreibung der Notizen-Blöcke.

### 13.4 Export-Optionen

Jeder Notizen-Block **MUSS** drei Checkboxen zur Steuerung des Word-Exports enthalten:
- **Dokumente anzeigen** (Standard: aktiviert) — steuert ob QHSE-Dokumente im Word erscheinen.
- **Bewertung anzeigen** (Standard: aktiviert) — steuert ob Bewertungsfelder und Zusammenfassung im Word erscheinen.
- **Notizen anzeigen** (Standard: aktiviert) — steuert ob Notizen im Word erscheinen.

---

## 14. Modul: Auditfragen & Dokumente

### 14.1 Audit-Informationen

- **Firmenname** (ID: `audit_company_name`): Platzhalter: "z.B. Jongen Werkzeugtechnik GmbH".
- **Auditdatum** (ID: `audit_date`, Typ: date).
- **Uhrzeit Von/Bis** (IDs: `audit_time_start`, `audit_time_end`, Typ: time).

### 14.2 Bereichsauswahl

- **Abteilung** (ID: `department_select`, Select, onchange: `updateChapterDropdown(); loadAuditQuestions();`): **43 vordefinierte Abteilungen** von "Geschäftsführung / Management" über "Produktion / Fertigung", "IT / Informationstechnologie" bis hin zu spezialisierten Bereichen wie "Supply Chain Management", "Projektmanagement", "Messtechnik", "Datenschutz", "IT-Sicherheit", "Change Management", "Compliance", "Risk Management" und "Innovationsmanagement".

- **Norm** (ID: `standard_select`, Select): ISO 9001, ISO 14001, ISO 45001, ISO 50001, ISO 27001.

- **Normkapitel** (ID: `chapter_select`, Select): Dynamisch befüllt basierend auf der gewählten Norm. Standard: "Alle Kapitel anzeigen".

### 14.3 Automatische Fragengenerierung

Bei Auswahl einer Abteilung und/oder Norm **MUSS** die Funktion `loadAuditQuestions()` aufgerufen werden, die:
- Relevante Auditfragen aus der Wissensdatenbank (`auditQuestionsData`) lädt und im Container (ID: `questions_list`) als nummerierte Liste anzeigt.
- Relevante Dokumente zur Einsichtnahme im Container (ID: `documents_list`) als Aufzählungsliste anzeigt.
- Den Abteilungstitel (ID: `department_title`) aktualisiert.

### 14.4 Speichern und Export

- **Speichern** (`saveAuditForm()`): Speichert den Datensatz unter `saved_audits` in localStorage.
- **Word-Export** (`generateAuditQuestionsWord()`): Erzeugt ein Word-Dokument (.doc) mit Abteilung, Datum, Fragen und Dokumentenliste.
- **PDF-Export** (`downloadAuditQuestionsAsPDF()`): Erzeugt ein PDF-Dokument.

---

## 15. Modul: Maßnahmenplan

### 15.1 Filterleiste

Der Maßnahmenplan (ID: `page-action-plan`) **MUSS** eine zweireihige Filterleiste mit sechs Filtern bereitstellen, die bei jeder Änderung die Funktion `filterActions()` aufrufen:

**Reihe 1:**
- **Feststellungsart** (ID: `action_type_filter`): Alle, Hauptabweichung, Nebenabweichung, Beobachtung/Hinweis, Verbesserungspotenzial, Positive Feststellung, Risiko/Chance.
- **Status** (ID: `action_status_filter`): Alle, Offen, In Bearbeitung, Abgeschlossen, Überfällig.
- **Audittyp** (ID: `action_audit_type_filter`): Alle, Internes Audit, Externes Audit, Zertifizierungsaudit, Lieferantenaudit, Kundenaudit.

**Reihe 2:**
- **Verantwortlicher** (ID: `action_responsible_filter`): Dynamisch aus vorhandenen Daten befüllt.
- **Priorität** (ID: `action_priority_filter`): Alle, Hoch, Mittel, Niedrig.
- **Norm** (ID: `action_standard_filter`): Alle, ISO 9001, ISO 14001, ISO 45001, ISO 50001, ISO 27001, Andere.

### 15.2 Maßnahmen-Felder

Jede Maßnahme **MUSS** folgende Felder enthalten:
- **Feststellungsbeschreibung** (Textarea): Detaillierte Beschreibung der Feststellung.
- **Feststellungsart** (Select): Farbkodierte Auswahl (Rot für Hauptabweichung, Gelb für Nebenabweichung, etc.).
- **Geplante Maßnahme** (Textarea): Beschreibung der Korrekturmaßnahme.
- **Status** (Select): Offen, In Bearbeitung, Abgeschlossen.
- **Verantwortlicher** (Text/Select): Zugewiesene Person.
- **Priorität** (Select): Hoch, Mittel, Niedrig.
- **Frist** (Datum): Erledigungsfrist — wird für Überfälligkeits-Berechnung verwendet.
- **Abschlussdatum** (Datum): Tatsächliches Abschlussdatum.
- **Norm** (Select): Zugehörige ISO-Norm.
- **Nachweise/Notizen** (Textarea): Belege und Anmerkungen.

### 15.3 Überfälligkeits-Berechnung

Eine Maßnahme gilt als **überfällig**, wenn: Fristdatum < aktuelles Datum UND Status ≠ "abgeschlossen". Überfällige Maßnahmen **MÜSSEN** visuell hervorgehoben werden und in der Dashboard-Kennzahl "Überfällige Maßnahmen" gezählt werden.

---

## 16. Einstellungen

### 16.1 Einstellungsmodal

Das Einstellungsmodal (ID: `settingsModal`, Klasse: `modal`) **MUSS** beim Klick auf den Einstellungs-Button erscheinen und folgende Abschnitte enthalten:

### 16.2 Farbschemata

#### Globale Farbschemata (23 Themes)
Im Tab "Global" **MÜSSEN** 18 vordefinierte Farbschemata als quadratische Farbvorschauen in einem Grid angezeigt werden. Jedes Theme definiert: Body-Hintergrund (Gradient), Header-Hintergrund, Button-Farben, Navigations-Highlight, Karten-Überschriften und Modal-Header-Farbe. Die Themes sind:

Default (#667eea → #764ba2), Dark (#2d3436 → #000000), Light (#f8f9fa → #e9ecef), Green (#1cc88a → #13855c), Blue (#4e73df → #224abe), Red (#e74c3c → #c0392b), Purple (#9b59b6 → #8e44ad), Orange (#f39c12 → #e67e22), Cyan (#00cec9 → #00b894), Pink (#fd79a8 → #e84393), Yellow (#f1c40f → #f39c12), Indigo (#6c5ce7 → #5f27cd), Teal (#16a085 → #1abc9c), Rose (#e84393 → #fd79a8), Emerald (#2ecc71 → #27ae60), Sky (#74b9ff → #0984e3), Slate (#636e72 → #2d3436).

#### Individuelle Bereichsfarben
Im Tab "Individuelle Bereiche" **MÜSSEN** drei Farbauswahlen bereitgestellt werden:
- **Header-Farbe** (ID: `headerColor`): Optionen: inherit (Standard), default, blue, green, red, purple, orange.
- **Navigations-Farbe** (ID: `navColor`): Gleiche Optionen.
- **Karten-Farbe** (ID: `cardColor`): Gleiche Optionen.

### 16.3 Kompaktansicht
- Checkbox (ID: `compactView`): "Kompakte Ansicht" — reduziert Paddings und Schriftgrößen in der gesamten Anwendung.

### 16.4 Benachrichtigungen
- Checkbox (ID: `showNotifications`, Standard: aktiviert): "Benachrichtigungen anzeigen" — steuert ob Erfolgs- und Fehlermeldungen angezeigt werden.

### 16.5 Sprache
- Select (ID: `languageSelect`): 10 Sprachen — Deutsch (de), English (en), Français (fr), Español (es), Italiano (it), Nederlands (nl), Português (pt), Polski (pl), Русский (ru), Türkçe (tr).

### 16.6 Standard-Einstellungen
- **Standard-Auditor** (ID: `defaultAuditor`): Vorausgefüllter Auditorname in Formularen.
- **Standard-Abteilung** (ID: `defaultDepartment`): Vorausgefüllte Abteilung.

### 16.7 Daten-Management im Einstellungsmodal
- **Export (JSON)** (ID: `exportData`): Identisch mit Import/Export-Seite.
- **Import** (ID: `importData`): Datei-Upload für JSON-Import.
- **Alle Daten löschen** (ID: `clearData`, Klasse: `btn btn-danger`): Löscht ALLE Daten aus localStorage mit Bestätigungsdialog.

---

## 17. Word-Dokumentgenerierung — Auditplan

### 17.1 Funktion und Aufruf

Die Funktion `generateWordDocument(data)` (asynchron, ca. 3.400 Zeilen) **MUSS** ein professionelles Word-Dokument (.docx) generieren, das alle Auditplandaten in einer strukturierten, druckfertigen Form darstellt. Die Funktion verwendet die docx.js-Bibliothek und erzeugt das Dokument vollständig im Browser.

### 17.2 Seitenformatierung

- **Seitenränder:** Oben: 2700 Twips (~1,88 Zoll, Platz für Kopfzeile), Rechts/Unten/Links: 360 Twips (~0,25 Zoll, schmale Ränder für maximale Inhaltsbreite).
- **Seitenrahmen:** Einfache schwarze Linie (Stil: Single, Stärke: 24pt, Farbe: 000000) auf allen Seiten, angewendet auf alle Seiten (`display: "allPages"`, `offsetFrom: "page"`).

### 17.3 Kopfzeile (Header-Tabelle)

Die Kopfzeile **MUSS** als Tabelle in der Standard-Kopfzeile (`Header.DEFAULT`) implementiert sein:

- **Titelzeile**: 2-spaltig — Links (70%): "Audit Notes / Auditnotizen" (fett, 32pt), Rechts (30%): optionales Logo (200x60px, falls vorhanden).
- **Datenzeile 1** (4-spaltig, 25%/28%/20%/27%): Firma/Client | Standard(s) | Zertifikat/Certificate | Auditart/Audit Type — alle Zellen mit grauem Hintergrund (D3D3D3), Schriftgröße 18pt.
- **Datenzeile 2** (4-spaltig): Datum/Date | Standort/Location | Auditor | Seite/Page — die Seitenzahl wird dynamisch mit `PageNumber.CURRENT` und `PageNumber.TOTAL_PAGES` generiert.

### 17.4 Hauptinhalt — Auftraggeber-Sektion

Der Auftraggeber **MUSS** mit einem Tab-Stop bei Position 3200 formatiert werden: "Auftraggeber:\t[Wert]". Mehrzeilige Adressen werden mit Einrückung auf Tab-Position 3200 dargestellt. Ein Disclaimer-Text ("Sofern keine Änderungen...") wird rechts in einer 2-Zellen-Tabelle (70%/30%) ohne sichtbare Rahmen platziert.

### 17.5 Hauptinhalt — Standorte

Die Standorte werden mit einer komplexen mehrzeiligen Struktur dargestellt: Die erste Zeile trägt das Label "Standort(e) / Produktionsstätte(n) /", die zweite "temporäre Standorte / andere Orte", die dritte "der Leistungserbringung:" — gefolgt vom ersten Standort. Weitere Standorte werden fett mit Tab-Einrückung darunter aufgelistet.

### 17.6 Hauptinhalt — Audit-Blöcke im Word

Jeder Audit-Block wird als eigenständige 1-spaltige Tabelle (100% Breite) dargestellt:

- **Info-Zeile**: Gelber Hintergrund (FFFF00), fette und zentrierte Schrift. Inhalt: "Datum | Uhrzeit | Organisationseinheit | Element | Auditor | Gesprächspartner | Normkapitel". Nicht aktivierte Toggle-Felder werden ausgelassen.
- **Beschreibung**: Grauer Hintergrund (D3D3D3), fette Schrift. Text wird an Absatzumbrüchen geteilt.
- **Vorstellung**: Weißer Hintergrund, Zellen-Margins (80/80/120/120 Twips).
- **Allgemein**: Weißer Hintergrund, Zellen-Margins.
- **Notizen**: Weißer Hintergrund, Zellen-Margins.
- **Dokumente**: Grauer Hintergrund (D3D3D3), fette Schrift (wenn nicht leer).
- **Bewertung/Zusammenfassung**: Grauer Hintergrund (D3D3D3), fette Schrift.

---

## 18. Word-Dokumentgenerierung — Auditnotizen

### 18.1 Funktion

Die Funktion `generateNotesWordDocument(notesData)` (asynchron, ca. 540 Zeilen) **MUSS** ein strukturiertes Word-Dokument aus den Daten des Auditnotizen-Generators erzeugen. Die Kopfzeile ist identisch zum Auditplan-Export.

### 18.2 Block-Darstellung im Word

Für jeden Notizen-Block **MUSS** eine separate Tabelle erzeugt werden mit folgender Struktur:

1. **Info-Zeile** (PFLICHT): Gelber Hintergrund (FFFF00), fett, zentriert. Dynamisch zusammengesetzt aus: `[Datum] | [Uhrzeit Von - Bis] | [Abteilung] | [Partner] | [Normen] | [Remote]` — nur aktivierte Felder werden aufgenommen (basierend auf Toggle-Zuständen). Die Pipe-Trennzeichen (|) werden nur zwischen vorhandenen Teilen eingefügt.

2. **Beschreibung** (bedingt, wenn Text vorhanden): Grauer Hintergrund (D3D3D3), fette Schrift. Text wird an doppelten Zeilenumbrüchen in separate Absätze aufgeteilt. Zellen-Margins: 80/80/120/120 Twips.

3. **Vorstellung** (bedingt, wenn Text vorhanden): Weißer Hintergrund, fett formatiertes Label. Zellen-Margins.

4. **Allgemeine Informationen** (bedingt): Weißer Hintergrund. Zellen-Margins.

5. **Notizen** (bedingt, nur wenn `showNotizen` aktiviert): Überschrift "Notizen:" (fett, zentriert) + Inhalt darunter. Zellen-Margins.

6. **Dokumente** (bedingt, nur wenn `showDocuments` aktiviert): Jedes QHSE-Dokument als eigene Tabellenzeile. Format: "Name (Datum) - Notizen". Bei leerer Liste: "Dokumente: -". **Keine redundante "Dokument:"-Überschrift pro Einzelzeile.**

7. **Bewertungen** (bedingt, nur wenn `showBewertung` aktiviert): Jedes Bewertungsfeld als eigene Tabellenzeile. Der Feststellungstyp wird **fett und gelb hinterlegt** (FFFF00) dargestellt, gefolgt von der Beschreibung. Bei leerer Liste: "Bewertung: -".

8. **Zusammenfassung** (bedingt, nur wenn `showBewertung` aktiviert UND Text vorhanden): Grauer Hintergrund (D3D3D3), **fette Schrift**. Dynamischer Titel: "Zusammenfassung [Abteilungsname]:" — der Abteilungsname wird aus dem Block-Datensatz entnommen. Text wird zeilenweise in separate fette Absätze aufgeteilt.

### 18.3 Tabellenrahmen

Alle Tabellen **MÜSSEN** folgende Rahmen haben: Oben/Unten/Links/Rechts: Single-Stil, Stärke 1, Farbe 000000. Innere horizontale Linien: Single-Stil, Stärke 1. Innere vertikale Linien: NONE (keine vertikalen Trennlinien innerhalb der Tabelle).

---

## 19. Word-Dokumentgenerierung — Notizen aus Blöcken

### 19.1 Funktion

Die Funktion `generateNotesWordDocumentFromBlocks(data)` (asynchron, ca. 540 Zeilen) **MUSS** ein Word-Dokument aus den Audit-Blöcken des Auditplan-Generators erzeugen. Diese Funktion wird über den Button "Auditnotizen generieren" im Auditplan-Generator aufgerufen.

### 19.2 Datensammlung

Die Funktion sammelt die Daten direkt aus den Formularelementen des Auditplan-Generators:
- Auftraggeber, Standorte, Geltungsbereich aus den Grunddaten-Feldern.
- Auditart aus dem Hidden-Input `auditart_hidden`.
- ISO-Standards aus der `ausgewaehlteKriterien`-Textarea.
- ZN-Nummern aus dem `znNumbers`-Array.
- Auditor aus dem `auditleiter`-Feld.
- Block-Daten: Für jeden Audit-Block werden Datum, Uhrzeit, Organisationseinheit, Partner, Norms, Remote-Status, Beschreibung, Vorstellung, Allgemein, Notizen, Dokumente und Bewertung gesammelt — unter Berücksichtigung der Toggle-Zustände.

### 19.3 Dokumentstruktur

Die Struktur ist identisch zu `generateNotesWordDocument()` (Kapitel 18), mit dem Unterschied dass die Daten aus den Auditplan-Blöcken statt aus den Notizen-Blöcken stammen. Alle Formatierungen (gelbe Info-Zeile, graue Beschreibung/Zusammenfassung, fette Schrift, Zellen-Margins) sind identisch.

### 19.4 Dateiname

Der generierte Dateiname **MUSS** dem Pattern `Auditnotizen_{timestamp}.docx` folgen.

---

## 20. Word-Dokumentgenerierung — Auditfragen

### 20.1 Funktion

Die Funktion `generateAuditQuestionsWord()` erzeugt ein Word-Dokument (.doc, **nicht** .docx) unter Verwendung eines HTML-Blob-Ansatzes (nicht docx.js). Das Dokument enthält: Abteilung, Datum, nummerierte Auditfragen mit Normreferenzen und eine Dokumentenliste.

### 20.2 Dateiformat

Im Gegensatz zu den anderen Word-Exporten wird hier ein einfaches HTML-Dokument mit dem MIME-Typ `application/msword` erzeugt. Der Dateiname folgt dem Pattern `Auditfragen_[Abteilung]_[Datum].doc`.

---

## 21. Wissensdatenbank und vorausgefüllte Inhalte

### 21.1 Organisationseinheiten mit Themen (`organisationseinheitOptionen`)

Dieses Objekt **MUSS** für 31 Abteilungen/Bereiche jeweils eine Liste von 6-10 vordefinierten Audit-Themen bereitstellen. Die Themen werden im durchsuchbaren Multiselect-Dropdown "Thema" angezeigt, wenn die entsprechende Organisationseinheit ausgewählt wird. Beispiele:

- **Management / Geschäftsführung** (10 Themen): Strategische Planung, Qualitätspolitik, Managementbewertung, Ressourcenmanagement, Kontext der Organisation, Interessierte Parteien, Risiken und Chancen, Ziele und Planung, Kommunikation, Führung und Verpflichtung.

- **Produktion / Fertigung** (10 Themen): Produktionsplanung, Fertigungsprozesse, Maschinenfreigabe und -wartung, Prüfprozesse, Rückverfolgbarkeit, Arbeitsanweisungen, Prozessüberwachung, Fehlerbehandlung, Wartung/Instandhaltung, Kennzahlen.

- **IT / Informationstechnologie** (8 Themen): IT-Infrastruktur, Datensicherheit und Backup, Softwareentwicklung, DSGVO-Compliance, Zugriffssteuerung, Notfallplanung IT, Netzwerkmanagement, Change Management.

### 21.2 Abteilungsbeschreibungen (`abteilungBeschreibungen`)

Dieses Objekt **MUSS** für 26 Abteilungen professionelle Beschreibungstexte im TÜV-Auditorstil bereitstellen, die jeweils 3-8 Sätze umfassen und die Schwerpunkte der Auditierung beschreiben. Diese Texte werden automatisch in das Beschreibungsfeld eingefügt, wenn eine Abteilung ausgewählt wird. Der Text **MUSS** fachlich korrekt formuliert sein und die relevanten Normforderungen für die jeweilige Abteilung abdecken.

### 21.3 Zusammenfassungsbeschreibungen (`zusammenfassungBeschreibungen`)

Dieses Objekt **MUSS** für 26 Abteilungen professionelle Bewertungszusammenfassungen im TÜV-Auditorstil bereitstellen, die jeweils 5-10 Sätze umfassen. Diese Texte fassen die typische Audit-Bewertung einer Abteilung zusammen und enden stets mit einem Satz wie "Insgesamt entspricht der [Bereich] den normativen Anforderungen." Die Texte werden automatisch in das Zusammenfassungsfeld eingefügt.

### 21.4 Generischer Zusammenfassungstext (`zusammenfassungDefaultText`)

Ein Fallback-Text von 7 Sätzen, der verwendet wird, wenn für die gewählte Abteilung keine spezifische Zusammenfassung vorhanden ist. Der Text **MUSS** allgemein genug formuliert sein, um auf jede Abteilung anwendbar zu sein, aber dennoch professionell und auditspezifisch klingen.

### 21.5 ISO-Normkapitel

Für jede der 5 unterstützten ISO-Normen **MUSS** eine vollständige Kapitelliste vorhanden sein:
- **ISO 9001:2015** (~80 Kapitel, von 4.1 bis 10.3): Gespeichert in `normkapitel`.
- **ISO 14001:2015** (~44 Kapitel): Gespeichert in `normkapitelISO14001`.
- **ISO 45001:2018** (~47 Kapitel): Gespeichert in `normkapitelISO45001`.
- **ISO 50001:2018** (~37 Kapitel): Gespeichert in `normkapitelISO50001`.
- **ISO 27001:2022** (~40 Kapitel): Gespeichert in `normkapitelISO27001`.
- **Kombiniert:** `alleNormkapitel` enthält alle Kapitel aller Normen.

### 21.6 Auditfragen-Datenbank (`auditQuestionsData`)

Ein umfangreiches Objekt (beginnt bei Zeile ~10005 in script.js) das für jede Kombination aus Abteilung und Norm spezifische Auditfragen und zu prüfende Dokumente enthält. Die Daten werden im Modul "Auditfragen & Dokumente" verwendet.

---

## 22. Toggle-System

### 22.1 Audit-Block-Toggles

Jeder Audit-Block-Zeile enthält drei Toggles:

- **Datum-Toggle** (ID: `date_toggle_{blockId}_{rowId}`, Funktion: `toggleDateField(blockId, rowId)`): Checkbox mit Label "Datum hinzufügen" (Schriftgröße: 0.85rem, Farbe: #667eea). Beim Aktivieren wird das Datums-Eingabefeld sichtbar. Im Word-Export: Wenn deaktiviert, erscheint das Datum NICHT in der gelben Info-Zeile.

- **Uhrzeit-Toggle** (ID: `time_toggle_{blockId}_{rowId}`, Funktion: `toggleTimeField(blockId, rowId)`): Checkbox mit Label "Uhrzeit hinzufügen". Beim Aktivieren werden die Zeitfelder (Von/Bis) sichtbar. Im Word-Export: Wenn deaktiviert, erscheint die Uhrzeit NICHT in der Info-Zeile.

- **Remote-Toggle** (ID: `remote_toggle_{blockId}_{rowId}`): Checkbox mit Label "Remote". Im Word-Export: Wenn aktiviert, wird "Remote" an die Info-Zeile angehängt.

### 22.2 Notizen-Block-Toggles

Jeder Notizen-Block enthält sechs Toggles:

- **Datum-Toggle** (ID: `notes_date_toggle_{blockId}`, Funktion: `toggleNotesDateField(blockId)`).
- **Uhrzeit-Toggle** (ID: `notes_time_toggle_{blockId}`, Funktion: `toggleNotesTimeField(blockId)`).
- **Remote-Toggle** (ID: `notes_remote_toggle_{blockId}`): Markierung als Remote-Audit.
- **Dokumente anzeigen**: Steuert ob QHSE-Dokumente im Word-Export erscheinen.
- **Bewertung anzeigen**: Steuert ob Bewertungsfelder und Zusammenfassung im Word erscheinen.
- **Notizen anzeigen**: Steuert ob Notizen im Word-Export erscheinen.

### 22.3 Toggle-Zustandserhaltung

Alle Toggle-Zustände **MÜSSEN** bei folgenden Operationen vollständig erhalten bleiben:
- Block duplizieren (`duplicateAuditBlock()`, `duplicateNotesBlock()`).
- Block-Reihenfolge ändern (Verschieben, Drag & Drop).
- Plan/Notizen speichern (`saveAuditPlan()`, `saveAuditNotes()`).
- Plan/Notizen laden (`editSavedPlan()`, `editSavedNotes()`).
- Block rendern (`renderAuditBlocks()`, `renderNotesBlocks()`).

---

## 23. Auto-Population und intelligente Befüllung

### 23.1 Abteilungswechsel in Audit-Blöcken

Wenn der Benutzer in einem Audit-Block die Organisationseinheit ändert, **MUSS** die Funktion `updateElementOptions(blockId, rowId, selectedOrg)` folgende Aktionen durchführen:

1. **Normkapitel filtern**: Das Normkapitel-Dropdown wird mit den für die Abteilung relevanten Kapiteln befüllt.
2. **Themen aktualisieren**: Das Thema-Dropdown wird mit den abteilungsspezifischen Themen aus `organisationseinheitOptionen` befüllt.
3. **Beschreibung auto-befüllen**: Das Beschreibungsfeld wird mit dem Text aus `abteilungBeschreibungen[selectedOrg]` befüllt — **NUR** wenn das Feld leer ist oder einen zuvor auto-befüllten Text enthält.
4. **Zusammenfassung auto-befüllen**: Das Bewertungsfeld wird mit dem Text aus `zusammenfassungBeschreibungen[selectedOrg]` befüllt — **NUR** wenn das Feld leer ist, den `zusammenfassungDefaultText` oder einen anderen auto-befüllten Text aus `zusammenfassungBeschreibungen` enthält. Manuell eingegebener Text wird **NIEMALS** überschrieben.
5. **Label aktualisieren**: Das Label "Zusammenfassung" wird zu "Zusammenfassung [Abteilungsname]:" geändert.
6. **Block-Titel aktualisieren**: Der Blocktitel wird mit dem Abteilungsnamen aktualisiert.

### 23.2 Abteilungswechsel in Notizen-Blöcken

Identische Logik wie 23.1, implementiert in den Funktionen `handleDepartmentSelectChange(blockId)` und `updateNotesBlockTitle(blockId)`.

### 23.3 Auto-Fill-Schutz-Logik

Der Auto-Fill-Schutz **MUSS** sicherstellen, dass manuell bearbeitete Felder nie überschrieben werden. Die Prüfung erfolgt durch Vergleich des aktuellen Feldwerts mit:
- Leerer String (Feld ist leer → darf befüllt werden)
- `zusammenfassungDefaultText` (generischer Text → darf durch spezifischen ersetzt werden)
- Alle Werte in `Object.values(zusammenfassungBeschreibungen)` (ein anderer auto-befüllter Text → darf ersetzt werden)

Nur wenn der aktuelle Wert einem dieser Werte entspricht, wird das Feld automatisch aktualisiert.

---

## 24. Block-Management-System

### 24.1 Audit-Blöcke — Erstellung und Verwaltung

Audit-Blöcke werden über die Funktion `addAuditBlock()` erstellt. Jeder Block erhält eine eindeutige ID (Timestamp-basiert) und wird im Array `auditBlocks` registriert. Jeder Block kann mehrere Zeilen enthalten, die im Objekt `auditBlockRows` als `{blockId: [rowId1, rowId2, ...]}` verwaltet werden.

#### Zeilen pro Audit-Block

Jede Zeile enthält folgende Felder (ID-Schema: `block_{blockId}_row_{rowId}_{feldname}`):

- **Datum** (togglebar): Datumseingabe mit Notizfeld für Tagesbezeichnung (z.B. "Tag 2/3 (8h)").
- **Uhrzeit Von/Bis** (togglebar): Zwei Zeiteingabefelder.
- **Remote** (Checkbox): Markierung als Remote-Audit.
- **Organisationseinheit**: Texteingabe mit Datalist und 26+ vordefinierten Abteilungen. Löst Auto-Population aus.
- **Normkapitel**: Durchsuchbarer Multiselect-Dropdown, dynamisch nach Abteilung gefiltert.
- **Thema**: Durchsuchbarer Multiselect-Dropdown mit Custom-Eingabe, abteilungsabhängig.
- **Element/Prozess**: Durchsuchbarer Multiselect-Dropdown mit Custom-Eingabe.
- **Auditor**: Freitext.
- **Gesprächspartner**: Freitext.

#### Notizen-Panel pro Zeile

Aufklappbar über einen Stift-Button. Enthält sechs Textarea-Felder:
- Beschreibung (5 Zeilen, auto-befüllt)
- Vorstellung (2 Zeilen, Standardtext)
- Allgemein (2 Zeilen, Standardtext)
- Notizen (3 Zeilen, leer)
- Dokumente (2 Zeilen, leer)
- Zusammenfassung [Abteilung] (6 Zeilen, auto-befüllt)

### 24.2 Notizen-Blöcke — Erstellung und Verwaltung

Notizen-Blöcke werden über `addNotesBlock()` erstellt und im Array `notesBlocks` verwaltet. Jeder Block enthält die in Kapitel 13 beschriebenen Felder plus QHSE-Dokumente und Bewertungsfelder.

### 24.3 Block-Operationen

Für beide Block-Typen **MÜSSEN** folgende Operationen implementiert sein:

- **Erstellen**: Neuer Block mit eindeutiger ID, leeren Feldern und Standardwerten.
- **Löschen**: Entfernung des Blocks (mit `confirm()`-Dialog). Aktualisierung aller abhängigen Datenstrukturen (qhseDocuments, additionalFields).
- **Duplizieren**: Vollständige Kopie aller Werte einschließlich: Textwerte, Select-Auswahlen, Checkbox-Zustände, Toggle-Zustände (dateToggleChecked, timeToggleChecked, remoteChecked), Notizen-Panel-Inhalte, QHSE-Dokumente (tiefe Kopie), Bewertungsfelder (tiefe Kopie).
- **Verschieben (oben/unten)**: Position im Array ändern und UI neu rendern.
- **Drag & Drop**: Freie Neuordnung per Mausziehen mit visuelem Feedback.

---

## 25. QHSE-Dokumentverwaltung

### 25.1 Datenstruktur

QHSE-Dokumente werden im Objekt `qhseDocuments` als `{blockId: [{id, name, date, notes}]}` verwaltet. Jeder Notizen-Block kann unbegrenzt viele Dokumente enthalten.

### 25.2 Verwaltungsfunktionen

- `addQhseDocument(blockId)`: Erzeugt ein neues Dokument mit eindeutiger ID und leeren Feldern.
- `removeQhseDocument(blockId, docId)`: Entfernt das Dokument (mit Bestätigung).
- `moveQhseDocumentUp/Down(blockId, index)`: Ändert die Reihenfolge.
- `renderQhseDocuments(blockId)`: Rendert die Dokumentliste mit Eingabefeldern und Aktionsbuttons.
- `updateQhseDocTitle(blockId, docId)`: Aktualisiert Name, Datum oder Notizen eines Dokuments.

### 25.3 Word-Export

Im Word-Export **MUSS** jedes Dokument als eigene Tabellenzeile dargestellt werden mit dem Format: "Dokumentname (Datum) - Notizen". Es darf **KEINE** redundante "Dokument:"-Überschrift pro Einzelzeile geben. Nur bei leerer Dokumentliste erscheint: "Dokumente: -".

---

## 26. Bewertungsfelder und Feststellungen

### 26.1 Datenstruktur

Bewertungsfelder werden im Objekt `additionalFields` als `{blockId: [{id, type, chapters, description}]}` verwaltet.

### 26.2 Feldtypen

Das Typ-Feld (Select) **MUSS** folgende Optionen bieten:
- Abweichung (Hauptabweichung)
- Nebenabweichung
- Beobachtung
- Verbesserungspotenzial
- Positive Feststellung

### 26.3 Kapitelauswahl

Das Kapitel-Feld (Multiselect) **MUSS** die ISO-Normkapitel anzeigen, die für den Block relevant sind (basierend auf den im Block ausgewählten Normen).

### 26.4 Word-Export-Formatierung

- **Feststellungstyp**: Fett + gelber Hintergrund (FFF2CC/FFFF00).
- **Kapitelreferenz**: In Klammern nach dem Typ.
- **Beschreibung**: Normaler Text nach Doppelpunkt.
- **Zusammenfassung**: Separater Abschnitt, grauer Hintergrund (D3D3D3), fette Schrift, dynamischer Titel.

---

## 27. Datei-Upload und -Verwaltung

### 27.1 Akzeptierte Formate

Die Anwendung **MUSS** folgende Dateiformate akzeptieren:
- Dokumente: PDF (.pdf), Word (.doc, .docx)
- Tabellen: Excel (.xls, .xlsx)
- Präsentationen: PowerPoint (.ppt, .pptx)
- Text: Textdateien (.txt)
- Bilder: JPEG (.jpg, .jpeg), PNG (.png)

### 27.2 Upload-Prozess

1. Benutzer wählt Datei(en) über `<input type="file" multiple>`.
2. Für jede Datei wird `FileReader.readAsDataURL()` aufgerufen.
3. Das Ergebnis (Base64-String) wird zusammen mit Dateiname und -größe im Audit-Datensatz gespeichert.
4. Die Dateiliste wird aktualisiert und die Dateianzahl angezeigt.

### 27.3 Dateivorschau und -verwaltung

- **Vorschau-Modal** (ID: `auditFilesModal`): Zeigt alle Dateien eines Audits mit Download- und Lösch-Buttons.
- **Dateiviewer-Modal** (ID: `fileViewerModal`, Z-Index: 1001 — über dem Dateimodal): Zeigt eine Vorschau der Datei (Bilder als `<img>`, PDFs als `<iframe>`, andere als Icon). Enthält Download- und Schließen-Buttons.
- **Dateigröße**: Wird formatiert angezeigt (KB/MB) über die Funktion `formatFileSize(bytes)`.

---

## 28. Datenpersistenz

### 28.1 localStorage-Schlüssel

| Schlüssel | Datentyp | Inhalt | Gelesen von | Geschrieben von |
|---|---|---|---|---|
| `audits` | JSON Array | Alle Audit-Datensätze | `displayAudits()`, `updateDashboard()` | `addAudit()`, `editAudit()`, `deleteAudit()` |
| `auditors` | JSON Array | Alle Auditorenprofile | `displayAuditors()`, `updateAuditorSelect()` | `addAuditor()`, `editAuditor()`, `deleteAuditor()` |
| `saved_plans` | JSON Array | Gespeicherte Auditpläne | `updateSavedPlansDisplay()` | `saveAuditPlan()` |
| `saved_notes` | JSON Array | Gespeicherte Auditnotizen | `updateSavedNotesDisplay()` | `saveAuditNotes()` |
| `saved_audits` | JSON Array | Gespeicherte Auditfragen | `updateSavedAuditsDisplay()` | `saveAuditForm()` |
| `saved_audit_questions` | JSON Array | Auditfragen-Vorlagen | `loadSavedAudit()` | `saveAuditForm()` |
| `calendar_entries` | JSON Array | Kalendereinträge | `renderCalendar()` | `saveCalendarEntry()` |
| `actions` | JSON Array | Maßnahmenplan-Einträge | `loadActions()`, `filterActions()` | `addNewAction()`, `saveAction()` |
| `auditplan_logo` | String (Base64) | Firmenlogo | `loadSavedLogo()` | `processLogoUpload()` |
| `settings` | JSON Object | Einstellungen (Theme, Sprache, etc.) | `loadSettingsToForm()` | `saveSettings()` |

### 28.2 Datenintegrität

- Beim Laden der Anwendung **MÜSSEN** alle Schlüssel gelesen und in globale Variablen geladen werden.
- Bei jeder Datenänderung **MUSS** der entsprechende Schlüssel sofort aktualisiert werden.
- Die Funktionen `exportData()` und `importData()` **MÜSSEN** alle Schlüssel berücksichtigen.

---

## 29. Drag & Drop und Sortierung

### 29.1 Audit-Block-Sortierung

Die Funktion `initBlockDragAndDrop()` **MUSS** Drag & Drop für alle Audit-Blöcke aktivieren. Beim Ziehen eines Blocks über einen anderen **MUSS** der Zielblock visuell hervorgehoben werden (gestrichelter blauer Rand: `border: 2px dashed #667eea`, leichter blauer Hintergrund: `background: #f0f2ff`, leichte Vergrößerung: `scale(1.02)`). Beim Loslassen **MUSS** die Block-Reihenfolge im Array aktualisiert und die Blöcke neu gerendert werden — unter vollständiger Erhaltung aller Feldwerte und Toggle-Zustände.

### 29.2 Notizen-Block-Sortierung

Implementiert über vier Handler: `handleNotesDragStart(event, blockId)`, `handleNotesDragOver(event)`, `handleNotesDrop(event, targetBlockId)`, `handleNotesDragEnd(event)`. Die Logik und visuellen Effekte sind identisch zu den Audit-Blöcken.

### 29.3 Zustandserhaltung bei Sortierung

Vor dem Neurendern der Blöcke **MÜSSEN** alle aktuellen Feldwerte aus dem DOM gesammelt werden (Save-Zyklus), und nach dem Rendern **MÜSSEN** sie wiederhergestellt werden (Restore-Zyklus). Dies betrifft: alle Input-/Textarea-/Select-Werte, alle Checkbox-Zustände (Toggles), die Sichtbarkeit bedingter Elemente und alle QHSE-Dokumente und Bewertungsfelder.

---
