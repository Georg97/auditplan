export interface AbteilungBeschreibungen {
	[abteilung: string]: string;
}

export const abteilungBeschreibungen: AbteilungBeschreibungen = {
	Management:
		'Im Rahmen des Audits wird die strategische Ausrichtung des Managementsystems bewertet. ' +
		'Es wird geprueft, ob die oberste Leitung ihre Fuehrungsrolle wahrnimmt und die Qualitaetspolitik aktiv kommuniziert. ' +
		'Die Managementbewertung wird hinsichtlich Vollstaendigkeit und Wirksamkeit der abgeleiteten Massnahmen analysiert. ' +
		'Besonderes Augenmerk liegt auf der systematischen Ermittlung des Kontextes der Organisation sowie der Erfordernisse interessierter Parteien. ' +
		'Die Risiko- und Chancenbewertung wird auf Aktualitaet und Angemessenheit geprueft.',

	Produktion:
		'Die Fertigungsprozesse werden hinsichtlich ihrer Konformitaet mit den festgelegten Verfahrensanweisungen und Arbeitsanweisungen bewertet. ' +
		'Es wird geprueft, ob die Produktionsplanung systematisch erfolgt und die notwendigen Ressourcen bereitgestellt werden. ' +
		'Die Pruef- und Freigabeprozesse werden auf Wirksamkeit und Rueckverfolgbarkeit untersucht. ' +
		'Besonderes Augenmerk liegt auf der Prozessueberwachung, der Fehlerbehandlung und der dokumentierten Freigabe von Maschinen und Anlagen. ' +
		'Die relevanten Kennzahlen werden auf ihre Aussagekraft und Nutzung fuer kontinuierliche Verbesserung geprueft.',

	IT:
		'Die IT-Infrastruktur und Informationssicherheit werden im Kontext der Normanforderungen bewertet. ' +
		'Es wird geprueft, ob geeignete Massnahmen zur Datensicherheit, Zugriffssteuerung und Notfallplanung implementiert sind. ' +
		'Die Einhaltung der DSGVO-Anforderungen wird stichprobenartig verifiziert. ' +
		'Change-Management-Prozesse fuer IT-Systeme werden auf Dokumentation und Freigabeverfahren geprueft.',

	Qualitaetsmanagement:
		'Das Qualitaetsmanagementsystem wird auf seine Wirksamkeit und kontinuierliche Verbesserung hin bewertet. ' +
		'Es wird geprueft, ob interne Audits systematisch geplant und durchgefuehrt werden. ' +
		'Das Reklamationsmanagement wird hinsichtlich Reaktionszeiten und Ursachenanalyse untersucht. ' +
		'Die Dokumentenlenkung wird auf Aktualitaet und Zugaenglichkeit geprueft.',

	Personalwesen:
		'Die Personalprozesse werden hinsichtlich der Sicherstellung notwendiger Kompetenzen bewertet. ' +
		'Es wird geprueft, ob Schulungsbedarfe systematisch ermittelt und Schulungsmassnahmen auf ihre Wirksamkeit hin ueberprueft werden. ' +
		'Der Onboarding-Prozess wird auf Vollstaendigkeit und Dokumentation untersucht. ' +
		'Die Personalplanung wird im Kontext der strategischen Unternehmensziele bewertet.',

	// TODO: Weitere Abteilungsbeschreibungen im professionellen TUEV-Auditor-Stil ergaenzen
	Einkauf: 'TODO: Beschreibung fuer Einkauf erstellen.',
	Vertrieb: 'TODO: Beschreibung fuer Vertrieb erstellen.',
	Logistik: 'TODO: Beschreibung fuer Logistik erstellen.',
	'Forschung & Entwicklung': 'TODO: Beschreibung fuer Forschung & Entwicklung erstellen.',
	'Finanzen & Controlling': 'TODO: Beschreibung fuer Finanzen & Controlling erstellen.',
	Arbeitssicherheit: 'TODO: Beschreibung fuer Arbeitssicherheit erstellen.',
	Umweltmanagement: 'TODO: Beschreibung fuer Umweltmanagement erstellen.',
	Energiemanagement: 'TODO: Beschreibung fuer Energiemanagement erstellen.',
	Instandhaltung: 'TODO: Beschreibung fuer Instandhaltung erstellen.',
	Lager: 'TODO: Beschreibung fuer Lager erstellen.',
	Marketing: 'TODO: Beschreibung fuer Marketing erstellen.',
	Rechtsabteilung: 'TODO: Beschreibung fuer Rechtsabteilung erstellen.',
	'Facility Management': 'TODO: Beschreibung fuer Facility Management erstellen.',
	Kundenservice: 'TODO: Beschreibung fuer Kundenservice erstellen.',
	Konstruktion: 'TODO: Beschreibung fuer Konstruktion erstellen.',
	Werkzeugbau: 'TODO: Beschreibung fuer Werkzeugbau erstellen.',
	Pruefmittelmanagement: 'TODO: Beschreibung fuer Pruefmittelmanagement erstellen.',
	Dokumentenmanagement: 'TODO: Beschreibung fuer Dokumentenmanagement erstellen.',
	'Schulung & Weiterbildung': 'TODO: Beschreibung fuer Schulung & Weiterbildung erstellen.',
	Projektmanagement: 'TODO: Beschreibung fuer Projektmanagement erstellen.',
	Datenschutz: 'TODO: Beschreibung fuer Datenschutz erstellen.',
	Fuhrpark: 'TODO: Beschreibung fuer Fuhrpark erstellen.',
	'Empfang & Rezeption': 'TODO: Beschreibung fuer Empfang & Rezeption erstellen.',
	'Kantine & Verpflegung': 'TODO: Beschreibung fuer Kantine & Verpflegung erstellen.',
	Betriebsrat: 'TODO: Beschreibung fuer Betriebsrat erstellen.',
	'Revision & Compliance': 'TODO: Beschreibung fuer Revision & Compliance erstellen.'
};
