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
				{ frage: 'Wie wird der Kontext der Organisation ermittelt und ueberwacht?', normRef: '4.1' },
				{ frage: 'Wie werden die Erfordernisse interessierter Parteien bestimmt?', normRef: '4.2' },
				{ frage: 'Ist der Anwendungsbereich des QMS festgelegt und dokumentiert?', normRef: '4.3' },
				{ frage: 'Wie nimmt die oberste Leitung ihre Fuehrungsrolle wahr?', normRef: '5.1' },
				{ frage: 'Ist die Qualitaetspolitik festgelegt und kommuniziert?', normRef: '5.2' },
				{ frage: 'Sind Rollen und Verantwortlichkeiten klar zugeordnet?', normRef: '5.3' },
				{ frage: 'Wie werden Risiken und Chancen ermittelt und behandelt?', normRef: '6.1' },
				{ frage: 'Sind messbare Qualitaetsziele festgelegt?', normRef: '6.2' },
				{ frage: 'Wie wird die Managementbewertung durchgefuehrt?', normRef: '9.3' },
				{ frage: 'Welche Massnahmen zur fortlaufenden Verbesserung werden umgesetzt?', normRef: '10.3' }
			],
			documents: [
				{ name: 'Managementbewertung', beschreibung: 'Letzte Bewertung mit Ergebnissen' },
				{ name: 'Qualitaetspolitik', beschreibung: 'Aktuelle Version' },
				{ name: 'Qualitaetsziele', beschreibung: 'Ziele mit Kennzahlen und Status' },
				{ name: 'Organigramm', beschreibung: 'Aktuelle Organisationsstruktur' },
				{ name: 'Risiko- und Chancenbewertung' }
			]
		},
		'ISO 14001': {
			questions: [
				{ frage: 'Wie werden Umweltaspekte auf Managementebene beruecksichtigt?', normRef: '4.1' },
				{ frage: 'Ist die Umweltpolitik festgelegt und kommuniziert?', normRef: '5.2' },
				{ frage: 'Wie werden bindende Verpflichtungen ermittelt?', normRef: '6.1.3' },
				{ frage: 'Sind Umweltziele festgelegt und werden diese verfolgt?', normRef: '6.2' },
				{ frage: 'Wie wird die Wirksamkeit des UMS bewertet?', normRef: '9.3' }
			],
			documents: [{ name: 'Umweltpolitik' }, { name: 'Umweltziele und -programme' }, { name: 'Rechtskataster Umwelt' }]
		},
		'ISO 45001': {
			questions: [
				{ frage: 'Wie wird die SGA-Politik von der obersten Leitung unterstuetzt?', normRef: '5.2' },
				{ frage: 'Wie werden Beschaeftigte konsultiert und beteiligt?', normRef: '5.4' },
				{ frage: 'Sind SGA-Ziele festgelegt und messbar?', normRef: '6.2' },
				{ frage: 'Wie wird das Notfallmanagement auf Fuehrungsebene gesteuert?', normRef: '8.2' },
				{ frage: 'Wie wird die SGA-Leistung in der Managementbewertung beruecksichtigt?', normRef: '9.3' }
			],
			documents: [{ name: 'SGA-Politik' }, { name: 'SGA-Ziele' }, { name: 'Notfallplan' }]
		}
	},
	Produktion: {
		'ISO 9001': {
			questions: [
				{ frage: 'Wie wird die Produktion geplant und gesteuert?', normRef: '8.1' },
				{ frage: 'Sind Arbeitsanweisungen aktuell und am Arbeitsplatz verfuegbar?', normRef: '8.5.1' },
				{ frage: 'Wie wird die Rueckverfolgbarkeit sichergestellt?', normRef: '8.5.2' },
				{ frage: 'Wie werden fehlerhafte Produkte behandelt?', normRef: '8.7' },
				{ frage: 'Welche Pruefungen werden waehrend der Produktion durchgefuehrt?', normRef: '8.6' },
				{ frage: 'Wie wird die Prozessfreigabe durchgefuehrt?', normRef: '8.5.1' },
				{ frage: 'Wie werden Aenderungen im Produktionsprozess gesteuert?', normRef: '8.5.6' },
				{ frage: 'Welche Kennzahlen werden zur Prozessueberwachung erhoben?', normRef: '9.1.1' }
			],
			documents: [
				{ name: 'Arbeitsanweisungen', beschreibung: 'Aktuelle Versionen am Arbeitsplatz' },
				{ name: 'Pruefprotokolle', beschreibung: 'Letzte 3 Monate' },
				{ name: 'Fehlerstatistik' },
				{ name: 'Prozessfreigabe-Checklisten' },
				{ name: 'Wartungsplaene', beschreibung: 'Maschinen und Anlagen' }
			]
		},
		'ISO 14001': {
			questions: [
				{ frage: 'Welche umweltrelevanten Aspekte gibt es in der Produktion?', normRef: '6.1.2' },
				{ frage: 'Wie wird der Abfall in der Produktion gehandhabt?', normRef: '8.1' },
				{ frage: 'Welche Emissionen entstehen im Produktionsprozess?', normRef: '6.1.2' },
				{ frage: 'Wie wird der Energie- und Ressourcenverbrauch ueberwacht?', normRef: '9.1.1' }
			],
			documents: [{ name: 'Abfallbilanz Produktion' }, { name: 'Gefahrstoffverzeichnis' }, { name: 'Umweltaspektebewertung Produktion' }]
		},
		'ISO 45001': {
			questions: [
				{ frage: 'Sind Gefaehrdungsbeurteilungen fuer alle Arbeitsplaetze erstellt?', normRef: '6.1.2.1' },
				{ frage: 'Welche PSA ist in der Produktion vorgeschrieben?', normRef: '8.1.2' },
				{ frage: 'Wie werden Sicherheitsunterweisungen durchgefuehrt und dokumentiert?', normRef: '7.3' },
				{ frage: 'Wie wird mit Unfaellen und Beinaheunfaellen umgegangen?', normRef: '10.2' },
				{ frage: 'Wie wird die Notfallvorsorge in der Produktion sichergestellt?', normRef: '8.2' }
			],
			documents: [{ name: 'Gefaehrdungsbeurteilungen', beschreibung: 'Alle Arbeitsplaetze' }, { name: 'Unterweisungsnachweise' }, { name: 'Unfallstatistik' }, { name: 'PSA-Plan' }]
		}
	},
	IT: {
		'ISO 9001': {
			questions: [
				{ frage: 'Wie wird die IT-Infrastruktur als Ressource bereitgestellt?', normRef: '7.1.3' },
				{ frage: 'Wie wird dokumentierte Information gelenkt und geschuetzt?', normRef: '7.5.3' },
				{ frage: 'Wie wird die Kompetenz der IT-Mitarbeiter sichergestellt?', normRef: '7.2' },
				{ frage: 'Wie werden Aenderungen an IT-Systemen geplant und gesteuert?', normRef: '6.3' }
			],
			documents: [{ name: 'IT-Notfallkonzept' }, { name: 'Datensicherungskonzept' }, { name: 'Berechtigungskonzept' }]
		},
		'ISO 27001': {
			questions: [
				{ frage: 'Wie wird die Informationssicherheitspolitik kommuniziert?', normRef: '5.2' },
				{ frage: 'Wie wird die Risikobeurteilung fuer Informationssicherheit durchgefuehrt?', normRef: '6.1.2' },
				{ frage: 'Welche Massnahmen zur Risikobehandlung sind implementiert?', normRef: '6.1.3' },
				{ frage: 'Wie wird die Zugriffssteuerung verwaltet?', normRef: '8.1' },
				{ frage: 'Wie werden Sicherheitsvorfaelle behandelt?', normRef: '10.2' },
				{ frage: 'Wie wird die Datensicherung durchgefuehrt und ueberprueft?', normRef: '8.1' },
				{ frage: 'Wie werden Aenderungen an IT-Systemen bezueglich Sicherheit bewertet?', normRef: '8.1' }
			],
			documents: [
				{ name: 'Informationssicherheitspolitik' },
				{ name: 'Risikobeurteilung Informationssicherheit' },
				{ name: 'Risikobehandlungsplan' },
				{ name: 'Statement of Applicability (SoA)' },
				{ name: 'Berechtigungsmatrix' },
				{ name: 'Vorfallprotokoll' }
			]
		}
	}
	// TODO: Weitere Abteilungen (Qualitaetsmanagement, Personalwesen, Einkauf, Vertrieb,
	// Logistik, F&E, Finanzen, Arbeitssicherheit, Umweltmanagement, Energiemanagement,
	// Instandhaltung, Lager, etc.)
};
