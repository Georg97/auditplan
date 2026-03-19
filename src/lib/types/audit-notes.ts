export interface AuditNotes {
	id: string;
	organizationId: string;
	name?: string;
	firma?: string;
	standards?: string;
	zertifikat?: string;
	auditart?: string;
	datumVon?: string;
	datumBis?: string;
	standort?: string;
	auditor?: string;
	seiteVon?: string;
	seiteBis?: string;
	logoBase64?: string;
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NotizenBlock {
	id: string;
	auditNotesId: string;
	position: number;
	datum?: string;
	uhrzeitVon?: string;
	uhrzeitBis?: string;
	istRemote?: boolean;
	organisationseinheit?: string;
	auditor?: string;
	gespraechspartner?: string;
	beschreibung?: string;
	vorstellung?: string;
	allgemein?: string;
	notizen?: string;
	dokumente?: string;
	zusammenfassung?: string;
	manuellBeschreibung?: boolean;
	manuellZusammenfassung?: boolean;
	manuellThema?: boolean;
	manuellNormkapitel?: boolean;
	toggles?: NotizenBlockToggles;
	qhseDokumente: QhseDokument[];
	bewertungen: Bewertung[];
	normkapitel: string[];
}

export interface NotizenBlockToggles {
	datum: boolean;
	uhrzeit: boolean;
	remote: boolean;
	dokumenteAnzeigen: boolean;
	bewertungAnzeigen: boolean;
	notizenAnzeigen: boolean;
}

export interface QhseDokument {
	id: string;
	notizenBlockId: string;
	position: number;
	name?: string;
	datum?: string;
	notizen?: string;
}

export interface Bewertung {
	id: string;
	notizenBlockId: string;
	position: number;
	typ?: string;
	beschreibung?: string;
	kapitel: string[];
}

export const BEWERTUNG_TYPES = ['major_nonconformity', 'minor_nonconformity', 'observation', 'improvement_potential', 'positive_finding'] as const;
export type BewertungType = (typeof BEWERTUNG_TYPES)[number];
