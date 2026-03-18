export interface SavedNotes {
	id: string;
	organizationId: string;
	name: string;
	daten: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface QHSEDokument {
	id: string;
	name: string;
	nummer: string;
	revision: string;
}

export interface BewertungsFeld {
	id: string;
	typ: 'conformity' | 'nonconformity_major' | 'nonconformity_minor' | 'observation' | 'improvement';
	kapitel: string[];
	beschreibung: string;
}

export interface NotizenBlock {
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
	showDatum: boolean;
	showUhrzeit: boolean;
	showRemote: boolean;
	showDokumente: boolean;
	showBewertung: boolean;
	showNotizen: boolean;
	qhseDokumente: QHSEDokument[];
	bewertungsfelder: BewertungsFeld[];
	notizen: string;
}

export interface NotizenDaten {
	firma: string;
	standards: string;
	zertifikat: string;
	auditart: string;
	datumVon: string;
	datumBis: string;
	standort: string;
	auditor: string;
	seiteVon: string;
	seiteBis: string;
	logo: string | null;
	bloecke: NotizenBlock[];
}
