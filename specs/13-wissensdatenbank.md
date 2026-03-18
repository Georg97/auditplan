# 13 - Wissensdatenbank

## Datenmodell

```typescript
// --- Organisationseinheiten und Audit-Themen ---

interface OrganisationseinheitOption {
	name: string; // Abteilungsname
	themen: string[]; // 6-10 vordefinierte Audit-Themen
}

// 31 Abteilungen mit je 6-10 Themen
const organisationseinheitOptionen: OrganisationseinheitOption[] = [
	{
		name: 'Management',
		themen: [
			'Strategische Planung',
			'Qualitaetspolitik',
			'Managementbewertung',
			'Ressourcenmanagement',
			'Kontext der Organisation',
			'Interessierte Parteien',
			'Risiken und Chancen',
			'Ziele und Planung',
			'Kommunikation',
			'Fuehrung und Verpflichtung'
		]
	},
	{
		name: 'Produktion',
		themen: [
			'Produktionsplanung',
			'Fertigungsprozesse',
			'Maschinenfreigabe',
			'Pruefprozesse',
			'Rueckverfolgbarkeit',
			'Arbeitsanweisungen',
			'Prozessueberwachung',
			'Fehlerbehandlung',
			'Wartung',
			'Kennzahlen'
		]
	},
	{
		name: 'IT',
		themen: ['IT-Infrastruktur', 'Datensicherheit', 'Softwareentwicklung', 'DSGVO', 'Zugriffssteuerung', 'Notfallplanung', 'Netzwerk', 'Change Management']
	}
	// ... plus 28 weitere Abteilungen
];

// --- Abteilungsbeschreibungen ---

// 26 Abteilungen mit professionellen TUEV-Auditor-Beschreibungen (3-8 Saetze)
interface AbteilungBeschreibungen {
	[abteilung: string]: string;
}

const abteilungBeschreibungen: AbteilungBeschreibungen = {
	Management: 'Im Rahmen des Audits wird die strategische Ausrichtung ...',
	Produktion: 'Die Fertigungsprozesse werden hinsichtlich ...',
	IT: 'Die IT-Infrastruktur und Informationssicherheit ...'
	// ... 23 weitere Abteilungen
};

// --- Zusammenfassungsbeschreibungen ---

// 26 Abteilungen mit professionellen Bewertungszusammenfassungen (5-10 Saetze)
// Endet immer mit einer Konformitaetsaussage
interface ZusammenfassungBeschreibungen {
	[abteilung: string]: string;
}

const zusammenfassungBeschreibungen: ZusammenfassungBeschreibungen = {
	Management: 'Die Managementbewertung zeigt eine klare ... Die Organisation erfuellt die Anforderungen der Norm.'
	// ... 25 weitere Abteilungen
};

// Fallback-Text fuer Abteilungen ohne spezifische Zusammenfassung (7 Saetze)
const zusammenfassungDefaultText: string = 'Die Abteilung wurde im Rahmen des Audits umfassend bewertet. ...';

// --- ISO-Normkapitel ---

interface NormKapitel {
	id: string; // z.B. "4.1"
	titel: string; // z.B. "Verstehen der Organisation und ihres Kontextes"
}

// ISO 9001:2015 - ca. 80 Kapitel (4.1 bis 10.3)
const iso9001Kapitel: NormKapitel[] = [
	{ id: '4.1', titel: 'Verstehen der Organisation und ihres Kontextes' },
	{ id: '4.2', titel: 'Verstehen der Erfordernisse und Erwartungen interessierter Parteien' },
	{ id: '4.3', titel: 'Festlegen des Anwendungsbereichs des QMS' },
	{ id: '4.4', titel: 'Qualitaetsmanagementsystem und seine Prozesse' }
	// ... bis 10.3
];

// ISO 14001:2015 - ca. 44 Kapitel
const iso14001Kapitel: NormKapitel[] = [
	// 4.1 bis 10.3 (Umweltmanagement)
];

// ISO 45001:2018 - ca. 47 Kapitel
const iso45001Kapitel: NormKapitel[] = [
	// 4.1 bis 10.3 (Arbeitsschutzmanagement)
];

// ISO 50001:2018 - ca. 37 Kapitel
const iso50001Kapitel: NormKapitel[] = [
	// 4.1 bis 10.2 (Energiemanagement)
];

// ISO 27001:2022 - ca. 40 Kapitel
const iso27001Kapitel: NormKapitel[] = [
	// 4.1 bis 10.2 (Informationssicherheit)
];

// Kombinierte Liste aller Normkapitel
const alleNormkapitel: Record<string, NormKapitel[]> = {
	'ISO 9001': iso9001Kapitel,
	'ISO 14001': iso14001Kapitel,
	'ISO 45001': iso45001Kapitel,
	'ISO 50001': iso50001Kapitel,
	'ISO 27001': iso27001Kapitel
};

// --- Auditfragen-Daten ---

interface AuditQuestionEntry {
	frage: string;
	normRef: string; // Normkapitel-Referenz, z.B. "9001:4.1"
}

interface AuditDocumentEntry {
	name: string;
	beschreibung?: string;
}

interface AuditQuestionsForDepartment {
	questions: AuditQuestionEntry[];
	documents: AuditDocumentEntry[];
}

// Fragen und Dokumente pro Abteilung+Norm-Kombination
const auditQuestionsData: Record<string, Record<string, AuditQuestionsForDepartment>> = {
	Management: {
		'ISO 9001': {
			questions: [
				{ frage: 'Wie wird der Kontext der Organisation ermittelt und ueberwacht?', normRef: '4.1' },
				{ frage: 'Wie werden die Erfordernisse interessierter Parteien bestimmt?', normRef: '4.2' }
				// ...
			],
			documents: [
				{ name: 'Managementbewertung', beschreibung: 'Letzte Bewertung' },
				{ name: 'Qualitaetspolitik' }
				// ...
			]
		},
		'ISO 14001': {
			/* ... */
		}
		// ...
	},
	Produktion: {
		'ISO 9001': {
			/* ... */
		}
		// ...
	}
	// ... weitere Abteilungen
};
```

