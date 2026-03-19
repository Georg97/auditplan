import type { NormKapitel } from './index';

export const iso27001Kapitel: NormKapitel[] = [
	// 4 Kontext der Organisation
	{ id: '4.1', titel: 'Verstehen der Organisation und ihres Kontextes' },
	{ id: '4.2', titel: 'Verstehen der Erfordernisse und Erwartungen interessierter Parteien' },
	{ id: '4.3', titel: 'Festlegen des Anwendungsbereichs des Informationssicherheitsmanagementsystems' },
	{ id: '4.4', titel: 'Informationssicherheitsmanagementsystem' },

	// 5 Fuehrung
	{ id: '5.1', titel: 'Fuehrung und Verpflichtung' },
	{ id: '5.2', titel: 'Informationssicherheitspolitik' },
	{ id: '5.3', titel: 'Rollen, Verantwortlichkeiten und Befugnisse in der Organisation' },

	// 6 Planung
	{ id: '6.1', titel: 'Massnahmen zum Umgang mit Risiken und Chancen' },
	{ id: '6.1.1', titel: 'Allgemeines' },
	{ id: '6.1.2', titel: 'Informationssicherheitsrisikobeurteilung' },
	{ id: '6.1.3', titel: 'Informationssicherheitsrisikobehandlung' },
	{ id: '6.2', titel: 'Informationssicherheitsziele und Planung zu deren Erreichung' },
	{ id: '6.3', titel: 'Planung von Aenderungen' },

	// 7 Unterstuetzung
	{ id: '7.1', titel: 'Ressourcen' },
	{ id: '7.2', titel: 'Kompetenz' },
	{ id: '7.3', titel: 'Bewusstsein' },
	{ id: '7.4', titel: 'Kommunikation' },
	{ id: '7.5', titel: 'Dokumentierte Information' },
	{ id: '7.5.1', titel: 'Allgemeines' },
	{ id: '7.5.2', titel: 'Erstellen und Aktualisieren' },
	{ id: '7.5.3', titel: 'Lenkung dokumentierter Information' },

	// 8 Betrieb
	{ id: '8.1', titel: 'Betriebliche Planung und Steuerung' },
	{ id: '8.2', titel: 'Informationssicherheitsrisikobeurteilung' },
	{ id: '8.3', titel: 'Informationssicherheitsrisikobehandlung' },

	// 9 Bewertung der Leistung
	{ id: '9.1', titel: 'Ueberwachung, Messung, Analyse und Bewertung' },
	{ id: '9.2', titel: 'Internes Audit' },
	{ id: '9.2.1', titel: 'Allgemeines' },
	{ id: '9.2.2', titel: 'Internes Auditprogramm' },
	{ id: '9.3', titel: 'Managementbewertung' },
	{ id: '9.3.1', titel: 'Allgemeines' },
	{ id: '9.3.2', titel: 'Eingaben fuer die Managementbewertung' },
	{ id: '9.3.3', titel: 'Ergebnisse der Managementbewertung' },

	// 10 Verbesserung
	{ id: '10.1', titel: 'Fortlaufende Verbesserung' },
	{ id: '10.2', titel: 'Nichtkonformitaet und Korrekturmassnahmen' }
];
