import { z } from 'zod';

export const FINDING_TYPES = ['major_nonconformity', 'minor_nonconformity', 'recommendation', 'improvement_potential', 'positive_finding', 'observation', 'note'] as const;
export type FindingType = (typeof FINDING_TYPES)[number];

export const ACTION_STATUSES = ['open', 'in_progress', 'implemented', 'verified', 'completed'] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const actionSchema = z.object({
	auditId: z.string().optional(),
	description: z.string().optional(),
	findingType: z.enum(FINDING_TYPES).optional(),
	plannedAction: z.string().optional(),
	status: z.enum(ACTION_STATUSES).default('open'),
	responsible: z.string().optional(),
	priority: z.enum(PRIORITIES).optional(),
	dueDate: z.string().optional(),
	completionDate: z.string().optional(),
	norm: z.string().optional(),
	evidenceNotes: z.string().optional(),
	auditType: z.string().optional()
});

export type ActionFormData = z.infer<typeof actionSchema>;

export interface Action extends ActionFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}
