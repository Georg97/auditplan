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
		themen: ['Qualitaetsplanung', 'Interne Audits', 'Reklamationsmanagement', 'Lieferantenbewertung', 'Dokumentenlenkung', 'KVP', 'Fehleranalyse', 'Kundenzufriedenheit']
	},
	{
		name: 'Personalwesen',
		themen: [
			'Kompetenzmanagement',
			'Schulungsplanung',
			'Mitarbeiterbewertung',
			'Personalentwicklung',
			'Onboarding',
			'Arbeitsvertraege',
			'Zeiterfassung',
			'Mitarbeiterzufriedenheit'
		]
	},
	{
		name: 'Einkauf',
		themen: [
			'Lieferantenauswahl',
			'Bestellprozess',
			'Wareneingangspruefung',
			'Lieferantenbewertung',
			'Vertragswesen',
			'Beschaffungsplanung',
			'Reklamationen an Lieferanten',
			'Risikobewertung Lieferkette'
		]
	},
	{
		name: 'Vertrieb',
		themen: [
			'Angebotserstellung',
			'Auftragsabwicklung',
			'Kundenkommunikation',
			'Vertragspruefung',
			'Marktanalyse',
			'Preiskalkulation',
			'Reklamationsbearbeitung',
			'Kundenzufriedenheit'
		]
	},
	{
		name: 'Logistik',
		themen: ['Versandabwicklung', 'Transportplanung', 'Lagerlogistik', 'Kommissionierung', 'Zollabwicklung', 'Verpackung', 'Liefertreue', 'Bestandsmanagement']
	},
	{
		name: 'Forschung & Entwicklung',
		themen: ['Entwicklungsprozess', 'Designvalidierung', 'Prototypenbau', 'Risikoanalyse', 'Patentmanagement', 'Technologiebewertung', 'Projektplanung', 'Freigabeprozess']
	},
	{
		name: 'Finanzen & Controlling',
		themen: ['Budgetplanung', 'Kostenrechnung', 'Investitionsplanung', 'Berichtswesen', 'Jahresabschluss', 'Risikomanagement', 'Compliance', 'Kennzahlensteuerung']
	},
	{
		name: 'Arbeitssicherheit',
		themen: [
			'Gefaehrdungsbeurteilung',
			'Sicherheitsunterweisungen',
			'PSA-Management',
			'Unfallanalyse',
			'Notfallmanagement',
			'Gefahrstoffmanagement',
			'Arbeitsmedizin',
			'Sicherheitsbegehungen'
		]
	},
	{
		name: 'Umweltmanagement',
		themen: ['Umweltaspekte', 'Abfallmanagement', 'Emissionsmanagement', 'Gewaesserschutz', 'Umweltkennzahlen', 'Rechtskonformitaet', 'Umweltziele', 'Notfallvorsorge']
	},
	{
		name: 'Energiemanagement',
		themen: ['Energieplanung', 'Energiekennzahlen', 'Energieeffizienz', 'Energieeinkauf', 'Energetische Bewertung', 'Monitoring', 'Energieziele', 'Verbrauchsanalyse']
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
			'Maschinenhistorie',
			'Zustandsueberwachung'
		]
	},
	{
		name: 'Lager',
		themen: ['Bestandsfuehrung', 'Ein- und Auslagerung', 'Inventur', 'Lagerbedingungen', 'FIFO/FEFO', 'Gefahrstofflagerung', 'Kennzeichnung']
	},
	{
		name: 'Marketing',
		themen: ['Markenstrategie', 'Kommunikation', 'Marktforschung', 'Kampagnenplanung', 'Wettbewerbsanalyse', 'Messeplanung', 'Content-Management']
	},
	{
		name: 'Rechtsabteilung',
		themen: ['Vertragsmanagement', 'Compliance', 'Rechtskonformitaet', 'Datenschutz', 'Haftungsfragen', 'Genehmigungen', 'Streitbeilegung']
	},
	{
		name: 'Facility Management',
		themen: ['Gebaeudemanagement', 'Sicherheitstechnik', 'Reinigung', 'Energieversorgung', 'Flaechen­management', 'Brandschutz', 'Zugangssteuerung']
	},
	{
		name: 'Kundenservice',
		themen: ['Beschwerdemanagement', 'Servicequalitaet', 'Reaktionszeiten', 'Kundenkommunikation', 'Eskalationsmanagement', 'Zufriedenheitsmessung', 'Wissensdatenbank']
	},
	{
		name: 'Konstruktion',
		themen: ['CAD-Prozesse', 'Zeichnungsfreigabe', 'Aenderungsmanagement', 'Normkonformitaet', 'Stuecklisten', 'Toleranzmanagement', 'Design Review']
	},
	{
		name: 'Werkzeugbau',
		themen: ['Werkzeugherstellung', 'Werkzeugwartung', 'Werkzeugverwaltung', 'Verschleissueberwachung', 'Werkzeugfreigabe', 'Ersatzteilbeschaffung', 'Dokumentation']
	},
	{
		name: 'Pruefmittelmanagement',
		themen: ['Pruefmittelueberwachung', 'Kalibrierung', 'Rueckverfolgbarkeit', 'Pruefmittelverwaltung', 'Messungenauigkeit', 'Pruefanweisungen']
	},
	{
		name: 'Dokumentenmanagement',
		themen: ['Dokumentenlenkung', 'Versionskontrolle', 'Archivierung', 'Zugriffskontrolle', 'Vorlagenverwaltung', 'Aufbewahrungsfristen']
	},
	{
		name: 'Schulung & Weiterbildung',
		themen: ['Schulungsbedarfsermittlung', 'Schulungsplanung', 'Wirksamkeitspruefung', 'E-Learning', 'Qualifikationsmatrix', 'Externe Schulungen', 'Unterweisungsnachweise']
	},
	{
		name: 'Projektmanagement',
		themen: ['Projektplanung', 'Ressourcenplanung', 'Risikomanagement', 'Meilensteinverfolgung', 'Stakeholdermanagement', 'Projektdokumentation', 'Lessons Learned']
	},
	{
		name: 'Datenschutz',
		themen: ['DSGVO-Konformitaet', 'Verarbeitungsverzeichnis', 'Datenschutz-Folgenabschaetzung', 'Betroffenenrechte', 'Auftragsverarbeitung', 'Datenschutzschulungen']
	},
	{
		name: 'Fuhrpark',
		themen: ['Fahrzeugverwaltung', 'Wartungsplanung', 'Fuehrerscheinkontrolle', 'Unfallmanagement', 'Kraftstoffmanagement', 'Fahrzeugdisposition']
	},
	{
		name: 'Empfang & Rezeption',
		themen: ['Besuchermanagement', 'Zutrittssteuerung', 'Telefonzentrale', 'Postverteilung', 'Sicherheitsunterweisung Besucher', 'Empfangsprozesse']
	},
	{
		name: 'Kantine & Verpflegung',
		themen: ['Lebensmittelhygiene', 'HACCP-Konzept', 'Speiseplanung', 'Allergenmanagement', 'Lieferantensteuerung', 'Abfallentsorgung']
	},
	{
		name: 'Betriebsrat',
		themen: ['Mitbestimmung', 'Betriebsvereinbarungen', 'Arbeitsschutz', 'Beschwerdemanagement', 'Informationsrechte', 'Soziale Angelegenheiten']
	},
	{
		name: 'Revision & Compliance',
		themen: ['Interne Revision', 'Compliance-Management', 'Risikobeurteilung', 'Anti-Korruption', 'Regelkonformitaet', 'Auditplanung', 'Berichterstattung']
	}
];
