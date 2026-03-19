import { z } from 'zod';

// ============================================================
// Enums & Constants
// ============================================================

export const auditartOptionValues = [
	'initial_certification',
	'surveillance_audit',
	'recertification',
	'internal',
	'supplier',
	'process_audit',
	'system_audit',
	'product_audit',
	'combined_audit',
	'transfer_audit',
	'preliminary_audit',
	'delta_audit',
	'follow_up_audit',
	'unannounced_audit',
	'remote_audit',
	'hybrid_audit'
] as const;
export type AuditartOption = (typeof auditartOptionValues)[number];
export const auditartOptionSchema = z.enum(auditartOptionValues);

export const auditSpracheValues = ['de', 'en', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'tr', 'ru', 'zh', 'ja', 'ko'] as const;
export type AuditSprache = (typeof auditSpracheValues)[number];
export const auditSpracheSchema = z.enum(auditSpracheValues);

export const schichtsystemValues = ['single_shift', 'double_shift', 'triple_shift', 'other'] as const;
export type Schichtsystem = (typeof schichtsystemValues)[number];
export const schichtsystemSchema = z.enum(schichtsystemValues);

export const auditmethodeValues = ['on_site', 'on_site_and_remote', 'fully_remote'] as const;
export type Auditmethode = (typeof auditmethodeValues)[number];
export const auditmethodeSchema = z.enum(auditmethodeValues);

export const teamRolleValues = ['lead_auditor', 'auditors', 'trainees', 'experts'] as const;
export type TeamRolle = (typeof teamRolleValues)[number];
export const teamRolleSchema = z.enum(teamRolleValues);

export const ISO_NORMEN = [
	{ id: 'iso9001', label: 'ISO 9001:2015' },
	{ id: 'iso14001', label: 'ISO 14001:2015' },
	{ id: 'iso45001', label: 'ISO 45001:2018' },
	{ id: 'iso50001', label: 'ISO 50001:2018' },
	{ id: 'iso27001', label: 'ISO/IEC 27001:2022' },
	{ id: 'andere', label: 'Andere (Freitext)' }
] as const;

// ============================================================
// Sub-schemas
// ============================================================

export const standortSchema = z.object({
	id: z.string(),
	name: z.string()
});
export type Standort = z.infer<typeof standortSchema>;

export const normAuswahlSchema = z.object({
	ausgewaehlteNormen: z.array(z.string()),
	freitext: z.string(),
	suchbegriff: z.string()
});
export type NormAuswahl = z.infer<typeof normAuswahlSchema>;

export const auditplanGrunddatenSchema = z.object({
	auftraggeber: z.string(),
	standorte: z.array(standortSchema),
	geltungsbereich: z.string(),
	normgrundlage: normAuswahlSchema
});
export type AuditplanGrunddaten = z.infer<typeof auditplanGrunddatenSchema>;

export const auditplanDetailsSchema = z.object({
	auditart: z.array(z.string()),
	auditartFreitext: z.string(),
	beauftragter: z.string(),
	auditziel: z.string(),
	auditzielEditierbar: z.boolean(),
	auditsprachen: z.array(auditSpracheSchema)
});
export type AuditplanDetails = z.infer<typeof auditplanDetailsSchema>;

export const auditTeamMitgliedSchema = z.object({
	id: z.string(),
	rolle: teamRolleSchema,
	name: z.string(),
	istExtern: z.boolean(),
	firmenname: z.string()
});
export type AuditTeamMitglied = z.infer<typeof auditTeamMitgliedSchema>;

export const betriebsorganisationSchema = z.object({
	schichtsystem: schichtsystemSchema,
	schichtsystemFreitext: z.string(),
	schichtuebergaben: z.string(),
	bemerkung: z.string()
});
export type Betriebsorganisation = z.infer<typeof betriebsorganisationSchema>;

export const auditmethodeBlockSchema = z.object({
	methode: auditmethodeSchema,
	iktTechnik: z.string(),
	iktTestdatum: z.string(),
	testLetztesAudit: z.boolean(),
	gastgeber: z.string()
});
export type AuditmethodeBlock = z.infer<typeof auditmethodeBlockSchema>;

export const revisionSchema = z.object({
	id: z.string(),
	nummer: z.string(),
	datum: z.string(),
	beschreibung: z.string()
});
export type Revision = z.infer<typeof revisionSchema>;

export const revisionMetaSchema = z.object({
	ortDatum: z.string(),
	aenderungWaehrendAudit: z.string(),
	kommentare: z.string()
});
export type RevisionMeta = z.infer<typeof revisionMetaSchema>;

export const auditzeitZeileSchema = z.object({
	id: z.string(),
	startzeit: z.string(),
	endzeit: z.string(),
	aktivitaet: z.string(),
	stunden: z.number()
});
export type AuditzeitZeile = z.infer<typeof auditzeitZeileSchema>;

export const auditzeitenTabelleSchema = z.object({
	id: z.string(),
	auditorId: z.string(),
	auditorName: z.string(),
	standortId: z.string(),
	standortName: z.string(),
	zeilen: z.array(auditzeitZeileSchema),
	gesamtStunden: z.number()
});
export type AuditzeitenTabelle = z.infer<typeof auditzeitenTabelleSchema>;

export const auditBlockNotizenSchema = z.object({
	beschreibung: z.string(),
	vorstellung: z.string(),
	allgemein: z.string(),
	notizen: z.string(),
	dokumente: z.string(),
	zusammenfassung: z.string()
});
export type AuditBlockNotizen = z.infer<typeof auditBlockNotizenSchema>;

