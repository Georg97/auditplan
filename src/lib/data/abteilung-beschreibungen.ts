export interface AbteilungBeschreibungen {
	[abteilung: string]: string;
}

export const abteilungBeschreibungen: AbteilungBeschreibungen = {
	Management:
		'Im Rahmen des Audits wird die strategische Ausrichtung der Organisation sowie die Wirksamkeit des Fuehrungssystems bewertet. Es wird geprueft, ob die oberste Leitung ihre Fuehrungsrolle wahrnimmt und die Qualitaetspolitik aktiv kommuniziert. Die Managementbewertung wird hinsichtlich Vollstaendigkeit und Massnahmenableitung analysiert. Besonderes Augenmerk liegt auf der systematischen Ermittlung des Kontexts der Organisation sowie der Beruecksichtigung interessierter Parteien.',
	Produktion:
		'Die Fertigungsprozesse werden hinsichtlich ihrer Planung, Durchfuehrung und Ueberwachung bewertet. Es wird geprueft, ob Arbeitsanweisungen aktuell und am Arbeitsplatz verfuegbar sind. Die Prozessfreigabe, Rueckverfolgbarkeit und der Umgang mit fehlerhaften Produkten werden untersucht. Besonderes Augenmerk liegt auf der Wirksamkeit von Pruef- und Messprozessen sowie der systematischen Fehleranalyse.',
	IT: 'Die IT-Infrastruktur und Informationssicherheit werden im Hinblick auf Verfuegbarkeit, Vertraulichkeit und Integritaet der Daten bewertet. Zugriffssteuerung, Datensicherung und Notfallkonzepte werden auf Aktualitaet und Wirksamkeit geprueft. Die Einhaltung der DSGVO-Anforderungen sowie das Change Management fuer IT-Systeme werden analysiert.',
	Qualitaetsmanagement:
		'Das Qualitaetsmanagementsystem wird auf Konformitaet mit den Normanforderungen und die Wirksamkeit seiner Prozesse geprueft. Die Planung und Durchfuehrung interner Audits, das Reklamationsmanagement sowie die Lieferantenbewertung werden bewertet. Die Dokumentenlenkung und der kontinuierliche Verbesserungsprozess stehen im Fokus der Bewertung.',
	Arbeitssicherheit:
		'Die Arbeitssicherheitsorganisation wird hinsichtlich der systematischen Gefaehrdungsbeurteilung und der Wirksamkeit von Schutzmassnahmen bewertet. Es wird geprueft, ob Sicherheitsunterweisungen dokumentiert und wirksam sind. Das Notfallmanagement, der Umgang mit Gefahrstoffen und die arbeitsmedizinische Vorsorge werden analysiert. Besonderes Augenmerk liegt auf der Unfallanalyse und der Ableitung praventiver Massnahmen.'
	// TODO: Weitere Abteilungen (Personalwesen, Einkauf, Vertrieb, Logistik, F&E, Finanzen,
	// Umweltmanagement, Energiemanagement, Instandhaltung, Lager, Marketing, Rechtsabteilung,
	// Facility Management, Kundenservice, Konstruktion, Werkzeugbau, Pruefmittelmanagement,
	// Dokumentenmanagement, Schulung, Projektmanagement, Datenschutz)
};
