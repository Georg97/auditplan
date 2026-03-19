import { z } from 'zod';
import { auditStatusSchema, auditTypeSchema, auditFormatSchema } from './common';

export const auditSchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	auditName: z.string().min(3),
	auditType: auditTypeSchema,
	startDate: z.string().min(1),
	endDate: z.string().nullable().optional(),
	startTime: z.string().nullable().optional(),
	endTime: z.string().nullable().optional(),
	company: z.string().min(1),
	department: z.string().min(1),
	location: z.string().nullable().optional(),
	format: auditFormatSchema.nullable().optional(),
	norms: z.string().nullable().optional(),
	scope: z.string().nullable().optional(),
	leadAuditorId: z.string().min(1),
	auditTeam: z.string().nullable().optional(),
	contactPerson: z.string().nullable().optional(),
	contactEmail: z.string().email().nullable().optional(),
	notes: z.string().nullable().optional(),
	documentLinks: z.string().nullable().optional(),
	status: auditStatusSchema.default('planned'),
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

/** Schema for audit file attachments */
export const auditFileSchema = z.object({
	id: z.string(),
	auditId: z.string(),
	fileName: z.string().min(1),
	fileType: z.string().min(1),
	fileSize: z.number().int().min(0).max(5_242_880),
	fileContent: z.string(),
	createdAt: z.date()
});

export type AuditFile = z.infer<typeof auditFileSchema>;

export const auditFileCreateSchema = auditFileSchema.omit({
	id: true,
	createdAt: true
});

export type AuditFileCreate = z.infer<typeof auditFileCreateSchema>;
