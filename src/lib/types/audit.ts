import { z } from 'zod';

export const AUDIT_TYPES = ['internal', 'external', 'certification', 'surveillance', 'recertification'] as const;
export type AuditTyp = (typeof AUDIT_TYPES)[number];

export const AUDIT_STATUSES = ['planned', 'in_progress', 'completed', 'postponed', 'cancelled'] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const AUDIT_FORMATS = ['on_site', 'remote', 'hybrid'] as const;
export type AuditFormat = (typeof AUDIT_FORMATS)[number];

export const auditSchema = z.object({
	auditName: z.string().min(1, 'Name is required'),
	auditTyp: z.enum(AUDIT_TYPES),
	startDatum: z.string().min(1, 'Start date is required'),
	endDatum: z.string().optional(),
	uhrzeitVon: z.string().optional(),
	uhrzeitBis: z.string().optional(),
	unternehmen: z.string().min(1, 'Company is required'),
	abteilung: z.string().min(1, 'Department is required'),
	standort: z.string().optional(),
	format: z.enum(AUDIT_FORMATS).optional(),
	geltungsbereich: z.string().optional(),
	leitenderAuditorId: z.string().optional(),
	ansprechpartner: z.string().optional(),
	kontaktEmail: z.string().email().optional().or(z.literal('')),
	notizen: z.string().optional(),
	status: z.enum(AUDIT_STATUSES).default('planned')
});

export type AuditFormData = z.infer<typeof auditSchema>;

export interface Audit extends AuditFormData {
	id: string;
	organizationId: string;
	dokumenteLinks?: string;
	createdAt: Date;
	updatedAt: Date;
}
