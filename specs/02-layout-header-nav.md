# 02 — Layout, Header und Navigation

## Datenmodell

```typescript
interface NavItem {
	label: string; // i18n-Schlüssel, z.B. "nav.overview"
	icon: string; // Lucide-Icon-Name, z.B. "clipboard-list"
	href: string; // SvelteKit-Route, z.B. "/overview"
}

// Navigationspunkte (12 Einträge)
const NAV_ITEMS: NavItem[] = [
	{ label: 'nav.overview', icon: 'clipboard-list', href: '/overview' },
	{ label: 'nav.dashboard', icon: 'bar-chart-3', href: '/dashboard' },
	{ label: 'nav.auditorManagement', icon: 'users', href: '/auditor-management' },
	{ label: 'nav.addAuditor', icon: 'user-plus', href: '/add-auditor' },
	{ label: 'nav.searchManage', icon: 'search', href: '/search-manage' },
	{ label: 'nav.calendar', icon: 'calendar', href: '/calendar' },
	{ label: 'nav.importExport', icon: 'folder-down', href: '/import-export' },
	{ label: 'nav.planGenerator', icon: 'file-text', href: '/plan-generator' },
	{ label: 'nav.reportGenerator', icon: 'file-check', href: '/report-generator' },
	{ label: 'nav.notesGenerator', icon: 'sticky-note', href: '/notes-generator' },
	{ label: 'nav.auditQuestions', icon: 'circle-help', href: '/audit-questions' },
	{ label: 'nav.actionPlan', icon: 'list-checks', href: '/action-plan' }
];
```

## UI-Beschreibung

### Layout-Architektur: Sidebar + Content (SaaS-Standard)

Die App verwendet ein modernes Sidebar-Layout wie bei typischen SaaS-Anwendungen (z.B. Linear, Notion, Vercel Dashboard):

- **Desktop (lg+):** Permanente Sidebar links, Content-Bereich rechts
- **Mobile/Tablet (<lg):** Sidebar ausgeblendet, Hamburger-Button öffnet Overlay-Sidebar (Sheet)

```
Desktop (lg+):                      Mobile (<lg):
+----------+---------------------+  +---------------------------+
| Sidebar  |     Header          |  | [☰] Header                |
|          |---------------------|  |---------------------------|
| [Logo]   |                     |  |                           |
| Nav 1    |   {@render          |  |   {@render children()}    |
| Nav 2    |     children()}     |  |                           |
| Nav 3    |                     |  +---------------------------+
| ...      |   (Seiteninhalt)    |
| Nav 12   |                     |  Hamburger → öffnet Sheet:
|          |                     |  +----------+
| [Zahnrad]|                     |  | [Logo]   |
| [User]   |                     |  | Nav 1    |
+----------+---------------------+  | Nav 2    |
                                    | ...      |
                                    | [Zahnrad]|
                                    | [User]   |
                                    +----------+
```

### Sidebar-Komponente

**Datei:** `src/lib/components/layout/AppSidebar.svelte`

Verwende ShadCN `sidebar` Komponente als Basis: `bunx shadcn-svelte@next add sidebar --no-git`

**Aufbau der Sidebar:**

1. **Sidebar-Header:**
   - App-Logo: `static/logo_dark.png` (light mode) / `static/logo_light.png` (dark mode) — responsiv über `mode-watcher`
   - App-Name: `i18n.t('app.name')` — kurzer Text, z.B. "Audit Manager"
   - Logo+Name als `<a href="/overview">` (Klick → Startseite)

2. **Sidebar-Content (scrollbar):**
   - 12 Nav-Items als Liste
   - Jedes Item: Lucide-Icon + Label aus `i18n.t(item.label)`
   - Aktiver Zustand: Vergleich `$page.url.pathname` mit `item.href`
   - Optional: Nav-Items in Gruppen unterteilen (z.B. "Übersicht", "Verwaltung", "Generatoren", "Tools")

3. **Sidebar-Footer:**
   - Einstellungen-Button: Lucide `settings` Icon + `i18n.t('nav.settings')`
   - User-Info: Avatar/Name des eingeloggten Benutzers aus `data.user`
   - Theme-Toggle: Light/Dark Mode Schalter (ShadCN `theme-switcher` bereits vorhanden)

### Sidebar Nav-Item Zustände