## UI-Beschreibung

### Dateistruktur

Die Wissensdatenbank besteht aus statischen TypeScript-Dateien, die keine eigene UI haben, sondern von anderen Modulen importiert werden:

```
src/lib/data/
  organisationseinheiten.ts     # organisationseinheitOptionen (31 Abteilungen)
  abteilung-beschreibungen.ts   # abteilungBeschreibungen (26 Eintraege)
  zusammenfassungen.ts          # zusammenfassungBeschreibungen + zusammenfassungDefaultText
  normkapitel/
    iso9001.ts                  # ~80 Kapitel (4.1-10.3)
    iso14001.ts                 # ~44 Kapitel
    iso45001.ts                 # ~47 Kapitel
    iso50001.ts                 # ~37 Kapitel
    iso27001.ts                 # ~40 Kapitel
    index.ts                    # alleNormkapitel (kombinierte Liste)
  audit-questions.ts            # auditQuestionsData (pro Abteilung+Norm)
```

### Verwendung in der UI

Die Wissensdatenbank wird in folgenden UI-Kontexten verwendet:

| Kontext                                   | Verwendete Daten                                |
| ----------------------------------------- | ----------------------------------------------- |
| Auditplan-Generator: Abteilungs-Select    | `organisationseinheitOptionen` (Namen)          |
| Auditplan-Generator: Themen pro Abteilung | `organisationseinheitOptionen` (Themen)         |
| Auditplan-Generator: Beschreibungsfeld    | `abteilungBeschreibungen`                       |
| Auditplan-Generator: Zusammenfassungsfeld | `zusammenfassungBeschreibungen` + Fallback      |
| Auditfragen: Norm-Kapitel-Select          | `alleNormkapitel[gewaehlteNorm]`                |
| Auditfragen: Fragen laden                 | `auditQuestionsData[abteilung][norm]`           |
| Auditfragen: Dokumente laden              | `auditQuestionsData[abteilung][norm].documents` |
| Word-Export: Beschreibungstexte           | `abteilungBeschreibungen`                       |
| Word-Export: Zusammenfassungstexte        | `zusammenfassungBeschreibungen`                 |

### Abteilungsliste (31 Abteilungen)

Die vollstaendige Liste der Organisationseinheiten:

| Nr. | Abteilung                | Anzahl Themen |
| --- | ------------------------ | ------------- |
| 1   | Management               | 10            |
| 2   | Produktion               | 10            |
| 3   | IT                       | 8             |
| 4   | Qualitaetsmanagement     | 8             |
| 5   | Personalwesen            | 8             |
| 6   | Einkauf                  | 8             |
| 7   | Vertrieb                 | 8             |
| 8   | Logistik                 | 8             |
| 9   | Forschung & Entwicklung  | 8             |
| 10  | Finanzen & Controlling   | 8             |
| 11  | Arbeitssicherheit        | 8             |
| 12  | Umweltmanagement         | 8             |
| 13  | Energiemanagement        | 8             |
| 14  | Instandhaltung           | 8             |
| 15  | Lager                    | 7             |
| 16  | Marketing                | 7             |
| 17  | Rechtsabteilung          | 7             |
| 18  | Facility Management      | 7             |
| 19  | Kundenservice            | 7             |
| 20  | Konstruktion             | 7             |
| 21  | Werkzeugbau              | 7             |
| 22  | Pruefmittelmanagement    | 6             |
| 23  | Dokumentenmanagement     | 6             |
| 24  | Schulung & Weiterbildung | 7             |
| 25  | Projektmanagement        | 7             |
| 26  | Datenschutz              | 6             |
| 27  | Fuhrpark                 | 6             |
| 28  | Empfang & Rezeption      | 6             |
| 29  | Kantine & Verpflegung    | 6             |
| 30  | Betriebsrat              | 6             |
| 31  | Revision & Compliance    | 7             |

