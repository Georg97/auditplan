import { z } from 'zod';
import { auditStatusSchema, auditTypeSchema } from './common';

export const auditSchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	title: z.string().min(1),
	description: z.string().nullable().optional(),
	status: auditStatusSchema.default('planned'),
	auditType: auditTypeSchema.nullable().optional(),
	norm: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	department: z.string().nullable().optional(),
	startDate: z.string().nullable().optional(),
	endDate: z.string().nullable().optional(),
	leadAuditorId: z.string().nullable().optional(),
	coAuditorId: z.string().nullable().optional(),
	scope: z.string().nullable().optional(),
	findings: z.string().nullable().optional(),
	attachments: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type Audit = z.infer<typeof auditSchema>;

export const auditCreateSchema = auditSchema.omit({
	id: true,
	organizationId: true,
	createdAt: true,
	updatedAt: true
});

export type AuditCreate = z.infer<typeof auditCreateSchema>;

export const auditUpdateSchema = auditCreateSchema.partial();

export type AuditUpdate = z.infer<typeof auditUpdateSchema>;
