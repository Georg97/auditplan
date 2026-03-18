# 01 — Systemarchitektur

## Tech-Stack

| Technologie          | Zweck                                                           |
| -------------------- | --------------------------------------------------------------- |
| **SvelteKit 2**      | Meta-Framework, SSR, Routing, Remote Functions                  |
| **Svelte 5**         | Reaktives UI-Framework (Runes: `$state`, `$derived`, `$effect`) |
| **Tailwind CSS 4**   | Utility-first Styling via `@tailwindcss/vite`                   |
| **Bits UI / ShadCN** | Komponentenbibliothek in `src/lib/components/ui/`               |
| **Drizzle ORM**      | Typsicherer SQL-Query-Builder                                   |
| **Turso (LibSQL)**   | Serverlose SQLite-Datenbank                                     |
| **better-auth**      | Authentifizierung (Google OAuth + E-Mail/Passwort)              |
| **SuperForms + Zod** | Serverseitige Formularvalidierung                               |
| **TanStack Table**   | Datentabellen (`@tanstack/svelte-table`)                        |
| **i18next**          | Internationalisierung (10 Sprachen, Lazy Loading)               |
| **docx**             | Word-Dokument-Generierung (.docx)                               |
| **Lucide**           | Icons (`@lucide/svelte`)                                        |
| **Bun**              | Paketmanager und Runtime                                        |

---

## Datenmodell

### Authentifizierung (better-auth — bereits vorhanden)

```typescript
interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface Session {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
}
```

### i18n

```typescript
type SupportedLocale = 'de' | 'en' | 'fr' | 'es' | 'it' | 'nl' | 'pt' | 'pl' | 'ru' | 'tr';
```

---

## Architektur-Muster (verbindlich)

### 1. Datenpersistenz — Remote Functions

Alle Daten werden serverseitig in Turso gespeichert. Zugriff ausschließlich über SvelteKit Remote Functions. **KEIN localStorage.**

```typescript
// src/lib/rpc/auditoren.remote.ts
import { query, mutation } from '$app/server';
import { db } from '$lib/server/db';
import { auditors } from '$db/schema';
import { eq } from 'drizzle-orm';

// Leseoperationen: query()
export const getAuditors = query(async () => {
	return db.select().from(auditors);
});

export const getAuditorById = query(async (id: string) => {
	return db.select().from(auditors).where(eq(auditors.id, id));
});

// Schreiboperationen: mutation()
export const deleteAuditor = mutation(async (id: string) => {
	await db.delete(auditors).where(eq(auditors.id, id));
});
```

Aufruf in Svelte-Komponenten:

```svelte
<script lang="ts">
	import { getAuditors } from '$lib/rpc/auditoren.remote';
	const auditors = getAuditors();
</script>

{#await auditors}
	<p>Laden...</p>
{:then data}
	<!-- data anzeigen -->
{:catch error}
	<p>Fehler: {error.message}</p>
{/await}
```

### 2. Formulare — SuperForms + Zod

Alle Formulare verwenden SvelteKit Form Actions mit SuperForms + Zod:

```typescript
// src/routes/(app)/auditor-neu/+page.server.ts
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const auditorSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	email: z.email('Ungültige E-Mail-Adresse'),
	company: z.string().optional()
});

export const load = async () => {
	const form = await superValidate(zod4(auditorSchema));
	return { form };
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(auditorSchema));
		if (!form.valid) return fail(400, { form });
		// DB-Operation...
		return message(form, 'Auditor gespeichert!');
	}
};
```

```svelte
<!-- src/routes/(app)/auditor-neu/+page.svelte -->
<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	const { form, errors, enhance } = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) toast.success(form.message);
			else toast.error('Bitte Fehler korrigieren');
		}
	});
</script>

<form method="POST" use:enhance>
	<Input name="name" bind:value={$form.name} />
	{#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}
	<Button type="submit">Speichern</Button>
</form>
```

### 3. Datentabellen — TanStack Table

Alle Listen/Tabellen verwenden TanStack Table mit ShadCN-Styling:

```svelte
<script lang="ts">
	import { createSvelteTable, getCoreRowModel, flexRender } from '@tanstack/svelte-table';
	import * as Table from '$lib/components/ui/table';

	const table = createSvelteTable({
		data: auditors,
		columns: [...],
		getCoreRowModel: getCoreRowModel()
	});
</script>
```

### 4. i18n — i18next + i18nRune

Lazy-Loading-Architektur mit custom Svelte 5 Rune:

```typescript
// src/lib/i18n/i18n.svelte.ts
import i18next from 'i18next';

export class I18nRune {
	locale = $state<SupportedLocale>('de');
	ready = $state(false);

	async init() {
		const de = await fetch('/locales/de.json').then((r) => r.json());
		await i18next.init({ lng: 'de', resources: { de: { translation: de } } });
		this.ready = true;
	}

	async changeLocale(lang: SupportedLocale) {
		if (!i18next.hasResourceBundle(lang, 'translation')) {
			const data = await fetch(`/locales/${lang}.json`).then((r) => r.json());
			i18next.addResourceBundle(lang, 'translation', data);
		}
		await i18next.changeLanguage(lang);
		this.locale = lang;
	}

	t(key: string, params?: Record<string, unknown>): string {
		return i18next.t(key, params) ?? key;
	}
}
```

Initialisierung in Layout:

```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
	import { setContext } from 'svelte';
	import { I18nRune } from '$lib/i18n/i18n.svelte';

	const i18n = new I18nRune();
	i18n.init();
	setContext('i18n', i18n);
</script>
```

Verwendung in Komponenten:

```svelte
<script lang="ts">
	import { getContext } from 'svelte';
	import type { I18nRune } from '$lib/i18n/i18n.svelte';

	const i18n = getContext<I18nRune>('i18n');
</script>

<h1>{i18n.t('dashboard.title')}</h1><p>{i18n.t('dashboard.totalAudits', { count: 42 })}</p>
```

### i18n-Konvention für Enums/Typen

TypeScript-Union-Types verwenden **interne englische Keys**, nicht deutsche Anzeigetexte:

```typescript
// RICHTIG — interne Keys
type AuditStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
type Priority = 'high' | 'medium' | 'low';

// FALSCH — deutsche Anzeigetexte als Typ-Werte
type AuditStatus = 'geplant' | 'in Bearbeitung' | 'abgeschlossen';
```

Die Anzeige erfolgt über i18n-Lookup:

```svelte
<span>{i18n.t(`audit.status.${audit.status}`)}</span>
<!-- Ergibt z.B. "Geplant" wenn locale=de, "Planned" wenn locale=en -->
```

Locale-Dateien unter `static/locales/`:

```json
// static/locales/de.json
{
	"nav": {
		"overview": "Übersicht",
		"dashboard": "Dashboard",
		"auditorManagement": "Auditor-Verwaltung"
	},
	"dashboard": {
		"title": "Dashboard",
		"totalAudits": "Gesamte Audits"
	}
}
```

### 5. Shared State — Svelte Context + Runes

```typescript
// src/lib/state/settings.svelte.ts
export class SettingsState {
	theme = $state('default');
	compactView = $state(false);
	showNotifications = $state(true);
	locale = $state<SupportedLocale>('de');
}
```

Initialisierung in `(app)/+layout.svelte` mit `setContext('settings', new SettingsState())`.

### 6. UI-Komponenten — ShadCN-first

Neue Komponenten werden NICHT manuell erstellt. Stattdessen:

```bash
# Standard ShadCN-Svelte Komponenten:
bunx shadcn-svelte@next add dialog
bunx shadcn-svelte@next add select
bunx shadcn-svelte@next add checkbox
bunx shadcn-svelte@next add table

# Erweiterte Komponenten (shadcn-svelte-extras):
bunx jsrepo add date-picker
bunx jsrepo add multi-select
```

### 7. Navigation — SvelteKit File-based Routing

```svelte
<!-- RICHTIG -->
<a href="/dashboard">Dashboard</a>
<a href="/auditoren">Auditor-Verwaltung</a>

<!-- FALSCH — NIEMALS verwenden -->
<button onclick="navigateToPage('dashboard')">Dashboard</button>
```

Programmatisch: `goto('/dashboard')` aus `$app/navigation`.
Aktiver Zustand: `$page.url.pathname` aus `$app/state`.