| Zustand | Beschreibung                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------- |
| Default | Icon + Label, dezenter Text (text-sidebar-foreground), kein Hintergrund                                   |
| Hover   | Leicht hervorgehobener Hintergrund (bg-sidebar-accent), sanfte Transition                                 |
| Aktiv   | Hervorgehobener Hintergrund (bg-sidebar-primary), kontrastierender Text (text-sidebar-primary-foreground) |

Die ShadCN `sidebar` Komponente bringt diese Zustände bereits mit — nutze die eingebauten Varianten.

### Mobile Navigation

- **Trigger:** Hamburger-Button (`menu` Lucide-Icon) oben links im Header, nur sichtbar auf Mobile (`lg:hidden`)
- **Overlay:** ShadCN `Sheet` Komponente (side="left"), enthält dieselbe Sidebar-Komponente
- **Schließen:** Klick außerhalb, Escape-Taste, oder Klick auf Nav-Item (automatische Navigation schließt Sheet)

### Header (nur Mobile / optionaler schmaler Header auf Desktop)

Auf Mobile wird ein schmaler Header angezeigt mit:

- Links: Hamburger-Button (öffnet Sheet-Sidebar)
- Mitte: App-Logo (klein) oder App-Name
- Rechts: Optional User-Avatar oder Theme-Toggle

Auf Desktop ist der Header optional — die Sidebar enthält bereits Logo, Navigation und User-Info. Wenn ein Header auf Desktop gewünscht ist, kann er für Breadcrumbs, Seitentitel oder Suchfeld genutzt werden.

### Content-Bereich

```svelte
<main class="flex-1 overflow-y-auto">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		{@render children()}
	</div>
</main>
```

### App-Layout Struktur

**Datei:** `src/routes/(app)/+layout.svelte`

```svelte
<script lang="ts">
	import { setContext } from 'svelte';
	import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
	import { SidebarProvider, SidebarTrigger, SidebarInset } from '$lib/components/ui/sidebar';
	// ... i18n + settings context setup
</script>

<SidebarProvider>
	<AppSidebar />
	<SidebarInset>
		<!-- Mobile header with hamburger -->
		<header class="flex items-center gap-2 border-b px-4 py-2 lg:hidden">
			<SidebarTrigger />
			<span class="font-display font-semibold">{i18n.t('app.name')}</span>
		</header>
		<!-- Page content -->
		<main class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{@render children()}
			</div>
		</main>
	</SidebarInset>
</SidebarProvider>
```

## Interaktionen

### Navigation

- Die aktive Route wird über `$page.url.pathname` (aus `$app/state`) ermittelt
- Jedes NavItem wird als `<a>` Tag gerendert (SvelteKit file-based Routing)
- Der aktive Zustand wird durch Vergleich von `$page.url.pathname` mit `item.href` bestimmt
- Auf Mobile: Nach Klick auf Nav-Item schließt sich das Sheet automatisch

### Einstellungen-Modal

1. Klick auf Einstellungen-Button in Sidebar-Footer → Modal öffnet sich (ShadCN `Dialog`)
2. Im Modal: Sprachauswahl, Theme-Wahl, weitere Einstellungen (Spec 14)
3. Modal schließen mit X-Button, Escape-Taste oder Klick außerhalb

### Responsive Verhalten

- **≥1024px (lg):** Sidebar permanent sichtbar, Content-Bereich nimmt restliche Breite ein
- **<1024px:** Sidebar ausgeblendet, Hamburger-Button öffnet Sheet-Overlay
- Sidebar kann auch auf Desktop ein-/ausgeklappt werden (ShadCN Sidebar `collapsible` Prop)
- Eingeklappter Zustand zeigt nur Icons (kein Label-Text)

## Abhängigkeiten

- **Spec 01 (Architektur):** Tech-Stack, Routing-Struktur, i18n-System, Theme-System
- **ShadCN-Komponenten:** `sidebar` (Hauptkomponente), `sheet` (Mobile Overlay), `dialog` (Settings Modal)
- **SvelteKit:** `$page` aus `$app/state` für aktive Route
- **i18n-Modul:** `i18nRune.t()` für alle sichtbaren Texte
- **mode-watcher:** Light/Dark Mode Detection für Logo-Wechsel
- **Alle anderen Module (03-14):** Werden innerhalb des Content-Bereichs gerendert
