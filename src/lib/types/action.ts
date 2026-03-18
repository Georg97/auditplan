import { z } from 'zod';

export const findingTypes = ['major_nonconformity', 'minor_nonconformity', 'recommendation', 'improvement_potential', 'positive_finding', 'observation', 'note'] as const;
export type FindingType = (typeof findingTypes)[number];

export const actionStatuses = ['open', 'in_progress', 'implemented', 'verified', 'completed'] as const;
export type ActionStatus = (typeof actionStatuses)[number];

export const priorities = ['high', 'medium', 'low'] as const;
export type Priority = (typeof priorities)[number];

export const normOptions = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001', 'other', 'all'] as const;
export type NormOption = (typeof normOptions)[number];

export const auditTypeOptions = ['internal', 'external', 'supplier', 'process_audit', 'system_audit', 'follow_up_audit'] as const;
export type AuditTypeOption = (typeof auditTypeOptions)[number];

export const actionSchema = z.object({
	feststellungsbeschreibung: z.string().min(1, 'Beschreibung ist erforderlich'),
	feststellungsart: z.enum(findingTypes),
	geplanterMassnahme: z.string().min(1, 'Maßnahme ist erforderlich'),
	status: z.enum(actionStatuses).default('open'),
	verantwortlicher: z.string().optional(),
	prioritaet: z.enum(priorities).optional(),
	frist: z.string().min(1, 'Frist ist erforderlich'),
	abschlussdatum: z.string().optional(),
	norm: z.enum(normOptions).optional(),
	nachweiseNotizen: z.string().optional(),
	audittyp: z.enum(auditTypeOptions).optional()
});

export type ActionFormData = z.infer<typeof actionSchema>;

export interface Action extends ActionFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}