### Normkapitel-Uebersicht

| Norm           | Anzahl Kapitel | Bereich      |
| -------------- | -------------- | ------------ |
| ISO 9001:2015  | ~80            | 4.1 bis 10.3 |
| ISO 14001:2015 | ~44            | 4.1 bis 10.3 |
| ISO 45001:2018 | ~47            | 4.1 bis 10.3 |
| ISO 50001:2018 | ~37            | 4.1 bis 10.2 |
| ISO 27001:2022 | ~40            | 4.1 bis 10.2 |

## Interaktionen

### Daten laden

1. **Import zur Build-Zeit:** Alle Dateien in `src/lib/data/` werden als statische TypeScript-Module importiert. Es gibt keinen Laufzeit-Datenbankzugriff fuer diese Daten.
2. **Abteilungs-Select befuellen:** Beim Rendern eines Select-Elements fuer Abteilungen wird `organisationseinheitOptionen.map(o => o.name)` verwendet.
3. **Themen laden:** Bei Auswahl einer Abteilung werden die zugehoerigen Themen aus `organisationseinheitOptionen.find(o => o.name === selected).themen` geladen.

### Auditfragen laden (loadAuditQuestions)

1. Benutzer waehlt Abteilung und Norm auf der Auditfragen-Seite.
2. `loadAuditQuestions()` sucht in `auditQuestionsData[abteilung][norm]`.
3. Falls vorhanden: Fragen und Dokumente werden in den jeweiligen Containern angezeigt.
4. Falls nicht vorhanden: Leere Liste oder Hinweismeldung.

### Normkapitel dynamisch laden

1. Benutzer waehlt eine Norm (z.B. "ISO 9001") im Select.
2. Das Normkapitel-Select wird mit `alleNormkapitel["ISO 9001"]` befuellt.
3. Bei Normwechsel wird das Normkapitel-Select zurueckgesetzt und neu befuellt.

### Beschreibungen und Zusammenfassungen

1. **Auditplan-Generator:** Bei Auswahl einer Abteilung wird automatisch `abteilungBeschreibungen[abteilung]` in das Beschreibungsfeld geladen.
2. **Zusammenfassung:** `zusammenfassungBeschreibungen[abteilung]` wird geladen, falls vorhanden. Andernfalls wird `zusammenfassungDefaultText` verwendet.
3. **Word-Export:** Die gleichen Texte werden beim Word-Export in die entsprechenden Tabellenzeilen eingefuegt.

## Abhaengigkeiten

### Interne Abhaengigkeiten

| Abhaengigkeit                    | Beschreibung                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------- |
| Spec 11 (Berichte & Auditfragen) | Verwendet `organisationseinheitOptionen`, `auditQuestionsData`, `alleNormkapitel` |
| Spec 12 (Word-Export)            | Verwendet `abteilungBeschreibungen`, `zusammenfassungBeschreibungen`              |
| Auditplan-Generator              | Verwendet Abteilungen, Themen, Beschreibungen, Zusammenfassungen                  |
| Auditnotizen                     | Verwendet Beschreibungen und Zusammenfassungen                                    |

### Externe Abhaengigkeiten

| Abhaengigkeit | Beschreibung                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| Keine         | Die Wissensdatenbank besteht ausschliesslich aus statischen TypeScript-Dateien ohne externe Abhaengigkeiten |

### Datenherkunft

Alle Daten in der Wissensdatenbank sind:

- **Statisch:** Fest im Quellcode hinterlegt, keine Laufzeit-Aenderungen durch Benutzer
- **Fachlich gepflegt:** Texte im Stil eines professionellen TUEV-Auditors verfasst
- **Norm-konform:** Normkapitel entsprechen den offiziellen ISO-Normen
- **Serverseitig verfuegbar:** Koennen sowohl im Client als auch im Server importiert werden
