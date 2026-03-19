// drizzle schema
import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ── Helper ──────────────────────────────────────────────────────────
const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp_ms' as const })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' as const })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
};

// ── Auth tables (better-auth managed) ───────────────────────────────
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	...timestamps
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamps.createdAt,
		updatedAt: timestamps.updatedAt,
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		activeOrganizationId: text('active_organization_id')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
		scope: text('scope'),
		password: text('password'),
		...timestamps
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		...timestamps
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

// ── Organization tables (better-auth organization plugin) ───────────
export const organization = sqliteTable('organization', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').unique(),
	logo: text('logo'),
	metadata: text('metadata'),
	...timestamps
});

export const member = sqliteTable(
	'member',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		role: text('role').notNull().default('member'),
		...timestamps
	},
	(table) => [index('member_orgId_idx').on(table.organizationId)]
);

export const invitation = sqliteTable(
	'invitation',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		email: text('email').notNull(),
		role: text('role'),
		status: text('status').notNull().default('pending'),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		inviterId: text('inviter_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		...timestamps
	},
	(table) => [index('invitation_orgId_idx').on(table.organizationId)]
);

// ── Auth relations ──────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	members: many(member)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member)
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, { fields: [member.userId], references: [user.id] })
}));

// ══════════════════════════════════════════════════════════════════════
// APPLICATION TABLES — all have organizationId for multi-tenant isolation
// ══════════════════════════════════════════════════════════════════════

// ── Auditors ────────────────────────────────────────────────────────
export const auditors = sqliteTable(
	'auditors',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		title: text('title'),
		email: text('email').notNull(),
		phone: text('phone'),
		mobile: text('mobile'),
		company: text('company'),
		street: text('street'),
		zipCode: text('zip_code'),
		city: text('city'),
		country: text('country').default('Deutschland'),
		iso9001: integer('iso_9001', { mode: 'boolean' }).default(false),
		iso14001: integer('iso_14001', { mode: 'boolean' }).default(false),
		iso45001: integer('iso_45001', { mode: 'boolean' }).default(false),
		iso50001: integer('iso_50001', { mode: 'boolean' }).default(false),
		iso27001: integer('iso_27001', { mode: 'boolean' }).default(false),
		certifications: text('certifications'),
		languages: text('languages'),
		experienceYears: integer('experience_years'),
		dailyRate: integer('daily_rate'),
		availability: text('availability'),
		notes: text('notes'),
		...timestamps
	},
	(table) => [index('auditors_orgId_idx').on(table.organizationId)]
);

// ── Audits ──────────────────────────────────────────────────────────
export const audits = sqliteTable(
	'audits',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		auditName: text('audit_name').notNull(),
		auditTyp: text('audit_typ').notNull(),
		startDatum: text('start_datum').notNull(),
		endDatum: text('end_datum'),
		uhrzeitVon: text('uhrzeit_von'),
		uhrzeitBis: text('uhrzeit_bis'),
		unternehmen: text('unternehmen').notNull(),
		abteilung: text('abteilung').notNull(),
		standort: text('standort'),
		format: text('format'),
		geltungsbereich: text('geltungsbereich'),
		leitenderAuditorId: text('leitender_auditor_id').references(() => auditors.id),
		ansprechpartner: text('ansprechpartner'),
		kontaktEmail: text('kontakt_email'),
		notizen: text('notizen'),
		dokumenteLinks: text('dokumente_links'),
		status: text('status').notNull().default('planned'),
		...timestamps
	},
	(table) => [index('audits_orgId_idx').on(table.organizationId), index('audits_auditorId_idx').on(table.leitenderAuditorId)]
);

export const auditNormen = sqliteTable('audit_normen', {
	auditId: text('audit_id')
		.notNull()
		.references(() => audits.id, { onDelete: 'cascade' }),
	normId: text('norm_id').notNull()
});

export const auditTeamMembers = sqliteTable('audit_team_members', {
	auditId: text('audit_id')
		.notNull()
		.references(() => audits.id, { onDelete: 'cascade' }),
	auditorId: text('auditor_id')
		.notNull()
		.references(() => auditors.id),
	role: text('role')
});

export const auditDateien = sqliteTable(
	'audit_dateien',
	{
		id: text('id').primaryKey(),
		auditId: text('audit_id')
			.notNull()
			.references(() => audits.id, { onDelete: 'cascade' }),
		dateiName: text('datei_name'),
		dateiTyp: text('datei_typ'),
		dateiGroesse: integer('datei_groesse'),
		storageKey: text('storage_key'),
		createdAt: timestamps.createdAt
	},
	(table) => [index('auditDateien_auditId_idx').on(table.auditId)]
);

