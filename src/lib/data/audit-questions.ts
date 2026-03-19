/**
 * Auditfragen und zugehörige Dokumente pro Abteilung+Norm-Kombination.
 * Struktur + 2-3 Beispiel-Abteilungen als Vorlage, Rest wird bei Bedarf ergänzt.
 */

export interface AuditQuestionEntry {
	frage: string;
	normRef: string;
}

export interface AuditDocumentEntry {
	name: string;
	beschreibung?: string;
}

export interface AuditQuestionsForDepartment {
	questions: AuditQuestionEntry[];
	documents: AuditDocumentEntry[];
}

export const auditQuestionsData: Record<string, Record<string, AuditQuestionsForDepartment>> = {
	Management: {
		'ISO 9001': {
			questions: [
				{
					frage: 'Wie wird der Kontext der Organisation ermittelt und überwacht?',
					normRef: '4.1'
				},
				{
					frage: 'Wie werden die Erfordernisse und Erwartungen interessierter Parteien bestimmt?',
					normRef: '4.2'
				},
				{
					frage: 'Ist der Anwendungsbereich des QMS festgelegt und dokumentiert?',
					normRef: '4.3'
				},
				{
					frage: 'Wie werden Risiken und Chancen systematisch ermittelt und behandelt?',
					normRef: '6.1'
				},
				{
					frage: 'Sind messbare Qualitätsziele festgelegt und wie wird deren Erreichung überwacht?',
					normRef: '6.2'
				},
				{
					frage: 'Wie wird die Managementbewertung durchgeführt und dokumentiert?',
					normRef: '9.3'
				},
				{
					frage: 'Wie stellt die oberste Leitung Führung und Verpflichtung sicher?',
					normRef: '5.1'
				},
				{
					frage: 'Ist die Qualitätspolitik dokumentiert, kommuniziert und verstanden?',
					normRef: '5.2'
				}
			],
			documents: [
				{ name: 'Managementbewertung', beschreibung: 'Letzte Bewertung mit Eingaben und Ergebnissen' },
				{ name: 'Qualitätspolitik', beschreibung: 'Aktuelle Version, unterschrieben' },
				{ name: 'Organigramm', beschreibung: 'Aktuelle Organisationsstruktur' },
				{ name: 'Risikoanalyse', beschreibung: 'Risiken und Chancen mit Maßnahmen' },
				{ name: 'Qualitätsziele', beschreibung: 'Zielvereinbarungen mit Messkriterien' }
			]
		},
		'ISO 14001': {
			questions: [
				{
					frage: 'Wie werden Umweltaspekte und deren Auswirkungen ermittelt und bewertet?',
					normRef: '6.1.2'
				},
				{
					frage: 'Welche bindenden Verpflichtungen bestehen und wie werden diese überwacht?',
					normRef: '6.1.3'
				},
				{
					frage: 'Wie wird die Umweltpolitik von der Leitung kommuniziert und umgesetzt?',
					normRef: '5.2'
				}
			],
			documents: [{ name: 'Umweltpolitik', beschreibung: 'Aktuelle Fassung' }, { name: 'Umweltaspekte-Register' }, { name: 'Rechtskataster Umwelt' }]
		}
	},
	Produktion: {
		'ISO 9001': {
			questions: [
				{
					frage: 'Wie wird die Produktionsplanung durchgeführt und dokumentiert?',
					normRef: '8.1'
				},
				{
					frage: 'Wie werden Prozessparameter überwacht und gesteuert?',
					normRef: '8.5.1'
				},
				{
					frage: 'Wie wird die Rückverfolgbarkeit der Produkte sichergestellt?',
					normRef: '8.5.2'
				},
				{
					frage: 'Welche Prüfungen werden durchgeführt und wie werden die Ergebnisse dokumentiert?',
					normRef: '8.6'
				},
				{
					frage: 'Wie werden fehlerhafte Produkte behandelt und gelenkt?',
					normRef: '8.7'
				},
				{
					frage: 'Wie wird die Kompetenz der Produktionsmitarbeiter sichergestellt?',
					normRef: '7.2'
				},
				{
					frage: 'Sind aktuelle Arbeitsanweisungen an den Arbeitsplätzen verfügbar?',
					normRef: '7.5'
				}
			],
			documents: [
				{ name: 'Produktionsplan', beschreibung: 'Aktuelle Fertigungsplanung' },
				{ name: 'Arbeitsanweisungen', beschreibung: 'Stichprobe aktueller Anweisungen' },
				{ name: 'Prüfprotokolle', beschreibung: 'Letzte Prüfaufzeichnungen' },
				{ name: 'Maschinenfreigaben', beschreibung: 'Freigabeprotokolle' },
				{ name: 'Wartungspläne', beschreibung: 'Instandhaltungsplanung' }
			]
		}
	},
	IT: {
		'ISO 27001': {
			questions: [
				{
					frage: 'Wie ist das Informationssicherheitsmanagementsystem (ISMS) aufgebaut und dokumentiert?',
					normRef: '4.4'
				},
				{
					frage: 'Wie werden Informationssicherheitsrisiken identifiziert und behandelt?',
					normRef: '6.1.2'
				},
				{
					frage: 'Wie wird die Zugriffssteuerung für IT-Systeme umgesetzt?',
					normRef: '8.1'
				},
				{
					frage: 'Wie werden Sicherheitsvorfälle erkannt, gemeldet und behandelt?',
					normRef: '8.1'
				},
				{
					frage: 'Wie werden Datensicherungen durchgeführt und deren Wiederherstellung getestet?',
					normRef: '8.1'
				},
				{
					frage: 'Wie wird die Netzwerksicherheit gewährleistet?',
					normRef: '8.1'
				}
			],
			documents: [
				{ name: 'ISMS-Handbuch', beschreibung: 'Informationssicherheits-Managementsystem' },
				{ name: 'Risikoanalyse IT', beschreibung: 'Aktuelle Risikobewertung' },
				{ name: 'Backup-Konzept', beschreibung: 'Datensicherungsplan und Testprotokolle' },
				{ name: 'Notfallplan IT', beschreibung: 'Business Continuity Plan für IT' },
				{ name: 'Berechtigungskonzept', beschreibung: 'Rollen und Zugriffsrechte' }
			]
		}
	}
};
