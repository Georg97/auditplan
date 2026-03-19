import type { NormKapitel } from './index';

export const iso45001Kapitel: NormKapitel[] = [
	// 4 Kontext der Organisation
	{ id: '4.1', titel: 'Verstehen der Organisation und ihres Kontextes' },
	{ id: '4.2', titel: 'Verstehen der Erfordernisse und Erwartungen von Beschaeftigten und anderen interessierten Parteien' },
	{ id: '4.3', titel: 'Festlegen des Anwendungsbereichs des SGA-Managementsystems' },
	{ id: '4.4', titel: 'SGA-Managementsystem' },

	// 5 Fuehrung und Beteiligung der Beschaeftigten
	{ id: '5.1', titel: 'Fuehrung und Verpflichtung' },
	{ id: '5.2', titel: 'SGA-Politik' },
	{ id: '5.3', titel: 'Rollen, Verantwortlichkeiten und Befugnisse in der Organisation' },
	{ id: '5.4', titel: 'Konsultation und Beteiligung von Beschaeftigten' },

	// 6 Planung
	{ id: '6.1', titel: 'Massnahmen zum Umgang mit Risiken und Chancen' },
	{ id: '6.1.1', titel: 'Allgemeines' },
	{ id: '6.1.2', titel: 'Identifizierung von Gefaehrdungen und Bewertung von Risiken und Chancen' },
	{ id: '6.1.2.1', titel: 'Identifizierung von Gefaehrdungen' },
	{ id: '6.1.2.2', titel: 'Bewertung von SGA-Risiken und anderen Risiken' },
	{ id: '6.1.2.3', titel: 'Bewertung von SGA-Chancen und anderen Chancen' },
	{ id: '6.1.3', titel: 'Bestimmung rechtlicher Verpflichtungen und anderer Anforderungen' },
	{ id: '6.1.4', titel: 'Planung von Massnahmen' },
	{ id: '6.2', titel: 'SGA-Ziele und Planung zu deren Erreichung' },
	{ id: '6.2.1', titel: 'SGA-Ziele' },
	{ id: '6.2.2', titel: 'Planung zur Erreichung der SGA-Ziele' },

	// 7 Unterstuetzung
	{ id: '7.1', titel: 'Ressourcen' },
	{ id: '7.2', titel: 'Kompetenz' },
	{ id: '7.3', titel: 'Bewusstsein' },
	{ id: '7.4', titel: 'Kommunikation' },
	{ id: '7.4.1', titel: 'Allgemeines' },
	{ id: '7.4.2', titel: 'Interne Kommunikation' },
	{ id: '7.4.3', titel: 'Externe Kommunikation' },
	{ id: '7.5', titel: 'Dokumentierte Information' },
	{ id: '7.5.1', titel: 'Allgemeines' },
	{ id: '7.5.2', titel: 'Erstellen und Aktualisieren' },
	{ id: '7.5.3', titel: 'Lenkung dokumentierter Information' },

	// 8 Betrieb
	{ id: '8.1', titel: 'Betriebliche Planung und Steuerung' },
	{ id: '8.1.1', titel: 'Allgemeines' },
	{ id: '8.1.2', titel: 'Beseitigung von Gefaehrdungen und Verringerung von SGA-Risiken' },
	{ id: '8.1.3', titel: 'Management des Wandels' },
	{ id: '8.1.4', titel: 'Beschaffung' },
	{ id: '8.1.4.1', titel: 'Allgemeines' },
	{ id: '8.1.4.2', titel: 'Auftragnehmer' },
	{ id: '8.1.4.3', titel: 'Ausgliederung (Outsourcing)' },
	{ id: '8.2', titel: 'Notfallvorsorge und Gefahrenabwehr' },

	// 9 Bewertung der Leistung
	{ id: '9.1', titel: 'Ueberwachung, Messung, Analyse und Leistungsbewertung' },
	{ id: '9.1.1', titel: 'Allgemeines' },
	{ id: '9.1.2', titel: 'Bewertung der Einhaltung rechtlicher Verpflichtungen' },
	{ id: '9.2', titel: 'Internes Audit' },
	{ id: '9.2.1', titel: 'Allgemeines' },
	{ id: '9.2.2', titel: 'Internes Auditprogramm' },
	{ id: '9.3', titel: 'Managementbewertung' },

	// 10 Verbesserung
	{ id: '10.1', titel: 'Allgemeines' },
	{ id: '10.2', titel: 'Vorfall, Nichtkonformitaet und Korrekturmassnahmen' },
	{ id: '10.3', titel: 'Fortlaufende Verbesserung' }
];
