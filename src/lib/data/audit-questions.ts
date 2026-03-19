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
					frage: 'Wie wird der Kontext der Organisation ermittelt und ueberwacht?',
					normRef: '4.1'
				},
				{
					frage: 'Wie werden die Erfordernisse und Erwartungen interessierter Parteien bestimmt?',
					normRef: '4.2'
				},
				{
					frage: 'Ist die Qualitaetspolitik dokumentiert und an alle relevanten Mitarbeiter kommuniziert?',
					normRef: '5.2'
				},
				{
					frage: 'Wie nimmt die oberste Leitung ihre Fuehrungsrolle im QMS wahr?',
					normRef: '5.1'
				},
				{
					frage: 'Werden Risiken und Chancen systematisch identifiziert und bewertet?',
					normRef: '6.1'
				},
				{
					frage: 'Sind messbare Qualitaetsziele festgelegt und werden diese regelmaessig ueberprueft?',
					normRef: '6.2'
				},
				{
					frage: 'Wird die Managementbewertung regelmaessig durchgefuehrt und dokumentiert?',
					normRef: '9.3'
				},
				{
					frage: 'Welche Massnahmen wurden aus der letzten Managementbewertung abgeleitet?',
					normRef: '9.3.3'
				}
			],
			documents: [
				{ name: 'Managementbewertung', beschreibung: 'Letzte Bewertung mit Ergebnissen' },
				{ name: 'Qualitaetspolitik', beschreibung: 'Aktuelle dokumentierte Politik' },
				{ name: 'Risiko- und Chancenbewertung' },
				{ name: 'Qualitaetsziele', beschreibung: 'Aktuelle Ziele mit Kennzahlen' },
				{ name: 'Organigramm', beschreibung: 'Aktuelle Organisationsstruktur' },
				{ name: 'Kontext der Organisation' }
			]
		},
		'ISO 14001': {
			questions: [
				{
					frage: 'Wie wird die Umweltpolitik von der obersten Leitung kommuniziert?',
					normRef: '5.2'
				},
				{
					frage: 'Werden Umweltaspekte und deren Auswirkungen systematisch bewertet?',
					normRef: '6.1.2'
				},
				{
					frage: 'Sind bindende Verpflichtungen identifiziert und eingehalten?',
					normRef: '6.1.3'
				},
				{
					frage: 'Wie werden Umweltziele festgelegt und deren Erreichung ueberwacht?',
					normRef: '6.2'
				}
			],
			documents: [{ name: 'Umweltpolitik' }, { name: 'Umweltaspekte-Register' }, { name: 'Rechtskataster Umwelt' }, { name: 'Umweltziele und -programme' }]
		}
	},
	Produktion: {
		'ISO 9001': {
			questions: [
				{
					frage: 'Wie wird die Produktionsplanung durchgefuehrt und dokumentiert?',
					normRef: '8.1'
				},
				{
					frage: 'Sind Arbeitsanweisungen am Arbeitsplatz verfuegbar und aktuell?',
					normRef: '8.5.1'
				},
				{
					frage: 'Wie wird die Rueckverfolgbarkeit der Produkte sichergestellt?',
					normRef: '8.5.2'
				},
				{
					frage: 'Welche Pruefungen werden waehrend und nach der Fertigung durchgefuehrt?',
					normRef: '8.6'
				},
				{
					frage: 'Wie wird mit nichtkonformen Produkten umgegangen?',
					normRef: '8.7'
				},
				{
					frage: 'Sind die Fertigungseinrichtungen fuer die Produktion freigegeben?',
					normRef: '8.5.1'
				},
				{
					frage: 'Wie werden Aenderungen an Fertigungsprozessen gesteuert?',
					normRef: '8.5.6'
				},
				{
					frage: 'Welche Kennzahlen werden zur Prozessueberwachung eingesetzt?',
					normRef: '9.1.1'
				}
			],
			documents: [
				{ name: 'Produktionsplan', beschreibung: 'Aktuelle Produktionsplanung' },
				{ name: 'Arbeitsanweisungen', beschreibung: 'Stichprobe aus der Fertigung' },
				{ name: 'Pruefprotokolle', beschreibung: 'Letzte Pruefungen' },
				{ name: 'Maschinenfreigabe-Protokolle' },
				{ name: 'Fehler-/Ausschussstatistik' },
				{ name: 'Wartungsplaene' }
			]
		}
	},
	IT: {
		'ISO 27001': {
			questions: [
				{
					frage: 'Wie ist die Informationssicherheitspolitik definiert und kommuniziert?',
					normRef: '5.2'
				},
				{
					frage: 'Wie werden Informationssicherheitsrisiken identifiziert und bewertet?',
					normRef: '6.1.2'
				},
				{
					frage: 'Welche Massnahmen zur Risikobehandlung sind implementiert?',
					normRef: '6.1.3'
				},
				{
					frage: 'Wie wird die Zugriffssteuerung auf IT-Systeme geregelt?',
					normRef: '8.1'
				},
				{
					frage: 'Gibt es ein dokumentiertes Verfahren fuer den Umgang mit Sicherheitsvorfaellen?',
					normRef: '10.2'
				},
				{
					frage: 'Wie wird die Datensicherung durchgefuehrt und ueberprueft?',
					normRef: '8.1'
				}
			],
			documents: [
				{ name: 'Informationssicherheitspolitik' },
				{ name: 'Risikobeurteilung Informationssicherheit' },
				{ name: 'Statement of Applicability (SoA)' },
				{ name: 'Zugriffsrechte-Matrix' },
				{ name: 'Datensicherungskonzept' },
				{ name: 'IT-Notfallplan' }
			]
		}
	}
};
