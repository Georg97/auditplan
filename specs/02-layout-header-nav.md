# 02 - Layout, Header und Navigation

## Datenmodell

```typescript
interface NavItem {
	id: string;
	label: string; // i18n-Schluessel, z.B. "nav.uebersicht"
	icon: string; // Emoji oder Icon-Bezeichner
	href: string; // SvelteKit-Route, z.B. "/overview"
}

interface SettingsState {
	isOpen: boolean; // Modal sichtbar
	language: SupportedLocale;
	theme: 'light' | 'dark'; // Falls spaeter gewuenscht
}

// Navigationspunkte (12 Eintraege)
const NAV_ITEMS: NavItem[] = [
	{ id: 'overview', label: 'nav.uebersicht', icon: '📋', href: '/overview' },
	{ id: 'dashboard', label: 'nav.dashboard', icon: '📊', href: '/dashboard' },
	{ id: 'auditor-management', label: 'nav.auditoren', icon: '👥', href: '/auditor-management' },
	{ id: 'add-auditor', label: 'nav.auditor_neu', icon: '➕', href: '/add-auditor' },
	{ id: 'search-manage', label: 'nav.suchen', icon: '🔍', href: '/search-manage' },
	{ id: 'calendar', label: 'nav.kalender', icon: '📅', href: '/calendar' },
	{ id: 'import-export', label: 'nav.import_export', icon: '📁', href: '/import-export' },
	{ id: 'plan-generator', label: 'nav.auditplan', icon: '📝', href: '/plan-generator' },
	{ id: 'report-generator', label: 'nav.auditbericht', icon: '📄', href: '/report-generator' },
	{ id: 'notes-generator', label: 'nav.auditnotizen', icon: '🗒️', href: '/notes-generator' },
	{ id: 'audit-questions', label: 'nav.fragen_dokumente', icon: '❓', href: '/audit-questions' },
	{ id: 'action-plan', label: 'nav.massnahmenplan', icon: '⚡', href: '/action-plan' }
];
```

## UI-Beschreibung

### Header

**Datei:** `src/lib/components/layout/Header.svelte`

Der Header ist ein festes Element am oberen Rand der Seite mit einem Verlaufshintergrund.

| Eigenschaft | Wert                                      |
| ----------- | ----------------------------------------- |
| Hintergrund | Linearer Gradient: `#667eea` -> `#764ba2` |
| Hoehe       | Automatisch (abhaengig vom Inhalt)        |
| Padding     | `1.5rem 2rem`                             |
| Position    | Relativ (scrollt mit der Seite)           |

**3 Elemente im Header (Flexbox, `justify-between`, `align-center`):**

#### 1. Linkes SVG - ISO-Zertifikat mit Lupe

- Groesse: `280x250px`
- Darstellung: 3D-ISO-Zertifikat mit einer Lupe darueber
- Techniken: SVG-Gradienten (`linearGradient`), Filter (`feDropShadow`, `feGaussianBlur`), abgerundete Rechtecke
- Farben: Weiss/Grau fuer das Dokument, Blau/Lila fuer Akzente, Gold fuer die Lupe
- Animation: Keine (statisches SVG)

#### 2. Mittlerer Bereich - Titel

- **Haupttitel:** `<h1>` mit Text "Der ISO Audit Manager"
  - Schriftgroesse: `2.5rem`
  - Farbe: Weiss
  - Text-Shadow: 3D-Effekt mit mehreren Schatten-Ebenen (`2px 2px 4px rgba(0,0,0,0.3)`)
  - Schriftstil: Fett (bold)
- **Untertitel 1:** Beschreibungstext mit Perspektiv-Effekt
  - Schriftgroesse: `1.1rem`
  - Farbe: `rgba(255, 255, 255, 0.9)`
  - Leichter `perspective`-CSS-Effekt
- **Untertitel 2:** Zweiter Beschreibungstext mit alternativem Perspektiv-Winkel
  - Gleiche Formatierung wie Untertitel 1

#### 3. Rechtes SVG - Klemmbrett mit Fortschrittsbalken

- Groesse: `280x250px`
- Darstellung: 3D-Klemmbrett mit ISO-Fortschrittsbalken, Auditor-Team-Symbolen und Kalender-Icon
- Techniken: SVG-Gradienten, Filter, Rechtecke mit abgerundeten Ecken
- Fortschrittsbalken: Verschiedene Fuellstaende fuer unterschiedliche ISO-Normen
- Farben: Gruen (abgeschlossen), Orange (in Bearbeitung), Blau (geplant)

#### 4. Einstellungen-Button

