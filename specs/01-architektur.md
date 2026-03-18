# 01 - Systemarchitektur

## Datenmodell

```typescript
// --- Authentifizierung (better-auth) ---

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
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface Account {
	id: string;
	userId: string;
	accountId: string;
	providerId: string; // "google" | "credential"
	accessToken: string | null;
	refreshToken: string | null;
	expiresAt: Date | null;
	password: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// --- i18n ---

type SupportedLocale = 'de' | 'en' | 'fr' | 'es' | 'it' | 'nl' | 'pt' | 'pl' | 'ru' | 'tr';

interface TranslationSet {
	[key: string]: string | TranslationSet;
}

interface I18nContext {
	locale: SupportedLocale;
	t: (key: string, params?: Record<string, string>) => string;
	setLocale: (locale: SupportedLocale) => void;
}
```

## UI-Beschreibung

### Tech-Stack

| Technologie      | Version / Variante | Zweck                                                               |
| ---------------- | ------------------ | ------------------------------------------------------------------- |
| **SvelteKit**    | 2.x                | Meta-Framework, SSR, Routing, Remote Functions                      |
| **Svelte**       | 5                  | Reaktives UI-Framework (Runes-API: `$state`, `$derived`, `$effect`) |
| **Tailwind CSS** | 4                  | Utility-first Styling                                               |
| **Bits UI**      | aktuelle Version   | Komponentenbibliothek (ShadCN-Svelte-Stil)                          |
| **Drizzle ORM**  | aktuelle Version   | Typsicherer SQL-Query-Builder                                       |
| **Turso**        | libSQL             | Serverlose SQLite-Datenbank (Edge)                                  |
| **better-auth**  | aktuelle Version   | Authentifizierung (Google OAuth + E-Mail/Passwort)                  |
| **Bun**          | aktuelle Version   | Paketmanager und Runtime                                            |

### Datenpersistenz-Strategie

Alle Anwendungsdaten werden serverseitig in einer Turso-Datenbank gespeichert. Der Zugriff erfolgt ausschliesslich ueber SvelteKit Remote Functions (`.remote.ts`-Dateien), die `query()` fuer Leseoperationen und `mutation()` fuer Schreiboperationen bereitstellen. Es wird **kein localStorage** verwendet.

**Ablauf einer Datenoperation:**

1. Svelte-Komponente ruft eine Remote Function auf (z.B. `getAuditors()`)
2. SvelteKit serialisiert den Aufruf und sendet ihn an den Server
3. Die Remote Function fuehrt die Drizzle-Query gegen Turso aus
4. Das Ergebnis wird serialisiert und an den Client zurueckgegeben
5. Die Komponente aktualisiert den reaktiven State (`$state`)

### Authentifizierung

- **Provider:** Google OAuth 2.0 und E-Mail/Passwort
- **Session-Management:** Cookie-basiert (httpOnly, secure, sameSite)
- **Middleware:** SvelteKit-Hooks (`hooks.server.ts`) pruefen die Session bei jedem Request
- **Schutz:** Alle Remote Functions sind nur fuer authentifizierte Benutzer zugaenglich

### i18n-Architektur

- **10 Sprachen:** Deutsch (Standard), Englisch, Franzoesisch, Spanisch, Italienisch, Niederlaendisch, Portugiesisch, Polnisch, Russisch, Tuerkisch
- **Uebersetzungsdateien:** TypeScript-Objekte unter `src/lib/i18n/locales/{locale}.ts`
- **Bereitstellung:** Svelte Context (`setContext` / `getContext`) mit einem reaktiven Store fuer die aktuelle Sprache
- **Standardsprache:** Deutsch (`de`)
- **Spracherkennung:** Reihenfolge: 1) User-Einstellung in DB, 2) `Accept-Language`-Header, 3) Fallback `de`

### Externe Bibliotheken