export const manuellBearbeitetSchema = z.object({
	beschreibung: z.boolean(),
	zusammenfassung: z.boolean(),
	thema: z.boolean(),
	normkapitel: z.boolean()
});
export type ManuellBearbeitet = z.infer<typeof manuellBearbeitetSchema>;

export const auditBlockZeileSchema = z.object({
	id: z.string(),
	blockId: z.string(),
	datum: z.string(),
	uhrzeitVon: z.string(),
	uhrzeitBis: z.string(),
	istRemote: z.boolean(),
	organisationseinheit: z.string(),
	normkapitel: z.array(z.string()),
	thema: z.array(z.string()),
	elementProzess: z.array(z.string()),
	auditor: z.string(),
	gespraechspartner: z.string(),
	datumToggle: z.boolean(),
	uhrzeitToggle: z.boolean(),
	remoteToggle: z.boolean(),
	notizen: auditBlockNotizenSchema,
	manuellBearbeitet: manuellBearbeitetSchema
});
export type AuditBlockZeile = z.infer<typeof auditBlockZeileSchema>;

export const auditBlockSchema = z.object({
	id: z.string(),
	zeilen: z.array(auditBlockZeileSchema),
	position: z.number()
});
export type AuditBlock = z.infer<typeof auditBlockSchema>;

export const hinweiseVerteilerSchema = z.object({
	infoText: z.string(),
	verteiler: z.string(),
	verteilungOptionen: z.object({
		auditteam: z.boolean(),
		geschaeftsfuehrung: z.boolean(),
		fachabteilungen: z.boolean(),
		extern: z.boolean()
	})
});
export type HinweiseVerteiler = z.infer<typeof hinweiseVerteilerSchema>;

// ============================================================
// Main AuditplanDaten schema
// ============================================================

export const auditplanDatenSchema = z.object({
	zertifikatsnummern: z.array(z.string()),
	logoBase64: z.string().nullable(),
	logoDateiname: z.string().nullable(),
	grunddaten: auditplanGrunddatenSchema,
	auditdetails: auditplanDetailsSchema,
	auditTeam: z.array(auditTeamMitgliedSchema),
	betriebsorganisation: betriebsorganisationSchema,
	auditmethode: auditmethodeBlockSchema,
	revisionen: z.array(revisionSchema),
	revisionMeta: revisionMetaSchema,
	auditzeiten: z.array(auditzeitenTabelleSchema),
	auditBloecke: z.array(auditBlockSchema),
	hinweiseVerteiler: hinweiseVerteilerSchema
});
export type AuditplanDaten = z.infer<typeof auditplanDatenSchema>;

// ============================================================
// Factory functions for default values
// ============================================================

export function createDefaultManuellBearbeitet(): ManuellBearbeitet {
	return {
		beschreibung: false,
		zusammenfassung: false,
		thema: false,
		normkapitel: false
	};
}

export function createDefaultBlockNotizen(): AuditBlockNotizen {
	return {
		beschreibung: '',
		vorstellung: '',
		allgemein: '',
		notizen: '',
		dokumente: '',
		zusammenfassung: ''
	};
}

export function createDefaultBlockZeile(blockId: string, id: string): AuditBlockZeile {
	return {
		id,
		blockId,
		datum: '',
		uhrzeitVon: '',
		uhrzeitBis: '',
		istRemote: false,
		organisationseinheit: '',
		normkapitel: [],
		thema: [],
		elementProzess: [],
		auditor: '',
		gespraechspartner: '',
		datumToggle: true,
		uhrzeitToggle: true,
		remoteToggle: true,
		notizen: createDefaultBlockNotizen(),
		manuellBearbeitet: createDefaultManuellBearbeitet()
	};
}

export function createDefaultAuditBlock(id: string, position: number): AuditBlock {
	return {
		id,
		zeilen: [createDefaultBlockZeile(id, crypto.randomUUID())],
		position
	};
}

export function createDefaultAuditplanDaten(): AuditplanDaten {
	return {
		zertifikatsnummern: [],
		logoBase64: null,
		logoDateiname: null,
		grunddaten: {
			auftraggeber: '',
			standorte: [{ id: crypto.randomUUID(), name: '' }],
			geltungsbereich: '',
			normgrundlage: {
				ausgewaehlteNormen: [],
				freitext: '',
				suchbegriff: ''
			}
		},
		auditdetails: {
			auditart: [],
			auditartFreitext: '',
			beauftragter: '',
			auditziel: '',
			auditzielEditierbar: false,
			auditsprachen: []
		},
		auditTeam: [],
		betriebsorganisation: {
			schichtsystem: 'single_shift',
			schichtsystemFreitext: '',
			schichtuebergaben: '',
			bemerkung: ''
		},
		auditmethode: {
			methode: 'on_site',
			iktTechnik: '',
			iktTestdatum: '',
			testLetztesAudit: false,
			gastgeber: ''
		},
		revisionen: [],
		revisionMeta: {
			ortDatum: '',
			aenderungWaehrendAudit: '',
			kommentare: ''
		},
		auditzeiten: [],
		auditBloecke: [],
		hinweiseVerteiler: {
			infoText: '',
			verteiler: '',
			verteilungOptionen: {
				auditteam: false,
				geschaeftsfuehrung: false,
				fachabteilungen: false,
				extern: false
			}
		}
	};
}