- Position: Absolut, oben rechts im Header (`top: 1rem`, `right: 1rem`)
- Icon: Zahnrad (Gear-Icon aus Bits UI oder SVG)
- Groesse: `2.5rem x 2.5rem`
- Hintergrund: `rgba(255, 255, 255, 0.2)`
- Border-Radius: `50%`
- Hover-Effekt: Rotation um 90 Grad (`transform: rotate(90deg)`), Transition `0.3s`
- Klick: Oeffnet das Einstellungen-Modal (Bits UI Dialog)

### Navigationsleiste

**Datei:** `src/lib/components/layout/NavBar.svelte`

| Eigenschaft   | Wert                                                  |
| ------------- | ----------------------------------------------------- |
| Layout        | Flexbox, `flex-wrap: wrap`, `justify-content: center` |
| Hintergrund   | Weiss                                                 |
| Padding       | `0.5rem 1rem`                                         |
| Border-Bottom | `2px solid #e2e8f0`                                   |
| Gap           | `0.5rem`                                              |

#### Navigations-Item (Standardzustand)

| Eigenschaft    | Wert                |
| -------------- | ------------------- |
| Padding        | `0.6rem 1.2rem`     |
| Border         | `2px solid #e2e8f0` |
| Border-Radius  | `25px` (Pill-Form)  |
| Hintergrund    | Weiss               |
| Schriftgroesse | `0.85rem`           |
| Cursor         | Pointer             |
| Transition     | `all 0.3s ease`     |

#### Navigations-Item (Hover-Zustand)

| Eigenschaft  | Wert                                 |
| ------------ | ------------------------------------ |
| Border-Farbe | `#667eea`                            |
| Textfarbe    | `#667eea`                            |
| Transform    | `translateY(-2px)`                   |
| Box-Shadow   | `0 4px 6px rgba(102, 126, 234, 0.2)` |

#### Navigations-Item (Aktiver Zustand)

| Eigenschaft  | Wert                                      |
| ------------ | ----------------------------------------- |
| Hintergrund  | Linearer Gradient: `#667eea` -> `#764ba2` |
| Textfarbe    | Weiss                                     |
| Border-Farbe | Transparent                               |
| Box-Shadow   | `0 4px 15px rgba(102, 126, 234, 0.4)`     |

### App-Layout

**Datei:** `src/routes/(app)/+layout.svelte`

```
+------------------------------------------------------+
|                    Header                            |
| [SVG Zertifikat]  Titel + Untertitel  [SVG Klemmbrett]|
|                                        [Zahnrad]     |
+------------------------------------------------------+
| Nav: [Uebersicht] [Dashboard] [Auditoren] [...]     |
+------------------------------------------------------+
|                                                      |
|                   <slot />                           |
|              (Seiteninhalt)                          |
|                                                      |
+------------------------------------------------------+
```

## Interaktionen

### Navigation

- Die aktive Route wird ueber `$page.url.pathname` (SvelteKit) ermittelt
- Jedes `NavItem` wird als `<a>`-Tag gerendert (SvelteKit `href`-Routing)
- SvelteKit uebernimmt das clientseitige Routing automatisch (kein manuelles `navigateToPage()`)
- Beim Klick auf einen Nav-Eintrag wird die entsprechende Route geladen
- Der aktive Zustand wird durch Vergleich von `$page.url.pathname` mit `item.href` bestimmt

### Einstellungen-Modal

1. Klick auf Zahnrad-Button -> Modal oeffnet sich (Bits UI `Dialog`)
2. Im Modal: Sprachauswahl (Dropdown mit 10 Sprachen)
3. Sprachwechsel -> `setLocale()` wird aufgerufen, UI aktualisiert sich reaktiv
4. Spracheinstellung wird per Remote Function in der Datenbank gespeichert
5. Modal schliessen mit X-Button, Escape-Taste oder Klick ausserhalb

### Responsive Verhalten

- Header-SVGs werden auf kleinen Bildschirmen (`< 768px`) ausgeblendet (`display: none`)
- Titel-Schriftgroesse reduziert sich auf `1.8rem`
- Navigationsleiste: `flex-wrap` sorgt fuer automatischen Umbruch
- Auf sehr kleinen Bildschirmen (`< 480px`) werden Nav-Items kompakter (weniger Padding)

## Abhaengigkeiten

- **Spec 01 (Architektur):** Tech-Stack, Routing-Struktur, i18n-System
- **SvelteKit:** `$page` Store fuer aktive Route, dateibasiertes Routing
- **Bits UI:** `Dialog`-Komponente fuer Einstellungen-Modal
- **i18n-Modul:** `t()`-Funktion fuer alle sichtbaren Texte
- **Alle anderen Module (03-05):** Werden innerhalb des `<slot />`-Bereichs dieses Layouts gerendert
