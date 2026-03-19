export interface ZusammenfassungBeschreibungen {
	[abteilung: string]: string;
}

export const zusammenfassungDefaultText: string =
	'Die Abteilung wurde im Rahmen des Audits umfassend bewertet. ' +
	'Die dokumentierten Prozesse und Verfahren entsprechen weitgehend den Anforderungen der zugrunde liegenden Norm. ' +
	'Die Mitarbeiter zeigten ein gutes Verstaendnis fuer die relevanten Anforderungen und deren Umsetzung im Tagesgeschaeft. ' +
	'Einzelne Verbesserungspotenziale wurden identifiziert und als Empfehlungen dokumentiert. ' +
	'Die erforderlichen Aufzeichnungen und Nachweise waren verfuegbar und nachvollziehbar gefuehrt. ' +
	'Insgesamt ist die Abteilung gut aufgestellt und zeigt ein funktionierendes Managementsystem. ' +
	'Die Organisation erfuellt die wesentlichen Anforderungen der Norm in diesem Bereich.';

export const zusammenfassungBeschreibungen: ZusammenfassungBeschreibungen = {
	Management:
		'Die Managementbewertung zeigt eine klare strategische Ausrichtung des Unternehmens. ' +
		'Die oberste Leitung nimmt ihre Verantwortung fuer das Managementsystem aktiv wahr und kommuniziert die Qualitaetspolitik an alle relevanten Ebenen. ' +
		'Der Kontext der Organisation sowie die Erfordernisse und Erwartungen interessierter Parteien sind systematisch ermittelt und dokumentiert. ' +
		'Die Risiko- und Chancenbewertung ist aktuell und in die strategische Planung integriert. ' +
		'Die abgeleiteten Ziele sind messbar und werden regelmaessig ueberprueft. ' +
		'Die Organisation erfuellt die Anforderungen der Norm in den Bereichen Fuehrung und Managementbewertung.',

	Produktion:
		'Die Fertigungsprozesse sind systematisch geplant und dokumentiert. ' +
		'Arbeitsanweisungen und Verfahrensanweisungen liegen aktuell und am Arbeitsplatz zugaenglich vor. ' +
		'Die Pruef- und Freigabeprozesse gewaehrleisten eine zuverlaessige Produktkonformitaet. ' +
		'Die Rueckverfolgbarkeit ist ueber alle Fertigungsstufen sichergestellt. ' +
		'Die produktionsrelevanten Kennzahlen werden systematisch erfasst und fuer Verbesserungsmassnahmen genutzt. ' +
		'Wartungs- und Instandhaltungsplaene werden eingehalten. ' +
		'Die Produktion erfuellt die normrelevanten Anforderungen an die betriebliche Planung und Steuerung.',

	IT:
		'Die IT-Infrastruktur ist angemessen dokumentiert und die Informationssicherheit wird systematisch gemanagt. ' +
		'Zugriffssteuerung und Datensicherungsmassnahmen sind implementiert und werden regelmaessig ueberprueft. ' +
		'Ein Notfallkonzept fuer IT-Ausfaelle ist vorhanden und wird getestet. ' +
		'Die DSGVO-Anforderungen werden in den relevanten Prozessen beruecksichtigt. ' +
		'Change-Management-Verfahren fuer IT-Systeme sind definiert und werden eingehalten. ' +
		'Die IT-Abteilung erfuellt die normativen Anforderungen an die Bereitstellung und Sicherung von IT-Ressourcen.',

	Qualitaetsmanagement:
		'Das Qualitaetsmanagementsystem ist wirksam implementiert und wird kontinuierlich verbessert. ' +
		'Interne Audits werden systematisch geplant und kompetent durchgefuehrt. ' +
		'Das Reklamationsmanagement gewaehrleistet eine zeitnahe Bearbeitung und fundierte Ursachenanalyse. ' +
		'Die Dokumentenlenkung stellt sicher, dass aktuelle Dokumente an den relevanten Stellen verfuegbar sind. ' +
		'Korrekturmassnahmen werden nachverfolgt und auf Wirksamkeit ueberprueft. ' +
		'Das Qualitaetsmanagement erfuellt die Anforderungen der Norm umfassend.',

	Personalwesen:
		'Die Personalprozesse stellen die Bereitstellung kompetenter Mitarbeiter sicher. ' +
		'Schulungsbedarfe werden systematisch ermittelt und in einen Schulungsplan ueberfuehrt. ' +
		'Die Wirksamkeit von Schulungsmassnahmen wird nachvollziehbar geprueft. ' +
		'Qualifikationsnachweise und Kompetenzmatrizen sind aktuell gefuehrt. ' +
		'Der Onboarding-Prozess ist strukturiert und dokumentiert. ' +
		'Die Personalabteilung erfuellt die Anforderungen an Kompetenz, Bewusstsein und Schulung.',

	// TODO: Weitere Zusammenfassungen im professionellen TUEV-Auditor-Stil ergaenzen
	Einkauf: 'TODO: Zusammenfassung fuer Einkauf erstellen.',
	Vertrieb: 'TODO: Zusammenfassung fuer Vertrieb erstellen.',
	Logistik: 'TODO: Zusammenfassung fuer Logistik erstellen.',
	'Forschung & Entwicklung': 'TODO: Zusammenfassung fuer Forschung & Entwicklung erstellen.',
	'Finanzen & Controlling': 'TODO: Zusammenfassung fuer Finanzen & Controlling erstellen.',
	Arbeitssicherheit: 'TODO: Zusammenfassung fuer Arbeitssicherheit erstellen.',
	Umweltmanagement: 'TODO: Zusammenfassung fuer Umweltmanagement erstellen.',
	Energiemanagement: 'TODO: Zusammenfassung fuer Energiemanagement erstellen.',
	Instandhaltung: 'TODO: Zusammenfassung fuer Instandhaltung erstellen.',
	Lager: 'TODO: Zusammenfassung fuer Lager erstellen.',
	Marketing: 'TODO: Zusammenfassung fuer Marketing erstellen.',
	Rechtsabteilung: 'TODO: Zusammenfassung fuer Rechtsabteilung erstellen.',
	'Facility Management': 'TODO: Zusammenfassung fuer Facility Management erstellen.',
	Kundenservice: 'TODO: Zusammenfassung fuer Kundenservice erstellen.',
	Konstruktion: 'TODO: Zusammenfassung fuer Konstruktion erstellen.',
	Werkzeugbau: 'TODO: Zusammenfassung fuer Werkzeugbau erstellen.',
	Pruefmittelmanagement: 'TODO: Zusammenfassung fuer Pruefmittelmanagement erstellen.',
	Dokumentenmanagement: 'TODO: Zusammenfassung fuer Dokumentenmanagement erstellen.',
	'Schulung & Weiterbildung': 'TODO: Zusammenfassung fuer Schulung & Weiterbildung erstellen.',
	Projektmanagement: 'TODO: Zusammenfassung fuer Projektmanagement erstellen.',
	Datenschutz: 'TODO: Zusammenfassung fuer Datenschutz erstellen.',
	Fuhrpark: 'TODO: Zusammenfassung fuer Fuhrpark erstellen.',
	'Empfang & Rezeption': 'TODO: Zusammenfassung fuer Empfang & Rezeption erstellen.',
	'Kantine & Verpflegung': 'TODO: Zusammenfassung fuer Kantine & Verpflegung erstellen.',
	Betriebsrat: 'TODO: Zusammenfassung fuer Betriebsrat erstellen.',
	'Revision & Compliance': 'TODO: Zusammenfassung fuer Revision & Compliance erstellen.'
};
