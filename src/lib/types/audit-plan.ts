import { z } from 'zod/v4';

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

export interface AuditPlanAuditzeit {
	id: string;
	auditPlanId: string;
	auditor: string;
	standort: string;
	position: number;
	zeilen: AuditPlanAuditzeitZeile[];
}

export interface AuditPlanAuditzeitZeile {
	id: string;
	auditzeitId: string;
	startzeit: string;
	endzeit: string;
	aktivitaet: string;
	position: number;
}

export const AUDIT_PLAN_TEAM_ROLES = ['lead_auditor', 'auditors', 'trainees', 'experts'] as const;
export type AuditPlanTeamRole = (typeof AUDIT_PLAN_TEAM_ROLES)[number];

export const AUDIT_METHODS = ['on_site', 'on_site_and_remote', 'fully_remote'] as const;
export type AuditMethod = (typeof AUDIT_METHODS)[number];

export const SHIFT_SYSTEMS = ['single_shift', 'double_shift', 'triple_shift', 'other'] as const;
export type ShiftSystem = (typeof SHIFT_SYSTEMS)[number];

export const AUDIT_LANGUAGES = ['de', 'en', 'fr', 'es', 'it', 'nl', 'pt', 'pl', 'ru', 'tr', 'zh', 'ja', 'ko', 'ar'] as const;
export type AuditLanguage = (typeof AUDIT_LANGUAGES)[number];

export const AUDITART_OPTIONS = [
	'initial_certification',
	'surveillance_1',
	'surveillance_2',
	'recertification',
	'transfer',
	'extension',
	'reduction',
	'special',
	'internal',
	'supplier',
	'process',
	'product',
	'system',
	'pre_audit',
	'follow_up',
	'combined'
] as const;
export type AuditartOption = (typeof AUDITART_OPTIONS)[number];

export const ISO_NORMS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001'] as const;
export type IsoNorm = (typeof ISO_NORMS)[number];

// ── Zod Schemas ─────────────────────────────────────────────────

export const auditPlanGrunddatenSchema = z.object({
	name: z.string().min(1, 'Name ist erforderlich'),
	auftraggeber: z.string().optional().default(''),
	geltungsbereich: z.string().optional().default(''),
	beauftragter: z.string().optional().default(''),
	auditziel: z.string().optional().default(''),
	auditzielEditierbar: z.boolean().optional().default(false),
	auditartFreitext: z.string().optional().default(''),
	schichtsystem: z.string().optional().default(''),
	schichtsystemFreitext: z.string().optional().default(''),
	schichtuebergaben: z.string().optional().default(''),
	bemerkungBetrieb: z.string().optional().default(''),
	auditmethode: z.string().optional().default(''),
	iktTechnik: z.string().optional().default(''),
	iktTestdatum: z.string().optional().default(''),
	testLetztesAudit: z.boolean().optional().default(false),
	gastgeber: z.string().optional().default(''),
	revisionOrtDatum: z.string().optional().default(''),
	revisionAenderungWaehrendAudit: z.string().optional().default(''),
	revisionKommentare: z.string().optional().default(''),
	hinweiseInfoText: z.string().optional().default(''),
	verteiler: z.string().optional().default(''),
	verteilungAuditteam: z.boolean().optional().default(true),
	verteilungGeschaeftsfuehrung: z.boolean().optional().default(true),
	verteilungFachabteilungen: z.boolean().optional().default(false),
	verteilungExtern: z.boolean().optional().default(false)
});

export type AuditPlanGrunddatenForm = z.infer<typeof auditPlanGrunddatenSchema>;

export const auditPlanBlockZeileSchema = z.object({
	id: z.string(),
	datum: z.string().optional().default(''),
	uhrzeitVon: z.string().optional().default(''),
	uhrzeitBis: z.string().optional().default(''),
	istRemote: z.boolean().optional().default(false),
	organisationseinheit: z.string().optional().default(''),
	auditor: z.string().optional().default(''),
	gespraechspartner: z.string().optional().default(''),
	normkapitel: z.array(z.string()).optional().default([]),
	themen: z.array(z.string()).optional().default([]),
	elemente: z.array(z.string()).optional().default([])
});

export type AuditPlanBlockZeileForm = z.infer<typeof auditPlanBlockZeileSchema>;
