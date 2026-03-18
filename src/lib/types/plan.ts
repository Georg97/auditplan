export interface SavedPlan {
	id: string;
	organizationId: string;
	name: string;
	daten: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuditplanBlock {
	id: string;
	datum: string;
	uhrzeitVon: string;
	uhrzeitBis: string;
	remote: boolean;
	organisationseinheit: string;
	normkapitel: string[];
	thema: string;
	element: string;
	auditor: string;
	gespraechspartner: string;
	beschreibung: string;
	zusammenfassung: string;
	notizen: {
		feststellungen: string;
		empfehlungen: string;
		massnahmen: string;
		bewertung: string;
		nachweise: string;
		sonstiges: string;
	};
	showDatum: boolean;
	showUhrzeit: boolean;
	showRemote: boolean;
}

export interface AuditplanDaten {
	znNummern: string[];
	logo: string | null;
	auftraggeber: string;
	standorte: string[];
	geltungsbereich: string;
	normgrundlage: string[];
	auditkriterien: string;
	auditart: string;
	customAuditart: string;
	beauftragter: string;
	auditziel: string;
	auditzielAngepasst: boolean;
	auditsprachen: string;
	teamLeiter: string;
	teamLeiterExtern: boolean;
	teamMitglied: string;
	teamMitgliedExtern: boolean;
	fachexperte: string;
	fachexperteExtern: boolean;
	beobachter: string;
	beobachterExtern: boolean;
	betriebsorganisation: string;
	auditmethode: string;
	revisionen: { datum: string; beschreibung: string }[];
	auditzeiten: string;
	bloecke: AuditplanBlock[];
	hinweise: string;
	verteiler: string;
}