// ── Calendar ────────────────────────────────────────────────────────
export const calendarEntries = sqliteTable(
	'calendar_entries',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		datum: text('datum').notNull(),
		titel: text('titel').notNull(),
		startzeit: text('startzeit'),
		endzeit: text('endzeit'),
		unternehmen: text('unternehmen'),
		auditorId: text('auditor_id').references(() => auditors.id),
		beschreibung: text('beschreibung'),
		auditId: text('audit_id').references(() => audits.id),
		...timestamps
	},
	(table) => [index('calendar_orgId_idx').on(table.organizationId), index('calendar_datum_idx').on(table.datum)]
);

// ── Actions (Maßnahmenplan) ─────────────────────────────────────────
export const actions = sqliteTable(
	'actions',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		auditId: text('audit_id').references(() => audits.id),
		description: text('description'),
		findingType: text('finding_type'),
		plannedAction: text('planned_action'),
		status: text('status').notNull().default('open'),
		responsible: text('responsible'),
		priority: text('priority'),
		dueDate: text('due_date'),
		completionDate: text('completion_date'),
		norm: text('norm'),
		evidenceNotes: text('evidence_notes'),
		auditType: text('audit_type'),
		...timestamps
	},
	(table) => [index('actions_orgId_idx').on(table.organizationId), index('actions_status_idx').on(table.status)]
);

// ── Audit Plans ─────────────────────────────────────────────────────
export const auditPlans = sqliteTable(
	'audit_plans',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		logoBase64: text('logo_base64'),
		logoDateiname: text('logo_dateiname'),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		updatedBy: text('updated_by')
			.notNull()
			.references(() => user.id),
		...timestamps
	},
	(table) => [index('auditPlans_orgId_idx').on(table.organizationId)]
);

export const auditPlanGrunddaten = sqliteTable('audit_plan_grunddaten', {
	id: text('id').primaryKey(),
	auditPlanId: text('audit_plan_id')
		.notNull()
		.references(() => auditPlans.id, { onDelete: 'cascade' }),
	auftraggeber: text('auftraggeber'),
	geltungsbereich: text('geltungsbereich'),
	beauftragter: text('beauftragter'),
	auditziel: text('auditziel'),
	auditzielEditierbar: integer('auditziel_editierbar', { mode: 'boolean' }).default(false),
	auditartFreitext: text('auditart_freitext'),
	schichtsystem: text('schichtsystem'),
	schichtsystemFreitext: text('schichtsystem_freitext'),
	schichtuebergaben: text('schichtuebergaben'),
	bemerkungBetrieb: text('bemerkung_betrieb'),
	auditmethode: text('auditmethode'),
	iktTechnik: text('ikt_technik'),
	iktTestdatum: text('ikt_testdatum'),
	testLetztesAudit: integer('test_letztes_audit', { mode: 'boolean' }).default(false),
	gastgeber: text('gastgeber'),
	revisionOrtDatum: text('revision_ort_datum'),
	revisionAenderungWaehrendAudit: text('revision_aenderung_waehrend_audit'),
	revisionKommentare: text('revision_kommentare'),
	hinweiseInfoText: text('hinweise_info_text'),
	verteiler: text('verteiler'),
	verteilungAuditteam: integer('verteilung_auditteam', { mode: 'boolean' }).default(true),
	verteilungGeschaeftsfuehrung: integer('verteilung_geschaeftsfuehrung', { mode: 'boolean' }).default(true),
	verteilungFachabteilungen: integer('verteilung_fachabteilungen', { mode: 'boolean' }).default(false),
	verteilungExtern: integer('verteilung_extern', { mode: 'boolean' }).default(false)
});

