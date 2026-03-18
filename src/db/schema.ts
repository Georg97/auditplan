// drizzle schema
import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ─── Auth tables (better-auth managed) ───────────────────────────────

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
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
		accessTokenExpiresAt: integer('access_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
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
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

// ─── Organization tables (better-auth organization plugin) ───────────

export const organization = sqliteTable('organization', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').unique(),
	logo: text('logo'),
	metadata: text('metadata'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
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
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('member_organizationId_idx').on(table.organizationId), index('member_userId_idx').on(table.userId)]
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
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('invitation_organizationId_idx').on(table.organizationId)]
);

// ─── Domain tables (all MUST have organizationId) ────────────────────

export const auditors = sqliteTable(
	'auditors',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
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
		iso9001: integer('iso_9001', { mode: 'boolean' }).default(false).notNull(),
		iso14001: integer('iso_14001', { mode: 'boolean' }).default(false).notNull(),
		iso45001: integer('iso_45001', { mode: 'boolean' }).default(false).notNull(),
		iso50001: integer('iso_50001', { mode: 'boolean' }).default(false).notNull(),
		iso27001: integer('iso_27001', { mode: 'boolean' }).default(false).notNull(),
		certifications: text('certifications'),
		languages: text('languages'),
		experienceYears: integer('experience_years'),
		dailyRate: integer('daily_rate'),
		availability: text('availability'),
		notes: text('notes'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('auditors_organizationId_idx').on(table.organizationId)]
);

export const audits = sqliteTable(
	'audits',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
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
		normen: text('normen'),
		geltungsbereich: text('geltungsbereich'),
		leitenderAuditorId: text('leitender_auditor_id').references(() => auditors.id),
		auditTeam: text('audit_team'),
		ansprechpartner: text('ansprechpartner'),
		kontaktEmail: text('kontakt_email'),
		notizen: text('notizen'),
		dokumenteLinks: text('dokumente_links'),
		status: text('status').notNull().default('planned'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('audits_organizationId_idx').on(table.organizationId), index('audits_status_idx').on(table.status)]
);

export const auditDateien = sqliteTable(
	'audit_dateien',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		auditId: text('audit_id')
			.notNull()
			.references(() => audits.id, { onDelete: 'cascade' }),
		dateiName: text('datei_name').notNull(),
		dateiTyp: text('datei_typ').notNull(),
		dateiGroesse: integer('datei_groesse').notNull(),
		dateiInhalt: text('datei_inhalt').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('auditDateien_auditId_idx').on(table.auditId)]
);

export const calendarEntries = sqliteTable(
	'calendar_entries',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		datum: text('datum').notNull(),
		titel: text('titel').notNull(),
		startzeit: text('startzeit'),
		endzeit: text('endzeit'),
		unternehmen: text('unternehmen'),
		auditorId: text('auditor_id').references(() => auditors.id),
		beschreibung: text('beschreibung'),
		auditId: text('audit_id').references(() => audits.id),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('calendarEntries_organizationId_idx').on(table.organizationId), index('calendarEntries_datum_idx').on(table.datum)]
);

export const actions = sqliteTable(
	'actions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		feststellungsbeschreibung: text('feststellungsbeschreibung').notNull(),
		feststellungsart: text('feststellungsart').notNull(),
		geplanterMassnahme: text('geplanter_massnahme').notNull(),
		status: text('status').notNull().default('open'),
		verantwortlicher: text('verantwortlicher'),
		prioritaet: text('prioritaet'),
		frist: text('frist').notNull(),
		abschlussdatum: text('abschlussdatum'),
		norm: text('norm'),
		nachweiseNotizen: text('nachweise_notizen'),
		audittyp: text('audittyp'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('actions_organizationId_idx').on(table.organizationId)]
);

export const savedPlans = sqliteTable(
	'saved_plans',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		daten: text('daten').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('savedPlans_organizationId_idx').on(table.organizationId)]
);

export const savedNotes = sqliteTable(
	'saved_notes',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		daten: text('daten').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('savedNotes_organizationId_idx').on(table.organizationId)]
);

export const savedAuditQuestions = sqliteTable(
	'saved_audit_questions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		formData: text('form_data').notNull(),
		questions: text('questions').notNull(),
		documents: text('documents').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('savedAuditQuestions_organizationId_idx').on(table.organizationId)]
);

export const settings = sqliteTable(
	'settings',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull().unique(),
		data: text('data').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('settings_organizationId_idx').on(table.organizationId)]
);

// ─── Relations ───────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	members: many(member)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member)
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	})
}));

export const auditorsRelations = relations(auditors, ({ many }) => ({
	audits: many(audits),
	calendarEntries: many(calendarEntries)
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
	leitenderAuditor: one(auditors, {
		fields: [audits.leitenderAuditorId],
		references: [auditors.id]
	}),
	dateien: many(auditDateien),
	calendarEntries: many(calendarEntries)
}));

export const auditDateienRelations = relations(auditDateien, ({ one }) => ({
	audit: one(audits, {
		fields: [auditDateien.auditId],
		references: [audits.id]
	})
}));

export const calendarEntriesRelations = relations(calendarEntries, ({ one }) => ({
	auditor: one(auditors, {
		fields: [calendarEntries.auditorId],
		references: [auditors.id]
	}),
	audit: one(audits, {
		fields: [calendarEntries.auditId],
		references: [audits.id]
	})
}));
