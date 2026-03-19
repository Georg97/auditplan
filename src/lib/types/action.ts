import { z } from 'zod';

export const FINDING_TYPES = ['major_nonconformity', 'minor_nonconformity', 'recommendation', 'improvement_potential', 'positive_finding', 'observation', 'note'] as const;
export type FindingType = (typeof FINDING_TYPES)[number];

export const ACTION_STATUSES = ['open', 'in_progress', 'implemented', 'verified', 'completed'] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const PRIORITIES = ['high', 'medium', 'low'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const ACTION_AUDIT_TYPES = ['internal', 'external', 'supplier', 'process_audit', 'system_audit', 'follow_up_audit'] as const;
export type AuditType = (typeof ACTION_AUDIT_TYPES)[number];

export const ACTION_NORMS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 50001', 'ISO 27001', 'other', 'all'] as const;
export type ActionNorm = (typeof ACTION_NORMS)[number];

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
	auditType: z.enum(ACTION_AUDIT_TYPES).optional()
});

export type ActionFormData = z.infer<typeof actionSchema>;

export interface Action extends ActionFormData {
	id: string;
	organizationId: string;
	createdAt: Date;
	updatedAt: Date;
}

/** Color mapping for finding types — used for badges/indicators */
export function findingTypeColor(type: FindingType): string {
	switch (type) {
		case 'major_nonconformity':
			return 'bg-destructive text-destructive-foreground';
		case 'minor_nonconformity':
			return 'bg-orange-500/15 text-orange-700 dark:text-orange-400';
		case 'recommendation':
			return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
		case 'improvement_potential':
			return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400';
		case 'positive_finding':
			return 'bg-green-500/15 text-green-700 dark:text-green-400';
		case 'observation':
			return 'bg-purple-500/15 text-purple-700 dark:text-purple-400';
		case 'note':
			return 'bg-muted text-muted-foreground';
	}
}

/** Check if an action is overdue */
export function isOverdue(dueDate: string | undefined, status: string | undefined): boolean {
	if (!dueDate || status === 'completed') return false;
	return new Date(dueDate) < new Date();
}
