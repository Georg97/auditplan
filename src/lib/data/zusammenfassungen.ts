export interface ZusammenfassungBeschreibungen {
	[abteilung: string]: string;
}

export const zusammenfassungDefaultText =
	'Die Abteilung wurde im Rahmen des Audits umfassend bewertet. Die grundlegenden Prozesse sind etabliert und werden von den Mitarbeitern verstanden. Es wurden sowohl positive Aspekte als auch Verbesserungspotenziale identifiziert. Die Dokumentation der Prozesse ist vorhanden und wird regelmaessig aktualisiert. Die Mitarbeiter zeigen ein angemessenes Bewusstsein fuer die Anforderungen des Managementsystems. Empfehlungen zur weiteren Optimierung wurden im Massnahmenplan festgehalten. Insgesamt erfuellt die Abteilung die wesentlichen Anforderungen der zugrundeliegenden Norm.';

export const zusammenfassungBeschreibungen: ZusammenfassungBeschreibungen = {
	Management:
		'Die Managementbewertung zeigt eine klare strategische Ausrichtung und ein wirksames Fuehrungssystem. Die oberste Leitung nimmt ihre Verantwortung fuer das Managementsystem aktiv wahr und stellt die notwendigen Ressourcen bereit. Der Kontext der Organisation und die interessierten Parteien werden systematisch ermittelt und beruecksichtigt. Die Qualitaetspolitik ist kommuniziert und wird von den Mitarbeitern verstanden. Risiken und Chancen werden identifiziert und in die Planung einbezogen. Die Managementbewertung erfolgt regelmaessig und fuehrt zu konkreten Verbesserungsmassnahmen. Die Organisation erfuellt die Anforderungen der Norm im Bereich Fuehrung und Verpflichtung.',
	Produktion:
		'Die Produktionsprozesse sind systematisch geplant und werden wirksam gesteuert. Arbeitsanweisungen sind aktuell, verstaendlich und am Arbeitsplatz verfuegbar. Die Prozessfreigabe erfolgt nach definierten Kriterien und wird dokumentiert. Die Rueckverfolgbarkeit der Produkte ist sichergestellt. Pruef- und Messprozesse sind implementiert und liefern zuverlaessige Ergebnisse. Der Umgang mit fehlerhaften Produkten ist geregelt und wird konsequent umgesetzt. Die Produktionskennzahlen werden erhoben und fuer die kontinuierliche Verbesserung genutzt. Die Abteilung erfuellt die Normanforderungen hinsichtlich der Steuerung der Produktion und Dienstleistungserbringung.',
	IT: 'Die IT-Abteilung zeigt ein hohes Bewusstsein fuer Informationssicherheit und Datenschutz. Die IT-Infrastruktur wird systematisch gewartet und ueberwacht. Zugriffssteuerung und Datensicherungskonzepte sind implementiert und werden regelmaessig ueberprueft. Das Notfallkonzept fuer IT-Systeme ist dokumentiert und wird erprobt. Die DSGVO-Anforderungen werden systematisch umgesetzt. Das Change Management fuer IT-Systeme ist etabliert und minimiert Risiken bei Aenderungen. Die IT-Abteilung erfuellt die Anforderungen an die Informationssicherheit.',
	Qualitaetsmanagement:
		'Das Qualitaetsmanagementsystem ist wirksam implementiert und wird kontinuierlich verbessert. Interne Audits werden systematisch geplant und durchgefuehrt, die Ergebnisse werden zur Verbesserung genutzt. Das Reklamationsmanagement ist strukturiert und fuehrt zu nachhaltigen Korrekturmassnahmen. Die Lieferantenbewertung erfolgt nach definierten Kriterien. Die Dokumentenlenkung ist geregelt und sichergestellt. Der KVP-Prozess ist aktiv und zeigt messbare Ergebnisse. Die Kundenzufriedenheit wird ermittelt und als Steuerungsgroesse genutzt. Das QM-System erfuellt die Normanforderungen umfassend.',
	Arbeitssicherheit:
		'Die Arbeitssicherheitsorganisation ist systematisch aufgebaut und zeigt eine positive Sicherheitskultur. Gefaehrdungsbeurteilungen werden fuer alle Arbeitsplaetze erstellt und regelmaessig aktualisiert. Sicherheitsunterweisungen werden termingerecht durchgefuehrt und dokumentiert. Das Notfallmanagement ist etabliert und wird regelmaessig erprobt. Die arbeitsmedizinische Vorsorge wird sichergestellt. Unfaelle und Beinaheunfaelle werden analysiert und fuehren zu praventiven Massnahmen. Die Abteilung erfuellt die Anforderungen des Arbeitsschutzmanagementsystems.'
	// TODO: Weitere Abteilungen (Personalwesen, Einkauf, Vertrieb, Logistik, F&E, Finanzen,
	// Umweltmanagement, Energiemanagement, Instandhaltung, Lager, Marketing, Rechtsabteilung,
	// Facility Management, Kundenservice, Konstruktion, Werkzeugbau, Pruefmittelmanagement,
	// Dokumentenmanagement, Schulung, Projektmanagement, Datenschutz)
};
