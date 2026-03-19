export interface OrganisationseinheitOption {
	name: string;
	themen: string[];
}

export const organisationseinheitOptionen: OrganisationseinheitOption[] = [
	{
		name: 'Management',
		themen: [
			'Strategische Planung',
			'Qualitätspolitik',
			'Managementbewertung',
			'Ressourcenmanagement',
			'Kontext der Organisation',
			'Interessierte Parteien',
			'Risiken und Chancen',
			'Ziele und Planung',
			'Kommunikation',
			'Führung und Verpflichtung'
		]
	},
	{
		name: 'Produktion',
		themen: [
			'Produktionsplanung',
			'Fertigungsprozesse',
			'Maschinenfreigabe',
			'Prüfprozesse',
			'Rückverfolgbarkeit',
			'Arbeitsanweisungen',
			'Prozessüberwachung',
			'Fehlerbehandlung',
			'Wartung',
			'Kennzahlen'
		]
	},
	{
		name: 'IT',
		themen: ['IT-Infrastruktur', 'Datensicherheit', 'Softwareentwicklung', 'DSGVO', 'Zugriffssteuerung', 'Notfallplanung', 'Netzwerk', 'Change Management']
	},
	{
		name: 'Qualitätsmanagement',
		themen: [
			'Dokumentenlenkung',
			'Internes Auditprogramm',
			'Korrekturmaßnahmen',
			'Kundenzufriedenheit',
			'Reklamationsmanagement',
			'Prozessleistung',
			'Kontinuierliche Verbesserung',
			'Normkonformität'
		]
	},
	{
		name: 'Personalwesen',
		themen: [
			'Kompetenzmanagement',
			'Schulungsplanung',
			'Mitarbeiterbewertung',
			'Einarbeitung neuer Mitarbeiter',
			'Personalentwicklung',
			'Stellenbeschreibungen',
			'Bewusstsein und Motivation',
			'Arbeitszeitmanagement'
		]
	},
	{
		name: 'Einkauf',
		themen: [
			'Lieferantenbewertung',
			'Lieferantenauswahl',
			'Wareneingangsprüfung',
			'Bestellprozess',
			'Vertragsmanagement',
			'Reklamationen an Lieferanten',
			'Beschaffungsplanung',
			'Lieferantenentwicklung'
		]
	},
	{
		name: 'Vertrieb',
		themen: ['Angebotserstellung', 'Vertragsprüfung', 'Kundenanforderungen', 'Auftragsabwicklung', 'Kundenkommunikation', 'Marktanalyse', 'Vertriebsplanung', 'Kundenfeedback']
	},
	{
		name: 'Logistik',
		themen: [
			'Versandabwicklung',
			'Transportmanagement',
			'Verpackung und Kennzeichnung',
			'Liefertermintreue',
			'Sendungsverfolgung',
			'Gefahrguthandling',
			'Zollabwicklung',
			'Retourenmanagement'
		]
	},
	{
		name: 'Forschung & Entwicklung',
		themen: [
			'Entwicklungsplanung',
			'Designvalidierung',
			'Designverifizierung',
			'Änderungsmanagement',
			'Prototypenprüfung',
			'Risikoanalyse Produktdesign',
			'Innovationsmanagement',
			'Technische Dokumentation'
		]
	},
	{
		name: 'Finanzen & Controlling',
		themen: [
			'Budgetplanung',
			'Kostenstellenrechnung',
			'Investitionscontrolling',
			'Qualitätskostenanalyse',
			'Berichtswesen',
			'Risikomanagement Finanzen',
			'Compliance Finanzprozesse',
			'Wirtschaftlichkeitsanalysen'
		]
	},
	{
		name: 'Arbeitssicherheit',
		themen: [
			'Gefährdungsbeurteilung',
			'Unfallmeldung und -analyse',
			'Persönliche Schutzausrüstung',
			'Sicherheitsunterweisungen',
			'Notfallübungen',
			'Arbeitsplatzergonomie',
			'Gefahrstoffmanagement',
			'Betriebsanweisungen'
		]
	},
	{
		name: 'Umweltmanagement',
		themen: [
			'Umweltaspekte und -auswirkungen',
			'Abfallmanagement',
			'Emissionsüberwachung',
			'Gewässerschutz',
			'Umweltrechtliche Anforderungen',
			'Umweltziele und -programme',
			'Notfallvorsorge Umwelt',
			'Umweltleistungsbewertung'
		]
	},
	{
		name: 'Energiemanagement',
		themen: [
			'Energetische Bewertung',
			'Energieleistungskennzahlen',
			'Energieziele und Aktionspläne',
			'Energiedatenerfassung',
			'Energieeffizienzmaßnahmen',
			'Beschaffung energierelevanter Produkte',
			'Energetische Ausgangsbasis',
			'Energieaudit'
		]
	},
	{
		name: 'Instandhaltung',
		themen: [
			'Wartungsplanung',
			'Präventive Instandhaltung',
			'Störungsmanagement',
			'Ersatzteilmanagement',
			'Maschinenhistorie',
			'Kalibrierung und Justierung',
			'Instandhaltungskennzahlen',
			'Fremdfirmenmanagement'
		]
	},
	{
		name: 'Lager',
		themen: ['Bestandsführung', 'Ein- und Auslagerung', 'Lagerbedingungen', 'Inventur', 'Kennzeichnung und Rückverfolgbarkeit', 'FIFO-Prinzip', 'Lagersicherheit']
	},
	{
		name: 'Marketing',
		themen: ['Markenführung', 'Kundenkommunikation', 'Werbematerialprüfung', 'Marktforschung', 'Messeplanung', 'Digitale Medien', 'Wettbewerbsanalyse']
	},
	{
		name: 'Rechtsabteilung',
		themen: [
			'Vertragsmanagement',
			'Rechtliche Anforderungen',
			'Haftungsfragen',
			'Gewerblicher Rechtsschutz',
			'Regulatorische Compliance',
			'Genehmigungsmanagement',
			'Rechtsänderungsmonitoring'
		]
	},
	{
		name: 'Facility Management',
		themen: ['Gebäudeinstandhaltung', 'Reinigungsmanagement', 'Sicherheitstechnik', 'Flächenmanagement', 'Versorgungstechnik', 'Außenanlagenpflege', 'Dienstleistersteuerung']
	},
	{
		name: 'Kundenservice',
		themen: ['Beschwerdemanagement', 'Servicequalität', 'Reaktionszeiten', 'Kundenzufriedenheitsmessung', 'Eskalationsprozesse', 'Servicedokumentation', 'Garantieabwicklung']
	},
	{
		name: 'Konstruktion',
		themen: ['Konstruktionsfreigabe', 'Zeichnungsmanagement', 'Toleranzanalyse', 'Stücklistenverwaltung', 'Änderungsdienst', 'Normgerechtes Konstruieren', 'CAD-Datenmanagement']
	},
	{
		name: 'Werkzeugbau',
		themen: ['Werkzeugherstellung', 'Werkzeugwartung', 'Werkzeugverwaltung', 'Verschleißüberwachung', 'Werkzeugfreigabe', 'Ersatzwerkzeuge', 'Werkzeugdokumentation']
	},
	{
		name: 'Prüfmittelmanagement',
		themen: ['Prüfmittelüberwachung', 'Kalibrierplanung', 'Prüfmitteleignung', 'Rückführbarkeit', 'Prüfmitteldatenbank', 'Umgang mit fehlerhaften Prüfmitteln']
	},
	{
		name: 'Dokumentenmanagement',
		themen: ['Dokumentenlenkung', 'Versionskontrolle', 'Archivierung', 'Zugriffsberechtigungen', 'Aufbewahrungsfristen', 'Elektronische Dokumentation']
	},
	{
		name: 'Schulung & Weiterbildung',
		themen: [
			'Schulungsbedarfsanalyse',
			'Schulungsplanung',
			'Wirksamkeitsbewertung',
			'E-Learning-Plattform',
			'Qualifikationsmatrix',
			'Externe Weiterbildung',
			'Unterweisungsnachweise'
		]
	},
	{
		name: 'Projektmanagement',
		themen: ['Projektplanung', 'Meilensteinüberwachung', 'Risikomanagement Projekte', 'Ressourcenplanung', 'Stakeholdermanagement', 'Projektdokumentation', 'Lessons Learned']
	},
	{
		name: 'Datenschutz',
		themen: ['Verarbeitungsverzeichnis', 'Datenschutz-Folgenabschätzung', 'Betroffenenrechte', 'Auftragsverarbeitung', 'Datenschutzschulungen', 'Datenpannenmanagement']
	},
	{
		name: 'Fuhrpark',
		themen: ['Fahrzeugwartung', 'Führerscheinkontrolle', 'Fahrtenbuchführung', 'Fahrzeugdisposition', 'Unfallmanagement', 'Kraftstoffmanagement']
	},
	{
		name: 'Empfang & Rezeption',
		themen: ['Besuchermanagement', 'Zutrittskontrolle', 'Sicherheitsunterweisung Besucher', 'Telefonzentrale', 'Posteingang und -ausgang', 'Empfangsprotokollierung']
	},
	{
		name: 'Kantine & Verpflegung',
		themen: ['Lebensmittelhygiene', 'HACCP-Konzept', 'Lieferantenmanagement Lebensmittel', 'Allergenmanagement', 'Reinigung und Desinfektion', 'Temperaturüberwachung']
	},
	{
		name: 'Betriebsrat',
		themen: ['Mitbestimmungsrechte', 'Betriebsvereinbarungen', 'Arbeitnehmerrechte', 'Arbeitsschutzmitwirkung', 'Beschwerdemanagement Mitarbeiter', 'Soziale Angelegenheiten']
	},
	{
		name: 'Revision & Compliance',
		themen: [
			'Interne Revision',
			'Compliance-Management-System',
			'Regelkonformitätsprüfung',
			'Antikorruptionsmaßnahmen',
			'Hinweisgebersystem',
			'Maßnahmenverfolgung',
			'Berichtswesen Compliance'
		]
	}
];