export const auditPlanNorms = sqliteTable(
	'audit_plan_norms',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		normId: text('norm_id').notNull(),
		freitext: text('freitext'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apNorms_planId_idx').on(table.auditPlanId)]
);

export const auditPlanAuditarten = sqliteTable(
	'audit_plan_auditarten',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		auditartId: text('auditart_id').notNull(),
		isCustom: integer('is_custom', { mode: 'boolean' }).default(false),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apAuditarten_planId_idx').on(table.auditPlanId)]
);

export const auditPlanAuditsprachen = sqliteTable(
	'audit_plan_auditsprachen',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		sprache: text('sprache').notNull(),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apSprachen_planId_idx').on(table.auditPlanId)]
);

export const auditPlanStandorte = sqliteTable(
	'audit_plan_standorte',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apStandorte_planId_idx').on(table.auditPlanId)]
);

export const auditPlanRevisionen = sqliteTable(
	'audit_plan_revisionen',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		nummer: text('nummer'),
		datum: text('datum'),
		beschreibung: text('beschreibung'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apRevisionen_planId_idx').on(table.auditPlanId)]
);

export const auditPlanTeamMitglieder = sqliteTable(
	'audit_plan_team_mitglieder',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		rolle: text('rolle').notNull(),
		auditorId: text('auditor_id').references(() => auditors.id),
		externalName: text('external_name'),
		externalCompany: text('external_company'),
		istExtern: integer('ist_extern', { mode: 'boolean' }).default(false),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apTeam_planId_idx').on(table.auditPlanId)]
);

export const auditPlanZnNummern = sqliteTable(
	'audit_plan_zn_nummern',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		value: text('value'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apZn_planId_idx').on(table.auditPlanId)]
);

// ── Audit Plan Blocks ───────────────────────────────────────────────
export const auditPlanBlocks = sqliteTable(
	'audit_plan_blocks',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apBlocks_planId_idx').on(table.auditPlanId)]
);

export const auditPlanBlockZeilen = sqliteTable(
	'audit_plan_block_zeilen',
	{
		id: text('id').primaryKey(),
		blockId: text('block_id')
			.notNull()
			.references(() => auditPlanBlocks.id, { onDelete: 'cascade' }),
		datum: text('datum'),
		uhrzeitVon: text('uhrzeit_von'),
		uhrzeitBis: text('uhrzeit_bis'),
		istRemote: integer('ist_remote', { mode: 'boolean' }).default(false),
		organisationseinheit: text('organisationseinheit'),
		auditor: text('auditor'),
		gespraechspartner: text('gespraechspartner'),
		manuellBearbeitetBeschreibung: integer('manuell_bearbeitet_beschreibung', {
			mode: 'boolean'
		}).default(false),
		manuellBearbeitetZusammenfassung: integer('manuell_bearbeitet_zusammenfassung', {
			mode: 'boolean'
		}).default(false),
		manuellBearbeitetThema: integer('manuell_bearbeitet_thema', { mode: 'boolean' }).default(false),
		manuellBearbeitetNormkapitel: integer('manuell_bearbeitet_normkapitel', {
			mode: 'boolean'
		}).default(false),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apBlockZeilen_blockId_idx').on(table.blockId)]
);

export const auditPlanBlockZeilenNotizen = sqliteTable('audit_plan_block_zeilen_notizen', {
	id: text('id').primaryKey(),
	zeileId: text('zeile_id')
		.notNull()
		.unique()
		.references(() => auditPlanBlockZeilen.id, { onDelete: 'cascade' }),
	beschreibung: text('beschreibung'),
	vorstellung: text('vorstellung'),
	allgemein: text('allgemein'),
	notizen: text('notizen'),
	dokumente: text('dokumente'),
	zusammenfassung: text('zusammenfassung')
});

export const auditPlanBlockZeilenToggles = sqliteTable('audit_plan_block_zeilen_toggles', {
	id: text('id').primaryKey(),
	zeileId: text('zeile_id')
		.notNull()
		.unique()
		.references(() => auditPlanBlockZeilen.id, { onDelete: 'cascade' }),
	datumToggle: integer('datum_toggle', { mode: 'boolean' }).default(true),
	uhrzeitToggle: integer('uhrzeit_toggle', { mode: 'boolean' }).default(true),
	remoteToggle: integer('remote_toggle', { mode: 'boolean' }).default(true)
});

export const auditPlanBlockZeilenNormkapitel = sqliteTable(
	'audit_plan_block_zeilen_normkapitel',
	{
		id: text('id').primaryKey(),
		zeileId: text('zeile_id')
			.notNull()
			.references(() => auditPlanBlockZeilen.id, { onDelete: 'cascade' }),
		normkapitelId: text('normkapitel_id'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apBlockNormkapitel_zeileId_idx').on(table.zeileId)]
);

export const auditPlanBlockZeilenThemen = sqliteTable(
	'audit_plan_block_zeilen_themen',
	{
		id: text('id').primaryKey(),
		zeileId: text('zeile_id')
			.notNull()
			.references(() => auditPlanBlockZeilen.id, { onDelete: 'cascade' }),
		themaId: text('thema_id'),
		customText: text('custom_text'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apBlockThemen_zeileId_idx').on(table.zeileId)]
);

export const auditPlanBlockZeilenElemente = sqliteTable(
	'audit_plan_block_zeilen_elemente',
	{
		id: text('id').primaryKey(),
		zeileId: text('zeile_id')
			.notNull()
			.references(() => auditPlanBlockZeilen.id, { onDelete: 'cascade' }),
		value: text('value'),
		isCustom: integer('is_custom', { mode: 'boolean' }).default(false),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apBlockElemente_zeileId_idx').on(table.zeileId)]
);

// ── Audit Plan Auditzeiten ──────────────────────────────────────────
export const auditPlanAuditzeiten = sqliteTable(
	'audit_plan_auditzeiten',
	{
		id: text('id').primaryKey(),
		auditPlanId: text('audit_plan_id')
			.notNull()
			.references(() => auditPlans.id, { onDelete: 'cascade' }),
		auditor: text('auditor').notNull().default(''),
		standort: text('standort').notNull().default(''),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apAuditzeiten_planId_idx').on(table.auditPlanId)]
);

export const auditPlanAuditzeitZeilen = sqliteTable(
	'audit_plan_auditzeit_zeilen',
	{
		id: text('id').primaryKey(),
		auditzeitId: text('auditzeit_id')
			.notNull()
			.references(() => auditPlanAuditzeiten.id, { onDelete: 'cascade' }),
		startzeit: text('startzeit').notNull().default(''),
		endzeit: text('endzeit').notNull().default(''),
		aktivitaet: text('aktivitaet').notNull().default(''),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('apAuditzeitZeilen_auditzeitId_idx').on(table.auditzeitId)]
);

// ── Audit Notes ─────────────────────────────────────────────────────
export const auditNotes = sqliteTable(
	'audit_notes',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		name: text('name'),
		firma: text('firma'),
		standards: text('standards'),
		zertifikat: text('zertifikat'),
		auditart: text('auditart'),
		datumVon: text('datum_von'),
		datumBis: text('datum_bis'),
		standort: text('standort'),
		auditor: text('auditor'),
		seiteVon: text('seite_von'),
		seiteBis: text('seite_bis'),
		logoBase64: text('logo_base64'),
		createdBy: text('created_by')
			.notNull()
			.references(() => user.id),
		updatedBy: text('updated_by')
			.notNull()
			.references(() => user.id),
		...timestamps
	},
	(table) => [index('auditNotes_orgId_idx').on(table.organizationId)]
);

export const notizenBlocks = sqliteTable(
	'notizen_blocks',
	{
		id: text('id').primaryKey(),
		auditNotesId: text('audit_notes_id')
			.notNull()
			.references(() => auditNotes.id, { onDelete: 'cascade' }),
		position: integer('position').notNull().default(0),
		datum: text('datum'),
		uhrzeitVon: text('uhrzeit_von'),
		uhrzeitBis: text('uhrzeit_bis'),
		istRemote: integer('ist_remote', { mode: 'boolean' }).default(false),
		organisationseinheit: text('organisationseinheit'),
		auditor: text('auditor'),
		gespraechspartner: text('gespraechspartner'),
		beschreibung: text('beschreibung'),
		vorstellung: text('vorstellung'),
		allgemein: text('allgemein'),
		notizen: text('notizen'),
		dokumente: text('dokumente'),
		zusammenfassung: text('zusammenfassung'),
		manuellBeschreibung: integer('manuell_beschreibung', { mode: 'boolean' }).default(false),
		manuellZusammenfassung: integer('manuell_zusammenfassung', { mode: 'boolean' }).default(false),
		manuellThema: integer('manuell_thema', { mode: 'boolean' }).default(false),
		manuellNormkapitel: integer('manuell_normkapitel', { mode: 'boolean' }).default(false)
	},
	(table) => [index('notizenBlocks_notesId_idx').on(table.auditNotesId)]
);

export const notizenBlockToggles = sqliteTable('notizen_block_toggles', {
	id: text('id').primaryKey(),
	notizenBlockId: text('notizen_block_id')
		.notNull()
		.unique()
		.references(() => notizenBlocks.id, { onDelete: 'cascade' }),
	datum: integer('datum', { mode: 'boolean' }).default(true),
	uhrzeit: integer('uhrzeit', { mode: 'boolean' }).default(true),
	remote: integer('remote', { mode: 'boolean' }).default(true),
	dokumenteAnzeigen: integer('dokumente_anzeigen', { mode: 'boolean' }).default(true),
	bewertungAnzeigen: integer('bewertung_anzeigen', { mode: 'boolean' }).default(true),
	notizenAnzeigen: integer('notizen_anzeigen', { mode: 'boolean' }).default(true)
});

export const notizenBlockQhseDokumente = sqliteTable(
	'notizen_block_qhse_dokumente',
	{
		id: text('id').primaryKey(),
		notizenBlockId: text('notizen_block_id')
			.notNull()
			.references(() => notizenBlocks.id, { onDelete: 'cascade' }),
		position: integer('position').notNull().default(0),
		name: text('name'),
		datum: text('datum'),
		notizen: text('notizen')
	},
	(table) => [index('notizenQhse_blockId_idx').on(table.notizenBlockId)]
);

export const notizenBlockBewertungen = sqliteTable(
	'notizen_block_bewertungen',
	{
		id: text('id').primaryKey(),
		notizenBlockId: text('notizen_block_id')
			.notNull()
			.references(() => notizenBlocks.id, { onDelete: 'cascade' }),
		position: integer('position').notNull().default(0),
		typ: text('typ'),
		beschreibung: text('beschreibung')
	},
	(table) => [index('notizenBewertung_blockId_idx').on(table.notizenBlockId)]
);

export const notizenBlockBewertungKapitel = sqliteTable(
	'notizen_block_bewertung_kapitel',
	{
		id: text('id').primaryKey(),
		bewertungId: text('bewertung_id')
			.notNull()
			.references(() => notizenBlockBewertungen.id, { onDelete: 'cascade' }),
		kapitelId: text('kapitel_id'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('notizenBewertungKap_bewId_idx').on(table.bewertungId)]
);

export const notizenBlockNormkapitel = sqliteTable(
	'notizen_block_normkapitel',
	{
		id: text('id').primaryKey(),
		notizenBlockId: text('notizen_block_id')
			.notNull()
			.references(() => notizenBlocks.id, { onDelete: 'cascade' }),
		normkapitelId: text('normkapitel_id'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('notizenNormkap_blockId_idx').on(table.notizenBlockId)]
);

// ── Audit Reports ───────────────────────────────────────────────────
export const auditReports = sqliteTable(
	'audit_reports',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		auditId: text('audit_id').references(() => audits.id),
		feststellungen: text('feststellungen'),
		empfehlungen: text('empfehlungen'),
		fazit: text('fazit'),
		generatedHtml: text('generated_html'),
		...timestamps
	},
	(table) => [index('auditReports_orgId_idx').on(table.organizationId)]
);

// ── Saved Audit Questions ───────────────────────────────────────────
export const savedAuditQuestions = sqliteTable(
	'saved_audit_questions',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		firmenname: text('firmenname'),
		auditdatum: text('auditdatum'),
		uhrzeitVon: text('uhrzeit_von'),
		uhrzeitBis: text('uhrzeit_bis'),
		abteilung: text('abteilung'),
		norm: text('norm'),
		normkapitel: text('normkapitel'),
		...timestamps
	},
	(table) => [index('savedQuestions_orgId_idx').on(table.organizationId)]
);

export const savedQuestionEntries = sqliteTable(
	'saved_question_entries',
	{
		id: text('id').primaryKey(),
		savedAuditQuestionsId: text('saved_audit_questions_id')
			.notNull()
			.references(() => savedAuditQuestions.id, { onDelete: 'cascade' }),
		frage: text('frage'),
		normRef: text('norm_ref'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('savedQEntries_questionsId_idx').on(table.savedAuditQuestionsId)]
);

export const savedQuestionDocuments = sqliteTable(
	'saved_question_documents',
	{
		id: text('id').primaryKey(),
		savedAuditQuestionsId: text('saved_audit_questions_id')
			.notNull()
			.references(() => savedAuditQuestions.id, { onDelete: 'cascade' }),
		name: text('name'),
		beschreibung: text('beschreibung'),
		position: integer('position').notNull().default(0)
	},
	(table) => [index('savedQDocs_questionsId_idx').on(table.savedAuditQuestionsId)]
);

// ── Settings ────────────────────────────────────────────────────────
export const settings = sqliteTable(
	'settings',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id').notNull(),
		data: text('data'),
		...timestamps
	},
	(table) => [uniqueIndex('settings_orgId_unique').on(table.organizationId)]
);
