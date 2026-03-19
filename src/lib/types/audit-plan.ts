export interface AuditPlan {
	id: string;
	organizationId: string;
	name: string;
	logoBase64?: string;
	logoDateiname?: string;
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface AuditPlanGrunddaten {
	id: string;
	auditPlanId: string;
	auftraggeber?: string;
	geltungsbereich?: string;
	beauftragter?: string;
	auditziel?: string;
	auditzielEditierbar?: boolean;
	auditartFreitext?: string;
	schichtsystem?: string;
	schichtsystemFreitext?: string;
	schichtuebergaben?: string;
	bemerkungBetrieb?: string;
	auditmethode?: string;
	iktTechnik?: string;
	iktTestdatum?: string;
	testLetztesAudit?: boolean;
	gastgeber?: string;
	revisionOrtDatum?: string;
	revisionAenderungWaehrendAudit?: string;
	revisionKommentare?: string;
	hinweiseInfoText?: string;
	verteiler?: string;
	verteilungAuditteam?: boolean;
	verteilungGeschaeftsfuehrung?: boolean;
	verteilungFachabteilungen?: boolean;
	verteilungExtern?: boolean;
}

export interface AuditPlanBlock {
	id: string;
	auditPlanId: string;
	position: number;
	zeilen: AuditPlanBlockZeile[];
}

export interface AuditPlanBlockZeile {
	id: string;
	blockId: string;
	datum?: string;
	uhrzeitVon?: string;
	uhrzeitBis?: string;
	istRemote?: boolean;
	organisationseinheit?: string;
	auditor?: string;
	gespraechspartner?: string;
	manuellBearbeitetBeschreibung?: boolean;
	manuellBearbeitetZusammenfassung?: boolean;
	manuellBearbeitetThema?: boolean;
	manuellBearbeitetNormkapitel?: boolean;
	position: number;
	notizen?: AuditPlanBlockZeilenNotizen;
	toggles?: AuditPlanBlockZeilenToggles;
	normkapitel: string[];
	themen: string[];
	elemente: string[];
}

export interface AuditPlanBlockZeilenNotizen {
	beschreibung?: string;
	vorstellung?: string;
	allgemein?: string;
	notizen?: string;
	dokumente?: string;
	zusammenfassung?: string;
}

export interface AuditPlanBlockZeilenToggles {
	datumToggle: boolean;
	uhrzeitToggle: boolean;
	remoteToggle: boolean;
}

export interface AuditPlanStandort {
	id: string;
	auditPlanId: string;
	name: string;
	position: number;
}

export interface AuditPlanRevision {
	id: string;
	auditPlanId: string;
	nummer?: string;
	datum?: string;
	beschreibung?: string;
	position: number;
}

export interface AuditPlanTeamMitglied {
	id: string;
	auditPlanId: string;
	rolle: string;
	auditorId?: string;
	externalName?: string;
	externalCompany?: string;
	istExtern?: boolean;
	position: number;
}

export const AUDIT_PLAN_TEAM_ROLES = ['lead_auditor', 'auditors', 'trainees', 'experts'] as const;
export type AuditPlanTeamRole = (typeof AUDIT_PLAN_TEAM_ROLES)[number];

export const AUDIT_METHODS = ['on_site', 'on_site_and_remote', 'fully_remote'] as const;
export type AuditMethod = (typeof AUDIT_METHODS)[number];

export const SHIFT_SYSTEMS = ['single_shift', 'double_shift', 'triple_shift', 'other'] as const;
export type ShiftSystem = (typeof SHIFT_SYSTEMS)[number];
