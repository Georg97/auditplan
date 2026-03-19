export interface OrganisationseinheitOption {
	name: string;
	themen: string[];
}

export const organisationseinheitOptionen: OrganisationseinheitOption[] = [
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
	},
	{
		name: 'Qualitaetsmanagement',
		themen: [
			'Qualitaetsplanung',
			'Prozessaudits',
			'Reklamationsmanagement',
			'Dokumentenlenkung',
			'Kontinuierliche Verbesserung',
			'Statistische Methoden',
			'Lieferantenbewertung',
			'Kundenzufriedenheit'
		]
	},
	{
		name: 'Personalwesen',
		themen: [
			'Personalplanung',
			'Kompetenzmanagement',
			'Schulungsplanung',
			'Mitarbeiterzufriedenheit',
			'Onboarding-Prozess',
			'Leistungsbeurteilung',
			'Arbeitsvertraege',
			'Personalentwicklung'
		]
	},
	{
		name: 'Einkauf',
		themen: [
			'Lieferantenauswahl',
			'Wareneingangspruefung',
			'Bestellprozess',
			'Lieferantenbewertung',
			'Reklamation an Lieferanten',
			'Rahmenvertraege',
			'Beschaffungsstrategie',
			'Qualitaetssicherungsvereinbarungen'
		]
	},
	{
		name: 'Vertrieb',
		themen: [
			'Angebotserstellung',
			'Auftragsabwicklung',
			'Kundenkommunikation',
			'Vertriebsplanung',
			'Marktanalyse',
			'Kundenanforderungen',
			'Vertragsmanagement',
			'After-Sales-Service'
		]
	},
	{
		name: 'Logistik',
		themen: [
			'Versandplanung',
			'Transportmanagement',
			'Verpackung',
			'Lieferterminueberwachung',
			'Retourenmanagement',
			'Zollabwicklung',
			'Gefahrguthandling',
			'Logistikdienstleister'
		]
	},
	{
		name: 'Forschung & Entwicklung',
		themen: ['Entwicklungsprozess', 'Design Review', 'Prototypenbau', 'Validierung', 'Verifizierung', 'Risikoanalyse', 'Aenderungsmanagement', 'Innovationsmanagement']
	},
	{
		name: 'Finanzen & Controlling',
		themen: ['Budgetplanung', 'Kostenrechnung', 'Investitionsplanung', 'Risikomanagement', 'Berichtswesen', 'Compliance', 'Wirtschaftlichkeitsanalysen', 'Forderungsmanagement']
	},
	{
		name: 'Arbeitssicherheit',
		themen: [
			'Gefaehrdungsbeurteilung',
			'Arbeitsschutzunterweisungen',
			'PSA-Management',
			'Unfalluntersuchung',
			'Notfallmanagement',
			'Arbeitsplatzergonomie',
			'Gefahrstoffmanagement',
			'Arbeitssicherheitskennzahlen'
		]
	},
	{
		name: 'Umweltmanagement',
		themen: [
			'Umweltaspekte und -auswirkungen',
			'Abfallmanagement',
			'Emissionsmanagement',
			'Gewaesserschutz',
			'Umweltziele',
			'Rechtskonformitaet',
			'Umweltprogramme',
			'Notfallvorsorge Umwelt'
		]
	},
	{
		name: 'Energiemanagement',
		themen: [
			'Energieplanung',
			'Energieleistungskennzahlen',
			'Energieeinsatz und -verbrauch',
			'Energetische Bewertung',
			'Beschaffung von Energie',
			'Energieziele',
			'Messung und Ueberwachung',
			'Energieeffizienz-Massnahmen'
		]
	},
	{
		name: 'Instandhaltung',
		themen: [
			'Wartungsplanung',
			'Praeventive Instandhaltung',
			'Stoerungsmanagement',
			'Ersatzteilmanagement',
			'Anlagendokumentation',
			'Kalibrierung',
			'Instandhaltungskennzahlen',
			'Fremdfirmenmanagement'
		]
	},
	{
		name: 'Lager',
		themen: ['Lagerhaltung', 'Bestandsmanagement', 'Ein- und Auslagerung', 'Inventur', 'Lagerbedingungen', 'FIFO/FEFO-Prinzip', 'Lagerplatzverwaltung']
	},
	{
		name: 'Marketing',
		themen: ['Marketingstrategie', 'Marktforschung', 'Kundenkommunikation', 'Markenmanagement', 'Werbemittel', 'Messeplanung', 'Digitales Marketing']
	},
	{
		name: 'Rechtsabteilung',
		themen: ['Vertragsmanagement', 'Rechtskonformitaet', 'Datenschutz', 'Gewerblicher Rechtsschutz', 'Arbeitsrecht', 'Haftungsmanagement', 'Regulatorische Anforderungen']
	},
	{
		name: 'Facility Management',
		themen: ['Gebaeudemanagement', 'Reinigung und Hygiene', 'Sicherheitstechnik', 'Flaechen- und Raumplanung', 'Energieversorgung', 'Wartung Gebaeudetechnik', 'Zutrittskontrolle']
	},
	{
		name: 'Kundenservice',
		themen: [
			'Reklamationsbearbeitung',
			'Service-Level-Agreements',
			'Kundenzufriedenheitsmessung',
			'Beschwerdemanagement',
			'Servicequalitaet',
			'Reaktionszeiten',
			'Eskalationsmanagement'
		]
	},
	{
		name: 'Konstruktion',
		themen: [
			'Konstruktionsprozess',
			'CAD-Management',
			'Stuecklistenmanagement',
			'Toleranzmanagement',
			'Normkonformitaet',
			'Konstruktionsaenderungen',
			'Fertigungsgerechte Konstruktion'
		]
	},
	{
		name: 'Werkzeugbau',
		themen: ['Werkzeugherstellung', 'Werkzeugwartung', 'Werkzeugverwaltung', 'Werkzeugkalibrierung', 'Standzeitueberwachung', 'Werkzeuginstandsetzung', 'Werkzeugdokumentation']
	},
	{
		name: 'Pruefmittelmanagement',
		themen: ['Pruefmittelueberwachung', 'Kalibrierung', 'Pruefmittelfaehigkeit', 'Pruefplaene', 'Messgeraeteverwaltung', 'Rueckfuehrbarkeit']
	},
	{
		name: 'Dokumentenmanagement',
		themen: ['Dokumentenlenkung', 'Versionskontrolle', 'Archivierung', 'Zugriffsteuerung', 'Dokumentenfreigabe', 'Aufbewahrungsfristen']
	},
	{
		name: 'Schulung & Weiterbildung',
		themen: ['Schulungsbedarfsermittlung', 'Schulungsplanung', 'Wirksamkeitspruefung', 'E-Learning', 'Qualifikationsmatrix', 'Unterweisungen', 'Weiterbildungsbudget']
	},
	{
		name: 'Projektmanagement',
		themen: ['Projektplanung', 'Risikomanagement', 'Meilensteinueberwachung', 'Ressourcenplanung', 'Projektkommunikation', 'Lessons Learned', 'Projektabschluss']
	},
	{
		name: 'Datenschutz',
		themen: [
			'Datenschutzkonzept',
			'Verarbeitungsverzeichnis',
			'Technisch-organisatorische Massnahmen',
			'Betroffenenrechte',
			'Datenschutz-Folgenabschaetzung',
			'Auftragsverarbeitung'
		]
	},
	{
		name: 'Fuhrpark',
		themen: ['Fahrzeugmanagement', 'Wartungsplanung', 'Fahrzeugdokumentation', 'Fuehrerscheinkontrolle', 'Kraftstoffmanagement', 'Unfallmanagement']
	},
	{
		name: 'Empfang & Rezeption',
		themen: ['Besuchermanagement', 'Zutrittskontrolle', 'Posteingang', 'Telefonzentrale', 'Sicherheitsunterweisung Besucher', 'Empfangsprozesse']
	},
	{
		name: 'Kantine & Verpflegung',
		themen: ['Hygienemaengement', 'HACCP-Konzept', 'Lieferantenmanagement', 'Speiseplanung', 'Allergenmanagement', 'Kuechentechnik']
	},
	{
		name: 'Betriebsrat',
		themen: ['Mitbestimmungsrechte', 'Betriebsvereinbarungen', 'Arbeitnehmervertretung', 'Informationsrechte', 'Beschwerdemanagement', 'Soziale Angelegenheiten']
	},
	{
		name: 'Revision & Compliance',
		themen: ['Interne Audits', 'Compliance-Management', 'Risikobewertung', 'Internes Kontrollsystem', 'Whistleblowing', 'Anti-Korruption', 'Berichterstattung']
	}
];
