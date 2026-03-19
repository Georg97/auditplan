export interface SavedNotes {
	id: string;
	organizationId: string;
	name: string;
	daten: string;
	createdAt: Date;
	updatedAt: Date;
}

export type BewertungsTyp = 'major_nonconformity' | 'minor_nonconformity' | 'observation' | 'improvement_potential' | 'positive_finding';

export interface QHSEDokument {
	id: string;
	name: string;
	datum: string;
	notizen: string;
}

export interface Bewertung {
	id: string;
	typ: BewertungsTyp;
	kapitel: string[];
	beschreibung: string;
}

export interface NotizenBlockToggles {
	datum: boolean;
	uhrzeit: boolean;
	remote: boolean;
	dokumenteAnzeigen: boolean;
	bewertungAnzeigen: boolean;
	notizenAnzeigen: boolean;
}

export interface NotizenBlock {
	id: string;
	position: number;
	datum: string;
	uhrzeitVon: string;
	uhrzeitBis: string;
	istRemote: boolean;
	organisationseinheit: string;
	normkapitel: string[];
	thema: string[];
	elementProzess: string[];
	auditor: string;
	gespraechspartner: string;
	beschreibung: string;
	vorstellung: string;
	allgemein: string;
	notizen: string;
	dokumente: string;
	zusammenfassung: string;
	toggles: NotizenBlockToggles;
	qhseDokumente: QHSEDokument[];
	bewertungen: Bewertung[];
	manuellBearbeitet: {
		beschreibung: boolean;
		zusammenfassung: boolean;
		thema: boolean;
		normkapitel: boolean;
	};
}

export interface NotizenHeader {
	firmaAuftraggeber: string;
	standards: string;
	zertifikat: string;
	auditart: string;
	datumVon: string;
	datumBis: string;
	standorte: string;
	auditor: string;
	seiteVon: string;
	seiteBis: string;
}

export interface NotizenDaten {
	header: NotizenHeader;
	logoBase64: string | null;
	logoDateiname: string | null;
	notizenBloecke: NotizenBlock[];
}