| Bibliothek | Zweck                              |
| ---------- | ---------------------------------- |
| `docx`     | Word-Dokument-Generierung (.docx)  |
| `date-fns` | Datumsformatierung und -berechnung |

## Interaktionen

### Projektstruktur

```
src/
  lib/
    db/
      schema/           # Drizzle-Schemas (Tabellendefinitionen)
        auth.ts          # User, Session, Account Tabellen
        auditors.ts      # Auditoren-Tabelle
        audits.ts        # Audits-Tabelle
        actions.ts       # Massnahmen-Tabelle
        documents.ts     # Gespeicherte Dokumente
        notes.ts         # Auditnotizen
        plans.ts         # Auditplaene
      index.ts           # Drizzle-Client-Instanz (Turso-Verbindung)
      migrations/        # SQL-Migrationsdateien
    i18n/
      locales/
        de.ts            # Deutsche Uebersetzungen (Standard)
        en.ts            # Englische Uebersetzungen
        ...              # Weitere 8 Sprachen
      index.ts           # i18n-Context-Setup, t()-Funktion
    components/
      ui/                # Bits-UI-basierte Basiskomponenten
      layout/            # Header, Navigation, Footer
      shared/            # Wiederverwendbare Fachkomponenten
    auth/
      client.ts          # better-auth Client-Konfiguration
      server.ts          # better-auth Server-Konfiguration
    utils/
      docx.ts            # Word-Generierungsfunktionen
      date.ts            # Datums-Hilfsfunktionen
  routes/
    (auth)/
      login/             # Login-Seite
      register/          # Registrierungsseite
    (app)/
      +layout.svelte     # App-Layout mit Header + Navigation
      uebersicht/        # Uebersichtsseite (Startseite)
      dashboard/         # Dashboard
      auditoren/         # Auditorenverwaltung (Grid)
      auditor-neu/       # Auditor hinzufuegen/bearbeiten
      suchen/            # Suchen & Verwalten
      kalender/          # Kalender
      import-export/     # Import/Export
      auditplan/         # Auditplan-Generator
      auditbericht/      # Auditbericht-Generator
      auditnotizen/      # Auditnotizen-Generator
      fragen-dokumente/  # Auditfragen & Dokumente
      massnahmenplan/    # Massnahmenplan
    api/
      auth/[...all]/     # better-auth API-Routen
  hooks.server.ts        # Auth-Middleware, Session-Validierung
```

### Remote Functions (Muster)

Jede Route, die Daten benoetigt, hat eine zugehoerige `.remote.ts`-Datei:

```typescript
// Beispiel: src/routes/(app)/auditoren/auditors.remote.ts
import { query, mutation } from '@sveltejs/kit/remote';
import { db } from '$lib/db';
import { auditors } from '$lib/db/schema/auditors';
import { eq } from 'drizzle-orm';

export const getAuditors = query(async () => {
	return db.select().from(auditors);
});

export const deleteAuditor = mutation(async (id: string) => {
	await db.delete(auditors).where(eq(auditors.id, id));
});
```

### Authentifizierungsfluss

1. Benutzer oeffnet die App -> `hooks.server.ts` prueft Session-Cookie
2. Keine gueltige Session -> Weiterleitung zu `/login`
3. Login via Google OAuth oder E-Mail/Passwort
4. better-auth erstellt Session, setzt Cookie
5. Weiterleitung zu `/(app)/uebersicht`
6. Alle nachfolgenden Requests enthalten den Session-Cookie

## Abhaengigkeiten

- **Externe Services:** Turso (Datenbank), Google OAuth (Authentifizierung)
- **Build-Tooling:** Bun (Paketmanager), Vite (Bundler via SvelteKit)
- **NPM-Pakete:** `@sveltejs/kit`, `svelte`, `tailwindcss`, `bits-ui`, `drizzle-orm`, `@libsql/client`, `better-auth`, `docx`, `date-fns`
- **Alle weiteren Module (02-05) bauen auf dieser Architektur auf**