### 8. Authentifizierung & Sicherheit

**Auth-Guard in (app)/+layout.server.ts** — schützt ALLE App-Routen:

```typescript
// src/routes/(app)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	return { user: locals.user };
};
```

**Organisation-basierte Mandantenfähigkeit:** Benutzer gehören zu einer Organisation (better-auth Organization Plugin). Alle Fachdaten gehören der Organisation, nicht dem einzelnen Benutzer. So können mehrere Teammitglieder dieselben Auditoren, Audits, Pläne etc. sehen.

Jede Tabelle (außer Auth/Org-Tabellen) hat eine `organizationId`-Spalte:

```typescript
// src/db/schema.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const auditors = sqliteTable('auditors', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	organizationId: text('organization_id').notNull(), // PFLICHT — Org-Datenisolation
	name: text('name').notNull(),
	email: text('email').notNull()
	// ...
});
```

**Jede Query filtert nach organizationId:**

```typescript
export const getAuditors = query(async () => {
	const event = getRequestEvent();
	const orgId = event.locals.session!.activeOrganizationId;
	return db.select().from(auditors).where(eq(auditors.organizationId, orgId));
});
```

**Form Actions prüfen Auth:**

```typescript
export const actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) return fail(401, { message: 'Unauthorized' });
		// ... Formular verarbeiten
	}
};
```

**XSS-Schutz:** NIEMALS `{@html content}` ohne Sanitization. Verwende `isomorphic-dompurify`:

```typescript
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userContent);
```

### 9. Fehlerbehandlung

- Formularfehler: SuperForms `$errors` Objekt
- Benachrichtigungen: `toast.success()` / `toast.error()` aus `svelte-sonner`
- Bestätigungsdialoge: ShadCN `alert-dialog` Komponente (**NIEMALS** `window.confirm()`)

### 9. Icons

- UI-Icons: `@lucide/svelte` — `import IconName from '@lucide/svelte/icons/icon-name'`
- App-Logos: `static/logo_dark.png`, `static/logo_light.png`

### 10. Testing

- Nur Logik testen: Remote Functions, Zod-Schemas, Utility-Funktionen
- KEINE Komponenten-Render-Tests (Svelte 5 Runes + jsdom = Probleme)
- Testdateien: `*.test.ts` neben der getesteten Datei

---

## Projektstruktur

```
src/
  routes/
    (auth)/login/           # Login-Seite
    (app)/
      +layout.svelte        # App-Layout (Header + Nav + Context-Setup)
      +layout.server.ts     # Auth-Guard, Settings laden
      overview/             # Übersicht (Startseite)
      dashboard/            # Dashboard
      auditor-management/   # Auditorenverwaltung
      add-auditor/          # Auditor hinzufügen/bearbeiten
      search-manage/        # Suchen & Verwalten
      calendar/             # Kalender
      import-export/        # Import/Export
      plan-generator/       # Auditplan-Generator
      report-generator/     # Auditbericht-Generator
      notes-generator/      # Auditnotizen-Generator
      audit-questions/      # Auditfragen & Dokumente
      action-plan/          # Maßnahmenplan
  lib/
    components/ui/          # ShadCN Komponenten (via CLI installiert)
    components/             # App-spezifische Komponenten
    types/                  # TypeScript Interfaces + Zod Schemas
    rpc/                    # Remote Functions (*.remote.ts)
    server/db.ts            # Drizzle Client
    state/                  # Shared State Klassen (*.svelte.ts)
    i18n/                   # i18nRune Implementation
    data/                   # Statische Wissensdatenbank
    word/                   # Word-Export Hilfsfunktionen
  db/schema.ts              # Drizzle Schema (alle Tabellen)
static/
  locales/                  # i18n JSON-Dateien
  logo_dark.png             # Dunkles App-Logo
  logo_light.png            # Helles App-Logo
specs/                      # Feature-Spezifikationen (Deutsch)
```

## Abhängigkeiten

- **Alle Module (02-14) bauen auf dieser Architektur auf**
- **Externe Services:** Turso (DB), Google OAuth (Auth)
- **Patterns sind verbindlich:** Remote Functions, SuperForms, TanStack Table, i18nRune, ShadCN-first
