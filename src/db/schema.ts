// drizzle schema
import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ============================================================
// Auth tables (managed by better-auth)
// ============================================================

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

// ============================================================
// Organization tables (managed by better-auth organization plugin)
// ============================================================

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
	(table) => [index('member_orgId_idx').on(table.organizationId), index('member_userId_idx').on(table.userId)]
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
	(table) => [index('invitation_orgId_idx').on(table.organizationId)]
);

// ============================================================
// Domain tables — ALL have organizationId for org-based tenancy
// ============================================================

export const auditors = sqliteTable(
	'auditors',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		email: text('email').notNull(),
		phone: text('phone'),
		mobile: text('mobile'),
		company: text('company'),
		role: text('role'),
		street: text('street'),
		zip: text('zip'),
		city: text('city'),
		country: text('country').default('Deutschland'),
		iso9001: integer('iso_9001', { mode: 'boolean' }).default(false),
		iso14001: integer('iso_14001', { mode: 'boolean' }).default(false),
		iso45001: integer('iso_45001', { mode: 'boolean' }).default(false),
		iso27001: integer('iso_27001', { mode: 'boolean' }).default(false),
		iso50001: integer('iso_50001', { mode: 'boolean' }).default(false),
		certifications: text('certifications'),
		languages: text('languages'),
		experienceYears: integer('experience_years'),
		dailyRate: integer('daily_rate'),
		availability: text('availability'),
		availableFrom: text('available_from'),
		availableTo: text('available_to'),
		notes: text('notes'),
		isExternal: integer('is_external', { mode: 'boolean' }).default(false),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('auditors_orgId_idx').on(table.organizationId)]
);

export const audits = sqliteTable(
	'audits',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		title: text('title').notNull(),
		description: text('description'),
		status: text('status').notNull().default('planned'),
		auditType: text('audit_type'),
		norm: text('norm'),
		location: text('location'),
		department: text('department'),
		startDate: text('start_date'),
		endDate: text('end_date'),
		leadAuditorId: text('lead_auditor_id'),
		coAuditorId: text('co_auditor_id'),
		scope: text('scope'),
		findings: text('findings'),
		attachments: text('attachments'),
		notes: text('notes'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('audits_orgId_idx').on(table.organizationId), index('audits_status_idx').on(table.status)]
);

export const calendarEntries = sqliteTable(
	'calendar_entries',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		title: text('title').notNull(),
		description: text('description'),
		date: text('date').notNull(),
		startTime: text('start_time'),
		endTime: text('end_time'),
		allDay: integer('all_day', { mode: 'boolean' }).default(false),
		auditId: text('audit_id'),
		color: text('color'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('calendar_orgId_idx').on(table.organizationId), index('calendar_date_idx').on(table.date)]
);

export const actions = sqliteTable(
	'actions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		auditId: text('audit_id'),
		findingType: text('finding_type').notNull().default('observation'),
		finding: text('finding').notNull(),
		measure: text('measure').notNull(),
		responsible: text('responsible'),
		deadline: text('deadline'),
		status: text('status').notNull().default('open'),
		priority: text('priority').notNull().default('medium'),
		completionDate: text('completion_date'),
		notes: text('notes'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('actions_orgId_idx').on(table.organizationId), index('actions_status_idx').on(table.status)]
);

export const savedPlans = sqliteTable(
	'saved_plans',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		data: text('data').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('saved_plans_orgId_idx').on(table.organizationId)]
);

export const savedNotes = sqliteTable(
	'saved_notes',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		data: text('data').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('saved_notes_orgId_idx').on(table.organizationId)]
);

export const savedQuestions = sqliteTable(
	'saved_questions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizationId: text('organization_id').notNull(),
		name: text('name').notNull(),
		data: text('data').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('saved_questions_orgId_idx').on(table.organizationId)]
);

export const settings = sqliteTable('settings', {
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
});

// ============================================================
// Relations
// ============================================================

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
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

export const auditorsRelations = relations(auditors, ({ many }) => ({
	ledAudits: many(audits, { relationName: 'leadAuditor' }),
	coAudits: many(audits, { relationName: 'coAuditor' })
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
	leadAuditor: one(auditors, {
		fields: [audits.leadAuditorId],
		references: [auditors.id],
		relationName: 'leadAuditor'
	}),
	coAuditor: one(auditors, {
		fields: [audits.coAuditorId],
		references: [auditors.id],
		relationName: 'coAuditor'
	}),
	calendarEntries: many(calendarEntries),
	actions: many(actions)
}));

export const calendarEntriesRelations = relations(calendarEntries, ({ one }) => ({
	audit: one(audits, {
		fields: [calendarEntries.auditId],
		references: [audits.id]
	})
}));

export const actionsRelations = relations(actions, ({ one }) => ({
	audit: one(audits, {
		fields: [actions.auditId],
		references: [audits.id]
	})
}));
