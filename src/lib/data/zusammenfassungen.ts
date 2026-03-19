/**
 * Professionelle Bewertungszusammenfassungen für Abteilungen (5-10 Sätze).
 * Enden immer mit einer Konformitätsaussage.
 * Werden im Auditplan-Generator automatisch in das Zusammenfassungsfeld geladen.
 */
export const zusammenfassungBeschreibungen: Record<string, string> = {
	Management:
		'Die Managementbewertung zeigt eine klare strategische Ausrichtung des Qualitätsmanagementsystems. Die Qualitätspolitik ist dokumentiert und wird aktiv kommuniziert. Ressourcen werden bedarfsgerecht bereitgestellt und die Führungsverantwortung wird auf allen Ebenen wahrgenommen. Der Kontext der Organisation und die Anforderungen interessierter Parteien sind systematisch ermittelt. Risiken und Chancen werden regelmäßig bewertet und geeignete Maßnahmen abgeleitet. Die Organisation erfüllt die Anforderungen der Norm.',
	Produktion:
		'Die Produktionsprozesse sind systematisch geplant und werden wirksam überwacht. Arbeitsanweisungen liegen aktuell vor und werden von den Mitarbeitern angewendet. Die Rückverfolgbarkeit der Produkte ist durchgängig sichergestellt. Prüfprozesse sind definiert und die Ergebnisse werden dokumentiert. Die Instandhaltung erfolgt planmäßig und Kennzahlen werden zur Prozesssteuerung genutzt. Nichtkonformitäten werden systematisch erfasst und Korrekturmaßnahmen eingeleitet. Die Fertigungsprozesse erfüllen die normativen Anforderungen.',
	IT: 'Die IT-Infrastruktur unterstützt die Geschäftsprozesse zuverlässig und sicher. Zugriffsrechte sind rollenbasiert vergeben und werden regelmäßig überprüft. Die Datensicherung erfolgt automatisiert nach einem definierten Plan. Notfallpläne für IT-Ausfälle sind erstellt und werden periodisch getestet. Die DSGVO-Anforderungen werden systematisch umgesetzt. Change-Management-Prozesse für IT-Änderungen sind etabliert. Die IT-Sicherheitsmaßnahmen entsprechen den Anforderungen der Organisation.',
	Qualitaetsmanagement:
		'Das Qualitätsmanagementsystem ist umfassend dokumentiert und wird wirksam aufrechterhalten. Interne Audits werden planmäßig durchgeführt und die Ergebnisse systematisch nachverfolgt. Korrekturmaßnahmen werden zeitnah umgesetzt und auf Wirksamkeit überprüft. Die Prozesslandschaft ist vollständig abgebildet und Wechselwirkungen sind identifiziert. Die kontinuierliche Verbesserung ist als Grundprinzip in der Organisation verankert. Das QM-System erfüllt die Anforderungen der zugrunde liegenden Normen.',
	Personalwesen:
		'Die Personalmanagementprozesse gewährleisten eine systematische Kompetenzentwicklung der Mitarbeiter. Schulungsbedarfe werden regelmäßig ermittelt und in einem Schulungsplan zusammengefasst. Die Einarbeitung neuer Mitarbeiter erfolgt nach einem strukturierten Programm. Kompetenznachweise werden vollständig geführt und sind aktuell. Die Personalentwicklungsstrategie unterstützt die Unternehmensziele. Die Anforderungen an Kompetenz und Bewusstsein werden erfüllt.'
	// TODO: Weitere Abteilungen mit professionellen Zusammenfassungen ergänzen
};

/**
 * Fallback-Text für Abteilungen ohne spezifische Zusammenfassung.
 */
export const zusammenfassungDefaultText =
	'Die Abteilung wurde im Rahmen des Audits umfassend bewertet. Die relevanten Prozesse sind dokumentiert und werden von den Mitarbeitern umgesetzt. Die erforderlichen Ressourcen stehen zur Verfügung und werden sachgerecht eingesetzt. Schulungsnachweise und Kompetenzbewertungen liegen vor. Die Prozesse werden anhand definierter Kennzahlen überwacht und bei Bedarf angepasst. Verbesserungspotenziale wurden identifiziert und entsprechende Maßnahmen eingeleitet. Die Abteilung erfüllt die relevanten normativen Anforderungen.';
